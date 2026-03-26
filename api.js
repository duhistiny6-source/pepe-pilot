 // --- КОНФИГУРАЦИЯ СЕРВЕРА ---
const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://duhistiny6-source.github.io/pepe-pilot/tonconnect-manifest.json',
    buttonRootId: null
});

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;
window.recoveryTime = 0;

// Загрузка данных из базы при старте
async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await response.json();
        window.frogMoney = data.balancePLT || 0;
        window.usdtMoney = data.balanceUSDT || 0; 
        if(typeof updateUI === "function") updateUI();
    } catch (e) { console.error("Ошибка загрузки:", e); }
}

// Сохранение монет (вызывается из game.js)
async function saveCollect(amount, type) {
    try {
        const response = await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: amount, type: type })
        });
        const data = await response.json();
        // Синхронизируем баланс с ответом сервера
        window.frogMoney = data.balancePLT;
        window.usdtMoney = data.balanceUSDT;
        if(typeof updateUI === "function") updateUI();
    } catch (e) { console.error("Ошибка сохранения:", e); }
}

// Функции интерфейса (восстановлены)
function toggleModal(id) {
    const m = document.getElementById(id);
    if(m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}
function openFriends() { toggleModal('friends-modal'); loadUserData(); }
async function connectWallet() {
    try { await tonConnectUI.connectWallet(); alert("Кошелек подключен!"); } catch (e) { console.error(e); }
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(freq, dur) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.005, audioCtx.currentTime); 
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

loadUserData();
