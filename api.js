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

// Функция обновления текста на экране
function updateUI() {
    // Проверяем наличие элементов, чтобы не было ошибок в консоли
    const usdtText = document.getElementById('money');
    const frogText = document.getElementById('frog-money');
    const energyText = document.getElementById('energy');

    if (usdtText) usdtText.innerText = (window.usdtMoney || 0).toFixed(4);
    if (frogText) frogText.innerText = Math.floor(window.frogMoney || 0);
    if (energyText) energyText.innerText = window.energy;
}

async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        if (!response.ok) throw new Error('Сеть не ок');
        const data = await response.json();
        
        window.frogMoney = data.balancePLT || 0;
        window.usdtMoney = data.balanceUSDT || 0; 
        updateUI();
    } catch (e) { 
        console.error("Ошибка загрузки данных:", e);
        updateUI(); // Показываем нули, если сервер не ответил
    }
}

async function saveCollect(amount, type) {
    // Сначала обновляем локально для мгновенного эффекта
    if (type === 'plt') window.frogMoney += amount;
    else window.usdtMoney += amount;
    updateUI();

    try {
        await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: amount, type: type })
        });
    } catch (e) { console.error("Ошибка сохранения:", e); }
}

// --- ПЕРЕВОД ---
const translations = {
    ru: { recovery: "Rec", ad_btn: "📺 РЕКЛАМА", settings: "НАСТРОЙКИ", close: "Закрыть", shop: "МАГАЗИН", tasks: "ЗАДАНИЯ", friends: "ДРУЗЬЯ", wallet: "КОШЕЛЕК" },
    en: { recovery: "Rec", ad_btn: "📺 AD", settings: "SETTINGS", close: "Close", shop: "SHOP", tasks: "TASKS", friends: "FRIENDS", wallet: "WALLET" }
};

function changeLanguage(lang) {
    const t = translations[lang];
    if(!t) return;
    // Обновляем текст кнопок
    try {
        document.getElementById('txt-recovery').innerText = t.recovery;
        document.getElementById('ad-button').innerText = t.ad_btn;
        document.getElementById('txt-settings-title').innerText = t.settings;
        document.getElementById('txt-close').innerText = t.close;
        document.getElementById('nav-shop').innerText = t.shop;
        document.getElementById('nav-tasks').innerText = t.tasks;
        document.getElementById('nav-friends').innerText = t.friends;
        document.getElementById('nav-wallet').innerText = t.wallet;
    } catch(e) { console.log("Некоторые элементы перевода не найдены"); }
    
    toggleModal('settings-modal'); 
}

function toggleModal(id) {
    const m = document.getElementById(id);
    if(m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function openFriends() { toggleModal('friends-modal'); loadUserData(); }

// Запуск при старте
loadUserData();

