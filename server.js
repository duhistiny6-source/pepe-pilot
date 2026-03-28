<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Pepe Pilot: Crypto Edition</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>
    <style>
        body { margin:0; padding:0; overflow:hidden; background:#000; touch-action: none; font-family: 'Segoe UI', Arial, sans-serif; }
        #top-bar { position: fixed; top: 0; left: 0; width: 100%; height: 35px; background: rgba(0, 0, 0, 0.4); z-index: 1000; backdrop-filter: blur(2px); display: flex; align-items: center; }
        
        /* БЛОК ЭНЕРГИИ */
        #energy-container { position: absolute; left: 12px; top: 2px; display: flex; flex-direction: column; align-items: flex-start; }
        #energy-main { color: #0f0; font-size: 13px; font-weight: bold; text-shadow: 1px 1px 1px #000; line-height: 1; }
        #energy-info-extra { display: none; margin-top: 1px; }
        #energy-timer { color: #aaa; font-size: 8px; font-family: monospace; }
        #restore-btn { background: #ffcc00; color: #000; font-size: 7px; padding: 1px 4px; border-radius: 3px; cursor: pointer; font-weight: bold; border: 1px solid #fff; margin-top: 1px; width: fit-content; }

        #balance-container { width: 100%; display: flex; align-items: center; justify-content: center; gap: 15px; color: #fff; font-size: 11px; }
        .balance-item { display: flex; align-items: center; gap: 4px; }
        .coin-icon { width: 14px; height: 14px; }
        #settings-btn { position: fixed; top: 7px; right: 10px; font-size: 18px; cursor: pointer; z-index: 1001; color: white; opacity: 0.8; }
        
        /* НАВИГАЦИЯ */
        #nav-bar { position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%); width: 85%; height: 50px; background: rgba(0, 0, 0, 0.9); border: 1px solid #333; border-radius: 12px; display: flex; justify-content: space-around; align-items: center; z-index: 200; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
        .nav-item { display: flex; flex-direction: column; align-items: center; color: #fff; flex: 1; cursor: pointer; }
        .nav-item span { font-size: 18px; }
        .nav-text { font-size: 8px; margin-top: 1px; color: #bbb; text-transform: uppercase; font-weight: bold; }

        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 2000; color: #fff; justify-content: center; align-items: center; }
        .modal-content { background: #1a1a1a; border: 2px solid #0f0; padding: 25px; border-radius: 20px; text-align: center; min-width: 280px; }
        .task-item { background: #222; border: 1px solid #444; border-radius: 10px; padding: 10px; margin: 10px 0; display: flex; justify-content: space-between; align-items: center; }
    </style>
</head>
<body>

<div id="settings-btn" onclick="toggleModal('settings-modal')">⚙️</div>

<div id="top-bar">
    <div id="energy-container">
        <div id="energy-main">⚡ <span id="energy">100</span></div>
        <div id="energy-info-extra">
            <div id="energy-timer">02:00:00</div>
            <div id="restore-btn" onclick="restoreEnergyByAd()">AD ⚡</div>
        </div>
    </div>
    <div id="balance-container">
        <div class="balance-item"><span>USDT:</span> <span id="money" style="color:#0f0">0.0000</span></div>
        <div class="balance-item">
            <img src="logo..png" class="coin-icon"> <span>PLT:</span> <span id="frog-money" style="color:#ffcc00">0</span>
        </div>
    </div>
</div>

<div id="settings-modal" class="modal">
    <div class="modal-content">
        <h3 id="txt-settings-title">НАСТРОЙКИ</h3>
        <button onclick="changeLanguage('ru')" style="width:100%; margin:5px; padding:10px;">РУССКИЙ</button>
        <button onclick="changeLanguage('en')" style="width:100%; margin:5px; padding:10px;">ENGLISH</button>
        <div style="margin-top:15px; color:#888; cursor:pointer;" onclick="toggleModal('settings-modal')" class="txt-close">Закрыть</div>
    </div>
</div>

<div id="nav-bar">
    <div class="nav-item" onclick="alert('Магазин скоро!')"><span>🛒</span><div class="nav-text" id="nav-shop">АНГАР</div></div>
    <div class="nav-item" onclick="alert('Задания скоро!')"><span>📜</span><div class="nav-text" id="nav-tasks">ЗАДАНИЯ</div></div>
    <div class="nav-item" onclick="alert('Друзья скоро!')"><span>👥</span><div class="nav-text" id="nav-friends">ДРУЗЬЯ</div></div>
    <div class="nav-item" onclick="alert('Кошелек подключается...')"><span>👛</span><div class="nav-text" id="nav-wallet">КОШЕЛЕК</div></div>
</div>

<script src="game.js"></script>
<script>
    function toggleModal(id) {
        const m = document.getElementById(id);
        m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
    }
    function changeLanguage(lang) {
        const d = { ru: { shop: "АНГАР", tasks: "ЗАДАНИЯ", friends: "ДРУЗЬЯ", wallet: "КОШЕЛЕК" }, en: { shop: "HANGAR", tasks: "TASKS", friends: "FRIENDS", wallet: "WALLET" } };
        document.getElementById('nav-shop').innerText = d[lang].shop;
        document.getElementById('nav-tasks').innerText = d[lang].tasks;
        document.getElementById('nav-friends').innerText = d[lang].friends;
        document.getElementById('nav-wallet').innerText = d[lang].wallet;
    }
</script>
</body>
</html>
