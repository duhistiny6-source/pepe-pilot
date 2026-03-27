const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;
window.currentPlane = 'default';
let audioCtx;
let nextRestoreTime = null;

window.toggleModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.playBeep = function(freq, dur) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
        osc.start(); osc.stop(audioCtx.currentTime + dur);
    } catch (e) {}
};

window.checkEnergy = function() {
    if (window.energy <= 0) {
        if (!nextRestoreTime) {
            nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000; // 2 часа
            startTimer();
        }
        window.toggleModal('energy-modal');
        return false;
    }
    return true;
};

function startTimer() {
    const display = document.getElementById('timer-display');
    const interval = setInterval(() => {
        let diff = nextRestoreTime - Date.now();
        if (diff <= 0) {
            clearInterval(interval);
            window.energy = 100;
            window.updateUI();
            nextRestoreTime = null;
            return;
        }
        let h = Math.floor(diff / 3600000).toString().padStart(2,'0');
        let m = Math.floor((diff % 3600000) / 60000).toString().padStart(2,'0');
        let s = Math.floor((diff % 60000) / 1000).toString().padStart(2,'0');
        if (display) display.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

window.saveCollect = function(amount, type) {
    if (type === 'plt') {
        const pltRewards = { default: 10, copper: 20, bronze: 50, gold: 100 };
        window.frogMoney += (pltRewards[window.currentPlane] || 10);
    } else {
        const usdtRewards = { default: 0.00001, copper: 0.0001, bronze: 0.0005, gold: 0.001 };
        window.usdtMoney += (usdtRewards[window.currentPlane] || 0.00001); // НОМИНАЛ 0.00001
    }
    window.updateUI();
};

window.updateUI = function() {
    if (document.getElementById('money')) document.getElementById('money').innerText = window.usdtMoney.toFixed(5);
    if (document.getElementById('frog-money')) document.getElementById('frog-money').innerText = Math.floor(window.frogMoney);
    if (document.getElementById('energy')) document.getElementById('energy').innerText = window.energy;
};

window.watchAd = function() {
    window.energy = 100;
    nextRestoreTime = null;
    window.updateUI();
    window.toggleModal('energy-modal');
    tg.showAlert("Энергия восстановлена!");
};
