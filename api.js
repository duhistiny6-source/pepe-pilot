const tg = window.Telegram.WebApp;
tg.expand();

window.frogMoney = 0; window.usdtMoney = 0; window.energy = 100; window.currentPlane = 'default';

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://duhistiny6-source.github.io/pepe-pilot/tonconnect-manifest.json'
});

window.toggleModal = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = (el.style.display === 'flex') ? 'none' : 'flex';
};

window.buyPlane = (type, price) => {
    if (window.usdtMoney >= price) {
        window.usdtMoney -= price;
        window.currentPlane = type;
        if (window.changePlaneSkin) window.changePlaneSkin(type);
        window.updateUI();
        window.toggleModal('shop-modal');
    } else { tg.showAlert("Недостаточно USDT!"); }
};

window.saveCollect = (dummy, type) => {
    let mult = (window.currentPlane === 'gold') ? 5 : (window.currentPlane === 'bronze') ? 2.5 : 1;
    if (type === 'plt') {
        window.frogMoney += (10 * mult);
    } else {
        window.usdtMoney += (0.00005 * mult);
    }
    window.updateUI();
};

window.updateUI = () => {
    document.getElementById('money').innerText = window.usdtMoney.toFixed(5);
    document.getElementById('frog-money').innerText = Math.floor(window.frogMoney);
    document.getElementById('energy').innerText = window.energy;
};

window.openFriends = () => {
    const uid = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "123";
    tg.openTelegramLink(`https://t.me/share/url?url=https://t.me/your_bot?start=${uid}`);
};
