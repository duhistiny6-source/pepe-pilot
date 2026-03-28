const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, rope, targets, bgMusic, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.015, distance = 25;

// Глобальное состояние
window.energy = 100;
window.pltBalance = 0;
window.usdtBalance = 0;
window.currentPlane = 'default';
let nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000;

// Функция звуковых сигналов (Beep)
window.playBeep = function(freq, duration) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.value = freq; gain.gain.value = 0.02;
        osc.start(); setTimeout(() => osc.stop(), duration * 1000);
    } catch(e){}
};

// Функция обновления UI
window.updateUI = function() {
    document.getElementById('energy').innerText = Math.floor(window.energy);
    document.getElementById('money').innerText = window.usdtBalance.toFixed(4);
    document.getElementById('frog-money').innerText = Math.floor(window.pltBalance);
    
    // Показываем таймер и кнопку только если энергия потрачена
    const extra = document.getElementById('energy-info-extra');
    extra.style.display = (window.energy < 100) ? "flex" : "none";
};

// Таймер восстановления
setInterval(() => {
    if (window.energy >= 100) return;
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
    window.energy = 100;
    nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000;
    window.updateUI();
    window.playBeep(600, 0.1);
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

    let tex = (window.currentPlane === 'default') ? 'plane' : 'plane_' + window.currentPlane;
    plane = this.add.image(config.width/2, 120, tex).setDisplaySize(280, 180).setDepth(60);

    this.physics.add.overlap(hook, targets, (h, item) => {
        if (isLaunching && !caughtItem) {
            caughtItem = item; caughtItem.body.enable = false;
            if (caughtItem.pulse) caughtItem.pulse.stop();
            window.playBeep(450, 0.1); 
            isLaunching = false; isReturning = true;
        }
    });

    this.input.on('pointerdown', (p) => {
        if (p.y < 50 || p.y > config.height - 70) return; // Не кликать на UI
        if (!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true; window.energy--; window.updateUI();
            window.playBeep(250, 0.06);
        }
    });
}

function spawn(scene) {
    let x = Phaser.Math.Between(60, config.width - 60);
    let y = Phaser.Math.Between(config.height * 0.5, config.height - 130);
    let type = (Phaser.Math.Between(1, 100) <= 70) ? 'pilot_coin' : 'usdt';
    let coin = targets.create(x, y, type).setScale(type === 'pilot_coin' ? 0.10 : 0.12).setDepth(40);
    coin.pulse = scene.tweens.add({ targets: coin, scale: (type === 'pilot_coin' ? 0.12 : 0.14), duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
}

function showValue(scene, isPlt) {
    let val = isPlt ? (window.currentPlane === 'copper' ? 20 : window.currentPlane === 'bronze' ? 50 : window.currentPlane === 'gold' ? 100 : 10) : (window.currentPlane === 'copper' ? 0.0001 : window.currentPlane === 'bronze' ? 0.0005 : window.currentPlane === 'gold' ? 0.001 : 0.00005);
    
    // Начисляем в глобальный баланс
    if (isPlt) window.pltBalance += val; else window.usdtBalance += val;
    window.updateUI();

    let txt = scene.add.text(plane.x, plane.y - 40, `+${val}`, { font: 'bold 28px Arial', fill: isPlt ? '#ffcc00' : '#00ff00' }).setOrigin(0.5).setDepth(100);
    scene.tweens.add({ targets: txt, y: txt.y - 70, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
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
                window.playBeep(700, 0.12);
                showValue(this, caughtItem.texture.key === 'pilot_coin');
                if (window.saveCollect) window.saveCollect(0, caughtItem.texture.key === 'pilot_coin' ? 'plt' : 'usdt');
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    hook.x = startX + Math.sin(angle) * distance; hook.y = startY + Math.cos(angle) * distance; hook.rotation = -angle;
    rope.clear().lineStyle(2, 0xffffff, 0.6).lineBetween(startX, startY, hook.x, hook.y);
    if (caughtItem) { caughtItem.x = hook.x; caughtItem.y = hook.y + 15; }
} 
