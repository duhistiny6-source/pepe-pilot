const tg = window.Telegram.WebApp;
tg.expand();

window.frogMoney = 0; window.usdtMoney = 0; window.energy = 100; window.currentPlane = 'default';

// Музыкальная система
let audioCtx;
window.bgMusicStarted = false;

window.playBeep = function(f, d) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = f; g.gain.setValueAtTime(0.005, audioCtx.currentTime);
    o.start(); o.stop(audioCtx.currentTime + d);
};

window.toggleModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.buyPlane = function(type, price) {
    if (window.usdtMoney < price) { tg.showAlert("Недостаточно USDT!"); return; }
    tg.showConfirm(`Купить этот самолет?`, (ok) => {
        if (ok) {
            window.usdtMoney -= price;
            window.currentPlane = type;
            if (window.changePlaneSkin) window.changePlaneSkin(type);
            window.updateUI();
            window.toggleModal('shop-modal');
        }
    });
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

// Пустые функции для кнопок, чтобы не было ошибок
window.openTasks = () => tg.showAlert("Задания скоро!");
window.openFriends = () => tg.showAlert("Рефералы скоро!");
window.connectWallet = () => tg.showAlert("Кошелек скоро!");
