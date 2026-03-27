window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;
window.currentPlane = 'default';
let audioCtx;
let nextRestoreTime = null;

const tg = window.Telegram.WebApp;
tg.expand();

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
        if (!nextRestoreTime) nextRestoreTime = Date.now() + 7200000;
        window.toggleModal('energy-modal');
        return false;
    }
    return true;
};

window.saveCollect = function(amount, type) {
    if (type === 'plt') {
        const rewards = { default: 10, copper: 20, bronze: 50, gold: 100 };
        window.frogMoney += (rewards[window.currentPlane] || 10);
    } else {
        const rewards = { default: 0.00001, copper: 0.0001, bronze: 0.0005, gold: 0.001 };
        window.usdtMoney += (rewards[window.currentPlane] || 0.00001);
    }
    window.updateUI();
};

window.updateUI = function() {
    const m = document.getElementById('money');
    const fm = document.getElementById('frog-money');
    const en = document.getElementById('energy');
    if (m) m.innerText = window.usdtMoney.toFixed(5);
    if (fm) fm.innerText = Math.floor(window.frogMoney);
    if (en) en.innerText = window.energy;
};

window.watchAd = function() {
    window.energy = 100;
    nextRestoreTime = null;
    window.updateUI();
    window.toggleModal('energy-modal');
};
    
