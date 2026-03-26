// --- КОНФИГУРАЦИЯ СЕРВЕРА ---
const RENDER_URL = "https://pepe-pilot.onrender.com"; 

const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://duhistiny6-source.github.io/pepe-pilot/tonconnect-manifest.json',
    buttonRootId: null
});

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;
window.recoveryTime = 0;

// Загрузка данных из БД
async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await response.json();
        
        // Берем данные строго из базы данных
        window.frogMoney = data.balancePLT || 0;
        window.usdtMoney = data.balanceUSDT || 0; 
        
        if(typeof updateUI === "function") updateUI();
    } catch (e) { console.error("Ошибка загрузки:", e); }
}

// Сохранение монет
async function saveCollect(amount, type) {
    try {
        const response = await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: amount, type: type })
        });
        
        if (response.ok) {
            // Сразу после сохранения обновляем баланс из базы
            await loadUserData(); 
        }
    } catch (e) { console.error("Ошибка сохранения:", e); }
}

async function connectWallet() {
    try { await tonConnectUI.connectWallet(); alert("Кошелек подключен!"); } catch (e) { console.error(e); }
}

function toggleModal(id) {
    const m = document.getElementById(id);
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function openFriends() { loadUserData(); toggleModal('friends-modal'); }

function doTask(url, reward) {
    window.open(url, '_blank');
    setTimeout(() => {
        window.energy = Math.min(100, window.energy + reward);
        updateUI();
        alert("Задание выполнено!");
    }, 2000);
}

// Вспомогательные функции (оставляем как есть)
const translations = { ru: { recovery: "Rec", ad_btn: "📺 РЕКЛАМА", settings: "НАСТРОЙКИ", close: "Закрыть", watching: "СМОТРИМ...", left: "Осталось", shop: "МАГАЗИН", tasks: "ЗАДАНИЯ", friends: "ДРУЗЬЯ", wallet: "КОШЕЛЕК" } };
function changeLanguage(lang) { toggleModal('settings-modal'); }
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(freq, dur) {
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq; osc.start(); osc.stop(audioCtx.currentTime + dur);
}
