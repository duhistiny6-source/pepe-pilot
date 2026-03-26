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

// --- ЗАГРУЗКА И СОХРАНЕНИЕ ---
async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await response.json();
        window.frogMoney = Number(data.balancePLT) || 0;
        window.usdtMoney = Number(data.balanceUSDT) || 0; 
        updateUI();
    } catch (e) { 
        console.error("Ошибка загрузки:", e); 
        updateUI();
    }
}

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
    } catch (e) { console.error("Ошибка сохранения:", e); }
}

function updateUI() {
    const u = document.getElementById('money');
    const f = document.getElementById('frog-money');
    if (u) u.innerText = (window.usdtMoney || 0).toFixed(4);
    if (f) f.innerText = Math.floor(window.frogMoney || 0);
    if (document.getElementById('energy')) document.getElementById('energy').innerText = window.energy;
}

// --- ФУНКЦИИ МЕНЮ ---

// Универсальное открытие/закрытие модалок
window.toggleModal = function(id) {
    const m = document.getElementById(id);
    if (m) {
        m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
    }
};

// Друзья
window.openFriends = function() {
    loadUserData();
    toggleModal('friends-modal');
};

// Кошелек
window.connectWallet = async function() {
    try {
        await tonConnectUI.connectWallet();
    } catch (e) {
        console.error("TON Connect Error:", e);
    }
};

// --- ПЕРЕВОД ЯЗЫКА ---
const translations = {
    ru: { shop: "МАГАЗИН", tasks: "ЗАДАНИЯ", friends: "ДРУЗЬЯ", wallet: "КОШЕЛЕК", settings: "НАСТРОЙКИ", close: "Закрыть" },
    en: { shop: "SHOP", tasks: "TASKS", friends: "FRIENDS", wallet: "WALLET", settings: "SETTINGS", close: "Close" }
};

window.changeLanguage = function(lang) {
    const t = translations[lang];
    if (!t) return;

    // Обновляем текст в навигации
    const ids = {
        'nav-shop': t.shop,
        'nav-tasks': t.tasks,
        'nav-friends': t.friends,
        'nav-wallet': t.wallet,
        'txt-settings-title': t.settings,
        'txt-close': t.close
    };

    for (let id in ids) {
        const el = document.getElementById(id);
        if (el) el.innerText = ids[id];
    }
    
    // Закрываем настройки после выбора
    toggleModal('settings-modal');
};

// Звуки
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

 
