const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

// Инициализация TON Connect (Кошелек)
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://duhistiny6-source.github.io/pepe-pilot/tonconnect-manifest.json'
});

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;

// --- ТИХИЙ ЗВУКОВОЙ ДВИЖОК ---
let audioCtx;
window.playBeep = function(freq, dur) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        // Ультра-тихо (0.004)
        gain.gain.setValueAtTime(0.004, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    } catch (e) { console.log("Звук недоступен"); }
};

// --- ФУНКЦИИ КНОПОК ---
window.toggleModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.connectWallet = async function() {
    try {
        await tonConnectUI.openModal(); 
    } catch (e) { console.error("Wallet error:", e); }
};

window.openFriends = function() {
    loadUserData();
    window.toggleModal('friends-modal');
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

// --- СВЯЗЬ С СЕРВЕРОМ ---
async function loadUserData() {
    try {
        const res = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await res.json();
        window.frogMoney = Number(data.balancePLT) || 0;
        window.usdtMoney = Number(data.balanceUSDT) || 0;
        updateUI();
    } catch (e) { updateUI(); }
}

window.saveCollect = async function(amount, type) {
    if (type === 'plt') window.frogMoney += amount;
    else window.usdtMoney += amount;
    updateUI();
    try {
        await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount, type })
        });
    } catch (e) { console.error("Save error"); }
};

window.updateUI = function() {
    const u = document.getElementById('money');
    const f = document.getElementById('frog-money');
    const e = document.getElementById('energy');
    if (u) u.innerText = window.usdtMoney.toFixed(4);
    if (f) f.innerText = Math.floor(window.frogMoney);
    if (e) e.innerText = window.energy;
};

loadUserData();
     
