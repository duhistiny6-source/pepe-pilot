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
    try {
        const response = await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: amount, type: type })
        });
        const data = await response.json();
        window.frogMoney = data.balancePLT;
        window.usdtMoney = data.balanceUSDT;
        updateUI();
    } catch (e) { console.error("Ошибка сохранения:", e); }
}

// --- ИСПРАВЛЕННЫЙ ПЕРЕВОД ---
const translations = {
    ru: { recovery: "Rec", ad_btn: "📺 РЕКЛАМА", settings: "НАСТРОЙКИ", close: "Закрыть", watching: "СМОТРИМ...", left: "Осталось", shop: "МАГАЗИН", tasks: "ЗАДАНИЯ", friends: "ДРУЗЬЯ", wallet: "КОШЕЛЕК" },
    en: { recovery: "Rec", ad_btn: "📺 AD", settings: "SETTINGS", close: "Close", watching: "WATCHING...", left: "Left", shop: "SHOP", tasks: "TASKS", friends: "FRIENDS", wallet: "WALLET" }
};

function changeLanguage(lang) {
    const t = translations[lang];
    if(!t) return;
    document.getElementById('txt-recovery').innerText = t.recovery;
    document.getElementById('ad-button').innerText = t.ad_btn;
    document.getElementById('txt-settings-title').innerText = t.settings;
    document.getElementById('txt-close').innerText = t.close;
    document.getElementById('nav-shop').innerText = t.shop;
    document.getElementById('nav-tasks').innerText = t.tasks;
    document.getElementById('nav-friends').innerText = t.friends;
    document.getElementById('nav-wallet').innerText = t.wallet;
    toggleModal('settings-modal'); // Закрываем после выбора
}

function toggleModal(id) {
    const m = document.getElementById(id);
    if(m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function openFriends() { toggleModal('friends-modal'); loadUserData(); }

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(freq, dur) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.005, audioCtx.currentTime); 
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

loadUserData();
