const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, rope, targets, bgMusic, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.03, distance = 25;

const USDT_VALUE = 0.0005;
const FROG_VALUE = 10;

function preload() {
    this.load.image('sky', 'pg.jpeg');
    this.load.image('hook', 'kleshn.png');
    this.load.image('usdt', 'usdt.png');
    this.load.image('pilot_coin', 'logo..png');
    this.load.image('plane', 'pepe.png');
    this.load.audio('theme', 'music.mp3');
}

function create() {
    this.add.image(config.width / 2, config.height / 2, 'sky').setDisplaySize(config.width, config.height);
    try { bgMusic = this.sound.add('theme', { volume: 0.1, loop: true }); } catch (e) {}
    this.input.once('pointerdown', () => { if (bgMusic && !bgMusic.isPlaying) bgMusic.play(); });

    targets = this.physics.add.group();
    for(let i = 0; i < 6; i++) spawn(this);
    
    rope = this.add.graphics().setDepth(5);
    hook = this.add.sprite(0, 0, 'hook').setDepth(50).setDisplaySize(60, 60); 
    this.physics.add.existing(hook);
    plane = this.add.image(config.width / 2, 120, 'plane').setDisplaySize(280, 180).setDepth(60);

    this.input.on('pointerdown', () => {
        if (!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true; window.energy--; updateUI();
        }
    });

    this.physics.add.overlap(hook, targets, (h, item) => {
        if (isLaunching && !caughtItem) {
            caughtItem = item; caughtItem.body.enable = false;
            if (caughtItem.pulse) caughtItem.pulse.stop();
            playBeep(400, 0.08); isLaunching = false; isReturning = true;
        }
    });
}

function spawn(scene) {
    let x = Phaser.Math.Between(50, config.width - 50);
    let y = Phaser.Math.Between(config.height * 0.45, config.height - 150);
    let type = (Phaser.Math.Between(1, 100) <= 60) ? 'pilot_coin' : 'usdt';
    let coin = targets.create(x, y, type).setDepth(40);
    coin.setScale(type === 'pilot_coin' ? 0.10 : 0.12);
    coin.pulse = scene.tweens.add({ targets: coin, scale: type === 'pilot_coin' ? 0.12 : 0.14, duration: 1000, yoyo: true, repeat: -1 });
}

function showValue(scene, val, isFrog) {
    let color = isFrog ? '#ffcc00' : '#0f0';
    let txt = scene.add.text(plane.x, plane.y - 40, `+${val}`, { font: 'bold 28px Arial', fill: color, stroke: '#000', strokeThickness: 5 }).setOrigin(0.5).setDepth(100);
    scene.tweens.add({ targets: txt, y: txt.y - 100, alpha: 0, duration: 1000, onComplete: () => txt.destroy() });
}

function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 8;
    let startX = plane.x - 5; let startY = plane.y + 15; 

    if (!isLaunching && !isReturning) {
        angle += swingSpeed; if (angle > 0.8 || angle < -0.8) swingSpeed *= -1;
        distance = 25;
    } else if (isLaunching) {
        distance += 16; if (distance > config.height - 110) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 10; 
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                let type = (caughtItem.texture.key === 'pilot_coin') ? 'plt' : 'usdt';
                let amount = (type === 'plt') ? FROG_VALUE : USDT_VALUE;
                showValue(this, amount, (type === 'plt'));
                playBeep(900, 0.12);
                saveCollect(amount, type); 
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    
    // --- ИСПРАВЛЕННЫЕ КООРДИНАТЫ ТРОСА ---
    hook.x = startX + Math.sin(angle) * distance;
    hook.y = startY + Math.cos(angle) * distance;
    hook.rotation = -angle;
    
    let endX = startX + Math.sin(angle) * (distance - 30);
    let endY = startY + Math.cos(angle) * (distance - 30);
    rope.clear().lineStyle(2, 0xffffff, 0.7).lineBetween(startX, startY, endX, endY);
    
    if (caughtItem) { 
        caughtItem.x = hook.x; 
        caughtItem.y = hook.y + 15; 
        caughtItem.rotation = hook.rotation; 
    }
}

function updateUI() {
    // ВАЖНО: .toFixed(4) показывает баланс USDT правильно
    document.getElementById('money').innerText = window.usdtMoney.toFixed(4);
    document.getElementById('frog-money').innerText = Math.floor(window.frogMoney);
    document.getElementById('energy').innerText = window.energy;
}

