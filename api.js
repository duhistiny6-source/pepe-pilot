const tg = window.Telegram.WebApp;
tg.expand();
const userId = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id.toString() : "guest";

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://duhistiny6-source.github.io/pepe-pilot/tonconnect-manifest.json'
});

window.frogMoney = 0; window.usdtMoney = 0; window.energy = 100; window.currentPlane = 'default';

window.toggleModal = (id) => {
    const el = document.getElementById(id);
    if(el) el.style.display = (el.style.display === 'flex') ? 'none' : 'flex';
};

window.openFriends = () => {
    const link = `https://t.me/share/url?url=https://t.me/your_bot?start=${userId}`;
    tg.openTelegramLink(link);
};

window.buyPlane = (type, price) => {
    if(window.usdtMoney >= price) {
        window.usdtMoney -= price;
        window.currentPlane = type;
        if(window.updatePlane) window.updatePlane(type);
        window.updateUI();
        window.toggleModal('shop-modal');
    } else {
        tg.showAlert("Недостаточно USDT");
    }
};

window.saveCollect = (type) => {
    let bonus = (window.currentPlane === 'gold') ? 5 : (window.currentPlane === 'copper') ? 2 : 1;
    if(type === 'plt') window.frogMoney += (10 * bonus);
    else window.usdtMoney += (0.00005 * bonus);
    window.updateUI();
};

window.updateUI = () => {
    document.getElementById('money').innerText = window.usdtMoney.toFixed(5);
    document.getElementById('frog-money').innerText = window.frogMoney;
    document.getElementById('energy').innerText = window.energy;
};
