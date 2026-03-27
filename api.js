const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://duhistiny6-source.github.io/pepe-pilot/tonconnect-manifest.json'
});

window.frogMoney = 0; window.usdtMoney = 0; window.energy = 100; window.currentPlane = 'default';

// Функции кнопок (ВОССТАНОВЛЕНО)
window.toggleModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};
window.connectWallet = async function() { await tonConnectUI.openModal(); };
window.openFriends = function() { document.getElementById('ref-link-display').innerText = `https://t.me/your_bot?start=${userId}`; window.toggleModal('friends-modal'); };
window.copyLink = function() { 
    const link = `https://t.me/your_bot?start=${userId}`;
    navigator.clipboard.writeText(link);
    tg.showAlert("Ссылка скопирована!");
};

window.buyPlane = function(type, price) {
    if (window.usdtMoney < price) { tg.showAlert("Недостаточно USDT!"); return; }
    tg.showConfirm(`Купить этот самолет?`, (ok) => {
        if (ok) {
            window.usdtMoney -= price; window.currentPlane = type;
            if (window.changePlaneSkin) window.changePlaneSkin(type);
            window.updateUI(); window.toggleModal('shop-modal');
        }
    });
};

const translations = {
    ru: { settings: "НАСТРОЙКИ", shop: "АНГАР", tasks: "ЗАДАНИЯ", friends: "ДРУЗЬЯ", wallet: "КОШЕЛЕК", close: "Закрыть", copper: "МЕДНЫЙ", bronze: "БРОНЗОВЫЙ", gold: "ЗОЛОТОЙ", price: "Цена", buy: "КУПИТЬ" },
    en: { settings: "SETTINGS", shop: "HANGAR", tasks: "TASKS", friends: "FRIENDS", wallet: "WALLET", close: "Close", copper: "COPPER", bronze: "BRONZE", gold: "GOLD", price: "Price", buy: "BUY" }
};

window.changeLanguage = function(lang) {
    const t = translations[lang]; if (!t) return;
    document.getElementById('txt-settings-title').innerText = t.settings;
    document.getElementById('nav-shop').innerText = t.shop;
    document.getElementById('nav-tasks').innerText = t.tasks;
    document.getElementById('nav-friends').innerText = t.friends;
    document.getElementById('nav-wallet').innerText = t.wallet;
    document.getElementById('txt-shop-title').innerText = t.shop;
    document.getElementById('txt-plane-copper').innerText = t.copper;
    document.getElementById('txt-plane-bronze').innerText = t.bronze;
    document.getElementById('txt-plane-gold').innerText = t.gold;
    document.querySelectorAll('.buy-btn-text').forEach(b => b.innerText = t.buy);
    document.querySelectorAll('.txt-price').forEach(p => p.innerText = t.price);
    document.querySelectorAll('.txt-close-all').forEach(c => c.innerText = t.close);
    window.toggleModal('settings-modal');
};

window.saveCollect = async function(dummy, type) {
    let amount = 0;
    if (type === 'plt') {
        amount = (window.currentPlane === 'gold') ? 50 : (window.currentPlane === 'bronze') ? 25 : 10;
        window.frogMoney += amount;
    } else {
        amount = (window.currentPlane === 'gold') ? 0.005 : (window.currentPlane === 'bronze') ? 0.0005 : 0.00005;
        window.usdtMoney += amount;
    }
    window.updateUI();
    try { fetch(`${RENDER_URL}/api/collect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tgId: userId, amount, type }) }); } catch (e) {}
    return amount; // Возвращаем для анимации
};

window.updateUI = function() {
    document.getElementById('money').innerText = window.usdtMoney.toFixed(5);
    document.getElementById('frog-money').innerText = Math.floor(window.frogMoney);
    document.getElementById('energy').innerText = window.energy;
};

// Звук
let audioCtx;
window.playBeep = function(f, d) {
    try {
        if (!audioCtx) audioCtx = new AudioContext();
        let o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.frequency.value = f; g.gain.setValueAtTime(0.004, audioCtx.currentTime);
        o.start(); o.stop(audioCtx.currentTime + d);
    } catch(e){}
};
