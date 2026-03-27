const config = {
    type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
    physics: { default: 'arcade' }, scene: { preload, create, update }
};
const game = new Phaser.Game(config);
let plane, hook, targets, isLaunching = false, isReturning = false, caughtItem = null;
let angle = 0, swingSpeed = 0.015, distance = 25;

// Глобальное состояние
window.energy = 100;
window.pltBalance = 0;
window.usdtBalance = 0;
window.currentPlane = 'default'; // copper, bronze, gold
let nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000;

// ТВОЯ ЧЕТКАЯ UI ФУНКЦИЯ
window.updateUI = function() {
    // Обновляем энергию
    document.getElementById('energy').innerText = Math.floor(window.energy);
    
    // Обновляем баланс (USDT до 5 знака)
    document.getElementById('money').innerText = window.usdtBalance.toFixed(5);
    document.getElementById('frog-money').innerText = Math.floor(window.pltBalance);
    
    // Показываем кнопку восстановления, если энергии МАЛО (менее 10)
    const btn = document.getElementById('restore-btn-inline');
    btn.style.display = (window.energy < 10) ? "inline-block" : "none";
}

// ТАЙМЕР НА 2 ЧАСА (Живет в фоне)
setInterval(() => {
    if (window.energy >= 100) return; // Энергия полная, таймер не нужен

    const now = Date.now();
    const diff = nextRestoreTime - now;
    
    if (diff <= 0) {
        window.energy = 100;
        nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000; // Сброс таймера
        window.updateUI();
    }
    
    // Обновляем отображение таймера
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    document.getElementById('energy-timer').innerText = `${h}:${m}:${s}`;
}, 1000);

// ФУНКЦИЯ ДЛЯ РЕКЛАМЫ (Смотрим -> Получаем 100)
window.restoreEnergyByAd = function() {
    // В будущем тут будет вызов рекламы (Adsgram и т.д.)
    // Пока имитируем просмотр
    window.energy = 100;
    nextRestoreTime = Date.now() + 2 * 60 * 60 * 1000;
    window.updateUI();
    console.log("Энергия восстановлена через рекламу");
}

function preload() {
    this.load.image('sky', 'pg.jpeg');
    this.load.image('hook', 'kleshn.png');
    this.load.image('usdt', 'usdt.png');
    this.load.image('plt', 'logo..png');
    this.load.image('plane', 'pepe.png');
}

function create() {
    this.add.image(config.width/2, config.height/2, 'sky').setDisplaySize(config.width, config.height);
    targets = this.physics.add.group();
    for(let i=0; i<6; i++) spawn(this);
    
    hook = this.add.sprite(0, 0, 'hook').setDisplaySize(65, 65).setDepth(5);
    this.physics.add.existing(hook);
    plane = this.add.image(config.width/2, 130, 'plane').setDisplaySize(260, 170).setDepth(10);

    this.physics.add.overlap(hook, targets, (h, item) => {
        if (isLaunching && !caughtItem) {
            caughtItem = item;
            caughtItem.body.enable = false;
            isLaunching = false; isReturning = true;
        }
    });

    this.input.on('pointerdown', (pointer) => {
        // Четкая проверка: не нажимаем на меню или кнопки
        if (pointer.y < 80 || pointer.y > config.height - 80) return;
        
        if (!isLaunching && !isReturning && window.energy > 0) {
            isLaunching = true;
            window.energy -= 1; // Расход энергии
            window.updateUI();
        }
    });
}

function spawn(scene) {
    let x = Phaser.Math.Between(50, config.width - 50);
    let y = Phaser.Math.Between(350, config.height - 180);
    let type = (Math.random() > 0.8) ? 'usdt' : 'plt';
    let coin = targets.create(x, y, type).setScale(0.12).setDepth(1);
}

function update() {
    let startX = plane.x - 5, startY = plane.y + 25;
    if (!isLaunching && !isReturning) {
        angle += swingSpeed; if (angle > 0.5 || angle < -0.5) swingSpeed *= -1;
        distance = 30;
    } else if (isLaunching) {
        distance += 12; if (distance > config.height - 120) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 9;
        if (distance <= 30) {
            isReturning = false;
            if (caughtItem) {
                // ЮВЕЛИРНОЕ НАЧИСЛЕНИЕ МОНЕТ
                let isPlt = (caughtItem.texture.key === 'plt');
                
                // Расчет в зависимости от самолета (взято из твоих модалок)
                if (isPlt) {
                    let amount = (window.currentPlane === 'gold' ? 100 : window.currentPlane === 'bronze' ? 50 : 10);
                    window.pltBalance += amount;
                } else {
                    let amount = (window.currentPlane === 'gold' ? 0.001 : window.currentPlane === 'bronze' ? 0.0005 : 0.0001);
                    window.usdtBalance += amount;
                }
                
                window.updateUI(); // Мгновенно обновляем интерфейс
                
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }
    hook.x = startX + Math.sin(angle) * distance;
    hook.y = startY + Math.cos(angle) * distance;
    hook.rotation = -angle;
}
        
