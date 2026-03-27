<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Pepe Pilot</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>
    <script src="https://unpkg.com/@tonconnect/ui@latest/dist/tonconnect-ui.min.js"></script>
    <style>
        body { margin:0; padding:0; overflow:hidden; background:#000; touch-action: none; font-family: 'Segoe UI', Arial, sans-serif; }
        #top-bar { position: fixed; top: 0; left: 0; width: 100%; height: 35px; background: rgba(0, 0, 0, 0.4); z-index: 1000; backdrop-filter: blur(2px); display: flex; align-items: center; }
        #energy-container { position: absolute; left: 12px; color: #0f0; font-size: 13px; font-weight: bold; }
        #balance-container { width: 100%; display: flex; align-items: center; justify-content: center; gap: 15px; color: #fff; font-size: 11px; }
        .balance-item { display: flex; align-items: center; gap: 4px; }
        .coin-icon { width: 14px; height: 14px; }
        #settings-btn { position: fixed; top: 7px; right: 10px; font-size: 18px; cursor: pointer; z-index: 1001; color: white; }
        #nav-bar { position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%); width: 85%; height: 50px; background: rgba(0, 0, 0, 0.9); border: 1px solid #333; border-radius: 12px; display: flex; justify-content: space-around; align-items: center; z-index: 200; }
        .nav-item { display: flex; flex-direction: column; align-items: center; color: #fff; flex: 1; cursor: pointer; }
        .nav-text { font-size: 8px; margin-top: 1px; color: #bbb; text-transform: uppercase; }
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 2000; color: #fff; justify-content: center; align-items: center; flex-direction: column; }
        .modal-content { background: #1a1a1a; border: 2px solid #0f0; padding: 20px; border-radius: 20px; text-align: center; min-width: 280px; max-width: 90%; max-height: 80vh; overflow-y: auto; }
        .task-item { background: #222; border: 1px solid #444; border-radius: 10px; padding: 10px; margin: 8px 0; display: flex; justify-content: space-between; align-items: center; }
        .task-info { text-align: left; }
        .task-title { font-size: 12px; font-weight: bold; }
        .task-btn { background: #0f0; color: #000; border: none; padding: 6px 12px; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 11px; }
        .lang-btn { background: #333; color: #0f0; border: 1px solid #0f0; padding: 10px; margin: 5px 0; cursor: pointer; border-radius: 10px; width: 100%; }
        .plane-img-sm { width: 45px; height: auto; margin-right: 8px; }
    </style>
</head>
<body>

<div id="settings-btn" onclick="toggleModal('settings-modal')">⚙️</div>

<div id="top-bar">
    <div id="energy-container">⚡ <span id="energy">100</span></div>
    <div id="balance-container">
        <div class="balance-item"><span>USDT:</span> <span id="money" style="color:#0f0">0.00000</span></div>
        <div class="balance-item"><img src="logo..png" class="coin-icon"> <span>PLT:</span> <span id="frog-money" style="color:#ffcc00">0</span></div>
    </div>
</div>

<div id="shop-modal" class="modal">
    <div class="modal-content">
        <h3 id="txt-shop-title">АНГАР</h3>
        <div class="task-item" style="border-color:#cd7f32"><img src="plane_copper.png" class="plane-img-sm"><div class="task-info"><div id="txt-plane-copper" style="color:#cd7f32">МЕДНЫЙ</div><div style="font-size:10px"><span class="txt-price">Цена</span>: 10 USDT</div></div><button class="task-btn buy-btn-text" onclick="buyPlane('copper', 10)">КУПИТЬ</button></div>
        <div class="task-item" style="border-color:#b08d57"><img src="plane_bronze.png" class="plane-img-sm"><div class="task-info"><div id="txt-plane-bronze" style="color:#b08d57">БРОНЗОВЫЙ</div><div style="font-size:10px"><span class="txt-price">Цена</span>: 25 USDT</div></div><button class="task-btn buy-btn-text" onclick="buyPlane('bronze', 25)">КУПИТЬ</button></div>
        <div class="task-item" style="border-color:#ffd700"><img src="plane_gold.png" class="plane-img-sm"><div class="task-info"><div id="txt-plane-gold" style="color:#ffd700">ЗОЛОТОЙ</div><div style="font-size:10px"><span class="txt-price">Цена</span>: 50 USDT</div></div><button class="task-btn buy-btn-text" onclick="buyPlane('gold', 50)">КУПИТЬ</button></div>
        <div style="margin-top:15px; color:#888; cursor:pointer;" onclick="toggleModal('shop-modal')" class="txt-close-all">Закрыть</div>
    </div>
</div>

<div id="settings-modal" class="modal">
    <div class="modal-content">
        <h3 id="txt-settings-title">НАСТРОЙКИ</h3>
        <button class="lang-btn" onclick="changeLanguage('ru')">РУССКИЙ</button>
        <button class="lang-btn" onclick="changeLanguage('en')">ENGLISH</button>
        <div style="margin-top:15px; color:#888; cursor:pointer;" onclick="toggleModal('settings-modal')" class="txt-close-all">Закрыть</div>
    </div>
</div>

<div id="tasks-modal" class="modal">
    <div class="modal-content">
        <h3 id="txt-tasks-title">ЗАДАНИЯ</h3>
        <div class="task-item"><div class="task-info"><div>Подписаться на канал</div><div style="color:#0f0">+100 ⚡</div></div><button class="task-btn" onclick="doTask('https://t.me/your_channel', 100)">GO</button></div>
        <div style="margin-top:15px; color:#888; cursor:pointer;" onclick="toggleModal('tasks-modal')" class="txt-close-all">Закрыть</div>
    </div>
</div>

<div id="friends-modal" class="modal">
    <div class="modal-content">
        <h3 id="txt-friends-title">ДРУЗЬЯ (0)</h3>
        <div id="ref-link-display" style="font-size:10px; background:#000; padding:5px; margin:10px 0;">Загрузка...</div>
        <button class="lang-btn" onclick="copyLink()">📋 КОПИРОВАТЬ</button>
        <div style="margin-top:15px; color:#888; cursor:pointer;" onclick="toggleModal('friends-modal')" class="txt-close-all">Закрыть</div>
    </div>
</div>

<div id="nav-bar">
    <div class="nav-item" onclick="toggleModal('shop-modal')"><span>🛒</span><div class="nav-text" id="nav-shop">МАГАЗИН</div></div>
    <div class="nav-item" onclick="toggleModal('tasks-modal')"><span>📜</span><div class="nav-text" id="nav-tasks">ЗАДАНИЯ</div></div>
    <div class="nav-item" onclick="openFriends()"><span>👥</span><div class="nav-text" id="nav-friends">ДРУЗЬЯ</div></div>
    <div class="nav-item" onclick="connectWallet()"><span>👛</span><div class="nav-text" id="nav-wallet">КОШЕЛЕК</div></div>
</div>

<script src="api.js"></script>
<script src="game.js"></script>
</body>
</html>
