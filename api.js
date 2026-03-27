// В функции create()
function create() {
    this.add.image(config.width/2, config.height/2, 'sky').setDisplaySize(config.width, config.height);
    
    // МУЗЫКА: Исправленный автоплей и цикл
    try { 
        bgMusic = this.sound.add('theme', { volume: 0.005, loop: true }); 
        // Запуск при первом взаимодействии (требование браузеров)
        this.input.once('pointerdown', () => { 
            if (!bgMusic.isPlaying) bgMusic.play(); 
        });
    } catch (e) { console.error("Ошибка звука"); }

    targets = this.physics.add.group();
    for(let i=0; i<6; i++) spawn(this);
    
    rope = this.add.graphics().setDepth(5);
    // Начальное положение клешни строго под самолетом
    hook = this.add.sprite(config.width/2, 140, 'hook').setDepth(50).setDisplaySize(65, 65); 
    this.physics.add.existing(hook);
    plane = this.add.image(config.width/2, 120, 'plane').setDisplaySize(280, 180).setDepth(60);

    this.physics.add.overlap(hook, targets, (h, item) => {
        if (isLaunching && !caughtItem) {
            caughtItem = item; 
            caughtItem.body.enable = false;
            isLaunching = false; 
            isReturning = true;
            if (window.playBeep) window.playBeep(350, 0.1); 
        }
    });
}

// В функции update() - ИСПРАВЛЕННЫЙ ТРОС
function update() {
    plane.y = 120 + Math.sin(this.time.now / 600) * 5;
    // Точка выхода троса из самолета
    let startX = plane.x - 5; 
    let startY = plane.y + 25; 

    if (!isLaunching && !isReturning) {
        angle += swingSpeed; 
        if (angle > 0.4 || angle < -0.4) swingSpeed *= -1;
        distance = 25;
    } else if (isLaunching) {
        distance += 12; 
        if (distance > config.height - 100) { isLaunching = false; isReturning = true; }
    } else if (isReturning) {
        distance -= 7;
        if (distance <= 25) {
            isReturning = false;
            if (caughtItem) {
                let isPlt = (caughtItem.texture.key === 'pilot_coin');
                if (window.showValue) window.showValue(this, plane.x, plane.y, isPlt); 
                if (window.saveCollect) window.saveCollect(0, isPlt ? 'plt' : 'usdt'); 
                if (window.playBeep) window.playBeep(600, 0.1);
                caughtItem.destroy(); caughtItem = null; spawn(this);
            }
        }
    }

    // Математика позиции клешни
    hook.x = startX + Math.sin(angle) * distance;
    hook.y = startY + Math.cos(angle) * distance;
    hook.rotation = -angle;
    
    // Отрисовка троса: от самолета до центра клешни
    rope.clear();
    rope.lineStyle(2, 0xffffff, 0.5);
    rope.lineBetween(startX, startY, hook.x, hook.y);
    
    if (caughtItem) { 
        caughtItem.x = hook.x; 
        caughtItem.y = hook.y + 15; 
        caughtItem.rotation = hook.rotation; 
    }
}
