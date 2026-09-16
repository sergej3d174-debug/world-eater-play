(function(root){
'use strict';
const E=typeof module!=='undefined'&&module.exports?require('./micro.js'):root.Evolution;
const TAU=Math.PI*2;
const MUTATIONS=[
 {id:'venom',name:'Ядовитые клетки',icon:'venom',group:'common',description:'Обычные атаки заражают цель: ещё 90% урона за три секунды.',tag:'УРОН СО ВРЕМЕНЕМ',color:'#a9e8a3'},
 {id:'split',name:'Двойное деление',icon:'split',group:'common',description:'Каждое четвёртое попадание выпускает два дополнительных снаряда.',tag:'СНАРЯДЫ',color:'#b7def5'},
 {id:'leech',name:'Живая кровь',icon:'heart',group:'common',description:'Поглощение подходящей добычи восстанавливает ещё 6% здоровья.',tag:'ВОССТАНОВЛЕНИЕ',color:'#f0a9bd'},
 {id:'pulse',name:'Сердце колонии',icon:'pulse',group:'common',description:'Каждое шестое попадание создаёт ударную волну вокруг героя.',tag:'УДАР ПО ПЛОЩАДИ',color:'#e7d6a0'},
 {id:'shell',name:'Шипастая оболочка',icon:'shield',group:'common',description:'При получении урона возвращает 35% силы удара ближайшим врагам.',tag:'ОТВЕТНЫЙ УДАР',color:'#b8d7aa'},
 {id:'momentum',name:'След эволюции',icon:'trail',group:'common',description:'После рывка остаётся импульс: урон и замедление вокруг точки прибытия.',tag:'РЫВОК',color:'#9be3d6'},
 {id:'fork',name:'Разветвлённая молния',icon:'split',group:'dragon',description:'E выпускает ещё три разряда и достаёт более далёкую добычу.',tag:'УСИЛЕНИЕ E',color:'#8ce4ff'},
 {id:'stormlings',name:'Дети грозы',icon:'swarm',group:'dragon',description:'После E два маленьких дракона пять секунд атакуют вместе с тобой.',tag:'СПУТНИКИ',color:'#9ecbff'},
 {id:'aftershock',name:'Эхо грома',icon:'pulse',group:'dragon',description:'Q повторяет удар кольцом через 0,7 секунды.',tag:'УСИЛЕНИЕ Q',color:'#bbc2ff'},
 {id:'crossfire',name:'Солнечный веер',icon:'split',group:'fox',description:'Q выпускает ещё пять огненных снарядов за спину. Можно окружить добычу огнём.',tag:'УСИЛЕНИЕ Q',color:'#ffd098'},
 {id:'wildfire',name:'Живое пламя',icon:'venom',group:'fox',description:'Q оставляет на месте героя горящий круг на четыре секунды.',tag:'ГОРЕНИЕ',color:'#ffc085'},
 {id:'twins',name:'Хоровод духов',icon:'swarm',group:'fox',description:'E призывает ещё двух огненных духов и продлевает жизнь фантомов.',tag:'УСИЛЕНИЕ E',color:'#ffe1aa'},
 {id:'orbit',name:'Живые осколки',icon:'orbit',group:'void',description:'После E три кристалла восемь секунд кружат рядом и атакуют врагов.',tag:'ОРБИТАЛЬНАЯ ЗАЩИТА',color:'#ceacff'},
 {id:'horizon',name:'Горизонт событий',icon:'vortex',group:'void',description:'Q оставляет воронку, которая ещё трижды стягивает и ранит добычу.',tag:'КОНТРОЛЬ',color:'#bba5f9'},
 {id:'rebirth',name:'Панцирь пустоты',icon:'shield',group:'void',description:'R дополнительно создаёт щит на 25% максимального здоровья.',tag:'УСИЛЕНИЕ R',color:'#a7e3df'},
 {id:'bulwark',name:'Зеркальный кристалл',icon:'shield',group:'titan',description:'Пока действует щит, 60% силы вражеского удара отражается обратно.',tag:'УСИЛЕНИЕ ЩИТА',color:'#b4f0b5'},
 {id:'faultline',name:'Раскол земли',icon:'split',group:'titan',description:'Q поднимает ещё две боковые цепочки кристальных шипов.',tag:'УСИЛЕНИЕ Q',color:'#d2e4b5'},
 {id:'heartstone',name:'Сердце горы',icon:'heart',group:'titan',description:'R восстанавливает 15% здоровья и отталкивает ближайшую добычу.',tag:'УСИЛЕНИЕ R',color:'#e1cca5'}
];
const COMPANIONS=[
 {id:'moss',name:'Мохлик',role:'Собиратель',color:'#b3e9a3',egg:'Лесное яйцо',cell:0,target:24,description:'Притягивает мелкую добычу и приносит на 25% больше эссенции.'},
 {id:'amber',name:'Янтарик',role:'Защитник',color:'#eec487',egg:'Янтарное яйцо',cell:1,target:30,description:'Раз в десять секунд создаёт защитную оболочку на 20% здоровья.'},
 {id:'ripple',name:'Рябь',role:'Ловец',color:'#c7a8fa',egg:'Астральное яйцо',cell:2,target:36,description:'Раз в шесть секунд стягивает ближайших врагов в одну группу.'}
];
const NESTS=[
 {id:'root',realm:0,level:8,name:'Гнездо у корней',guardian:'Шипокрыл, хранитель гнезда',kind:'moss',art:0},
 {id:'amber',realm:1,level:60,name:'Янтарное святилище',guardian:'Янтарный страж',kind:'amber',art:1},
 {id:'cocoon',realm:2,level:260,name:'Треснувший кокон',guardian:'Матриарх кристаллов',kind:'ripple',art:2},
 {id:'reef',realm:3,level:1400,name:'Живой риф',guardian:'Хранитель глубин',kind:'moss',art:0},
 {id:'comet',realm:4,level:5000,name:'Колыбель кометы',guardian:'Рыцарь солнечной пыли',kind:'amber',art:1},
 {id:'star',realm:5,level:10000,name:'Гнездо новой звезды',guardian:'Призрак туманности',kind:'ripple',art:2}
];
const PHASE_POINTS={micro:[8,40],world:[5,35,180,900]};
const mutation=id=>MUTATIONS.find(m=>m.id===id),companion=id=>COMPANIONS.find(p=>p.id===id),nestDef=id=>NESTS.find(n=>n.id===id);
const phase=s=>s.phase==='micro'?'micro':'world';
const reached=s=>PHASE_POINTS[phase(s)].filter(l=>s.level>=l).map(l=>phase(s)+':'+l);
const has=(w,id)=>w.save.adventure?.mutations.includes(id);
function prepare(s){
 if(!s.adventure){const checkpoints=reached(s);s.adventure={version:1,mutations:[],pending:checkpoints.length?1:0,offer:[],picks:0,checkpoints,eggs:[],nextEgg:1,companions:[],active:null,nests:[],seen:[],hatched:0};}
 ensureOffer(s);return s.adventure;
}
function ensureOffer(s){const a=s.adventure;if(!a||!a.pending||a.offer.length)return;const pool=MUTATIONS.filter(m=>(m.group==='common'||m.group===E.hero(s).id)&&!a.mutations.includes(m.id));const rng=E.random(s.seed+a.picks*3571+481);for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}a.offer=pool.slice(0,3).map(m=>m.id);if(!a.offer.length)a.pending=0;}
function syncProgress(s){const a=prepare(s);for(const key of reached(s))if(!a.checkpoints.includes(key)){a.checkpoints.push(key);if(a.mutations.length+a.pending<6)a.pending++;}ensureOffer(s);}
function chooseMutation(w,id){const a=prepare(w.save);if(!a.pending||!a.offer.includes(id)||a.mutations.includes(id))return false;a.mutations.push(id);a.picks++;a.pending--;a.offer=[];ensureOffer(w.save);w.emit('mutationPicked',{id});w.fx('solarRing',w.player.x,w.player.y,w.player.r*3,mutation(id).color,1);return true;}
function addEgg(w,kind,source){const a=prepare(w.save),def=companion(kind);if(!def||a.eggs.length>=12)return null;const egg={id:a.nextEgg++,kind,progress:0,target:def.target,source};a.eggs.push(egg);w.emit('eggFound',{kind});return egg;}
function eggReady(w,egg){return egg.progress>=egg.target&&!w.isMicro&&w.save.level>=10;}
function hatch(w,id){const a=prepare(w.save),egg=a.eggs.find(e=>e.id===id);if(!egg||!eggReady(w,egg))return null;let pet=a.companions.find(p=>p.kind===egg.kind);const first=!pet;if(!pet){pet={kind:egg.kind,bond:1};a.companions.push(pet);}else pet.bond=Math.min(3,pet.bond+1);a.eggs=a.eggs.filter(e=>e.id!==id);a.hatched++;if(!a.active)a.active=pet.kind;w.emit('hatched',{kind:pet.kind,first});return{...pet,first};}
function activate(w,kind){const a=prepare(w.save);if(kind!==null&&!a.companions.some(p=>p.kind===kind))return false;a.active=kind;w.rarePet=null;return true;}
function tickEggs(w,e,oldLevel){const a=prepare(w.save);if(e.level<oldLevel*.35)return;for(const egg of a.eggs){const before=egg.progress;egg.progress=Math.min(egg.target,egg.progress+(e.nestId||e.boss?4:1));if(before<egg.target&&egg.progress===egg.target)w.emit('eggReady',{kind:egg.kind});}}
function makeNest(w,def){const p=w.player,r=E.radiusAt(def.level)*1.1,angle=.9+def.realm*.85,d=Math.max(p.r*9,r*2.4+p.r*5);return{id:def.id,x:p.x+Math.cos(angle)*d,y:p.y+Math.sin(angle)*d,r,state:'sealed',health:1,rewarded:false};}
function ensureNests(w){if(w.isMicro)return;const a=prepare(w.save),def=NESTS[w.realm];if(def&&!a.nests.some(n=>n.id===def.id))a.nests.push(makeNest(w,def));for(const n of a.nests)if(n.state==='fighting'&&!w.enemies.some(e=>e.nestId===n.id&&e.hp>0))spawnGuardian(w,n);}
function spawnGuardian(w,n){const def=nestDef(n.id),e=w.spawn(def.level,{x:n.x,y:n.y});e.nestId=n.id;e.name=def.guardian;e.artTier=def.realm;e.artSlot=3;e.r=E.radiusAt(def.level)*1.12;e.maxHp=(18+def.level*3.2)*6;e.hp=e.maxHp*n.health;e.nestAttack=2.5;e.spawn=0;return e;}
function currentNest(w){if(w.isMicro)return null;const a=prepare(w.save);return a.nests.find(n=>nestDef(n.id).realm===w.realm&&n.state!=='absorbed')||null;}
function challenge(w){if(w.isMicro||w.status!=='playing'||prepare(w.save).pending||w.save.choices)return false;w.habitatGoal=null;w.habitatChannel=null;ensureNests(w);const n=currentNest(w);if(!n||n.state==='absorbed')return false;const p=w.player,near=Math.hypot(p.x-n.x,p.y-n.y)<p.r*3+n.r;
 if(n.state==='cleared'){w.nestGoal=n.id;w.targetId=null;w.moveTarget={x:n.x,y:n.y};return true;}
 if(n.state==='fighting'){const e=w.enemies.find(e=>e.nestId===n.id&&e.hp>0);if(e)w.target(e.id);return true;}
 if(!near){w.nestGoal=n.id;w.targetId=null;w.autoHunt=false;w.moveTarget={x:n.x,y:n.y};return true;}
 n.state='fighting';const e=spawnGuardian(w,n);w.nestGoal=null;w.target(e.id);w.emit('nestChallenge',{name:nestDef(n.id).name});return true;
}
function clearNest(w,n,absorbed=false){if(n.rewarded){if(absorbed)n.state='absorbed';return;}n.health=0;n.state=absorbed?'absorbed':'cleared';n.rewarded=true;const def=nestDef(n.id);addEgg(w,def.kind,def.id);w.save.essence+=Math.ceil(def.level*3);w.emit('nestCleared',{id:n.id,absorbed});w.fx('solarRing',n.x,n.y,Math.min(n.r,w.player.r*5),companion(def.kind).color,1.4);}
function updateNests(w,dt,input){if(w.isMicro)return;const p=w.player,a=prepare(w.save);w.nestTimer=(w.nestTimer||0)-dt;if(w.nestTimer<=0){ensureNests(w);w.nestTimer=1;}
 if(Math.hypot(input?.x||0,input?.y||0)>.05)w.nestGoal=null;
 for(const n of a.nests){if(n.state==='absorbed')continue;const def=nestDef(n.id),d=Math.hypot(p.x-n.x,p.y-n.y);
  if(p.r>=n.r*5&&d<p.r*1.8){for(const e of w.enemies)if(e.nestId===n.id){e.hp=0;e.dead=true;}clearNest(w,n,true);w.nestGoal=null;continue;}
  if(w.nestGoal===n.id&&d<p.r*3+n.r){w.nestGoal=null;w.moveTarget=null;if(n.state==='sealed')challenge(w);else w.emit('nestSmall',{id:n.id});}
  const guard=w.enemies.find(e=>e.nestId===n.id&&e.hp>0);if(!guard)continue;n.health=E.clamp(guard.hp/guard.maxHp,0,1);guard.nestAttack-=dt;
  const leash=Math.max(n.r*6,p.r*8);if(Math.hypot(guard.x-n.x,guard.y-n.y)>leash){guard.x+=(n.x-guard.x)*dt*2;guard.y+=(n.y-guard.y)*dt*2;}
  if(d<p.r*13+n.r&&guard.nestAttack<=0){guard.nestAttack=guard.hp<guard.maxHp*.5?2:3;const count=def.art===2?3:def.art===1?2:1;for(let i=0;i<count;i++)w.warnings.push({x:p.x+(i?Math.cos(i*TAU/count)*p.r*2:0),y:p.y+(i?Math.sin(i*TAU/count)*p.r*2:0),r:p.r*(def.art===0?2.1:1.6),life:1.2,max:1.2,damage:(8+def.level*.45)*1.6});w.emit('bossAttack');}
 }
}
function addMinions(w,count,duration,kind){w.mutationMinions||=[];for(let i=0;i<count;i++)w.mutationMinions.push({life:duration,max:duration,angle:i*TAU/count,timer:i*.2,kind});w.mutationMinions=w.mutationMinions.slice(-7);}
function updateExtras(w,dt){const p=w.player,r=p.r,damage=E.stats(w.save).damage,col=E.hero(w.save).color;
 for(const e of w.enemies)if(e.poison>0&&e.hp>0){e.poison-=dt;e.poisonTick-=dt;if(e.poisonTick<=0){e.poisonTick=1;w.hit(e,e.poisonDamage,'mutation');w.fx('dnaPoison',e.x,e.y,e.r,'#afe8a5',.55);}}
 for(const q of w.mutationZones||[]){q.delay-=dt;if(q.delay>0)continue;q.timer-=dt;q.life-=dt;if(q.timer<=0){q.timer=q.interval;const x=q.follow?p.x:q.x,y=q.follow?p.y:q.y;if(q.pull)for(const e of w.enemies){if(e.hp>0&&Math.hypot(e.x-x,e.y-y)<q.r+e.r){const amount=(e.nestId||e.boss) ? .09 : .23;e.x+=(x-e.x)*amount;e.y+=(y-e.y)*amount;e.slow=1;}}w.areaHit(x,y,q.r,damage*q.damage,{source:'mutation',slow:1});w.fx(q.pull?'blackhole':q.fire?'ember':'thunderRing',x,y,q.r,q.color,.75);}}
 w.mutationZones=(w.mutationZones||[]).filter(q=>q.delay>0||q.life>0);
 const minions=w.mutationMinions||[];for(let i=0;i<minions.length;i++){const q=minions[i];q.life-=dt;q.timer-=dt;const a=w.time*1.1+q.angle;q.x=p.x+Math.cos(a)*r*2.3;q.y=p.y+Math.sin(a)*r*1.5;if(q.timer<=0){q.timer=.8;const e=w.nearest(q.x,q.y,r*7,t=>t.level<w.save.level*1.6);if(e){w.hit(e,damage*.65,'mutation');w.fx(q.kind==='crystal'?'beam':q.kind==='fox'?'firelink':'chain',q.x,q.y,r,col,.45,{x2:e.x,y2:e.y});}}}w.mutationMinions=minions.filter(q=>q.life>0);
 const a=prepare(w.save),pet=a.companions.find(q=>q.kind===a.active);if(w.isMicro||!pet)return;const def=companion(pet.kind),t=w.time*.7;w.rarePet||={x:p.x,y:p.y,timer:1,kind:pet.kind};const ally=w.rarePet;ally.x+=(p.x+Math.cos(t)*r*2.6-ally.x)*Math.min(1,dt*7);ally.y+=(p.y+Math.sin(t)*r*1.8-ally.y)*Math.min(1,dt*7);ally.timer-=dt;if(ally.timer>0)return;const bond=1+(pet.bond-1)*.1;
 if(pet.kind==='amber'){ally.timer=10;p.shield=Math.max(p.shield||0,E.stats(w.save).hp*.2*bond);p.shieldTime=Math.max(p.shieldTime||0,5);w.fx('shieldburst',p.x,p.y,r*1.8,def.color,.8);}
 else if(pet.kind==='moss'){ally.timer=3;const e=w.nearest(ally.x,ally.y,r*8,q=>q.level<w.save.level*.65&&!q.boss&&!q.nestId);if(e){e.x+=(ally.x-e.x)*.55;e.y+=(ally.y-e.y)*.55;w.hit(e,damage*1.6*bond,'companion');w.fx('link',ally.x,ally.y,r,def.color,.65,{x2:e.x,y2:e.y});}}
 else{ally.timer=6;for(const e of w.enemies)if(e.hp>0&&Math.hypot(e.x-ally.x,e.y-ally.y)<r*6+e.r&&e.level<w.save.level*1.7){const pull=(e.boss||e.nestId) ? .09 : .4;e.x+=(ally.x-e.x)*pull;e.y+=(ally.y-e.y)*pull;e.slow=2;w.hit(e,damage*.9*bond,'companion');}w.fx('blackhole',ally.x,ally.y,r*5,def.color,1);}
}
// Capture inherited methods before either prototype is extended.
const methods=['hit','kill','gainXP','useSkill','hurt','update'];
const originals=[E.World,E.MicroWorld].map(Type=>({Type,base:Object.fromEntries(methods.map(k=>[k,Type.prototype[k]]))}));
for(const {Type,base} of originals){const p=Type.prototype;
 p.gainXP=function(amount){prepare(this.save);const result=base.gainXP.call(this,amount);syncProgress(this.save);return result;};
 p.hit=function(e,damage,source='attack'){if(e.hp<=0)return;prepare(this.save);base.hit.call(this,e,damage,source);if(source!=='attack')return;this.dnaHits=(this.dnaHits||0)+1;const s=this.save,r=this.player.r;
  if(has(this,'venom')&&e.hp>0){e.poison=3.01;e.poisonTick=1;e.poisonDamage=damage*.3;this.fx('dnaPoison',e.x,e.y,e.r,'#9ee29c',.4);}
  if(has(this,'split')&&this.dnaHits%4===0){const a=this.aim();this.projectile(a-.35,'crystal',damage*.65);this.projectile(a+.35,'crystal',damage*.65);}
  if(has(this,'pulse')&&this.dnaHits%6===0){this.areaHit(this.player.x,this.player.y,r*3.3,damage*1.8,{source:'mutation'});this.fx('solarRing',this.player.x,this.player.y,r*3.3,'#e9dfac',.75);}
 };
 p.kill=function(e){if(e.dead)return;const a=prepare(this.save),oldLevel=this.save.level,before=this.save.essence;tickEggs(this,e,oldLevel);const seen=(this.isMicro?'micro':'world')+':'+e.artTier+':'+e.artSlot;if(!a.seen.includes(seen))a.seen.push(seen);base.kill.call(this,e);if(has(this,'leech')&&e.level>=oldLevel*.35)this.player.hp=Math.min(E.stats(this.save).hp,this.player.hp+E.stats(this.save).hp*.06);if(a.active==='moss')this.save.essence+=Math.ceil((this.save.essence-before)*.25);if(e.nestId){const n=a.nests.find(q=>q.id===e.nestId);if(n)clearNest(this,n);}};
 p.useSkill=function(id){if(prepare(this.save).pending)return false;const done=base.useSkill.call(this,id);if(!done)return false;const p=this.player,r=p.r,col=E.hero(this.save).color,damage=E.stats(this.save).damage,a=this.aim();this.mutationZones||=[];
  if(id==='dash'&&has(this,'momentum'))this.dnaDash=true;
  if(id==='storm'&&has(this,'fork'))for(const e of this.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<r*14+e.r).sort((a,b)=>Math.hypot(b.x-p.x,b.y-p.y)-Math.hypot(a.x-p.x,a.y-p.y)).slice(0,3)){this.hit(e,damage*2,'mutation');this.fx('chain',p.x,p.y,r,col,.8,{x2:e.x,y2:e.y});}
  if(id==='storm'&&has(this,'stormlings'))addMinions(this,2,5,'dragon');
  if(id==='nova'&&has(this,'aftershock'))this.mutationZones.push({x:p.x,y:p.y,r:r*4.6,delay:.7,life:.05,timer:0,interval:1,damage:2,color:col});
  if(id==='nova'&&has(this,'crossfire'))for(let i=-2;i<=2;i++)this.projectile(a+Math.PI+i*.25,'fire',damage*1.25);
  if(id==='nova'&&has(this,'wildfire'))this.mutationZones.push({x:p.x,y:p.y,r:r*3,delay:0,life:4,timer:0,interval:.65,damage:.55,color:col,fire:true});
  if(id==='storm'&&has(this,'twins')){p.phantoms=Math.max(p.phantoms||0,9);addMinions(this,2,9,'fox');}
  if(id==='storm'&&has(this,'orbit'))addMinions(this,3,8,'crystal');
  if(id==='nova'&&has(this,'horizon'))this.mutationZones.push({x:p.x,y:p.y,r:r*6,delay:.65,life:2.05,timer:0,interval:1,damage:1.2,color:col,pull:true});
  if(id==='devour'&&has(this,'rebirth')){p.shield=Math.max(p.shield||0,E.stats(this.save).hp*.25);p.shieldTime=6;this.fx('shieldburst',p.x,p.y,r*2,col,.8);}
  if(id==='nova'&&has(this,'faultline'))for(const side of [-1,1])for(let i=1;i<=3;i++){const x=p.x+Math.cos(a)*r*i*1.5-Math.sin(a)*r*side*1.5,y=p.y+Math.sin(a)*r*i*1.5+Math.cos(a)*r*side*1.5;this.skillAreas.push({kind:'spike',x,y,r:r*1.3,delay:i*.1,life:.15,damage:damage*1.7,color:col,fired:false});this.fx('spike',x,y,r*1.3,col,1.1,{delay:i*.1});}
  if(id==='devour'&&has(this,'heartstone')){p.hp=Math.min(E.stats(this.save).hp,p.hp+E.stats(this.save).hp*.15);this.areaHit(p.x,p.y,r*3,damage*.5,{source:'mutation',push:r*1.5});this.fx('shieldburst',p.x,p.y,r*2,col,.8);}return true;
 };
 p.hurt=function(amount){const can=this.player.invuln<=0&&this.player.dash<=0,shield=this.player.shield>0;base.hurt.call(this,amount);if(!can||this.status!=='playing')return;const factor=(has(this,'shell')?.35:0)+(has(this,'bulwark')&&shield?.6:0);if(factor){this.areaHit(this.player.x,this.player.y,this.player.r*4,amount*factor,{source:'mutation'});this.fx('shatter',this.player.x,this.player.y,this.player.r*3,'#b8f4cf',.65);}};
 p.update=function(dt,input={}){const a=prepare(this.save);if(this.status!=='playing'||a.pending||this.save.choices)return;dt=E.clamp(dt,0,.05);base.update.call(this,dt,input);if(this.status!=='playing'||this.save.choices||a.pending)return;if(this.dnaDash&&this.player.dash<=0){this.dnaDash=false;this.areaHit(this.player.x,this.player.y,this.player.r*3,E.stats(this.save).damage*.8,{slow:2,source:'mutation'});this.fx('dnaPulse',this.player.x,this.player.y,this.player.r*3,'#a4ead9',.8);}updateExtras(this,dt);updateNests(this,dt,input);};
}
const oldComplete=E.completeMicro;E.completeMicro=s=>{const born=oldComplete(s);if(born&&s.adventure)born.adventure=JSON.parse(JSON.stringify(s.adventure));return born;};
const originalValid=E.validSave,finite=(x,min=0,max=1e22)=>Number.isFinite(x)&&x>=min&&x<=max,unique=(xs,check,max)=>Array.isArray(xs)&&xs.length<=max&&new Set(xs).size===xs.length&&xs.every(check);
function validAdventure(a,s){if(a===undefined)return true;return !!(a&&a.version===1&&unique(a.mutations,id=>MUTATIONS.some(m=>m.id===id&&(m.group==='common'||m.group===E.hero(s).id)),6)&&Number.isInteger(a.pending)&&a.pending>=0&&a.pending+a.mutations.length<=6&&unique(a.offer,id=>MUTATIONS.some(m=>m.id===id&&(m.group==='common'||m.group===E.hero(s).id))&&!a.mutations.includes(id),3)&&(!a.pending||a.offer.length>0)&&Number.isInteger(a.picks)&&a.picks>=0&&a.picks<=6&&unique(a.checkpoints,k=>['micro:8','micro:40','world:5','world:35','world:180','world:900'].includes(k),6)&&Array.isArray(a.eggs)&&a.eggs.length<=12&&new Set(a.eggs.map(e=>e.id)).size===a.eggs.length&&a.eggs.every(e=>e&&Number.isInteger(e.id)&&e.id>0&&e.id<a.nextEgg&&companion(e.kind)&&e.target===companion(e.kind).target&&Number.isInteger(e.progress)&&finite(e.progress,0,e.target)&&typeof e.source==='string'&&e.source.length<50)&&Number.isInteger(a.nextEgg)&&finite(a.nextEgg,1,1000)&&Array.isArray(a.companions)&&a.companions.length<=3&&new Set(a.companions.map(p=>p.kind)).size===a.companions.length&&a.companions.every(p=>companion(p.kind)&&Number.isInteger(p.bond)&&p.bond>=1&&p.bond<=3)&&(a.active===null||a.companions.some(p=>p.kind===a.active))&&Array.isArray(a.nests)&&a.nests.length<=6&&new Set(a.nests.map(n=>n.id)).size===a.nests.length&&a.nests.every(n=>nestDef(n.id)&&finite(n.x,-1e22)&&finite(n.y,-1e22)&&finite(n.r,.01)&&['sealed','fighting','cleared','absorbed'].includes(n.state)&&finite(n.health,0,1)&&typeof n.rewarded==='boolean')&&unique(a.seen,v=>/^(micro:[0]:[0-5]|world:[0-5]:[0-3])$/.test(v),30)&&Number.isInteger(a.hatched)&&finite(a.hatched,0,1000));}
E.validSave=s=>{try{return originalValid(s)&&validAdventure(s.adventure,s);}catch{return false;}};
function readProfile(raw){const p=raw&&typeof raw==='object'?raw:{};return{version:1,mutations:Array.isArray(p.mutations)?[...new Set(p.mutations.filter(id=>mutation(id)))]:[],companions:Array.isArray(p.companions)?[...new Set(p.companions.filter(id=>companion(id)))]:[],nests:Array.isArray(p.nests)?[...new Set(p.nests.filter(id=>nestDef(id)))]:[],seen:Array.isArray(p.seen)?[...new Set(p.seen.filter(v=>/^(micro:[0]:[0-5]|world:[0-5]:[0-3])$/.test(v)))]:[],heroes:Array.isArray(p.heroes)?[...new Set(p.heroes.filter(id=>E.HEROES.some(h=>h.id===id)))]:[]};}
function remember(profile,s){const a=prepare(s);for(const [key,values] of [['mutations',a.mutations],['companions',a.companions.map(p=>p.kind)],['nests',a.nests.filter(n=>n.rewarded).map(n=>n.id)],['seen',a.seen],['heroes',s.microComplete?[E.hero(s).id]:[]]])for(const value of values)if(!profile[key].includes(value))profile[key].push(value);return profile;}
function inheritEgg(s,kind,profile){prepare(s);if(!companion(kind)||!profile.companions.includes(kind)||s.adventure.eggs.some(e=>e.source==='memory')||s.adventure.eggs.length>=12)return false;const def=companion(kind);s.adventure.eggs.push({id:s.adventure.nextEgg++,kind,progress:0,target:def.target,source:'memory'});return true;}
Object.assign(E,{MUTATIONS,COMPANIONS,NESTS,mutation,companion,nestDef,prepareAdventure:prepare,chooseMutation,addEgg,eggReady,hatchEgg:hatch,activateCompanion:activate,currentNest,challengeNest:challenge,ensureNests,readProfile,remember,inheritEgg});
if(typeof module!=='undefined'&&module.exports)module.exports=E;
})(typeof window!=='undefined'?window:globalThis);
