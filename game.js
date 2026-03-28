const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, rope, targets, bgMusic, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.015, distance = 25;

// Состояние энергии
window.energy = 100;
let restoreTime = 0; // Время до восстановления (в секундах)

// Ювелирная функция звука (восстанавливаем сигналы)
window.playBeep = function(freq, duration) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.value = freq; gain.gain.value = 0.05;
        osc.start(); setTimeout(() => osc.stop(), duration * 1000);
    } catch(e) {}
};

window.updateUI = function() {
    document.getElementById('energy').innerText = window.energy;
    const extra = document.getElementById('energy-info-extra');
    if (window.energy < 100) {
        extra.style.display = "block";
    } else {
        extra.style.display = "none";
    }
};

window.restoreEnergyByAd = function() {
    // Имитация просмотра рекламы
    window.energy = 100;
    restoreTime = 0;
    window.updateUI();
    window.playBeep(600, 0.2);
};

// Таймер восстановления (2 часа = 7200 сек)
setInterval(() => {
    if (window.energy < 100) {
        if (restoreTime <= 0) restoreTime = 7200; 
        restoreTime--;
        
        let h = Math.floor(restoreTime / 3600);
        let m = Math.floor((restoreTime % 3600) / 60);
        let s = restoreTime % 60;
        document.getElementById('energy-timer').innerText = 
            `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        
        if (restoreTime <= 0) {
            window.energy = 100;
            window.updateUI();
        }
    }
}, 1000);

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
    try {
        bgMusic = this.sound.add('theme', { volume: 0.01, loop: true });
    } catch (e) {}
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
            window.playBeep(450, 0.1); // СИГНАЛ ЗАХВАТА
            isLaunching = false; isReturning = true;
        }
    });

    this.input.on('pointerdown', () => {
        if (!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true; 
            window.energy--; 
            window.updateUI();
            window.playBeep(250, 0.06); // СИГНАЛ ЗАПУСКА
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
    let val = isPlt ? "10" : "0.00005"; // Базовые значения
    let txt = scene.add.text(plane.x, plane.y - 40, `+${val}`, { font: 'bold 28px Arial', fill: isPlt ? '#ffcc00' : '#00ff00' }).setOrigin(0.5).setDepth(100);
    scene.tweens.add({ targets: txt, y: txt.y - 70, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
}

function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 8;
    let startX = plane.x - 5, startY = plane.y + 20;
    
    if (!isLaunching && !isReturning) {
        angle += swingSpeed; if (angle > 0.4 || angle < -0.4) swingSpeed *= -1; distance = 25;
    } else if (isLaunching) {
        distance += 14; 
        if (distance > config.height - 110) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 4; // ЗАМЕДЛИЛИ ВОЗВРАТ (было 6)
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                window.playBeep(700, 0.12); // СИГНАЛ УДАРА
                showValue(this, caughtItem.texture.key === 'pilot_coin');
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    hook.x = startX + Math.sin(angle) * distance; hook.y = startY + Math.cos(angle) * distance; hook.rotation = -angle;
    rope.clear().lineStyle(2, 0xffffff, 0.6).lineBetween(startX, startY, startX + Math.sin(angle) * (distance - 20), startY + Math.cos(angle) * (distance - 20));
    if (caughtItem) { caughtItem.x = hook.x; caughtItem.y = hook.y + 15; }
}
