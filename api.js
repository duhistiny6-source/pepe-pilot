const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
tg.expand();

// Получаем ID пользователя и проверяем его наличие
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";
console.log("Текущий пользователь ID:", userId);

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;

// 1. ЗАГРУЗКА ИЗ БАЗЫ ПРИ СТАРТЕ
async function loadUserData() {
    try {
        console.log("Запрос данных с сервера...");
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();
        console.log("Данные получены из БД:", data);

        // Обновляем глобальные переменные только если данные пришли
        window.frogMoney = Number(data.balancePLT) || 0;
        window.usdtMoney = Number(data.balanceUSDT) || 0; 
        updateUI();
    } catch (e) { 
        console.error("Критическая ошибка загрузки из БД:", e); 
        // Если база не отвечает, интерфейс всё равно покажет 0, но мы об этом узнаем из логов
        updateUI();
    }
}

// 2. СОХРАНЕНИЕ В БАЗУ ПРИ КАЖДОМ СБОРЕ
async function saveCollect(amount, type) {
    // Сначала меняем цифры в самой игре для скорости
    if (type === 'plt') window.frogMoney += amount;
    else window.usdtMoney += amount;
    updateUI();

    // Отправляем запрос на сохранение
    try {
        const response = await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                tgId: userId, 
                amount: amount, 
                type: type 
            })
        });

        if (!response.ok) {
            console.error("Сервер отказался сохранять монеты");
        } else {
            const result = await response.json();
            console.log("Успешно сохранено в MongoDB. Новый баланс в БД:", result);
        }
    } catch (e) { 
        console.error("Сетевая ошибка при сохранении:", e); 
    }
}

function updateUI() {
    const u = document.getElementById('money');
    const f = document.getElementById('frog-money');
    if (u) u.innerText = window.usdtMoney.toFixed(4);
    if (f) f.innerText = Math.floor(window.frogMoney);
    if (document.getElementById('energy')) document.getElementById('energy').innerText = window.energy;
}

// Остальные функции кнопок (оставляем как были)
window.toggleModal = (id) => {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.openFriends = () => { loadUserData(); window.toggleModal('friends-modal'); };

// Сразу запускаем загрузку
loadUserData();
