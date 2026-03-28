const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, rope, targets, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.015, distance = 25;

// СОСТОЯНИЕ (Кошелек и энергия)
window.energy = 100;
window.pltBalance = 0;
window.usdtBalance = 0;
let nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000;

// Обновление интерфейса
window.updateUI = function() {
    document.getElementById('energy').innerText = Math.floor(window.energy);
    document.getElementById('money').innerText = window.usdtBalance.toFixed(5);
    document.getElementById('frog-money').innerText = Math.floor(window.pltBalance);
    
    // Показываем таймер только если энергия < 100
    document.getElementById('energy-info-extra').style.display = (window.energy < 100) ? "flex" : "none";
};

// Таймер восстановления
setInterval(() => {
    if (window.energy >= 100) return;
    const diff = nextRestoreTime - Date.now();
    if (diff <= 0) {
        window.energy = 100;
        nextRestoreTime = Date.now() + 7200000;
        window.updateUI();
    }
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    document.getElementById('energy-timer').innerText = `01:${m}:${s}`;
}, 1000);

window.restoreEnergyByAd = function() {
    window.energy = 100;
    window.updateUI();
};

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
    rope = this.add.graphics().setDepth(5);
    hook = this.add.sprite(0, 0, 'hook').setDepth(50).setDisplaySize(65, 65);
    this.physics.add.existing(hook);
    plane = this.add.image(config.width/2, 120, 'plane').setDisplaySize(280, 180).setDepth(60);

    this.physics.add.overlap(hook, targets, (h, item) => {
        if (isLaunching && !caughtItem) {
            caughtItem = item; caughtItem.body.enable = false;
            isLaunching = false; isReturning = true;
        }
    });

    this.input.on('pointerdown', (p) => {
        if (p.y < 50 || p.y > config.height - 70) return;
        if (!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true; window.energy--; window.updateUI();
        }
    });
}

function spawn(scene) {
    let x = Phaser.Math.Between(60, config.width - 60);
    let y = Phaser.Math.Between(config.height * 0.5, config.height - 130);
    let type = (Math.random() > 0.7) ? 'usdt' : 'plt';
    targets.create(x, y, type).setScale(0.12).setDepth(40);
}

function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 8;
    let startX = plane.x - 5, startY = plane.y + 20;

    if (!isLaunching && !isReturning) {
        angle += swingSpeed; if (angle > 0.4 || angle < -0.4) swingSpeed *= -1; distance = 25;
    } else if (isLaunching) {
        distance += 14; if (distance > config.height - 110) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 9;
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                // Начисление в кошелек
                if (caughtItem.texture.key === 'plt') window.pltBalance += 10;
                else window.usdtBalance += 0.0001;
                window.updateUI();
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }

    hook.x = startX + Math.sin(angle) * distance;
    hook.y = startY + Math.cos(angle) * distance;
    hook.rotation = -angle;

    // ИСПРАВЛЕННАЯ НИТКА (Рисуем точно до центра клешни)
    rope.clear().lineStyle(2, 0xffffff, 0.5).lineBetween(startX, startY, hook.x, hook.y);

    if (caughtItem) { caughtItem.x = hook.x; caughtItem.y = hook.y + 15; }
}
