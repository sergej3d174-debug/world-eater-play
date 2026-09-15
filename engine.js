(function(root){
  'use strict';
  const C=typeof module!=='undefined'&&module.exports?require('./content.js'):root.EvolutionContent;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), TAU=Math.PI*2;
  const FORMS=[
    {level:1,name:'Капля жизни',title:'Всё начинается с малого',radius:12,color:'#70e5ce',realm:0,body:'blob',description:'Трава выше тебя. Но даже самый большой хищник когда-то был маленьким.'},
    {level:5,name:'Лесной лисёнок',title:'У тебя появились лапы',radius:24,color:'#79dfd0',realm:0,body:'fox',description:'Теперь ты быстрее. Тот, кто был угрозой минуту назад, становится добычей.'},
    {level:15,name:'Рогатый охотник',title:'Лес услышал твой рёв',radius:65,color:'#78cce2',realm:0,body:'horn',description:'Новые рога, сильные лапы и настоящий охотничий инстинкт.'},
    {level:35,name:'Крылатый хищник',title:'Пора расправить крылья',radius:180,color:'#80a9f2',realm:1,body:'wing',description:'Кроны деревьев уже не закрывают небо. Впереди поселения великанов.'},
    {level:80,name:'Грозовой дракон',title:'Ты вырос выше деревьев',radius:650,color:'#ad99ed',realm:1,body:'dragon',description:'Рождённый ползать научился летать. Рядом пробуждается новый спутник.'},
    {level:180,name:'Древний виверн',title:'Города у твоих ног',radius:2200,color:'#d6a1ed',realm:2,body:'dragon',description:'Прежние враги — маленькие точки. На горизонте появились горные исполины.'},
    {level:400,name:'Каменный титан',title:'Земля дрожит от шагов',radius:10000,color:'#ecb876',realm:2,body:'titan',description:'Твоё тело стало живой горой. Камень и огонь повинуются тебе.'},
    {level:900,name:'Хранитель материков',title:'Горы больше не преграда',radius:80000,color:'#f89b70',realm:3,body:'titan',description:'Реки превратились в тонкие линии. Теперь ты видишь очертания материков.'},
    {level:1800,name:'Небесный левиафан',title:'Океан кажется лужей',radius:700000,color:'#f5bfa2',realm:3,body:'celestial',description:'Острова плывут под тобой. Ты давно перерос свой первый лес.'},
    {level:3500,name:'Звёздный странник',title:'Добро пожаловать за пределы мира',radius:12000000,color:'#9cdce7',realm:4,body:'celestial',description:'Твой родной мир стал голубой планетой. Он всё ещё здесь — только очень маленький.'},
    {level:6500,name:'Пожиратель солнц',title:'Даже звёзды бывают добычей',radius:180000000,color:'#d9b3fa',realm:4,body:'cosmic',description:'Вокруг тебя вращаются планеты. Охота выходит на вселенский масштаб.'},
    {level:10000,name:'Начало новой вселенной',title:'Ты больше своего мира',radius:3200000000,color:'#fff0ad',realm:5,body:'cosmic',description:'10 000 уровней позади. Остался последний противник — Сердце вселенной.'}
  ];
  const REALMS=[
    {name:'Затерянная роща',sub:'ТЫ БЫЛ МЕНЬШЕ ТРАВИНКИ',level:1,color:'#b6d89a',dark:'#7ead75'},
    {name:'Земли великанов',sub:'ДЕРЕВЬЯ УЖЕ ПО КОЛЕНО',level:35,color:'#b4d3ac',dark:'#8ab28e'},
    {name:'Каменный предел',sub:'ГОРОДА СТАНОВЯТСЯ КРОШЕЧНЫМИ',level:180,color:'#c2d0c6',dark:'#899e9d'},
    {name:'Мировой океан',sub:'МАТЕРИКИ ВМЕСТО ОСТРОВКОВ',level:900,color:'#69b8b7',dark:'#438f9f'},
    {name:'За краем неба',sub:'ТВОЙ ЛЕС ТЕПЕРЬ НА ГОЛУБОЙ ТОЧКЕ',level:3500,color:'#16243e',dark:'#0c172c'},
    {name:'Колыбель вселенных',sub:'СЕЙЧАС РОДИТСЯ НОВЫЙ МИР',level:10000,color:'#24233d',dark:'#10192b'}
  ];
  const PETS=[
    {id:'wisp',level:10,name:'Люми',role:'Лесной дух',color:'#fff1a1',body:'wisp',description:'Крошечный светлячок помогает в охоте лучами лесного света.',power:.32},
    {id:'fox',level:80,name:'Искра',role:'Огненный лис',color:'#ffb28b',body:'fox',description:'Маленький хищник атакует вместе с тобой и становится сильнее с каждым уровнем.',power:.48},
    {id:'rock',level:400,name:'Гром',role:'Каменный голем',color:'#b3cbe0',body:'titan',description:'Крушит врагов и усиливает защиту героя на 15%.',power:.55},
    {id:'dragon',level:1800,name:'Астра',role:'Небесный дракон',color:'#c4aeff',body:'dragon',description:'Атакует на большой дистанции звёздными разрядами.',power:.7},
    {id:'star',level:6500,name:'Нова',role:'Дитя звёзд',color:'#a9e5f0',body:'void',description:'Твой спутник на охоте за солнцами. Усиливает получение опыта на 20%.',power:.85}
  ];
  const BOSSES=[
    {id:'frog',name:'Бульк, хозяин пруда',level:18,body:'frog',color:'#88bd67',realm:0,pet:'wisp'},
    {id:'warden',name:'Страж древней рощи',level:120,body:'treant',color:'#b8b786',realm:1,pet:'fox'},
    {id:'golem',name:'Вулканический дракон',level:650,body:'titan',color:'#b1b6c8',realm:2,pet:'rock'},
    {id:'leviathan',name:'Тот, кто несёт острова',level:2600,body:'dragon',color:'#b6dfe2',realm:3,pet:'dragon'},
    {id:'sun',name:'Угасающее солнце',level:8500,body:'cosmic',color:'#ffcf7d',realm:4,pet:'star'},
    {id:'heart',name:'Сердце вселенной',level:10000,body:'cosmic',color:'#ffafdf',realm:5,pet:null}
  ];
  const skills=[{id:'dash',key:'ПРОБЕЛ',name:'Рывок',level:10,cooldown:3},{id:'nova',key:'Q',name:'Волна силы',level:30,cooldown:5},{id:'storm',key:'E',name:'Звёздный гром',level:200,cooldown:7},{id:'devour',key:'R',name:'Поглощение',level:1000,cooldown:9}];
  function formIndex(level){let i=0;while(i<FORMS.length-1&&level>=FORMS[i+1].level)i++;return i;}
  function radiusAt(level){const i=formIndex(level),a=FORMS[i],b=FORMS[Math.min(i+1,FORMS.length-1)];if(a===b)return a.radius;const t=clamp((level-a.level)/(b.level-a.level),0,1);return a.radius*Math.pow(b.radius/a.radius,t);}
  function xpNeeded(level){return (20+level*.24)*1.55;}
  function random(seed){let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=Math.imul(x^x>>>15,1|x);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
  function newSave(ascensions=0,hero='dragon'){return {version:3,hero:C.hero(hero).id,level:1,xp:0,kills:0,essence:0,time:0,traits:{power:0,growth:0,vitality:0},pets:[],activePets:[],bosses:[],choices:0,seed:Date.now(),ascensions:clamp(ascensions,0,50),won:false};}
  function validSave(s){return !!(s&&[2,3].includes(s.version)&&(s.hero===undefined||C.HEROES.some(h=>h.id===s.hero))&&Number.isInteger(s.level)&&s.level>=1&&s.level<=10000&&Number.isFinite(s.xp)&&s.xp>=0&&s.xp<xpNeeded(s.level)+.001&&Number.isInteger(s.kills)&&s.kills>=0&&Number.isFinite(s.essence)&&s.essence>=0&&Number.isFinite(s.time)&&s.time>=0&&s.traits&&['power','growth','vitality'].every(k=>Number.isInteger(s.traits[k])&&s.traits[k]>=0&&s.traits[k]<=100)&&Array.isArray(s.pets)&&s.pets.every(id=>PETS.some(p=>p.id===id))&&new Set(s.pets).size===s.pets.length&&Array.isArray(s.activePets)&&s.activePets.length<=3&&new Set(s.activePets).size===s.activePets.length&&s.activePets.every(id=>s.pets.includes(id))&&Array.isArray(s.bosses)&&s.bosses.every(id=>BOSSES.some(b=>b.id===id))&&Number.isInteger(s.choices)&&s.choices>=0&&s.choices<=11&&Number.isFinite(s.seed)&&Number.isInteger(s.ascensions)&&s.ascensions>=0&&s.ascensions<=50&&typeof s.won==='boolean');}
  function stats(s){const h=C.hero(s),protection=s.activePets.includes('rock')?.85:1;return {hp:(80+s.level*7)*(1+s.traits.vitality*.2)*h.hp,damage:(9+s.level*1.1)*(1+s.traits.power*.16)*h.damage,xp:1+(s.microComplete?.1:0)+s.traits.growth*.15+Math.min(s.ascensions,5)*.2+(s.activePets.includes('star')?.2:0),protection};}
  class World{
    constructor(save){
      save.hero=C.hero(save).id;save.version=3;this.save=save;this.rng=random(save.seed+save.level*29);this.time=0;this.id=0;this.player={x:0,y:0,r:radiusAt(save.level),hp:stats(save).hp,face:1,vx:0,vy:0,attack:0,invuln:0,dash:0,lastHit:9,hit:0};
      this.enemies=[];this.effects=[];this.particles=[];this.texts=[];this.events=[];this.pets=[];this.bullets=[];this.warnings=[];this.targetId=null;this.moveTarget=null;this.cooldowns={dash:0,nova:0,storm:0,devour:0};this.combo=0;this.comboTimer=0;this.comboMax=0;this.spawnTimer=0;this.status='playing';this.shake=0;this.realm=FORMS[formIndex(save.level)].realm;this.bossSpawned=new Set();this.pendingPets=[];this.speedBonus=0;this.sweepAngle=0;this.worldMilestones=[];
      this.syncPets();this.populate(true);
    }
    emit(type,data={}){this.events.push({type,...data});}
    syncPets(){this.pets=this.save.activePets.map((id,i)=>({id,x:this.player.x+(i-1)*this.player.r,y:this.player.y+this.player.r*1.4,timer:i*.2}));}
    unlockPet(id){if(this.save.pets.includes(id))return;this.save.pets.push(id);if(this.save.activePets.length<3)this.save.activePets.push(id);this.syncPets();this.pendingPets.push(id);this.emit('pet',{id});}
    setPet(id){if(!this.save.pets.includes(id))return false;const list=this.save.activePets;if(list.includes(id))list.splice(list.indexOf(id),1);else{if(list.length>=3)return false;list.push(id);}this.syncPets();return true;}
    gainXP(amount){const s=this.save,before=s.level,oldIndex=formIndex(before),oldHp=stats(s).hp;s.xp+=amount*stats(s).xp;
      while(s.level<10000&&s.xp>=xpNeeded(s.level)){s.xp-=xpNeeded(s.level);s.level++;}
      if(s.level===10000)s.xp=0;const index=formIndex(s.level),up=s.level-before;
      if(up){this.player.r=radiusAt(s.level);this.player.hp=Math.min(stats(s).hp,this.player.hp/oldHp*stats(s).hp+up*1.3);this.emit('level',{from:before,to:s.level,amount:up});
        if(index>oldIndex){s.choices+=index-oldIndex;this.player.hp=stats(s).hp;this.realm=FORMS[index].realm;this.emit('evolve',{from:oldIndex,to:index});this.spawnTimer=0;}
        for(const pet of PETS)if(s.level>=pet.level)this.unlockPet(pet.id);
        for(const skill of C.skillsFor(s))if(before<skill.level&&s.level>=skill.level)this.emit('skill',{id:skill.id});
      }return up;
    }
    evolve(choice){if(!['power','growth','vitality'].includes(choice)||!this.save.choices)return false;this.save.traits[choice]+=this.save.choices;this.save.choices=0;this.player.hp=stats(this.save).hp;return true;}
    spawn(level,options={}){
      level=clamp(Math.round(level),1,12000);const pr=this.player.r,angle=options.angle??this.rng()*TAU,r=radiusAt(Math.min(level,10000))*(options.boss?1.25: .78),d=options.distance??Math.max(pr*(7+this.rng()*6),r+pr*5);
      const bodies=['mite','slime','rabbit','boar','wolf','treant','dragon','titan','celestial','cosmic'];const band=clamp(Math.floor(formIndex(level)*.83),0,bodies.length-1),body=options.body||bodies[Math.max(0,band-(this.rng()<.3?1:0))];
      const health=(18+level*3.2)*(options.boss?9:1),boss=options.boss||null;
      const e={id:++this.id,level,x:options.x??(this.player.x+Math.cos(angle)*d),y:options.y??(this.player.y+Math.sin(angle)*d),r,hp:health,maxHp:health,body,boss,name:options.name||({mite:'Луговой жучок',slime:'Дикий слизень',rabbit:'Мшистый прыгун',boar:'Клыкач',wolf:'Сумеречный охотник',treant:'Древень',dragon:'Дикий дракон',titan:'Исполин',celestial:'Небесный зверь',cosmic:'Звёздный странник'}[body]),color:options.color||(['#edb899','#b6c695','#a8cdaa','#e4ba94','#c7b4d9','#94b6a2','#c1acdf','#cbafa4','#aecfe1','#d5b6ec'][band]),angle:this.rng()*TAU,hit:0,attack:0,attackTimer:1.5+this.rng(),touchTimer:0,slow:0,wander:this.rng()*TAU,spawn:.7,pet:options.pet||null};
      const artTier=options.boss?BOSSES.findIndex(b=>b.id===options.boss):C.tier(level),artSlot=options.boss?3:Math.floor(this.rng()*3),kind=C.ENEMIES[artTier];e.artTier=artTier;e.artSlot=artSlot;if(!options.boss){e.name=kind.names[artSlot];e.body=kind.bodies[artSlot];e.color=kind.color;}
      this.enemies.push(e);return e;
    }
    populate(first=false){const s=this.save,r=this.player.r;
      if(first&&s.level===1){this.spawn(1,{x:56,y:10});this.spawn(1,{x:-66,y:-45});this.spawn(2,{x:24,y:-110});this.spawn(2,{x:120,y:44});this.spawn(3,{x:-124,y:74});}
      const wanted=first?22:28;while(this.enemies.filter(e=>!e.boss&&e.level>s.level*.12).length<wanted&&this.enemies.length<70){const roll=this.rng(),ratio=roll<.63?.35+this.rng()*.5:roll<.92?.85+this.rng()*.35:1.35+this.rng()*.45;this.spawn(Math.max(1,s.level*ratio));}
      const realm=FORMS[formIndex(s.level)].realm,b=BOSSES[realm];if(b&&!s.bosses.includes(b.id)&&!this.bossSpawned.has(b.id)){this.bossSpawned.add(b.id);this.spawn(b.level,{...b,boss:b.id,distance:Math.max(r*(realm===0?23:10),radiusAt(b.level)*1.25*1.5+r*8),angle:-.7});}
    }
    addText(x,y,text,color='#ffffff',big=false){this.texts.push({x,y,text:String(text),color,life:1.2,max:1.2,big,scale:this.player.r});if(this.texts.length>45)this.texts.shift();}
    burst(x,y,color,count=12,size=this.player.r){for(let i=0;i<count&&this.particles.length<550;i++){const a=this.rng()*TAU,v=size*(1+this.rng()*3);this.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,size:size*(.025+this.rng()*.1),color,life:.3+this.rng()*.5,max:.8});}}
    nearest(x=this.player.x,y=this.player.y,range=this.player.r*7,filter=()=>true){let nearest=null,min=range;for(const e of this.enemies){if(e.hp<=0||!filter(e))continue;const d=Math.hypot(e.x-x,e.y-y)-e.r;if(d<min){nearest=e;min=d;}}return nearest;}
    target(id){const e=this.enemies.find(e=>e.id===id);if(!e)return false;this.targetId=id;this.moveTarget=null;this.emit('target',{strong:e.level>this.save.level*1.55});return true;}
    hit(e,damage,source='attack'){
      if(e.hp<=0)return;const ratio=this.save.level/e.level;const adjusted=damage*(ratio<.6?Math.max(.06,ratio**1.8):1);e.hp-=adjusted;e.hit=.15;
      if(source!=='pet'||this.rng()<.3)this.addText(e.x,e.y-e.r,Math.round(adjusted),source==='nova'?'#fff2ac':source==='pet'?'#a9ecff':'#ffffff');
      if(e.hp<=0)this.kill(e);else this.emit('hit');
    }
    kill(e){if(e.dead)return;e.dead=true;e.hp=0;this.save.kills++;this.combo=this.comboTimer>0?this.combo+1:1;this.comboMax=Math.max(this.comboMax,this.combo);this.comboTimer=3;
      const oldRadius=this.player.r,bonus=1+Math.min(this.combo-1,12)*.025,quality=this.save.level<10?1:clamp((e.level/this.save.level)**1.7,.008,1.6),amount=(22+e.level*.24)*(1+e.level*.021)*(e.boss?4:1)*bonus*quality;this.save.essence+=Math.max(1,Math.ceil(e.level*.15));
      this.effects.push({type:'absorb',x:e.x,y:e.y,r:e.r,life:.55,max:.55,color:e.color});this.burst(e.x,e.y,e.color,e.boss?40:13,Math.min(e.r,oldRadius*2));
      this.addText(e.x,e.y-e.r*1.4,'+'+Math.round(amount*stats(this.save).xp)+' XP','#fff6a8',true);this.emit('eat',{boss:!!e.boss});
      if(e.boss){this.save.bosses.push(e.boss);if(e.pet)this.unlockPet(e.pet);this.emit('bossDown',{name:e.name});this.shake=9;}
      this.gainXP(amount);this.player.hp=Math.min(stats(this.save).hp,this.player.hp+stats(this.save).hp*.025);
      if(this.targetId===e.id)this.targetId=null;
      if(e.boss==='heart'){this.save.won=true;this.status='won';this.emit('won');}
    }
    hurt(damage){const p=this.player;if(p.invuln>0||p.dash>0)return;const amount=damage*stats(this.save).protection;p.hp=Math.max(0,p.hp-amount);p.hit=.3;p.invuln=.55;p.lastHit=0;this.shake=5;this.addText(p.x,p.y-p.r,Math.round(amount),'#ffb39d');this.emit('hurt');if(p.hp<=0){this.status='dead';this.emit('dead');}}
    useSkill(id){const skill=skills.find(s=>s.id===id);if(!skill||this.save.level<skill.level||this.cooldowns[id]>0||this.status!=='playing')return false;
      const p=this.player,r=p.r,damage=stats(this.save).damage;this.cooldowns[id]=skill.cooldown;this.emit('skillUse',{id});
      if(id==='dash'){let dx=p.vx,dy=p.vy;if(Math.hypot(dx,dy)<.1){const e=this.enemies.find(e=>e.id===this.targetId);dx=e?e.x-p.x:p.face;dy=e?e.y-p.y:0;}const d=Math.hypot(dx,dy)||1;p.dash=.26;p.dashX=dx/d;p.dashY=dy/d;p.invuln=.32;}
      if(id==='nova'){this.effects.push({type:'nova',x:p.x,y:p.y,r:r*5,life:.65,max:.65,color:'#fff0a2'});for(const e of this.enemies){const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy)||1;if(d<r*5+e.r){this.hit(e,damage*3.4,'nova');e.x+=dx/d*r*2;e.y+=dy/d*r*2;e.slow=1.5;}}this.shake=6;}
      if(id==='storm'){const targets=this.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<r*10+e.r).sort((a,b)=>a.level-b.level).slice(0,7);for(const e of targets){this.effects.push({type:'bolt',x:e.x,y:e.y,r:r*4,life:.45,max:.45,color:'#d5bbff'});this.hit(e,damage*5,'storm');}this.shake=7;}
      if(id==='devour'){this.effects.push({type:'vortex',x:p.x,y:p.y,r:r*9,life:1.1,max:1.1,color:'#97eff0'});for(const e of this.enemies){if(Math.hypot(e.x-p.x,e.y-p.y)<r*9+e.r){if(e.level<this.save.level*.8&&!e.boss)this.hit(e,e.hp*20,'nova');else this.hit(e,damage*4,'nova');}}this.shake=8;}
      return true;
    }
    update(dt,input={x:0,y:0}){
      if(this.status!=='playing'||this.save.choices>0)return;dt=clamp(dt,0,.05);this.time+=dt;this.save.time+=dt;this.shake=Math.max(0,this.shake-dt*20);const p=this.player,s=this.save,r=p.r;
      for(const id of Object.keys(this.cooldowns))this.cooldowns[id]=Math.max(0,this.cooldowns[id]-dt);
      p.hit=Math.max(0,p.hit-dt);p.invuln=Math.max(0,p.invuln-dt);p.dash=Math.max(0,p.dash-dt);p.lastHit+=dt;p.attack=Math.max(0,p.attack-dt);this.comboTimer-=dt;if(this.comboTimer<=0)this.combo=0;
      if(p.lastHit>4)p.hp=Math.min(stats(s).hp,p.hp+stats(s).hp*.035*dt);
      let dx=input.x||0,dy=input.y||0;const manual=Math.hypot(dx,dy)>.05;if(manual){this.targetId=null;this.moveTarget=null;}
      const target=this.enemies.find(e=>e.id===this.targetId&&e.hp>0);if(!manual&&(target||this.moveTarget)){const to=target||this.moveTarget,tx=to.x-p.x,ty=to.y-p.y,d=Math.hypot(tx,ty)||1,stop=target?p.r*.55+target.r:p.r*.3;if(d>stop){dx=tx/d;dy=ty/d;}else if(!target)this.moveTarget=null;}
      const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}const speed=r*(s.level<5?5.8:5.3)*C.hero(s).speed;p.vx=dx;p.vy=dy;if(Math.abs(dx)>.03)p.face=dx>0?1:-1;
      p.x+=(p.dash>0?p.dashX*speed*4:dx*speed)*dt;p.y+=(p.dash>0?p.dashY*speed*4:dy*speed)*dt;
      if(p.dash>0){this.effects.push({type:'ghost',x:p.x,y:p.y,r,life:.22,max:.22,color:FORMS[formIndex(s.level)].color});}
      this.spawnTimer-=dt;if(this.spawnTimer<=0){this.populate();this.spawnTimer=1.5;}
      let attackTarget=target&&Math.hypot(target.x-p.x,target.y-p.y)<r*1.8+target.r?target:this.nearest(p.x,p.y,r*1.25,e=>e.level<=s.level*1.6||Math.hypot(e.x-p.x,e.y-p.y)<r+e.r);
      if(p.attack<=0&&attackTarget){p.attack=.38;this.sweepAngle=Math.atan2(attackTarget.y-p.y,attackTarget.x-p.x);this.effects.push({type:'slash',x:p.x,y:p.y,r:r*1.9,angle:this.sweepAngle,life:.2,max:.2,color:'#fffde0'});this.hit(attackTarget,stats(s).damage);if(s.level>=15){for(const e of this.enemies){if(e===attackTarget||e.hp<=0)continue;const a=Math.atan2(e.y-p.y,e.x-p.x),diff=Math.atan2(Math.sin(a-this.sweepAngle),Math.cos(a-this.sweepAngle));if(Math.abs(diff)<.85&&Math.hypot(e.x-p.x,e.y-p.y)<r*1.8+e.r)this.hit(e,stats(s).damage*.6);}}}
      for(let i=0;i<this.pets.length;i++){const pet=this.pets[i],def=PETS.find(q=>q.id===pet.id),a=this.time*.7+i*TAU/Math.max(1,this.pets.length),px=p.x+Math.cos(a)*r*1.8,py=p.y+Math.sin(a)*r*1.1;pet.x+=(px-pet.x)*Math.min(1,dt*6);pet.y+=(py-pet.y)*Math.min(1,dt*6);pet.timer-=dt;if(pet.timer<=0){const e=this.nearest(pet.x,pet.y,r*(pet.id==='dragon'?8:4),e=>e.level<=s.level*1.6);if(e){pet.timer=.85;this.effects.push({type:'link',x:pet.x,y:pet.y,x2:e.x,y2:e.y,r:r*.1,life:.2,max:.2,color:def.color});this.hit(e,stats(s).damage*def.power,'pet');}}}
      for(const e of this.enemies){if(this.save.choices>0)break;if(e.hp<=0)continue;e.spawn=Math.max(0,e.spawn-dt);e.hit=Math.max(0,e.hit-dt);e.slow=Math.max(0,e.slow-dt);e.touchTimer=Math.max(0,e.touchTimer-dt);e.attackTimer-=dt;
        const ex=p.x-e.x,ey=p.y-e.y,d=Math.hypot(ex,ey)||1,engaged=!e.boss||e.id===this.targetId||e.hp<e.maxHp*.98||e.level<=s.level*1.4,aggro=e.boss?(engaged?r*10:0):e.r*5+r*2;let vx=0,vy=0;const edible=e.level<s.level*.65;
        if(d<aggro){const direction=edible&&!e.boss?-1:1;vx=ex/d*direction;vy=ey/d*direction;if(edible&&e.level<s.level*.18){vx*=.5;vy*=.5;}}
        else{vx=Math.cos(this.time*.3+e.wander)*.35;vy=Math.sin(this.time*.4+e.wander)*.35;}
        const speed=Math.min(r*4.0,Math.max(e.r*2.8,r*.45))*(e.slow>0?.35:1);e.x+=vx*speed*dt;e.y+=vy*speed*dt;e.angle=vx<0?-1:1;
        if(d<r*.7+e.r*.75&&e.touchTimer<=0){if(e.level<=s.level*.35&&!e.boss){this.kill(e);}else{this.hurt((4+e.level*.55)*(e.boss?2.1:1));e.touchTimer=.9;}}
        if(e.boss&&engaged&&d<r*18&&e.attackTimer<=0){e.attackTimer=e.hp<e.maxHp*.5?1.8:2.7;const blastR=Math.min(e.r*1.6,r*3);this.warnings.push({x:p.x,y:p.y,r:blastR,life:1.1,max:1.1,damage:(8+e.level*.6)*2});this.emit('bossAttack');}
      }
      for(const w of this.warnings){w.life-=dt;if(w.life<=0){if(Math.hypot(w.x-p.x,w.y-p.y)<w.r+r*.65)this.hurt(w.damage);this.effects.push({type:'nova',x:w.x,y:w.y,r:w.r,life:.5,max:.5,color:'#ff927d'});this.burst(w.x,w.y,'#ff9e84',18,w.r);}}
      this.warnings=this.warnings.filter(w=>w.life>0);
      this.enemies=this.enemies.filter(e=>e.hp>0&&(e.boss||Math.hypot(e.x-p.x,e.y-p.y)<p.r*35)&&e.r/p.r>.0001);
      for(const q of this.particles){q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=1-dt*3;q.vy*=1-dt*3;}for(const q of this.effects)q.life-=dt;for(const q of this.texts){q.life-=dt;q.y-=q.scale*dt*.7;}
      this.particles=this.particles.filter(q=>q.life>0);this.effects=this.effects.filter(q=>q.life>0);this.texts=this.texts.filter(q=>q.life>0);
    }
  }
  const formDescriptions=["Трава выше тебя. Выбирай посильную добычу и открывай силу своей стихии.","Твоя стихия пробудилась. Первое боевое умение уже доступно на Q.","Прежние хищники становятся добычей. Твои атаки теперь задевают целый сектор.","Лес остался внизу. Ты вырос, а твоя стихия обрела новую форму.","Деревья уже по колено. Открыта высшая способность на R.","Ты стал выше поселений. Впереди — каменные исполины и новые противники.","Земля дрожит от твоих шагов. Даже скалы становятся маленькими.","Горы больше не преграда. Перед тобой раскрывается мировой океан.","Теперь острова кажутся крошечными. Твоя стая охотится на морских колоссов.","Твой родной мир превратился в голубую планету. Он всё ещё здесь, только гораздо меньше.","Звёзды стали твоей добычей. Ты приближаешься к краю вселенной.","10 000 уровней позади. Остался последний противник — Сердце вселенной."];
  const formFor=(s,i=formIndex(s.level))=>({...FORMS[i],description:formDescriptions[i],name:C.hero(s).names[i],body:C.hero(s).id,color:C.hero(s).color,stage:Math.min(3,Math.floor(i/3))});
  const API={...C,FORMS,REALMS,PETS,BOSSES,skills:C.HEROES[0].skills,clamp,formIndex,formFor,radiusAt,xpNeeded,random,newSave,validSave,stats,World};
  (typeof module!=='undefined'&&module.exports?require('./combat.js'):root.EvolutionCombat)(API);
  if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.Evolution=API;
})(typeof window!=='undefined'?window:globalThis);
