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
    this.load.image('plane', 'pepe.png'); // Стандартный
    
    // ЗАГРУЗКА НОВЫХ САМОЛЕТОВ
    this.load.image('plane_copper', 'plane_copper.png');
    this.load.image('plane_bronze', 'plane_bronze.png');
    this.load.image('plane_gold', 'plane_gold.png');
    
    this.load.audio('theme', 'music.mp3');
}

function create() {
    this.add.image(config.width/2, config.height/2, 'sky').setDisplaySize(config.width, config.height);
    
    try { 
        bgMusic = this.sound.add('theme', { volume: 0.002, loop: true }); 
    } catch (e) {}
    this.input.once('pointerdown', () => { if (bgMusic && !bgMusic.isPlaying) bgMusic.play(); });

    targets = this.physics.add.group();
    for(let i=0; i<6; i++) spawn(this);
    
    rope = this.add.graphics().setDepth(5);
    hook = this.add.sprite(0, 0, 'hook').setDepth(50).setDisplaySize(65, 65); 
    this.physics.add.existing(hook);
    
    // Создаем самолет (используем текущий из api.js если он уже загружен)
    let startTexture = 'plane';
    if(window.currentPlane === 'copper') startTexture = 'plane_copper';
    if(window.currentPlane === 'bronze') startTexture = 'plane_bronze';
    if(window.currentPlane === 'gold') startTexture = 'plane_gold';
    
    plane = this.add.image(config.width/2, 120, startTexture).setDisplaySize(280, 180).setDepth(60);

    this.physics.add.overlap(hook, targets, (h, item) => {
        if (isLaunching && !caughtItem) {
            caughtItem = item; 
            caughtItem.body.enable = false;
            if (caughtItem.pulseTween) caughtItem.pulseTween.stop(); 
            if (window.playBeep) window.playBeep(350, 0.1); 
            isLaunching = false; isReturning = true;
        }
    });

    this.input.on('pointerdown', () => {
        if (!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true; window.energy--; if (window.updateUI) window.updateUI();
        }
    });
}

// Функция для смены скина из api.js
window.changePlaneSkin = function(type) {
    if (!plane) return;
    let tex = 'plane';
    if (type === 'copper') tex = 'plane_copper';
    if (type === 'bronze') tex = 'plane_bronze';
    if (type === 'gold') tex = 'plane_gold';
    plane.setTexture(tex);
    plane.setDisplaySize(280, 180);
};

function spawn(scene) {
    let x = Phaser.Math.Between(60, config.width - 60);
    let y = Phaser.Math.Between(config.height * 0.5, config.height - 130);
    let type = (Phaser.Math.Between(1, 100) <= 70) ? 'pilot_coin' : 'usdt';
    let coin = targets.create(x, y, type).setDepth(40);
    let baseScale = type === 'pilot_coin' ? 0.10 : 0.12;
    coin.setScale(baseScale);

    coin.pulseTween = scene.tweens.add({
        targets: coin, scale: baseScale * 1.2, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
}

function showValue(scene, isPlt) {
    let val = "";
    let color = isPlt ? '#ffcc00' : '#00ff00';
    
    // Определяем текст в зависимости от самолета
    if (isPlt) {
        if (window.currentPlane === 'copper') val = "10";
        else if (window.currentPlane === 'bronze') val = "25";
        else if (window.currentPlane === 'gold') val = "50";
        else val = "10";
    } else {
        if (window.currentPlane === 'copper') val = "0.00005";
        else if (window.currentPlane === 'bronze') val = "0.0005";
        else if (window.currentPlane === 'gold') val = "0.005";
        else val = "0.00005";
    }

    let txt = scene.add.text(plane.x, plane.y - 40, `+${val}`, { font: 'bold 28px Arial', fill: color }).setOrigin(0.5).setDepth(100);
    scene.tweens.add({ targets: txt, y: txt.y - 70, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
}

function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 8;
    let startX = plane.x - 5; let startY = plane.y + 20; 

    if (!isLaunching && !isReturning) {
        angle += swingSpeed; 
        if (angle > 0.4 || angle < -0.4) swingSpeed *= -1; 
        distance = 25;
    } else if (isLaunching) {
        distance += 14; 
        if (distance > config.height - 110) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 6; 
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                let isPlt = (caughtItem.texture.key === 'pilot_coin');
                
                // ВАЖНО: вызываем showValue БЕЗ передачи заранее посчитанной суммы, 
                // так как она теперь считается внутри функции на основе самолета
                showValue(this, isPlt); 
                
                if (window.playBeep) window.playBeep(700, 0.1); 
                
                // Сохраняем (в api.js сумма посчитается автоматически)
                if (window.saveCollect) window.saveCollect(0, isPlt ? 'plt' : 'usdt'); 
                
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    hook.x = startX + Math.sin(angle) * distance;
    hook.y = startY + Math.cos(angle) * distance;
    hook.rotation = -angle;
    
    let ropeEndX = startX + Math.sin(angle) * (distance - 20);
    let ropeEndY = startY + Math.cos(angle) * (distance - 20);
    rope.clear().lineStyle(2, 0xffffff, 0.6).lineBetween(startX, startY, ropeEndX, ropeEndY);
    
    if (caughtItem) { 
        caughtItem.x = hook.x; caughtItem.y = hook.y + 15; caughtItem.rotation = hook.rotation; 
    }
}
