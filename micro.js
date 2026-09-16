(function(root){
'use strict';
const E=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.Evolution;
const TAU=Math.PI*2;
const MICRO_STAGES=[
 {level:1,name:'Молекула жизни',radius:4e-8,realm:0,cell:0,icon:'molecule',description:'Всего несколько связанных частиц. Но внутри уже есть искра твоей будущей стихии.'},
 {level:8,name:'Первая клетка',radius:1e-6,realm:0,cell:1,icon:'cell',description:'Появились оболочка и ядро. Твоя первая способность на Q поможет добыть энергию для роста.'},
 {level:20,name:'Живой микроб',radius:2e-5,realm:1,cell:2,icon:'microbe',description:'Ты научился двигаться самостоятельно. В клеточном саду появились новые охотники. Открыта способность E.'},
 {level:40,name:'Колония клеток',radius:.001,realm:1,cell:2,icon:'colony',description:'Клетки действуют вместе. Теперь твои атаки задевают соседние цели, а на R доступна сила всей колонии.'},
 {level:70,name:'Зародыш героя',radius:.08,realm:2,cell:3,icon:'larva',description:'Сквозь оболочку уже видна будущая форма. Вырасти до μ100 и победи Стража мембраны, чтобы выйти в большой мир.'}
];
const MICRO_REALMS=[
 {name:'Капля начала',sub:'ЖИЗНЬ, КОТОРУЮ ЕЩЁ НЕ ВИДНО',level:1,color:'#72e6dc'},
 {name:'Клеточный сад',sub:'ОДНА КЛЕТКА СТАЛА ЦЕЛЫМ МИРОМ',level:20,color:'#c5a3fa'},
 {name:'Колыбель жизни',sub:'ЗА МЕМБРАНОЙ ЖДЁТ БОЛЬШОЙ МИР',level:70,color:'#b9df8e'}
];
const names={dragon:['Ионный импульс','Электрическая оболочка','Нервная искра','Грозовой резонанс'],fox:['Тепловой импульс','Веер энергии','Солнечные копии','Вспышка жизни'],void:['Квантовый скачок','Клеточный захват','Споровый взрыв','Осмос'],titan:['Плотный импульс','Кристаллизация','Крепкая мембрана','Пульс колонии']};
const baseStats=E.stats,baseSkills=E.skillsFor,baseForm=E.formFor,baseValid=E.validSave;
const microIndex=l=>{let i=0;while(i<4&&l>=MICRO_STAGES[i+1].level)i++;return i;};
const microRadius=l=>{const a=MICRO_STAGES[microIndex(l)],b=MICRO_STAGES[microIndex(l)+1]||{level:100,radius:12};return a.radius*Math.pow(b.radius/a.radius,E.clamp((l-a.level)/(b.level-a.level),0,1));};
const microXP=l=>(10+l*.15)*2;
const microStats=s=>({hp:(42+s.level*2.5)*E.hero(s).hp*(1+s.traits.vitality*.2),damage:(5+s.level*.65)*E.hero(s).damage*(1+s.traits.power*.16),xp:1+s.traits.growth*.15,protection:1});
const microSkills=s=>baseSkills(s).map((skill,i)=>({...skill,name:names[E.hero(s).id][i],level:[1,8,20,40][i]}));
function microForm(s,i=microIndex(s.level)){const f=MICRO_STAGES[E.clamp(i,0,4)];return {...f,stage:f.cell,color:E.hero(s).color,body:'micro-'+E.hero(s).id};}
function microSize(r){const m=r*.02;if(m<1e-6)return(m*1e9).toLocaleString('ru-RU',{maximumFractionDigits:1})+' нм';if(m<.001)return(m*1e6).toLocaleString('ru-RU',{maximumFractionDigits:1})+' мкм';if(m<.01)return(m*1000).toLocaleString('ru-RU',{maximumFractionDigits:1})+' мм';return(m*100).toLocaleString('ru-RU',{maximumFractionDigits:1})+' см';}
function newJourney(ascensions=0,hero='dragon'){return {...E.newSave(ascensions,hero),phase:'micro',microBoss:false,microComplete:false};}
function completeMicro(s){if(s.phase!=='micro'||s.level!==100||!s.microBoss)return null;return {...E.newSave(s.ascensions,s.hero),phase:'world',seed:s.seed,time:s.time,microComplete:true,microKills:s.kills,microTime:s.time};}
E.stats=s=>s.phase==='micro'?microStats(s):baseStats(s);
E.skillsFor=s=>s?.phase==='micro'?microSkills(s):baseSkills(s);
E.formFor=(s,i)=>s.phase==='micro'?microForm(s,i):baseForm(s,i);
E.validSave=s=>baseValid(s)&&(s.phase===undefined||s.phase==='world'||(s.phase==='micro'&&s.level<=100&&s.xp<microXP(s.level)+.001&&typeof s.microBoss==='boolean'&&!s.won&&!s.microComplete&&s.choices<=4&&s.pets.length===0&&s.bosses.length===0))&&(s.microComplete===undefined||typeof s.microComplete==='boolean')&&(s.microKills===undefined||Number.isInteger(s.microKills)&&s.microKills>=0)&&(s.microTime===undefined||Number.isFinite(s.microTime)&&s.microTime>=0);
class MicroWorld extends E.World{
 constructor(save){super(save);this.isMicro=true;this.realm=microForm(save).realm;this.player.r=microRadius(save.level);this.player.hp=microStats(save).hp;this.enemies=[];this.autoHunt=false;this.populate(true);if(save.level===100&&save.microBoss)this.status='emerging';}
 populate(first=false){if(!this.isMicro)return;const s=this.save,r=this.player.r,p=this.player;
  if(first&&s.level===1){this.spawn(1,{x:r*3,y:r*.5});this.spawn(1,{x:-r*4,y:-r*2});this.spawn(2,{x:r*2,y:-r*6});}
  while(this.enemies.filter(e=>!e.boss&&e.level>s.level*.3).length<24&&this.enemies.length<50){const roll=this.rng(),level=s.level*(roll<.65?.55+this.rng()*.43:roll<.94?1+this.rng()*.22:1.3+this.rng()*.18);this.spawn(level);}
  if(s.level>=70&&!s.microBoss&&!this.enemies.some(e=>e.boss==='membrane'))this.spawn(100,{boss:'membrane',name:'Страж мембраны',distance:Math.max(r*10,microRadius(100)*1.7+r*7),angle:-.4});
 }
 spawn(level,opts={}){level=E.clamp(Math.round(level),1,110);const p=this.player,r=microRadius(Math.min(level,100))*(opts.boss?1.15:.73),a=opts.angle??this.rng()*TAU,d=opts.distance??Math.max(p.r*(6+this.rng()*7),r+p.r*4),band=level<8?0:level<20?1:level<40?2:level<70?3:4,slot=opts.boss?5:Math.max(0,band-(this.rng()<.3?1:0)),hp=(9+level*1.4)*(opts.boss?7:1);
  const e={id:++this.id,level,x:opts.x??p.x+Math.cos(a)*d,y:opts.y??p.y+Math.sin(a)*d,r,hp,maxHp:hp,body:'slime',boss:opts.boss||null,name:opts.name||['Питательная молекула','Светящаяся водоросль','Золотая инфузория','Панцирная коловратка','Шипастый микроб'][slot],color:['#a7f5dc','#8adeae','#edc878','#8ddddb','#bb8bef','#ed99ce'][slot],artSlot:slot,artTier:0,angle:1,hit:0,attack:0,attackTimer:2.5,touchTimer:0,slow:0,wander:this.rng()*TAU,spawn:.6};this.enemies.push(e);return e;
 }
 target(id){const ok=super.target(id);if(ok)this.autoHunt=true;return ok;}
 gainXP(amount){const s=this.save,before=s.level,oldStage=microIndex(before),hp=microStats(s).hp;s.xp+=amount*microStats(s).xp;while(s.level<100&&s.xp>=microXP(s.level)){s.xp-=microXP(s.level);s.level++;}if(s.level===100)s.xp=0;if(s.level!==before){this.player.r=microRadius(s.level);this.player.hp=Math.min(microStats(s).hp,this.player.hp/hp*microStats(s).hp+(s.level-before)*2);this.realm=microForm(s).realm;this.emit('level',{from:before,to:s.level,amount:s.level-before});const next=microIndex(s.level);if(next>oldStage){s.choices+=next-oldStage;this.player.hp=microStats(s).hp;this.emit('evolve',{from:oldStage,to:next});this.spawnTimer=0;}for(const sk of microSkills(s))if(before<sk.level&&s.level>=sk.level)this.emit('skill',{id:sk.id});}if(s.level===100&&s.microBoss){s.choices=0;this.status='emerging';this.emit('birth');}return s.level-before;}
 evolve(choice){if(!['power','growth','vitality'].includes(choice)||!this.save.choices)return false;this.save.traits[choice]+=this.save.choices;this.save.choices=0;this.player.hp=microStats(this.save).hp;return true;}
 kill(e){if(e.dead)return;e.dead=true;e.hp=0;const s=this.save;s.kills++;s.essence+=Math.max(1,Math.ceil(e.level*.1));this.combo=this.comboTimer>0?this.combo+1:1;this.comboTimer=3.5;this.comboMax=Math.max(this.comboMax,this.combo);const quality=E.clamp((e.level/s.level)**1.4,.025,1.5),xp=(7+e.level*.1)*quality*(e.boss?15:1)*(1+Math.min(this.combo,8)*.025)*(E.microHuntRate||1);this.effects.push({type:'absorb',x:e.x,y:e.y,r:e.r,color:e.color,life:.7,max:.7});this.burst(e.x,e.y,e.color,e.boss?35:10,Math.min(e.r,this.player.r*2));this.addText(e.x,e.y-e.r,'+'+Math.round(xp*microStats(s).xp)+' ДНК','#cdf6df',true);this.emit('eat',{boss:!!e.boss});if(e.boss){s.microBoss=true;this.emit('bossDown',{name:e.name});this.shake=8;}this.gainXP(xp);this.player.hp=Math.min(microStats(s).hp,this.player.hp+microStats(s).hp*.035);if(this.targetId===e.id)this.targetId=null;}
 hurt(damage){const p=this.player;if(p.invuln>0||p.dash>0)return;p.hp=Math.max(0,p.hp-damage);p.hit=.3;p.invuln=.65;p.lastHit=0;this.shake=4;this.addText(p.x,p.y-p.r,Math.round(damage),'#ffb5ce');this.emit('hurt');if(p.hp<=0){this.status='dead';this.emit('dead');}}
 update(dt,input={}){
  if(this.status!=='playing'||this.save.choices>0)return;dt=E.clamp(dt,0,.05);this.time+=dt;this.save.time+=dt;this.shake=Math.max(0,this.shake-dt*20);const p=this.player,s=this.save,r=p.r,st=microStats(s);
  for(const id of Object.keys(this.cooldowns))this.cooldowns[id]=Math.max(0,this.cooldowns[id]-dt);
  p.hit=Math.max(0,p.hit-dt);p.invuln=Math.max(0,p.invuln-dt);p.dash=Math.max(0,p.dash-dt);p.lastHit+=dt;p.attack=Math.max(0,p.attack-dt);this.comboTimer-=dt;if(this.comboTimer<=0)this.combo=0;if(p.lastHit>3)p.hp=Math.min(st.hp,p.hp+st.hp*.045*dt);
  let dx=input.x||0,dy=input.y||0;const manual=Math.hypot(dx,dy)>.05;if(manual){this.targetId=null;this.moveTarget=null;this.autoHunt=false;}
  let target=this.enemies.find(e=>e.id===this.targetId&&e.hp>0);if(this.autoHunt&&!target&&!manual){target=this.nearest(p.x,p.y,r*25,e=>e.level<=s.level*1.1);if(target)this.targetId=target.id;}
  if(!manual&&(target||this.moveTarget)){const to=target||this.moveTarget,tx=to.x-p.x,ty=to.y-p.y,d=Math.hypot(tx,ty)||1,stop=target?r*.55+target.r:r*.25;if(d>stop){dx=tx/d;dy=ty/d;}else if(!target)this.moveTarget=null;}
  const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}const speed=r*5.8*E.hero(s).speed;p.vx=dx;p.vy=dy;if(Math.abs(dx)>.03)p.face=dx>0?1:-1;p.x+=(p.dash>0?p.dashX*speed*4:dx*speed)*dt;p.y+=(p.dash>0?p.dashY*speed*4:dy*speed)*dt;
  if(p.dash>0)this.effects.push({type:'ghost',x:p.x,y:p.y,r,color:E.hero(s).color,life:.24,max:.24});
  this.spawnTimer-=dt;if(this.spawnTimer<=0){this.populate();this.spawnTimer=1.5;}
  const victim=target&&Math.hypot(target.x-p.x,target.y-p.y)<r*1.65+target.r?target:this.nearest(p.x,p.y,r*1.15,e=>e.level<=s.level*1.4);
  if(p.attack<=0&&victim){p.attack=.46;this.sweepAngle=Math.atan2(victim.y-p.y,victim.x-p.x);this.effects.push({type:'slash',x:p.x,y:p.y,r:r*1.75,angle:this.sweepAngle,color:E.hero(s).color,life:.25,max:.25});this.hit(victim,st.damage);if(s.level>=40)for(const e of this.enemies)if(e!==victim&&e.hp>0&&Math.hypot(e.x-victim.x,e.y-victim.y)<r*1.8)this.hit(e,st.damage*.5);}
  for(const e of this.enemies){if(s.choices>0||this.status!=='playing')break;if(e.hp<=0)continue;e.spawn=Math.max(0,e.spawn-dt);e.hit=Math.max(0,e.hit-dt);e.slow=Math.max(0,e.slow-dt);e.touchTimer=Math.max(0,e.touchTimer-dt);e.attackTimer-=dt;const ex=p.x-e.x,ey=p.y-e.y,d=Math.hypot(ex,ey)||1,edible=e.level<s.level*.65,engaged=!e.boss||e.id===this.targetId||e.hp<e.maxHp||s.level>=90;let vx=Math.cos(this.time*.35+e.wander)*.2,vy=Math.sin(this.time*.3+e.wander)*.2;if(d<r*7+e.r&&engaged){const dir=edible&&!e.boss?-1:1;vx=ex/d*dir;vy=ey/d*dir;}
   const speed=Math.min(r*2.6,Math.max(e.r*1.8,r*.2))*(e.slow>0?.3:1);e.x+=vx*speed*dt;e.y+=vy*speed*dt;e.angle=vx<0?-1:1;
   if(d<r*.65+e.r*.7&&e.touchTimer<=0){if(e.level<=s.level*.38&&!e.boss)this.kill(e);else{this.hurt((2+e.level*.15)*(e.boss?1.8:1));e.touchTimer=1.2;}}
   if(e.boss&&engaged&&d<r*14&&e.attackTimer<=0){e.attackTimer=e.hp<e.maxHp*.5?2.1:3;this.warnings.push({x:p.x,y:p.y,r:r*2,life:1.1,max:1.1,damage:24+s.level*.24});this.emit('bossAttack');}
  }
  for(const w of this.warnings){w.life-=dt;if(w.life<=0){if(Math.hypot(w.x-p.x,w.y-p.y)<w.r+r*.65)this.hurt(w.damage);this.effects.push({type:'nova',x:w.x,y:w.y,r:w.r,color:'#f2a9d5',life:.7,max:.7});this.burst(w.x,w.y,'#f2a9d5',18,w.r);}}this.warnings=this.warnings.filter(w=>w.life>0);
  this.enemies=this.enemies.filter(e=>e.hp>0&&(e.boss||Math.hypot(e.x-p.x,e.y-p.y)<p.r*30)&&e.r/p.r>.001);
  for(const q of this.particles){q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=1-dt*3;q.vy*=1-dt*3;}for(const q of this.effects)q.life-=dt;for(const q of this.texts){q.life-=dt;q.y-=q.scale*dt*.7;}this.particles=this.particles.filter(q=>q.life>0);this.effects=this.effects.filter(q=>q.life>0);this.texts=this.texts.filter(q=>q.life>0);
 }
}
const install=typeof module!=='undefined'&&module.exports?require('./combat.js'):root.EvolutionCombat;
install({...E,World:MicroWorld});
Object.assign(E,{MICRO_STAGES,MICRO_REALMS,microIndex,microRadius,microXP,microStats,microSkills,microForm,microSize,newJourney,completeMicro,MicroWorld});
if(typeof module!=='undefined'&&module.exports)module.exports=E;
})(typeof window!=='undefined'?window:globalThis);
