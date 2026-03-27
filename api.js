const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://duhistiny6-source.github.io/pepe-pilot/tonconnect-manifest.json'
});

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;
window.currentPlane = 'default'; 

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
    } catch (e) {}
};

window.toggleModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.buyPlane = async function(type, price) {
    if (window.usdtMoney < price) {
        tg.showAlert("Недостаточно USDT!");
        return;
    }
    tg.showConfirm(`Купить?`, async (ok) => {
        if (ok) {
            window.usdtMoney -= price;
            window.currentPlane = type;
            window.updateUI();
            if (window.changePlaneSkin) window.changePlaneSkin(type);
            window.toggleModal('shop-modal');
            tg.showAlert("Успешно!");
        }
    });
};

const translations = {
    ru: { settings: "НАСТРОЙКИ", shop: "АНГАР", tasks: "ЗАДАНИЯ", friends: "ДРУЗЬЯ", wallet: "КОШЕЛЕК", close: "Закрыть", copper: "МЕДНЫЙ", bronze: "БРОНЗОВЫЙ", gold: "ЗОЛОТОЙ", price: "Цена", buy: "КУПИТЬ" },
    en: { settings: "SETTINGS", shop: "HANGAR", tasks: "TASKS", friends: "FRIENDS", wallet: "WALLET", close: "Close", copper: "COPPER", bronze: "BRONZE", gold: "GOLD", price: "Price", buy: "BUY" }
};

window.changeLanguage = function(lang) {
    const t = translations[lang];
    if (!t) return;
    document.getElementById('txt-settings-title').innerText = t.settings;
    document.getElementById('nav-shop').innerText = t.shop;
    document.getElementById('nav-tasks').innerText = t.tasks;
    document.getElementById('nav-friends').innerText = t.friends;
    document.getElementById('nav-wallet').innerText = t.wallet;
    document.getElementById('txt-shop-title').innerText = t.shop;
    document.getElementById('txt-plane-copper').innerText = t.copper;
    document.getElementById('txt-plane-bronze').innerText = t.bronze;
    document.getElementById('txt-plane-gold').innerText = t.gold;
    document.querySelectorAll('.buy-btn-text').forEach(btn => btn.innerText = t.buy);
    document.querySelectorAll('.txt-price').forEach(el => el.innerText = t.price);
    document.querySelectorAll('.txt-close-all').forEach(el => el.innerText = t.close);
    window.toggleModal('settings-modal');
};

window.saveCollect = async function(dummy, type) {
    let amount = 0;
    if (type === 'plt') {
        if (window.currentPlane === 'copper') amount = 10;
        else if (window.currentPlane === 'bronze') amount = 25;
        else if (window.currentPlane === 'gold') amount = 50;
        else amount = 10;
        window.frogMoney += amount;
    } else {
        if (window.currentPlane === 'copper') amount = 0.00005;
        else if (window.currentPlane === 'bronze') amount = 0.0005;
        else if (window.currentPlane === 'gold') amount = 0.005;
        else amount = 0.00005;
        window.usdtMoney += amount;
    }
    window.updateUI();
    try {
        fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount, type })
        });
    } catch (e) {}
};

window.updateUI = function() {
    document.getElementById('money').innerText = window.usdtMoney.toFixed(5);
    document.getElementById('frog-money').innerText = Math.floor(window.frogMoney);
    document.getElementById('energy').innerText = window.energy;
};
