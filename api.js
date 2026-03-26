// --- КОНФИГУРАЦИЯ СЕРВЕРА ---
const RENDER_URL = "https://pepe-pilot.onrender.com"; 

const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://duhistiny6-source.github.io/pepe-pilot/tonconnect-manifest.json',
    buttonRootId: null
});

// Глобальные переменные
window.frogMoney = 0;
window.usdtMoney = 0;
window.energy = 100;
window.recoveryTime = 0;

// Загрузка данных пользователя из БД
async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await response.json();
        
        // Загружаем актуальные балансы из базы данных MongoDB
        window.frogMoney = data.balancePLT || 0;
        window.usdtMoney = data.balanceUSDT || 0; 
        
        document.getElementById('txt-friends-title').innerText = `ДРУЗЬЯ (${data.friendsCount || 0})`;
        
        // Принудительно обновляем экран
        if(typeof updateUI === "function") updateUI();
    } catch (e) { console.error("Ошибка загрузки данных:", e); }
}

// Сохранение монет с подтверждением от сервера
async function saveCollect(amount, type) {
    try {
        const response = await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                tgId: userId, 
                amount: amount, 
                type: type 
            })
        });
        
        const data = await response.json();
        
        // СИНХРОНИЗАЦИЯ: берем точные значения, которые сохранил сервер
        window.frogMoney = data.balancePLT;
        window.usdtMoney = data.balanceUSDT;
        
        // Сразу обновляем цифры на экране
        if(typeof updateUI === "function") updateUI();
    } catch (e) { console.error("Ошибка сохранения монет:", e); }
}

async function connectWallet() {
    try { await tonConnectUI.connectWallet(); alert("Кошелек успешно подключен!"); } catch (e) { console.error(e); }
}

function toggleModal(id) {
    const m = document.getElementById(id);
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function openFriends() {
    generateRefLink();
    loadUserData(); 
    toggleModal('friends-modal');
}

function generateRefLink() {
    const botUsername = "pepe_pilot_bot"; 
    const link = `https://t.me/${botUsername}?start=ref${userId}`;
    document.getElementById('ref-link-display').innerText = link;
    return link;
}

function shareInvite() {
    const link = generateRefLink();
    const text = "Присоединяйся к Pepe Pilot и зарабатывай PLT вместе со мной! 🚀";
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
}

function copyLink() {
    const link = document.getElementById('ref-link-display').innerText;
    navigator.clipboard.writeText(link).then(() => alert("Ссылка скопирована!"));
}

function doTask(url, reward) {
    window.open(url, '_blank');
    setTimeout(() => {
        window.energy = Math.min(100, window.energy + reward);
        window.recoveryTime = 0;
        if(typeof updateUI === "function") updateUI();
        alert("Задание выполнено!");
    }, 2000);
}

function doAdTask() { toggleModal('tasks-modal'); startAd(); }

const translations = {
    ru: { recovery: "Rec", ad_btn: "📺 РЕКЛАМА", settings: "НАСТРОЙКИ", close: "Закрыть", watching: "СМОТРИМ РОЛИК...", left: "Осталось", shop: "МАГАЗИН", tasks: "ЗАДАНИЯ", friends: "ДРУЗЬЯ", wallet: "КОШЕЛЕК" },
    en: { recovery: "Rec", ad_btn: "📺 AD", settings: "SETTINGS", close: "Close", watching: "WATCHING AD...", left: "Left", shop: "SHOP", tasks: "TASKS", friends: "FRIENDS", wallet: "WALLET" }
};

let currentLang = 'ru';
function changeLanguage(lang) {
    currentLang = lang; const t = translations[lang];
    document.getElementById('txt-recovery').innerText = t.recovery;
    document.getElementById('ad-button').innerText = t.ad_btn;
    document.getElementById('txt-settings-title').innerText = t.settings;
    document.getElementById('txt-close').innerText = t.close;
    document.getElementById('txt-ad-watching').innerText = t.watching;
    document.getElementById('nav-shop').innerText = t.shop;
    document.getElementById('nav-tasks').innerText = t.tasks;
    document.getElementById('nav-friends').innerText = t.friends;
    document.getElementById('nav-wallet').innerText = t.wallet;
    toggleModal('settings-modal');
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(freq, dur) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = freq; osc.type = 'sine';
    gain.gain.setValueAtTime(0.005, audioCtx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
}
  
