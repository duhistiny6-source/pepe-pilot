const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, rope, targets, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.02, distance = 30;

function preload() {
    this.load.image('sky', 'pg.jpeg');
    this.load.image('hook', 'kleshn.png');
    this.load.image('usdt', 'usdt.png');
    this.load.image('plt', 'logo..png');
    this.load.image('plane', 'pepe.png');
    this.load.image('plane_copper', 'plane_copper.png');
    this.load.image('plane_gold', 'plane_gold.png');
    this.load.audio('music', 'music.mp3');
}

function create() {
    this.add.image(config.width/2, config.height/2, 'sky').setDisplaySize(config.width, config.height);
    
    // Самолет
    plane = this.add.image(config.width/2, 130, 'plane').setDisplaySize(250, 160).setDepth(10);
    
    // Клешня и Трос
    rope = this.add.graphics();
    hook = this.add.sprite(config.width/2, 160, 'hook').setDisplaySize(50, 50).setDepth(5);
    this.physics.add.existing(hook);

    targets = this.physics.add.group();
    for(let i=0; i<5; i++) spawnItem(this);

    this.physics.add.overlap(hook, targets, (h, item) => {
        if(isLaunching && !caughtItem) {
            caughtItem = item; item.body.enable = false;
            isLaunching = false; isReturning = true;
        }
    });

    this.input.on('pointerdown', () => {
        if(!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true; window.energy--; window.updateUI();
        }
    });
}

function spawnItem(scene) {
    const x = Phaser.Math.Between(50, config.width - 50);
    const y = Phaser.Math.Between(300, config.height - 150);
    const type = Phaser.Math.RND.pick(['plt', 'usdt']);
    const item = targets.create(x, y, type).setScale(0.12);
    
    // Пульсация
    scene.tweens.add({
        targets: item, scale: 0.14, duration: 600, yoyo: true, repeat: -1
    });
}

window.updatePlane = (t) => {
    plane.setTexture('plane_' + t);
};

function update() {
    const startX = plane.x;
    const startY = plane.y + 30;

    if(!isLaunching && !isReturning) {
        angle += swingSpeed;
        if(angle > 0.5 || angle < -0.5) swingSpeed *= -1;
    } else if(isLaunching) {
        distance += 10;
        if(distance > config.height - 100) { isLaunching = false; isReturning = true; }
    } else if(isReturning) {
        distance -= 8;
        if(distance <= 30) {
            isReturning = false;
            if(caughtItem) {
                window.saveCollect(caughtItem.texture.key);
                caughtItem.destroy(); caughtItem = null; spawnItem(this);
            }
        }
    }

    hook.x = startX + Math.sin(angle) * distance;
    hook.y = startY + Math.cos(angle) * distance;
    hook.rotation = -angle;

    rope.clear().lineStyle(2, 0xaaaaaa).lineBetween(startX, startY, hook.x, hook.y);
    if(caughtItem) { caughtItem.x = hook.x; caughtItem.y = hook.y + 10; }
}
