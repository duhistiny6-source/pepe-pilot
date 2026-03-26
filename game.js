const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, rope, targets, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.03, distance = 25;

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

    this.input.on('pointerdown', () => {
        if (!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true; window.energy--; updateUI();
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
    let type = (Phaser.Math.Between(1, 100) <= 60) ? 'pilot_coin' : 'usdt';
    targets.create(x, y, type).setScale(type === 'pilot_coin' ? 0.10 : 0.12).setDepth(40);
}

function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 8;
    if (!isLaunching && !isReturning) {
        angle += swingSpeed; if (angle > 0.8 || angle < -0.8) swingSpeed *= -1;
    } else if (isLaunching) {
        distance += 16; if (distance > config.height - 110) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 10; 
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                const type = (caughtItem.texture.key === 'pilot_coin') ? 'plt' : 'usdt';
                const amount = (type === 'plt') ? 10 : 0.0005;
                
                saveCollect(amount, type); // Вызов нашей функции из api.js
                
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    hook.x = (plane.x - 5) + Math.sin(angle) * distance;
    hook.y = (plane.y + 15) + Math.cos(angle) * distance;
    rope.clear().lineStyle(2, 0xffffff, 0.7).lineBetween(plane.x - 5, plane.y + 15, hook.x, hook.y);
    if (caughtItem) { caughtItem.x = hook.x; caughtItem.y = hook.y + 15; }
}
