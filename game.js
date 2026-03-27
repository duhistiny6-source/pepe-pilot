const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: { default: 'arcade' },
    scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, rope, targets, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, distance = 25;

function preload() {
    // Выводим в консоль, если файл не грузится
    this.load.on('loaderror', (file) => { console.log('Ошибка загрузки: ' + file.key); });

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
    
    targets = this.physics.add.group();
    for(let i=0; i<6; i++) spawn(this);
    
    rope = this.add.graphics();
    hook = this.add.sprite(0, 0, 'hook').setDisplaySize(60, 60).setDepth(50);
    this.physics.add.existing(hook);

    // Безопасная инициализация самолета
    let tex = 'plane';
    if(window.currentPlane !== 'default') tex = 'plane_' + window.currentPlane;
    plane = this.add.image(config.width/2, 120, tex).setDisplaySize(280, 180).setDepth(60);

    this.physics.add.overlap(hook, targets, (h, item) => {
        if (isLaunching && !caughtItem) {
            caughtItem = item;
            caughtItem.body.enable = false;
            if (window.playBeep) window.playBeep(450, 0.1);
            isLaunching = false; isReturning = true;
        }
    });

    this.input.on('pointerdown', () => {
        if (!isLaunching && !isReturning && window.checkEnergy()) {
            isLaunching = true;
            window.energy--;
            window.updateUI();
            if (window.playBeep) window.playBeep(250, 0.05);
        }
    });
}

function spawn(scene) {
    let x = Phaser.Math.Between(50, config.width - 50);
    let y = Phaser.Math.Between(config.height * 0.5, config.height - 100);
    let type = (Phaser.Math.Between(1, 100) <= 70) ? 'pilot_coin' : 'usdt';
    targets.create(x, y, type).setScale(0.12).setDepth(40);
}

function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 5;
    let startX = plane.x, startY = plane.y + 20;

    if (!isLaunching && !isReturning) {
        angle += 0.015;
        if (Math.abs(angle) > 0.4) angle *= -1; // Упрощенное качание
        distance = 25;
    } else if (isLaunching) {
        distance += 12;
        if (distance > config.height - 100) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 8;
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                if (window.playBeep) window.playBeep(700, 0.1);
                window.saveCollect(0, caughtItem.texture.key === 'pilot_coin' ? 'plt' : 'usdt');
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    hook.x = startX + Math.sin(angle) * distance;
    hook.y = startY + Math.cos(angle) * distance;
    rope.clear().lineStyle(2, 0xffffff, 0.5).lineBetween(startX, startY, hook.x, hook.y);
    if (caughtItem) { caughtItem.x = hook.x; caughtItem.y = hook.y + 10; }
}
       
    
 
