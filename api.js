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

window.toggleModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.connectWallet = async function() {
    try { await tonConnectUI.openModal(); } catch (e) {}
};

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
    if (!display) return;
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

window.saveCollect = async function(amount, type) {
    let finalAmount = 0;
    if (type === 'plt') {
        const pltRewards = { default: 10, copper: 20, bronze: 50, gold: 100 };
        finalAmount = pltRewards[window.currentPlane] || 10;
        window.frogMoney += finalAmount;
    } else {
        const usdtRewards = { default: 0.00001, copper: 0.0001, bronze: 0.0005, gold: 0.001 };
        finalAmount = usdtRewards[window.currentPlane] || 0.00001;
        window.usdtMoney += finalAmount;
    }
    window.updateUI();
    try {
        fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: finalAmount, type: type })
        });
    } catch (e) {}
};

window.updateUI = function() {
    const m = document.getElementById('money');
    const fm = document.getElementById('frog-money');
    const en = document.getElementById('energy');
    const ref = document.getElementById('ref-link-display');
    if (m) m.innerText = window.usdtMoney.toFixed(5);
    if (fm) fm.innerText = Math.floor(window.frogMoney);
    if (en) en.innerText = window.energy;
    if (ref) ref.innerText = `t.me/YOUR_BOT?start=${userId}`;
};

// Инициализация при загрузке
window.onload = () => { window.updateUI(); };
