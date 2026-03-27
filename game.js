const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, rope, targets, isLaunching = false, isReturning = false, caughtItem = null;
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
}

function create() {
    this.add.image(config.width/2, config.height/2, 'sky').setDisplaySize(config.width, config.height);
    targets = this.physics.add.group();
    for(let i=0; i<6; i++) spawn(this);
    
    rope = this.add.graphics().setDepth(5);
    hook = this.add.sprite(config.width/2, 140, 'hook').setDepth(50).setDisplaySize(65, 65); 
    this.physics.add.existing(hook);
    plane = this.add.image(config.width/2, 120, 'plane').setDisplaySize(280, 180).setDepth(60);

    this.physics.add.overlap(hook, targets, (h, item) => {
        if (isLaunching && !caughtItem) {
            caughtItem = item; caughtItem.body.enable = false;
            isLaunching = false; isReturning = true;
            if(window.playBeep) window.playBeep(350, 0.1);
        }
    });

    this.input.on('pointerdown', (p) => {
        if (p.y > 100 && p.y < config.height - 80) { // Не кликать на меню
            if (!isLaunching && !isReturning && window.energy > 0) {
                isLaunching = true; window.energy--; window.updateUI();
            }
        }
    });
}

window.changePlaneSkin = function(t) {
    if(!plane) return;
    let key = (t === 'copper') ? 'plane_copper' : (t === 'bronze') ? 'plane_bronze' : (t === 'gold') ? 'plane_gold' : 'plane';
    plane.setTexture(key);
};

function spawn(scene) {
    let x = Phaser.Math.Between(50, config.width - 50);
    let y = Phaser.Math.Between(config.height * 0.4, config.height - 120);
    let type = (Phaser.Math.Between(1, 100) <= 75) ? 'pilot_coin' : 'usdt';
    let item = targets.create(x, y, type).setScale(type === 'pilot_coin' ? 0.1 : 0.12).setDepth(40);
}

function showValue(scene, x, y, isPlt) {
    let val = isPlt ? (window.currentPlane === 'gold' ? "50" : window.currentPlane === 'bronze' ? "25" : "10") : 
                    (window.currentPlane === 'gold' ? "0.005" : window.currentPlane === 'bronze' ? "0.0005" : "0.00005");
    let txt = scene.add.text(x, y - 50, `+${val}`, { font: 'bold 24px Arial', fill: isPlt ? '#ffcc00' : '#00ff00' }).setOrigin(0.5).setDepth(100);
    scene.tweens.add({ targets: txt, y: txt.y - 60, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
}

function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 5;
    let startX = plane.x - 5, startY = plane.y + 25;

    if (!isLaunching && !isReturning) {
        angle += swingSpeed; if (angle > 0.4 || angle < -0.4) swingSpeed *= -1;
        distance = 25;
    } else if (isLaunching) {
        distance += 12; if (distance > config.height - 100) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 7;
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                let isPlt = caughtItem.texture.key === 'pilot_coin';
                showValue(this, plane.x, plane.y, isPlt);
                window.saveCollect(0, isPlt ? 'plt' : 'usdt');
                if(window.playBeep) window.playBeep(600, 0.1);
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    hook.x = startX + Math.sin(angle) * distance;
    hook.y = startY + Math.cos(angle) * distance;
    hook.rotation = -angle;
    rope.clear().lineStyle(2, 0xffffff, 0.5).lineBetween(startX, startY, hook.x, hook.y);
    if (caughtItem) { caughtItem.x = hook.x; caughtItem.y = hook.y + 10; caughtItem.rotation = hook.rotation; }
}
