const tg = window.Telegram.WebApp;
tg.expand();

let userId = tg.initDataUnsafe?.user?.id || "test";

window.energy = 100;
window.plt = 0;
window.usdt = 0;

// 💾 LOAD
async function loadUser(){
    try{
        let res = await fetch(`http://localhost:3000/api/user/${userId}`);
        let data = await res.json();

        plt = data.balancePLT;
        usdt = data.balanceUSDT;

        updateUI();
    }catch(e){}
}

// 💰 SAVE
window.saveCollect = async function(amount,type){
    if(type==='plt'){ plt+=amount }
    if(type==='usdt'){ usdt+=amount }

    updateUI();

    try{
        await fetch('http://localhost:3000/api/collect',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({tgId:userId,amount,type})
        });
    }catch(e){}
}

// 🎨 UI
window.updateUI = function(){
    document.getElementById('energy').innerText = energy;
    document.getElementById('plt').innerText = Math.floor(plt);
    document.getElementById('usdt').innerText = usdt.toFixed(4);
}

// 🎁 СУНДУК
window.openChest = function(){
    let reward = Math.random();

    if(reward < 0.7){
        saveCollect(20,'plt');
        alert("+20 PLT");
    }else{
        saveCollect(0.0002,'usdt');
        alert("+0.0002 USDT");
    }
}

// 📅 DAILY
window.dailyBonus = function(){
    let last = localStorage.getItem('daily');

    if(!last || Date.now()-last > 86400000){
        localStorage.setItem('daily', Date.now());
        energy += 50;
        updateUI();
        alert("Бонус получен ⚡");
    }else{
        alert("Уже забрал сегодня");
    }
}

// ⚡ REWARD
window.rewardEnergy = function(){
    energy += 30;
    updateUI();
    alert("Ты получил энергию ⚡");
}

// 👥 REF
window.invite = function(){
    let link = `https://t.me/YOUR_BOT?start=${userId}`;
    tg.openTelegramLink(`https://t.me/share/url?url=${link}`);
}

// 📦 MODAL
window.toggleModal = function(id){
    let el = document.getElementById(id);
    el.style.display = el.style.display==='flex'?'none':'flex';
}

// ⚡ REGEN
setInterval(()=>{
    if(energy<100){
        energy++;
        updateUI();
    }
},3000);

loadUser(); 
