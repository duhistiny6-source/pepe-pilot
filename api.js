const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

// Инициализация TON Connect
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://duhistiny6-source.github.io/pepe-pilot/tonconnect-manifest.json'
});

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;
window.currentPlane = 'default'; // Текущий самолет

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

// --- ЛОГИКА ПОКУПКИ САМОЛЕТА ---
window.buyPlane = async function(type, price) {
    if (window.usdtMoney < price) {
        tg.showAlert("Недостаточно USDT для покупки!");
        return;
    }

    tg.showConfirm(`Купить этот самолет за ${price} USDT?`, async (ok) => {
        if (ok) {
            // Мгновенная покупка (пока без сервера для теста)
            window.usdtMoney -= price;
            window.currentPlane = type;
            window.updateUI();
            
            if (window.changePlaneSkin) window.changePlaneSkin(type);
            window.toggleModal('shop-modal');
            tg.showAlert("Поздравляем с покупкой!");
            
            // Отправка на сервер (когда добавишь API)
            try {
                await fetch(`${RENDER_URL}/api/buy-plane`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tgId: userId, planeType: type, price: price })
                });
            } catch (e) {}
        }
    });
};

const translations = {
    ru: { settings: "НАСТРОЙКИ", shop: "АНГАР", tasks: "ЗАДАНИЯ", friends: "ДРУЗЬЯ", wallet: "КОШЕЛЕК", close: "Закрыть" },
    en: { settings: "SETTINGS", shop: "HANGAR", tasks: "TASKS", friends: "FRIENDS", wallet: "WALLET", close: "Close" }
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
        window.currentPlane = data.currentPlane || 'default';
        if (window.changePlaneSkin) window.changePlaneSkin(window.currentPlane);
        updateUI();
    } catch (e) { updateUI(); }
}

// УМНЫЙ СБОР С УЧЕТОМ ТИПА САМОЛЕТА
window.saveCollect = async function(amount, type) {
    let finalAmount = amount;

    // Пересчитываем награду в зависимости от самолета
    if (type === 'plt') {
        if (window.currentPlane === 'copper') finalAmount = 10;
        else if (window.currentPlane === 'bronze') finalAmount = 25;
        else if (window.currentPlane === 'gold') finalAmount = 50;
        else finalAmount = 10; // Стандартный
        window.frogMoney += finalAmount;
    } else {
        if (window.currentPlane === 'copper') finalAmount = 0.00005;
        else if (window.currentPlane === 'bronze') finalAmount = 0.0005;
        else if (window.currentPlane === 'gold') finalAmount = 0.005;
        else finalAmount = 0.00005; // Стандартный
        window.usdtMoney += finalAmount;
    }

    updateUI();
    try {
        await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: finalAmount, type: type })
        });
    } catch (e) { console.error("Save error"); }
};

window.updateUI = function() {
    const u = document.getElementById('money');
    const f = document.getElementById('frog-money');
    const e = document.getElementById('energy');
    if (u) u.innerText = window.usdtMoney.toFixed(5);
    if (f) f.innerText = Math.floor(window.frogMoney);
    if (e) e.innerText = window.energy;
};

loadUserData();
