const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://duhistiny6-source.github.io/pepe-pilot/tonconnect-manifest.json'
});

window.frogMoney = 0; window.usdtMoney = 0; window.energy = 100; window.currentPlane = 'default';

window.toggleModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.openFriends = function() {
    tg.showAlert("Реферальная ссылка: https://t.me/your_bot?start=" + userId);
};

window.buyPlane = function(type, price) {
    if (window.usdtMoney < price) { tg.showAlert("Недостаточно USDT!"); return; }
    window.usdtMoney -= price; window.currentPlane = type;
    if (window.changePlaneSkin) window.changePlaneSkin(type);
    window.updateUI(); window.toggleModal('shop-modal');
};

const translations = {
    ru: { settings: "НАСТРОЙКИ", shop: "АНГАР", copper: "МЕДНЫЙ", bronze: "БРОНЗОВЫЙ", gold: "ЗОЛОТОЙ", buy: "КУПИТЬ", close: "Закрыть" },
    en: { settings: "SETTINGS", shop: "HANGAR", copper: "COPPER", bronze: "BRONZE", gold: "GOLD", buy: "BUY", close: "Close" }
};

window.changeLanguage = function(lang) {
    const t = translations[lang]; if (!t) return;
    document.getElementById('txt-settings-title').innerText = t.settings;
    document.getElementById('nav-shop').innerText = t.shop;
    document.getElementById('txt-shop-title').innerText = t.shop;
    document.getElementById('txt-plane-copper').innerText = t.copper;
    document.getElementById('txt-plane-bronze').innerText = t.bronze;
    document.getElementById('txt-plane-gold').innerText = t.gold;
    document.querySelectorAll('.buy-btn-text').forEach(b => b.innerText = t.buy);
    document.querySelectorAll('.txt-close-all').forEach(c => c.innerText = t.close);
    window.toggleModal('settings-modal');
};

window.saveCollect = function(dummy, type) {
    let amount = 0;
    if (type === 'plt') {
        amount = (window.currentPlane === 'gold') ? 50 : (window.currentPlane === 'bronze') ? 25 : 10;
        window.frogMoney += amount;
    } else {
        amount = (window.currentPlane === 'gold') ? 0.005 : (window.currentPlane === 'bronze') ? 0.0005 : 0.00005;
        window.usdtMoney += amount;
    }
    window.updateUI();
};

window.updateUI = function() {
    document.getElementById('money').innerText = window.usdtMoney.toFixed(5);
    document.getElementById('frog-money').innerText = Math.floor(window.frogMoney);
    document.getElementById('energy').innerText = window.energy;
};
