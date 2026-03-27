const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, rope, targets, bgMusic, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.015, distance = 25;

// СОСТОЯНИЕ (ИНТЕГРАЦИЯ)
window.energy = 100;
window.pltBalance = 0;
window.usdtBalance = 0;
let nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000;

window.updateUI = function() {
    document.getElementById('energy').innerText = Math.floor(window.energy);
    document.getElementById('money').innerText = window.usdtBalance.toFixed(5);
    document.getElementById('frog-money').innerText = Math.floor(window.pltBalance);
    
    // Показываем кнопку рекламы только когда энергии меньше 100
    document.getElementById('restore-btn').style.display = (window.energy < 100) ? "block" : "none";
};

// ТАЙМЕР 2 ЧАСА
setInterval(() => {
    const diff = nextRestoreTime - Date.now();
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
    // Сюда подключаем рекламу в будущем
    window.energy = 100;
    nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000;
    window.updateUI();
};

function preload() {
    this.load.image('sky', 'pg.jpeg');
    this.load.image('hook', 'kleshn.png');
    this.load.image('usdt', 'usdt.png');
    this.load.image('pilot_coin', 'logo..png');
    this.load.image('plane', 'pepe.png');
    this.load.image('plane_copper', 'plane_copper.png');
    this.load.image('plane_bronze', 'plane_bronze.png');
    this.load.image('plane_gold', 'plane_gold.png');
    this.load.audio('theme', 'music.mp3');
}

function create() {
    this.add.image(config.width/2, config.height/2, 'sky').setDisplaySize(config.width, config.height);
    try { bgMusic = this.sound.add('theme', { volume: 0.01, loop: true }); } catch (e) {}
    this.input.once('pointerdown', () => { if (bgMusic && !bgMusic.isPlaying) bgMusic.play(); });

    targets = this.physics.add.group();
    for(let i=0; i<6; i++) spawn(this);
    rope = this.add.graphics().setDepth(5);
    hook = this.add.sprite(0, 0, 'hook').setDepth(50).setDisplaySize(65, 65);
    this.physics.add.existing(hook);

    let tex = 'plane';
    if(window.currentPlane === 'copper') tex = 'plane_copper';
    if(window.currentPlane === 'bronze') tex = 'plane_bronze';
    if(window.currentPlane === 'gold') tex = 'plane_gold';
    plane = this.add.image(config.width/2, 120, tex).setDisplaySize(280, 180).setDepth(60);

    this.physics.add.overlap(hook, targets, (h, item) => {
        if (isLaunching && !caughtItem) {
            caughtItem = item; caughtItem.body.enable = false;
            if (caughtItem.pulse) caughtItem.pulse.stop();
            isLaunching = false; isReturning = true;
        }
    });

    this.input.on('pointerdown', (p) => {
        if (p.y < 50 || p.y > config.height - 70) return; // Не кликать на интерфейс
        if (!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true; 
            window.energy--; 
            window.updateUI();
        }
    });
}

function spawn(scene) {
    let x = Phaser.Math.Between(60, config.width - 60);
    let y = Phaser.Math.Between(config.height * 0.5, config.height - 130);
    let type = (Phaser.Math.Between(1, 100) <= 75) ? 'pilot_coin' : 'usdt';
    let coin = targets.create(x, y, type).setScale(type === 'pilot_coin' ? 0.10 : 0.12).setDepth(40);
    coin.pulse = scene.tweens.add({ targets: coin, scale: (type === 'pilot_coin' ? 0.12 : 0.14), duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
}

function showValue(scene, isPlt) {
    let val = isPlt ? (window.currentPlane === 'copper' ? "20" : window.currentPlane === 'bronze' ? "50" : window.currentPlane === 'gold' ? "100" : "10") : (window.currentPlane === 'copper' ? "0.0001" : window.currentPlane === 'bronze' ? "0.0005" : window.currentPlane === 'gold' ? "0.001" : "0.00005");
    let txt = scene.add.text(plane.x, plane.y - 40, `+${val}`, { font: 'bold 28px Arial', fill: isPlt ? '#ffcc00' : '#00ff00' }).setOrigin(0.5).setDepth(100);
    scene.tweens.add({ targets: txt, y: txt.y - 70, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
    
    // Начисление в баланс
    if (isPlt) window.pltBalance += parseFloat(val);
    else window.usdtBalance += parseFloat(val);
    window.updateUI();
    
    // Отправка на сервер
    if (window.saveCollect) window.saveCollect(parseFloat(val), isPlt ? 'plt' : 'usdt');
}

function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 8;
    let startX = plane.x - 5, startY = plane.y + 20;
    if (!isLaunching && !isReturning) {
        angle += swingSpeed; if (angle > 0.4 || angle < -0.4) swingSpeed *= -1; distance = 25;
    } else if (isLaunching) {
        distance += 14; if (distance > config.height - 110) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 8;
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                showValue(this, caughtItem.texture.key === 'pilot_coin');
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    hook.x = startX + Math.sin(angle) * distance; hook.y = startY + Math.cos(angle) * distance; hook.rotation = -angle;
    rope.clear().lineStyle(2, 0xffffff, 0.6).lineBetween(startX, startY, startX + Math.sin(angle) * (distance - 20), startY + Math.cos(angle) * (distance - 20));
    if (caughtItem) { caughtItem.x = hook.x; caughtItem.y = hook.y + 15; }
}
