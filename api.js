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
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.005, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
        osc.start(); osc.stop(audioCtx.currentTime + dur);
    } catch (e) {}
};

window.toggleModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.connectWallet = async function() {
    try { await tonConnectUI.openModal(); } catch (e) {}
};

window.buyPlane = async function(type, price) {
    if (window.usdtMoney < price) { tg.showAlert("Недостаточно USDT!"); return; }
    tg.showConfirm(`Купить этот самолет?`, async (ok) => {
        if (ok) {
            window.usdtMoney -= price; window.currentPlane = type;
            window.updateUI(); if (window.changePlaneSkin) window.changePlaneSkin(type);
            window.toggleModal('shop-modal'); tg.showAlert("Успешно!");
            try { fetch(`${RENDER_URL}/api/buy-plane`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tgId: userId, planeType: type, price: price }) }); } catch (e) {}
        }
    });
};

const translations = {
    ru: {
        settings: "НАСТРОЙКИ", shop: "АНГАР", tasks: "ЗАДАНИЯ", friends: "ДРУЗЬЯ", wallet: "КОШЕЛЕК", close: "Закрыть",
        price: "Цена", buy: "КУПИТЬ", sub: "Подписаться на канал", invite: "📢 ПРИГЛАСИТЬ", fdesc: "Приглашай друзей и получай 10%!",
        cplane: "МЕДНЫЙ", bplane: "БРОНЗОВЫЙ", gplane: "ЗОЛОТОЙ"
    },
    en: {
        settings: "SETTINGS", shop: "HANGAR", tasks: "TASKS", friends: "FRIENDS", wallet: "WALLET", close: "Close",
        price: "Price", buy: "BUY", sub: "Subscribe to channel", invite: "📢 INVITE", fdesc: "Invite friends and get 10%!",
        cplane: "COPPER", bplane: "BRONZE", gplane: "GOLD"
    }
};

window.changeLanguage = function(lang) {
    const t = translations[lang];
    document.getElementById('txt-settings-title').innerText = t.settings;
    document.getElementById('txt-shop-title').innerText = t.shop;
    document.getElementById('txt-tasks-title').innerText = t.tasks;
    document.getElementById('txt-friends-title').innerText = t.friends;
    document.getElementById('txt-friends-desc').innerText = t.fdesc;
    document.getElementById('nav-shop').innerText = t.shop;
    document.getElementById('nav-tasks').innerText = t.tasks;
    document.getElementById('nav-friends').innerText = t.friends;
    document.getElementById('nav-wallet').innerText = t.wallet;
    document.getElementById('task-sub').innerText = t.sub;
    document.getElementById('btn-invite').innerText = t.invite;
    document.getElementById('plane-name-copper').innerText = t.cplane;
    document.getElementById('plane-name-bronze').innerText = t.bplane;
    document.getElementById('plane-name-gold').innerText = t.gplane;
    document.querySelectorAll('.txt-close').forEach(el => el.innerText = t.close);
    document.querySelectorAll('.txt-price').forEach(el => el.innerText = t.price);
    document.querySelectorAll('.buy-btn').forEach(el => el.innerText = t.buy);
    window.toggleModal('settings-modal');
};

window.saveCollect = async function(amount, type) {
    let finalAmount = 0;
    if (type === 'plt') {
        if (window.currentPlane === 'copper') finalAmount = 20;
        else if (window.currentPlane === 'bronze') finalAmount = 50;
        else if (window.currentPlane === 'gold') finalAmount = 100;
        else finalAmount = 10;
        window.frogMoney += finalAmount;
    } else {
        if (window.currentPlane === 'copper') finalAmount = 0.0001;
        else if (window.currentPlane === 'bronze') finalAmount = 0.0005;
        else if (window.currentPlane === 'gold') finalAmount = 0.001;
        else finalAmount = 0.00005;
        window.usdtMoney += finalAmount;
    }
    window.updateUI();
    try { fetch(`${RENDER_URL}/api/collect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tgId: userId, amount: finalAmount, type: type }) }); } catch (e) {}
};

window.updateUI = function() {
    if (document.getElementById('money')) document.getElementById('money').innerText = window.usdtMoney.toFixed(5);
    if (document.getElementById('frog-money')) document.getElementById('frog-money').innerText = Math.floor(window.frogMoney);
    if (document.getElementById('energy')) document.getElementById('energy').innerText = window.energy;
    if (document.getElementById('ref-link-display')) document.getElementById('ref-link-display').innerText = `t.me/YOUR_BOT?start=${userId}`;
};
window.updateUI();
