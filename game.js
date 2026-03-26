const USDT_VALUE = 0.0005;
const FROG_VALUE = 10;
const RECOVERY_DURATION = 7200; 

let plane, hook, rope, targets, bgMusic, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.03, distance = 25;
let energy = 100, recoveryTime = 0;

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: { default: 'arcade' },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

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
    
    try { 
        bgMusic = this.sound.add('theme', { volume: 0.004, loop: true }); 
    } catch (e) { console.log("Музыка не загружена"); }

    this.input.once('pointerdown', () => { 
        if (bgMusic && !bgMusic.isPlaying) bgMusic.play(); 
    });

    targets = this.physics.add.group();
    for(let i = 0; i < 6; i++) spawn(this);

    rope = this.add.graphics().setDepth(5);
    hook = this.add.sprite(0, 0, 'hook').setDepth(50).setDisplaySize(60, 60); 
    this.physics.add.existing(hook);
    
    plane = this.add.image(config.width / 2, 120, 'plane').setDisplaySize(280, 180).setDepth(60);

    this.input.on('pointerdown', (p) => {
        // Запрет клика, если открыто меню
        if (document.querySelector('.modal[style*="flex"]') || 
            document.getElementById('ad-overlay')?.style.display === 'flex') return;

        if (p.y > 80 && p.y < config.height - 80 && !isLaunching && !isReturning && energy > 0) {
            isLaunching = true; 
            energy--; 
            if (energy <= 0) startRecovery(); 
            updateUI();
        }
    });

    this.physics.add.overlap(hook, targets, (h, item) => {
        if (isLaunching && !caughtItem) {
            caughtItem = item; 
            caughtItem.body.enable = false;
            if (caughtItem.pulse) caughtItem.pulse.stop();
            isLaunching = false; 
            isReturning = true;
        }
    });

    setInterval(tick, 1000);
}

function spawn(scene) {
    let x = Phaser.Math.Between(50, config.width - 50);
    let y = Phaser.Math.Between(config.height * 0.45, config.height - 150);
    let randomChance = Phaser.Math.Between(1, 100);
    let textureKey = (randomChance <= 60) ? 'pilot_coin' : 'usdt';
    
    let coin = targets.create(x, y, textureKey).setDepth(40);
    coin.setScale(textureKey === 'pilot_coin' ? 0.10 : 0.12);
    coin.pulse = scene.tweens.add({ 
        targets: coin, 
        scale: textureKey === 'pilot_coin' ? 0.11 : 0.14, 
        duration: 1000, 
        yoyo: true, 
        repeat: -1, 
        ease: 'Sine.easeInOut' 
    });
}

function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 8;
    let startX = plane.x - 5; 
    let startY = plane.y + 15; 

    if (!isLaunching && !isReturning) {
        angle += swingSpeed; 
        if (angle > 0.8 || angle < -0.8) swingSpeed *= -1;
        distance = 25;
    } else if (isLaunching) {
        distance += 16; 
        if (distance > config.height - 110) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 6; 
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                let addPLT = 0;
                let addUSDT = 0;

                if (caughtItem.texture.key === 'pilot_coin') {
                    addPLT = FROG_VALUE;
                    window.frogMoney += addPLT;
                } else {
                    addUSDT = USDT_VALUE;
                    window.usdtMoney += addUSDT;
                }

                // ВЫЗОВ ФУНКЦИИ ИЗ API.JS
                saveProgress(addPLT, addUSDT); 

                caughtItem.destroy(); 
                caughtItem = null; 
                spawn(this.scene.scene); 
                updateUI();
            }
        }
    }

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
    // Обновляем текст на экране из глобальных переменных
    if(document.getElementById('money')) document.getElementById('money').innerText = window.usdtMoney.toFixed(4);
    if(document.getElementById('frog-money')) document.getElementById('frog-money').innerText = Math.floor(window.frogMoney);
    if(document.getElementById('energy')) document.getElementById('energy').innerText = energy;

    const isOutOfEnergy = energy <= 0;
    const rb = document.getElementById('recovery-block');
    if(rb) rb.style.display = isOutOfEnergy ? 'flex' : 'none';
}

function tick() {
    if (recoveryTime > 0) {
        recoveryTime--;
        let h = Math.floor(recoveryTime / 3600).toString().padStart(2, '0');
        let m = Math.floor((recoveryTime % 3600) / 60).toString().padStart(2, '0');
        let s = (recoveryTime % 60).toString().padStart(2, '0');
        if(document.getElementById('time-left')) document.getElementById('time-left').innerText = `${h}:${m}:${s}`;
        if (recoveryTime === 0) { energy = 100; updateUI(); }
    }
}

function startRecovery() { recoveryTime = RECOVERY_DURATION; }
