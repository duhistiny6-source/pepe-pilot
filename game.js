const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, targets, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.018, distance = 25;

// Глобальное состояние
window.energy = 100;
window.pltBalance = 0;
window.usdtBalance = 0;
window.currentPlane = 'default'; // copper, bronze, gold
let nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000;

window.updateUI = function() {
    document.getElementById('energy').innerText = Math.floor(window.energy);
    document.getElementById('money').innerText = window.usdtBalance.toFixed(5);
    document.getElementById('frog-money').innerText = Math.floor(window.pltBalance);
    
    // Кнопка восстановления видна только если энергия не полная
    const btn = document.getElementById('restore-btn');
    btn.style.visibility = (window.energy < 100) ? "visible" : "hidden";
}

// Таймер обратного отсчета (2 часа)
setInterval(() => {
    const now = Date.now();
    const diff = nextRestoreTime - now;
    if (diff <= 0) {
        window.energy = 100;
        nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000;
        window.updateUI();
    }
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    document.getElementById('energy-timer').innerText = `${h}:${m}:${s}`;
}, 1000);

window.restoreEnergyByAd = function() {
    // Здесь будет вызов твоей рекламы
    window.energy = 100;
    nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000;
    window.updateUI();
    if (window.userId) {
        // Опционально: отправить на сервер факт восстановления
    }
}

function preload() {
    this.load.image('sky', 'pg.jpeg');
    this.load.image('hook', 'kleshn.png');
    this.load.image('usdt', 'usdt.png');
    this.load.image('plt', 'logo..png');
    this.load.image('plane', 'pepe.png');
}

function create() {
    this.add.image(config.width/2, config.height/2, 'sky').setDisplaySize(config.width, config.height);
    targets = this.physics.add.group();
    for(let i=0; i<6; i++) spawn(this);
    
    hook = this.add.sprite(0, 0, 'hook').setDisplaySize(65, 65).setDepth(5);
    this.physics.add.existing(hook);
    plane = this.add.image(config.width/2, 130, 'plane').setDisplaySize(260, 170).setDepth(10);

    this.physics.add.overlap(hook, targets, (h, item) => {
        if (isLaunching && !caughtItem) {
            caughtItem = item;
            caughtItem.body.enable = false;
            isLaunching = false; isReturning = true;
        }
    });

    this.input.on('pointerdown', (pointer) => {
        // Не запускаем если нажали на меню или кнопки
        if (pointer.y < 80 || pointer.y > config.height - 80) return;
        
        if (!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true;
            window.energy -= 1;
            window.updateUI();
        }
    });
}

function spawn(scene) {
    let x = Phaser.Math.Between(50, config.width - 50);
    let y = Phaser.Math.Between(350, config.height - 180);
    let type = (Math.random() > 0.85) ? 'usdt' : 'plt';
    let coin = targets.create(x, y, type).setScale(0.13).setDepth(1);
}

function update() {
    let startX = plane.x - 5, startY = plane.y + 25;
    if (!isLaunching && !isReturning) {
        angle += swingSpeed; if (angle > 0.5 || angle < -0.5) swingSpeed *= -1;
        distance = 30;
    } else if (isLaunching) {
        distance += 12; if (distance > config.height - 120) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 9;
        if (distance <= 30) {
            isReturning = false;
            if (caughtItem) {
                let isPlt = (caughtItem.texture.key === 'plt');
                
                // Начисление в зависимости от самолета
                let addAmount = 0;
                if (isPlt) {
                    addAmount = (window.currentPlane === 'gold' ? 100 : window.currentPlane === 'bronze' ? 50 : window.currentPlane === 'copper' ? 20 : 10);
                    window.pltBalance += addAmount;
                } else {
                    addAmount = (window.currentPlane === 'gold' ? 0.001 : window.currentPlane === 'bronze' ? 0.0005 : window.currentPlane === 'copper' ? 0.0001 : 0.00005);
                    window.usdtBalance += addAmount;
                }
                
                window.updateUI();
                
                // Отправка на сервер (если функция определена в api.js)
                if (window.saveCollect) window.saveCollect(addAmount, isPlt ? 'plt' : 'usdt');

                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    hook.x = startX + Math.sin(angle) * distance;
    hook.y = startY + Math.cos(angle) * distance;
    hook.rotation = -angle;
}
