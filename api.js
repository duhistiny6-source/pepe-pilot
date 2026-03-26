const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

// Загрузка данных
async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await response.json();
        
        // Глобальные переменные для игры
        window.frogMoney = data.balancePLT || 0;
        window.usdtMoney = data.balanceUSDT || 0;
        
        document.getElementById('frog-money').innerText = Math.floor(window.frogMoney);
        document.getElementById('money').innerText = window.usdtMoney.toFixed(4);
        if(document.getElementById('txt-friends-title')) {
            document.getElementById('txt-friends-title').innerText = `ДРУЗЬЯ (${data.friendsCount || 0})`;
        }
    } catch (e) { console.error("Ошибка загрузки данных:", e); }
}

// ИСПРАВЛЕННОЕ СОХРАНЕНИЕ
async function saveProgress(pltAmount, usdtAmount) {
    console.log(`Отправка на сервер: PLT ${pltAmount}, USDT ${usdtAmount}`);
    try {
        await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                tgId: userId, 
                amount: pltAmount,      // Передаем PLT
                amountUSDT: usdtAmount  // ТЕПЕРЬ ПЕРЕДАЕМ USDT!
            })
        });
    } catch (e) { console.error("Ошибка сохранения:", e); }
}

// Функции для модалок
function toggleModal(id) {
    const m = document.getElementById(id);
    if(m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

tg.ready();
tg.expand();
loadUserData();
