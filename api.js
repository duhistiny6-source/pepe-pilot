const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

// Инициализация TON Connect
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://duhistiny6-source.github.io/pepe-pilot/tonconnect-manifest.json',
    buttonRootId: null
});

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;

// --- ЗАГРУЗКА ДАННЫХ ---
async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await response.json();
        window.frogMoney = Number(data.balancePLT) || 0;
        window.usdtMoney = Number(data.balanceUSDT) || 0; 
        updateUI();
    } catch (e) { 
        console.error("Ошибка загрузки данных:", e); 
        updateUI();
    }
}

// --- СОХРАНЕНИЕ ДАННЫХ ---
async function saveCollect(amount, type) {
    if (type === 'plt') window.frogMoney += amount;
    else window.usdtMoney += amount;
    updateUI();

    try {
        await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: amount, type: type })
        });
    } catch (e) { console.error("Ошибка сохранения в БД:", e); }
}

function updateUI() {
    const u = document.getElementById('money');
    const f = document.getElementById('frog-money');
    const e = document.getElementById('energy');
    if (u) u.innerText = window.usdtMoney.toFixed(4);
    if (f) f.innerText = Math.floor(window.frogMoney);
    if (e) e.innerText = window.energy;
}

// --- ФУНКЦИИ ДЛЯ КНОПОК (ПРИВЯЗКА К WINDOW) ---
window.toggleModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.openFriends = function() {
    loadUserData();
    window.toggleModal('friends-modal');
};

window.connectWallet = async function() {
    try {
        await tonConnectUI.connectWallet();
    } catch (e) { console.error("Ошибка кошелька:", e); }
};

const translations = {
    ru: { settings: "НАСТРОЙКИ", shop: "МАГАЗИН", tasks: "ЗАДАНИЯ", friends: "ДРУЗЬЯ", wallet: "КОШЕЛЕК", close: "Закрыть" },
    en: { settings: "SETTINGS", shop: "SHOP", tasks: "TASKS", friends: "FRIENDS", wallet: "WALLET", close: "Close" }
};

window.changeLanguage = function(lang) {
    const t = translations[lang];
    if (!t) return;
    document.getElementById('txt-settings-title').innerText = t.settings;
    document.getElementById('nav-shop').innerText = t.shop;
    document.getElementById('nav-tasks').innerText = t.tasks;
    document.getElementById('nav-friends').innerText = t.friends;
    document.getElementById('nav-wallet').innerText = t.wallet;
    document.getElementById('txt-close').innerText = t.close;
    window.toggleModal('settings-modal');
};

// --- ЗВУКИ ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
window.playBeep = function(freq, dur) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.005, audioCtx.currentTime);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
};

loadUserData();
