const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;

// Загрузка из базы данных
async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await response.json();
        window.frogMoney = Number(data.balancePLT) || 0;
        window.usdtMoney = Number(data.balanceUSDT) || 0; 
        updateUI();
    } catch (e) { 
        console.error("Ошибка базы данных:", e); 
        updateUI();
    }
}

// Сохранение в базу данных
async function saveCollect(amount, type) {
    if (type === 'plt') window.frogMoney += amount;
    else window.usdtMoney += amount;
    updateUI();

    try {
        await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: amount, type: type })
        });
    } catch (e) { console.error("Не удалось сохранить в БД:", e); }
}

function updateUI() {
    const u = document.getElementById('money');
    const f = document.getElementById('frog-money');
    if (u) u.innerText = window.usdtMoney.toFixed(4);
    if (f) f.innerText = Math.floor(window.frogMoney);
    if (document.getElementById('energy')) document.getElementById('energy').innerText = window.energy;
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(freq, dur) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.005, audioCtx.currentTime); // Тихий сигнал
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

function toggleModal(id) {
    const m = document.getElementById(id);
    if(m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function changeLanguage(lang) {
    const isEn = (lang === 'en');
    const labels = {
        'nav-shop': isEn ? 'SHOP' : 'МАГАЗИН',
        'nav-tasks': isEn ? 'TASKS' : 'ЗАДАНИЯ',
        'nav-friends': isEn ? 'FRIENDS' : 'ДРУЗЬЯ',
        'nav-wallet': isEn ? 'WALLET' : 'КОШЕЛЕК'
    };
    for (let id in labels) {
        let el = document.getElementById(id);
        if(el) el.innerText = labels[id];
    }
    toggleModal('settings-modal');
}

loadUserData();
