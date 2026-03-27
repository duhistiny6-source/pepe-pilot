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

window.toggleModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
};

window.buyPlane = async function(type, price) {
    if (window.usdtMoney < price) {
        tg.showAlert("Недостаточно USDT!");
        return;
    }
    tg.showConfirm(`Купить самолет за ${price} USDT?`, async (ok) => {
        if (ok) {
            window.usdtMoney -= price;
            window.currentPlane = type;
            window.updateUI();
            if (window.changePlaneSkin) window.changePlaneSkin(type);
            window.toggleModal('shop-modal');
            tg.showAlert("Успешно куплено!");
            
            try {
                await fetch(`${RENDER_URL}/api/buy-plane`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tgId: userId, planeType: type, price: price })
                });
            } catch (e) {}
        }
    });
};

window.saveCollect = async function(amount, type) {
    let finalAmount = 0;
    // ЛОГИКА НАЧИСЛЕНИЯ
    if (type === 'plt') {
        if (window.currentPlane === 'copper') finalAmount = 20;
        else if (window.currentPlane === 'bronze') finalAmount = 50;
        else if (window.currentPlane === 'gold') finalAmount = 100;
        else finalAmount = 10;
        window.frogMoney += finalAmount;
    } else {
        if (window.currentPlane === 'copper') finalAmount = 0.0001;
        else if (window.currentPlane === 'bronze') finalAmount = 0.0005;
        else if (window.currentPlane === 'gold') finalAmount = 0.001;
        else finalAmount = 0.00005;
        window.usdtMoney += finalAmount;
    }
    window.updateUI();
    try {
        await fetch(`${RENDER_URL}/api/collect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId: userId, amount: finalAmount, type: type })
        });
    } catch (e) {}
};

window.updateUI = function() {
    if (document.getElementById('money')) document.getElementById('money').innerText = window.usdtMoney.toFixed(5);
    if (document.getElementById('frog-money')) document.getElementById('frog-money').innerText = Math.floor(window.frogMoney);
    if (document.getElementById('energy')) document.getElementById('energy').innerText = window.energy;
};

async function loadUserData() {
    try {
        const res = await fetch(`${RENDER_URL}/api/user/${userId}`);
        const data = await res.json();
        window.frogMoney = Number(data.balancePLT) || 0;
        window.usdtMoney = Number(data.balanceUSDT) || 0;
        window.currentPlane = data.currentPlane || 'default';
        if (window.changePlaneSkin) window.changePlaneSkin(window.currentPlane);
        window.updateUI();
    } catch (e) { window.updateUI(); }
}
loadUserData();
