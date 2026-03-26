const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;

async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await response.json();
        window.frogMoney = data.balancePLT || 0;
        window.usdtMoney = data.balanceUSDT || 0; 
        updateUI();
    } catch (e) { console.error("Ошибка загрузки:", e); }
}

async function saveCollect(amount, type) {
    // 1. Сначала прибавляем визуально, чтобы не был 0
    if (type === 'usdt') { window.usdtMoney += amount; } 
    else { window.frogMoney += amount; }
    updateUI();

    // 2. Затем отправляем в базу
    try {
        await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: amount, type: type })
        });
    } catch (e) { console.error("Ошибка сохранения:", e); }
}

function updateUI() {
    const mDisplay = document.getElementById('money');
    const fDisplay = document.getElementById('frog-money');
    if (mDisplay) mDisplay.innerText = window.usdtMoney.toFixed(4);
    if (fDisplay) fDisplay.innerText = Math.floor(window.frogMoney);
    if (document.getElementById('energy')) document.getElementById('energy').innerText = window.energy;
}

// Загружаем данные при старте
loadUserData();

// Остальные функции (кошелек, друзья) оставляем пустыми или как были
function toggleModal(id) { const m = document.getElementById(id); if(m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex'; }
function openFriends() { toggleModal('friends-modal'); }
