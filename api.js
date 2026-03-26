const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;

// Функция загрузки данных
async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await response.json();
        
        // Обновляем глобальные переменные из базы
        window.frogMoney = Number(data.balancePLT) || 0;
        window.usdtMoney = Number(data.balanceUSDT) || 0; 
        
        console.log("Данные загружены:", window.frogMoney, window.usdtMoney);
        updateUI();
    } catch (e) { 
        console.error("Ошибка загрузки данных:", e); 
    }
}

// Функция сохранения
async function saveCollect(amount, type) {
    // Мгновенное визуальное обновление (чтобы не был 0)
    if (type === 'plt') {
        window.frogMoney += amount;
    } else {
        window.usdtMoney += amount;
    }
    updateUI();

    // Отправка на сервер в фоновом режиме
    try {
        await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: amount, type: type })
        });
    } catch (e) { 
        console.error("Ошибка сохранения на сервере:", e); 
    }
}

// Обновление всех элементов интерфейса
function updateUI() {
    const pltElement = document.getElementById('frog-money');
    const usdtElement = document.getElementById('money');
    const energyElement = document.getElementById('energy');

    if (pltElement) pltElement.innerText = Math.floor(window.frogMoney);
    if (usdtElement) usdtElement.innerText = window.usdtMoney.toFixed(4);
    if (energyElement) energyElement.innerText = window.energy;
}

// Запуск загрузки при старте скрипта
loadUserData();

// Остальные функции (заглушки для работы кнопок)
function toggleModal(id) { 
    const m = document.getElementById(id); 
    if(m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex'; 
}
function openFriends() { toggleModal('friends-modal'); loadUserData(); }
