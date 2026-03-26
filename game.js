const USDT_VALUE = 0.0005;
const FROG_VALUE = 10;
let plane, hook, rope, targets, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.03, distance = 25, energy = 100;

const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'pg.jpeg');
    this.load.image('hook', 'kleshn.png');
    this.load.image('usdt', 'usdt.png');
    this.load.image('pilot_coin', 'logo..png');
    this.load.image('plane', 'pepe.png');
}

function create() {
    this.add.image(config.width / 2, config.height / 2, 'sky').setDisplaySize(config.width, config.height);
    targets = this.physics.add.group();
    for(let i = 0; i < 6; i++) spawn(this);
    rope = this.add.graphics().setDepth(5);
    hook = this.add.sprite(0, 0, 'hook').setDepth(50).setDisplaySize(60, 60); 
    this.physics.add.existing(hook);
    plane = this.add.image(config.width / 2, 120, 'plane').setDisplaySize(280, 180).setDepth(60);

    this.input.on('pointerdown', (p) => {
        if (document.querySelector('.modal[style*="flex"]')) return;
        if (p.y > 80 && !isLaunching && !isReturning && energy > 0) {
            isLaunching = true; energy--; updateUI();
        }
    });

    this.physics.add.overlap(hook, targets, (h, item) => {
        if (isLaunching && !caughtItem) {
            caughtItem = item; caughtItem.body.enable = false;
            isLaunching = false; isReturning = true;
        }
    });
}

function spawn(scene) {
    let x = Phaser.Math.Between(50, config.width - 50);
    let y = Phaser.Math.Between(config.height * 0.45, config.height - 150);
    let key = (Phaser.Math.Between(1, 100) <= 60) ? 'pilot_coin' : 'usdt';
    let coin = targets.create(x, y, key).setDepth(40).setScale(key === 'pilot_coin' ? 0.1 : 0.12);
}

function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 8;
    let sX = plane.x - 5, sY = plane.y + 15; 
    if (!isLaunching && !isReturning) {
        angle += swingSpeed; if (angle > 0.8 || angle < -0.8) swingSpeed *= -1;
    } else if (isLaunching) {
        distance += 16; if (distance > config.height - 110) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 6; 
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                let p = 0, u = 0;
                if (caughtItem.texture.key === 'pilot_coin') { p = FROG_VALUE; window.frogMoney += p; }
                else { u = USDT_VALUE; window.usdtMoney += u; }
                saveProgress(p, u);
                caughtItem.destroy(); caughtItem = null; spawn(this.scene.scene); updateUI();
            }
        }
    }
    hook.x = sX + Math.sin(angle) * distance; hook.y = sY + Math.cos(angle) * distance; hook.rotation = -angle;
    rope.clear().lineStyle(2, 0xffffff, 0.7).lineBetween(sX, sY, hook.x, hook.y);
    if (caughtItem) { caughtItem.x = hook.x; caughtItem.y = hook.y + 15; }
}

function updateUI() {
    document.getElementById('money').innerText = window.usdtMoney.toFixed(4);
    document.getElementById('frog-money').innerText = Math.floor(window.frogMoney);
    document.getElementById('energy').innerText = energy;
}
