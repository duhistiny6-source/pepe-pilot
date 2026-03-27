const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, rope, targets, bgMusic, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.015, distance = 25;

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
    try { bgMusic = this.sound.add('theme', { volume: 0.002, loop: true }); } catch (e) {}
    this.input.once('pointerdown', () => { if (bgMusic && !bgMusic.isPlaying) bgMusic.play(); });

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

    this.input.on('pointerdown', () => {
        if (!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true; window.energy--; window.updateUI();
        }
    });
}

window.changePlaneSkin = function(type) {
    if (!plane) return;
    let tex = (type === 'copper') ? 'plane_copper' : (type === 'bronze') ? 'plane_bronze' : (type === 'gold') ? 'plane_gold' : 'plane';
    plane.setTexture(tex);
};

function spawn(scene) {
    let x = Phaser.Math.Between(60, config.width - 60);
    let y = Phaser.Math.Between(config.height * 0.5, config.height - 130);
    let type = (Phaser.Math.Between(1, 100) <= 70) ? 'pilot_coin' : 'usdt';
    let coin = targets.create(x, y, type).setScale(type === 'pilot_coin' ? 0.10 : 0.12).setDepth(40);
    coin.pulseTween = scene.tweens.add({ targets: coin, scale: coin.scale * 1.2, duration: 1000, yoyo: true, repeat: -1 });
}

function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 8;
    let startX = plane.x - 5; let startY = plane.y + 20; 
    if (!isLaunching && !isReturning) {
        angle += swingSpeed; if (angle > 0.4 || angle < -0.4) swingSpeed *= -1;
        distance = 25;
    } else if (isLaunching) {
        distance += 14; if (distance > config.height - 110) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 6;
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                let isPlt = (caughtItem.texture.key === 'pilot_coin');
                window.saveCollect(0, isPlt ? 'plt' : 'usdt');
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    hook.x = startX + Math.sin(angle) * distance; hook.y = startY + Math.cos(angle) * distance;
    rope.clear().lineStyle(2, 0xffffff, 0.6).lineBetween(startX, startY, hook.x, hook.y);
    if (caughtItem) { caughtItem.x = hook.x; caughtItem.y = hook.y + 15; }
}
  
