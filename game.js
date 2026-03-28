const config = {
type: Phaser.AUTO,
width: window.innerWidth,
height: window.innerHeight,
physics:{default:'arcade'},
scene:{preload,create,update}
};

const game = new Phaser.Game(config);

let plane, hook, rope, targets;
let isLaunching=false,isReturning=false,caught=null;
let angle=0,speed=0.02,dist=25;

function preload(){
this.load.image('sky','pg.jpeg');
this.load.image('hook','kleshn.png');
this.load.image('coin','logo..png');
this.load.image('usdt','usdt.png');
this.load.image('plane','pepe.png');
}

function create(){
this.add.image(config.width/2,config.height/2,'sky')
.setDisplaySize(config.width,config.height);

targets=this.physics.add.group();
for(let i=0;i<6;i++) spawn(this);

rope=this.add.graphics();
hook=this.add.sprite(0,0,'hook').setScale(0.5);
this.physics.add.existing(hook);

plane=this.add.image(config.width/2,120,'plane')
.setScale(0.7);

this.physics.add.overlap(hook,targets,(h,t)=>{
if(isLaunching && !caught){
caught=t;
t.body.enable=false;
isLaunching=false;
isReturning=true;
}
});

this.input.on('pointerdown',()=>{
if(!isLaunching && !isReturning && energy>0){
energy--;
updateUI();
isLaunching=true;
}
});
}

function spawn(scene){
let x=Phaser.Math.Between(50,config.width-50);
let y=Phaser.Math.Between(300,config.height-100);

let type=Math.random()<0.75?'coin':'usdt';

targets.create(x,y,type).setScale(0.1);
}

function update(){
let sx=plane.x, sy=plane.y+20;

if(!isLaunching && !isReturning){
angle+=speed;
if(angle>0.5||angle<-0.5) speed*=-1;
}
else if(isLaunching){
dist+=15;
if(dist>config.height){isLaunching=false;isReturning=true;}
}
else{
dist-=8;
if(dist<=25){
isReturning=false;

if(caught){
if(caught.texture.key==='coin'){
saveCollect(10,'plt');
}else{
saveCollect(0.00005,'usdt');
}
caught.destroy();
caught=null;
spawn(this);
}
}
}

hook.x=sx+Math.sin(angle)*dist;
hook.y=sy+Math.cos(angle)*dist;

rope.clear();
rope.lineStyle(2,0xffffff);
rope.lineBetween(sx,sy,hook.x,hook.y);

if(caught){
caught.x=hook.x;
caught.y=hook.y;
}
}          
