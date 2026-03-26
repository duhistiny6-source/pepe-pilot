const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;

// Загрузка данных при старте
async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await response.json();
        window.frogMoney = Number(data.balancePLT) || 0;
        window.usdtMoney = Number(data.balanceUSDT) || 0; 
        updateUI();
    } catch (e) { 
        console.error("Ошибка загрузки:", e); 
        updateUI();
    }
}

// Сохранение (теперь с четким сигналом серверу)
async function saveCollect(amount, type) {
    // 1. Сначала прибавляем в игре для скорости
    if (type === 'plt') window.frogMoney += amount;
    else window.usdtMoney += amount;
    updateUI();

    // 2. Отправляем в базу MongoDB
    try {
        await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: amount, type: type })
        });
    } catch (e) { console.error("Ошибка базы:", e); }
}

function updateUI() {
    const u = document.getElementById('money');
    const f = document.getElementById('frog-money');
    if (u) u.innerText = window.usdtMoney.toFixed(4);
    if (f) f.innerText = Math.floor(window.frogMoney);
    if (document.getElementById('energy')) document.getElementById('energy').innerText = window.energy;
}

// ВОССТАНОВЛЕННЫЕ СИГНАЛЫ (Бипы)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(freq, dur) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.01, audioCtx.currentTime); // Тихий приятный звук
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

function toggleModal(id) {
    const m = document.getElementById(id);
    if(m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

loadUserData();
