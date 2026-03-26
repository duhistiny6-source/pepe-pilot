
const API_URL = "https://pepe-pilot.onrender.com/api";
const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe?.user?.id.toString();

// Функция для получения баланса при входе
async function loadUserData() {
    if (!userId) return;
    try {
        const response = await fetch(`${API_URL}/user/${userId}`);
        const data = await response.json();
        
        // Обновляем текст на экране (убедись, что в index.html есть эти ID)
        if(document.getElementById('plt-balance')) {
            document.getElementById('plt-balance').innerText = Math.floor(data.balancePLT || 0);
        }
        if(document.getElementById('usdt-balance')) {
            document.getElementById('usdt-balance').innerText = data.balanceUSDT?.toFixed(4) || "0.0000";
        }
        return data;
    } catch (e) {
        console.error("Ошибка загрузки:", e);
    }
}

// ФУНКЦИЯ СОХРАНЕНИЯ (Тут мы чиним USDT)
async function saveProgress(pltAmount, usdtAmount) {
    if (!userId) {
        console.error("ID пользователя не найден!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tgId: userId,
                amount: Number(pltAmount) || 0,
                amountUSDT: Number(usdtAmount) || 0 // ТЕПЕРЬ ОТПРАВЛЯЕТСЯ!
            })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log("Успешно сохранено!");
            loadUserData(); // Сразу обновляем баланс на экране
        }
    } catch (e) {
        console.error("Ошибка сохранения USDT:", e);
    }
}

// Инициализация
tg.ready();
tg.expand();
loadUserData();
