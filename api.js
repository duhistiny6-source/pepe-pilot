const RENDER_URL = "https://pepe-pilot.onrender.com"; 
const tg = window.Telegram.WebApp;
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

window.frogMoney = 0;
window.usdtMoney = 0;

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://duhistiny6-source.github.io/pepe-pilot/tonconnect-manifest.json',
    buttonRootId: null
});

async function loadUserData() {
    try {
        const response = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await response.json();
        window.frogMoney = data.balancePLT || 0;
        window.usdtMoney = data.balanceUSDT || 0;
        if(typeof updateUI === 'function') updateUI();
        if(document.getElementById('txt-friends-title')) {
            document.getElementById('txt-friends-title').innerText = `ДРУЗЬЯ (${data.friendsCount || 0})`;
        }
    } catch (e) { console.error("Load error:", e); }
}

async function saveProgress(plt, usdt) {
    try {
        await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: plt, amountUSDT: usdt })
        });
    } catch (e) { console.error("Save error:", e); }
}

function toggleModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

function openFriends() {
    const link = `https://t.me/PepePilot_bot?start=ref${userId}`;
    document.getElementById('ref-link-display').innerText = link;
    toggleModal('friends-modal');
}

function copyLink() {
    const link = document.getElementById('ref-link-display').innerText;
    navigator.clipboard.writeText(link).then(() => alert("Скопировано!"));
}

async function connectWallet() {
    try { await tonConnectUI.connectWallet(); } catch (e) { console.error(e); }
}

window.toggleModal = toggleModal;
window.openFriends = openFriends;
window.copyLink = copyLink;
window.connectWallet = connectWallet;

tg.ready();
tg.expand();
loadUserData();
