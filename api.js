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
let nextRestoreTime = null;

// ЗВУКОВОЙ ДВИЖОК
window.playBeep = function(freq, dur) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime); // МЯГКИЙ ГРОМКОСТЬ 2%
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

// СИСТЕМА ЭНЕРГИИ
window.checkEnergy = function() {
    if (window.energy <= 0) {
        if (!nextRestoreTime) {
            nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000;
        }
        window.toggleModal('energy-modal');
        updateTimerDisplay();
        return false;
    }
    return true;
};

function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    const interval = setInterval(() => {
        let diff = nextRestoreTime - Date.now();
        if (diff <= 0 || window.energy > 0) {
            clearInterval(interval);
            if (diff <= 0) { window.energy = 100; window.updateUI(); nextRestoreTime = null; }
            return;
        }
        let h = Math.floor(diff / 3600000);
        let m = Math.floor((diff % 3600000) / 60000);
        let s = Math.floor((diff % 60000) / 1000);
        display.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }, 1000);
}

window.watchAd = function() {
    tg.showConfirm("Посмотреть рекламу?", (ok) => {
        if (ok) {
            window.energy = 100;
            nextRestoreTime = null;
            window.updateUI();
            window.toggleModal('energy-modal');
            tg.showAlert("Энергия восстановлена!");
        }
    });
};

// СБОР МОНЕТОК
window.saveCollect = async function(amount, type) {
    let finalAmount = 0;
    if (type === 'plt') {
        const pltRewards = { default: 10, copper: 20, bronze: 50, gold: 100 };
        finalAmount = pltRewards[window.currentPlane] || 10;
        window.frogMoney += finalAmount;
    } else {
        const usdtRewards = { default: 0.00001, copper: 0.0001, bronze: 0.0005, gold: 0.001 };
        finalAmount = usdtRewards[window.currentPlane] || 0.00001; // НОВЫЙ НОМИНАЛ
        window.usdtMoney += finalAmount;
    }
    window.updateUI();
    try { fetch(`${RENDER_URL}/api/collect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tgId: userId, amount: finalAmount, type: type }) }); } catch (e) {}
};

const translations = {
    ru: {
        settings: "НАСТРОЙКИ", shop: "АНГАР", tasks: "ЗАДАНИЯ", friends: "ДРУЗЬЯ", wallet: "КОШЕЛЕК", close: "Закрыть",
        price: "Цена", buy: "КУПИТЬ", sub: "Подписаться", invite: "📢 ПРИГЛАСИТЬ", fdesc: "Приглашай друзей и получай 10%!",
        cplane: "МЕДНЫЙ", bplane: "БРОНЗОВЫЙ", gplane: "ЗОЛОТОЙ", en_title: "НЕТ ЭНЕРГИИ", en_desc: "Восстановление через:", en_btn: "📺 СМОТРЕТЬ РЕКЛАМУ (+100 ⚡)"
    },
    en: {
        settings: "SETTINGS", shop: "HANGAR", tasks: "TASKS", friends: "FRIENDS", wallet: "WALLET", close: "Close",
        price: "Price", buy: "BUY", sub: "Subscribe", invite: "📢 INVITE", fdesc: "Invite friends and get 10%!",
        cplane: "COPPER", bplane: "BRONZE", gplane: "GOLD", en_title: "NO ENERGY", en_desc: "Restoration in:", en_btn: "📺 WATCH AD (+100 ⚡)"
    }
};

window.changeLanguage = function(lang) {
    const t = translations[lang];
    document.getElementById('txt-settings-title').innerText = t.settings;
    document.getElementById('txt-shop-title').innerText = t.shop;
    document.getElementById('txt-tasks-title').innerText = t.tasks;
    document.getElementById('txt-friends-title').innerText = t.friends;
    document.getElementById('nav-shop').innerText = t.shop;
    document.getElementById('nav-tasks').innerText = t.tasks;
    document.getElementById('nav-friends').innerText = t.friends;
    document.getElementById('nav-wallet').innerText = t.wallet;
    document.getElementById('txt-energy-title').innerText = t.en_title;
    document.getElementById('txt-energy-desc').innerText = t.en_desc;
    document.getElementById('btn-ad').innerText = t.en_btn;
    document.getElementById('plane-name-copper').innerText = t.cplane;
    document.getElementById('plane-name-bronze').innerText = t.bplane;
    document.getElementById('plane-name-gold').innerText = t.gplane;
    document.querySelectorAll('.txt-close').forEach(el => el.innerText = t.close);
    document.querySelectorAll('.txt-price').forEach(el => el.innerText = t.price);
    document.querySelectorAll('.buy-btn').forEach(el => el.innerText = t.buy);
    window.toggleModal('settings-modal');
};

window.updateUI = function() {
    document.getElementById('money').innerText = window.usdtMoney.toFixed(5);
    document.getElementById('frog-money').innerText = Math.floor(window.frogMoney);
    document.getElementById('energy').innerText = window.energy;
    document.getElementById('ref-link-display').innerText = `t.me/YOUR_BOT?start=${userId}`;
};
window.updateUI();
