const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, rope, targets, bgMusic, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.015, distance = 25;

// Синхронизация интерфейса
window.updateUI = function() {
    const energyEl = document.getElementById('energy');
    const restoreBtn = document.getElementById('restore-btn');
    const moneyEl = document.getElementById('money');
    const frogMoneyEl = document.getElementById('frog-money');

    if (energyEl) energyEl.innerText = Math.floor(window.energy || 0);
    if (moneyEl) moneyEl.innerText = (window.usdtBalance || 0).toFixed(5);
    if (frogMoneyEl) frogMoneyEl.innerText = Math.floor(window.pltBalance || 0);
    
    // Показываем кнопку восстановления, если энергия кончилась
    if (window.energy <= 0) {
        restoreBtn.style.display = "block";
    } else {
        restoreBtn.style.display = "none";
    }
}

// Функция для кнопки "Восстановить"
window.restoreEnergyByAd = function() {
    window.energy = 100;
    window.updateUI();
    saveEnergyToServer(100);
}

function saveEnergyToServer(val) {
    if(!window.userId) return;
    fetch('/api/energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgId: window.userId, energy: val })
    }).catch(e => console.error("Error saving energy"));
}

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
            if (window.playBeep) window.playBeep(450, 0.1);
            isLaunching = false; isReturning = true;
        }
    });

    this.input.on('pointerdown', (pointer) => {
        // Не запускаем, если кликнули по кнопкам меню (верх/низ)
        if (pointer.y < 60 || pointer.y > config.height - 70) return;

        if (!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true; 
            window.energy--; 
            window.updateUI();
            saveEnergyToServer(window.energy);
            if (window.playBeep) window.playBeep(250, 0.06);
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
    let val = isPlt ? (window.currentPlane === 'copper' ? "20" : window.currentPlane === 'bronze' ? "50" : window.currentPlane === 'gold' ? "100" : "10") : (window.currentPlane === 'copper' ? "0.0001" : window.currentPlane === 'bronze' ? "0.0005" : window.currentPlane === 'gold' ? "0.001" : "0.00005");
    let txt = scene.add.text(plane.x, plane.y - 40, `+${val}`, { font: 'bold 28px Arial', fill: isPlt ? '#ffcc00' : '#00ff00' }).setOrigin(0.5).setDepth(100);
    scene.tweens.add({ targets: txt, y: txt.y - 70, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
}

function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 8;
    let startX = plane.x - 5, startY = plane.y + 20;
    if (!isLaunching && !isReturning) {
        angle += swingSpeed; if (angle > 0.4 || angle < -0.4) swingSpeed *= -1; distance = 25;
    } else if (isLaunching) {
        distance += 14; if (distance > config.height - 110) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 6;
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                if (window.playBeep) window.playBeep(700, 0.12);
                let isPlt = caughtItem.texture.key === 'pilot_coin';
                showValue(this, isPlt);
                
                // Исправленное начисление баланса
                let addVal = isPlt ? (window.currentPlane === 'copper' ? 20 : window.currentPlane === 'bronze' ? 50 : window.currentPlane === 'gold' ? 100 : 10) : (window.currentPlane === 'copper' ? 0.0001 : window.currentPlane === 'bronze' ? 0.0005 : window.currentPlane === 'gold' ? 0.001 : 0.00005);
                
                if(isPlt) window.pltBalance += addVal; else window.usdtBalance += addVal;
                window.updateUI();

                // Отправка на сервер
                if(window.saveCollect) window.saveCollect(addVal, isPlt ? 'plt' : 'usdt');
                
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    hook.x = startX + Math.sin(angle) * distance; hook.y = startY + Math.cos(angle) * distance; hook.rotation = -angle;
    rope.clear().lineStyle(2, 0xffffff, 0.6).lineBetween(startX, startY, startX + Math.sin(angle) * (distance - 20), startY + Math.cos(angle) * (distance - 20));
    if (caughtItem) { caughtItem.x = hook.x; caughtItem.y = hook.y + 15; }
}
     
