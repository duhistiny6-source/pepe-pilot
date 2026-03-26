const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;

// ЗАГРУЗКА ИЗ БАЗЫ
async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await response.json();
        // Присваиваем значения из БД в глобальные переменные
        window.frogMoney = Number(data.balancePLT) || 0;
        window.usdtMoney = Number(data.balanceUSDT) || 0; 
        updateUI();
    } catch (e) { 
        console.error("Ошибка загрузки данных из БД:", e); 
        updateUI();
    }
}

// СОХРАНЕНИЕ В БАЗУ
async function saveCollect(amount, type) {
    // 1. Сначала прибавляем визуально
    if (type === 'plt') window.frogMoney += amount;
    else window.usdtMoney += amount;
    updateUI();

    // 2. Отправляем на сервер (Render -> MongoDB)
    try {
        await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: amount, type: type })
        });
        console.log("Данные успешно сохранены в MongoDB");
    } catch (e) { 
        console.error("Ошибка сохранения на сервере:", e); 
    }
}

function updateUI() {
    const usdtText = document.getElementById('money');
    const frogText = document.getElementById('frog-money');
    if (usdtText) usdtText.innerText = window.usdtMoney.toFixed(4);
    if (frogText) frogText.innerText = Math.floor(window.frogMoney);
    if (document.getElementById('energy')) document.getElementById('energy').innerText = window.energy;
}

// ЗВУКОВОЙ ДВИЖОК
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(freq, dur) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.01, audioCtx.currentTime); 
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}

function toggleModal(id) {
    const m = document.getElementById(id);
    if(m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function changeLanguage(lang) {
    // Упрощенная логика смены языка для кнопок
    const isEn = (lang === 'en');
    const navs = {
        'nav-shop': isEn ? 'SHOP' : 'МАГАЗИН',
        'nav-tasks': isEn ? 'TASKS' : 'ЗАДАНИЯ',
        'nav-friends': isEn ? 'FRIENDS' : 'ДРУЗЬЯ',
        'nav-wallet': isEn ? 'WALLET' : 'КОШЕЛЕК'
    };
    for (let id in navs) {
        let el = document.getElementById(id);
        if(el) el.innerText = navs[id];
    }
    toggleModal('settings-modal');
}

// Запускаем загрузку сразу
loadUserData();
