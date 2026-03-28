const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, rope, targets, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.015, distance = 25;

window.energy = 100;
let restoreTime = 7200; // 2 часа

window.playBeep = function(f, d) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f; g.gain.value = 0.04;
        o.start(); setTimeout(() => o.stop(), d * 1000);
    } catch(e){}
};

window.updateUI = function() {
    document.getElementById('energy').innerText = window.energy;
    // Показываем блок с таймером и AD ТОЛЬКО если энергия < 100
    document.getElementById('energy-info-extra').style.display = (window.energy < 100) ? "block" : "none";
};

window.restoreEnergyByAd = function() {
    window.energy = 100; restoreTime = 7200; window.updateUI();
};

setInterval(() => {
    if (window.energy < 100) {
        restoreTime--;
        let h = Math.floor(restoreTime / 3600), m = Math.floor((restoreTime % 3600) / 60), s = restoreTime % 60;
        document.getElementById('energy-timer').innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        if (restoreTime <= 0) { window.energy = 100; window.updateUI(); }
    }
}, 1000);

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
            window.playBeep(450, 0.1); isLaunching = false; isReturning = true;
        }
    });

    this.input.on('pointerdown', (p) => {
        if (p.y < 50 || p.y > config.height - 70) return;
        if (!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true; window.energy--; window.updateUI();
            window.playBeep(250, 0.06);
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
        distance -= 4; // Медленный возврат
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                window.playBeep(700, 0.12);
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    hook.x = startX + Math.sin(angle) * distance;
    hook.y = startY + Math.cos(angle) * distance;
    hook.rotation = -angle;

    // Нитка ювелирно в центр клешни
    rope.clear().lineStyle(2, 0xffffff, 0.5).lineBetween(startX, startY, hook.x, hook.y);
    if (caughtItem) { caughtItem.x = hook.x; caughtItem.y = hook.y + 15; }
}
