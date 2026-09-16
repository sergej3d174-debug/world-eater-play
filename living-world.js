(function(root){
'use strict';
const E=typeof module!=='undefined'&&module.exports?require('./expedition.js'):root.Evolution;
const HOME={
 name:'Пруд первой капли',
 leaf:{x:0,y:0,r:44,name:'Лист-укрытие',cell:0},
 den:{x:250,y:-90,r:78,name:'Логово Шороха',cell:1,level:35},
 pond:{x:210,y:570,r:620,name:'Пруд первой капли',cell:2,level:180},
 predator:{x:220,y:15,level:14,name:'Шорох, охотник берега'}
};
const MEMORIES=['shelter','predator','den','pond'];
function prepare(s){if(!s.habitat)s.habitat={version:1,sheltered:false,predator:'alive',predatorHealth:1,den:'whole',pond:'whole',relic:false,notices:[]};return s.habitat;}
function covered(w){if(w.isMicro||w.targetId!==null&&w.targetId!==undefined||w.autoHunt)return false;const p=w.player,l=HOME.leaf,h=prepare(w.save);return h.pond==='whole'&&h.den==='whole'&&p.r<l.r*.72&&Math.hypot((p.x-l.x)/1.15,p.y-l.y)<l.r*.6;}
function alivePredator(w){return w.enemies.find(e=>e.habitatPredator&&e.hp>0);}
function ensure(w){if(w.isMicro)return;const h=prepare(w.save);if(h.predator==='eaten'||h.pond==='absorbed'||alivePredator(w))return;
 const d=HOME.predator;if(Math.hypot(w.player.x-d.x,w.player.y-d.y)>Math.max(w.player.r*28,1100))return;
 const e=w.spawn(d.level,{x:d.x,y:d.y});e.habitatPredator=true;e.name=d.name;e.artTier=1;e.artSlot=1;e.color='#becba9';e.r=E.radiusAt(d.level)*.92;e.maxHp=160;e.hp=e.maxHp*h.predatorHealth;e.spawn=.7;
}
function announce(w,id,message){const h=prepare(w.save);if(h.notices.includes(id))return;h.notices.push(id);w.emit('homeNotice',{id,message});}
function objective(w){const h=prepare(w.save),p=w.player;if(w.isMicro)return {id:'micro',name:HOME.name,description:'Вся твоя жизнь — внутри одной капли.',action:'История родного мира',level:0,ready:false};
 if(h.predator==='alive'&&w.save.level<14)return {id:'leaf',...HOME.leaf,description:covered(w)?'Шорох потерял тебя. Выбор добычи раскроет тебя.':p.r<HOME.leaf.r*.72?'Шорох сильнее. Спрячься под листом.':'Ты перерос укрытие. Расти до ур. 14.',action:p.r<HOME.leaf.r*.72?'Спрятаться под листом':'Найти Шороха',ready:p.r<HOME.leaf.r*.72,level:14};
 if(h.predator==='alive'){const e=alivePredator(w);return {id:'predator',...HOME.predator,x:e?.x??HOME.predator.x,y:e?.y??HOME.predator.y,r:E.radiusAt(14),description:'Он пугал тебя в начале. Теперь ты сильнее.',action:'Охотиться на Шороха',ready:true};}
 if(h.den==='whole')return {id:'den',...HOME.den,description:w.save.level<35?'Логово осталось. Вырасти до ур. 35.':'Теперь его дом — твоя добыча.',action:w.save.level<35?'Посмотреть логово':'Разрушить логово',ready:w.save.level>=35};
 if(h.pond==='whole')return {id:'pond',...HOME.pond,description:w.save.level<180?'Твоя первая капля была здесь. Вырасти до ур. 180.':'Пруд, в котором ты родился, меньше тебя.',action:w.save.level<180?'Вернуться к пруду':'Поглотить родной пруд',ready:w.save.level>=180};
 return {id:'complete',...HOME.pond,description:'Жемчужина начала · +5% опыта в этой жизни.',action:'История родного мира',ready:false};
}
function seek(w){if(!w||w.isMicro||w.status!=='playing'||w.save.choices||w.save.adventure?.pending)return false;ensure(w);const o=objective(w);if(o.id==='complete')return false;
 w.nestGoal=null;w.autoHunt=false;w.targetId=null;w.habitatChannel=null;
 if(o.id==='predator'||o.id==='leaf'&&!o.ready){const e=alivePredator(w);if(!e)return false;if(w.save.level>=14){w.target(e.id);w.habitatGoal=null;}else{w.habitatGoal='watch';w.moveTarget={x:HOME.den.x-HOME.den.r*2,y:HOME.den.y+HOME.den.r*2};}return true;}
 w.habitatGoal=o.id;w.moveTarget={x:o.x,y:o.y};return true;
}
function rememberMoment(w,id){w.emit('homeMoment',{id});w.fx('solarRing',w.player.x,w.player.y,w.player.r*4,'#d2efb3',1.8);}
function consume(w,kind){const h=prepare(w.save),o=HOME[kind];if(!o||Math.hypot(w.player.x-o.x,w.player.y-o.y)>w.player.r*.65+o.r*.5||kind==='den'&&h.den!=='whole'||kind==='pond'&&h.pond!=='whole')return false;
 if(kind==='den'){if(h.predator!=='eaten'||w.save.level<35)return false;h.den='broken';w.save.essence+=75;E.addEgg(w,'moss','home-den');}
 if(kind==='pond'){if(h.den!=='broken'||w.save.level<180)return false;h.pond='absorbed';h.relic=true;w.save.essence+=500;E.addEgg(w,'ripple','home-pond');for(const e of w.enemies)if(!e.boss&&!e.nestId&&e.level<=60&&Math.hypot(e.x-o.x,e.y-o.y)<o.r){e.hp=0;e.dead=true;}}
 w.homeScene={kind,x:o.x,y:o.y,r:o.r,life:3,max:3};w.habitatGoal=null;w.habitatChannel=null;w.moveTarget=null;w.shake=kind==='pond'?8:5;rememberMoment(w,kind);return true;
}
function update(w,dt,input){const h=prepare(w.save),p=w.player;if(w.homeScene){w.homeScene.life-=dt;if(w.homeScene.life<=0)w.homeScene=null;}
 if(Math.hypot(input.x||0,input.y||0)>.05){w.habitatGoal=null;w.habitatChannel=null;}
 const hidden=covered(w);w.inShelter=hidden;
 if(hidden){if(!h.sheltered){h.sheltered=true;rememberMoment(w,'shelter');}for(const e of w.enemies){const dx=e.x-HOME.leaf.x,dy=e.y-HOME.leaf.y,d=Math.hypot(dx,dy)||1,min=HOME.leaf.r+e.r*.8;if(d<min&&e.level>w.save.level){e.x=HOME.leaf.x+dx/d*min;e.y=HOME.leaf.y+dy/d*min;}}}
 if(h.sheltered&&p.r>=HOME.leaf.r*.72)announce(w,'outgrown','Ты вырос из первого укрытия. Лист теперь слишком мал.');
 if(h.predator==='alive'&&w.save.level>=14)announce(w,'hunter','Помнишь Шороха? Теперь ты можешь охотиться на него. V — вернуться.');
 if(h.den==='whole'&&h.predator==='eaten'&&w.save.level>=35)announce(w,'den-ready','Его логово стало маленьким. V — вернуться и разрушить.');
 if(h.pond==='whole'&&h.den==='broken'&&w.save.level>=180)announce(w,'pond-ready','Ты вырос больше родного пруда. V — поглотить его целиком.');
 ensure(w);const predator=alivePredator(w);
 if(predator){const d=HOME.den,dist=Math.hypot(predator.x-d.x,predator.y-d.y);if((hidden||Math.hypot(p.x-d.x,p.y-d.y)>850)&&dist>180){predator.x+=(d.x-predator.x)*Math.min(1,dt*2);predator.y+=(d.y-predator.y)*Math.min(1,dt*2);}h.predatorHealth=E.clamp(predator.hp/predator.maxHp,0,1);}
 const goal=w.habitatGoal;if(!['leaf','den','pond','watch'].includes(goal))return;const dest=goal==='watch'?w.moveTarget:HOME[goal];if(!dest)return;
 const near=Math.hypot(p.x-dest.x,p.y-dest.y)<(goal==='leaf'?HOME.leaf.r*.45:p.r*.65+(dest.r||30)*.5);
 if(!near){w.habitatChannel=null;return;}w.moveTarget=null;p.vx=p.vy=0;
 if(goal==='leaf'||goal==='watch'){w.habitatGoal=null;return;}
 const ready=goal==='den'?h.predator==='eaten'&&w.save.level>=35:h.den==='broken'&&w.save.level>=180;
 if(!ready){w.habitatGoal=null;w.emit('homeNotice',{message:'Это место пока больше тебя. Расти дальше и возвращайся.'});return;}
 w.habitatChannel||={kind:goal,elapsed:0,duration:goal==='pond'?2.6:1.4};w.habitatChannel.elapsed+=dt;
 if(w.habitatChannel.elapsed>=w.habitatChannel.duration)consume(w,goal);
}
// A quick opening, then enough hunting to remember each world before outgrowing it.
const GROWTH_BOOST=1.2;
E.progressionScale=(level,s)=>{const floor={dragon:.12,fox:.10,void:.11,titan:.16}[E.hero(s||'dragon').id];return GROWTH_BOOST*(floor+(1-floor)*Math.exp(-Math.max(0,level-1)/25));};
E.microHuntRate=.72*GROWTH_BOOST;
const p=E.World.prototype,base={update:p.update,hit:p.hit,hurt:p.hurt,useSkill:p.useSkill,kill:p.kill};
p.update=function(dt,input={}){prepare(this.save);if(covered(this))this.player.attack=Math.max(this.player.attack,.15);base.update.call(this,dt,input);if(this.status==='playing'&&!this.save.choices&&!this.save.adventure?.pending)update(this,E.clamp(dt,0,.05),input);};
p.hurt=function(amount){if(covered(this))return;base.hurt.call(this,amount);};
p.hit=function(e,damage,source='attack'){if(covered(this))return;base.hit.call(this,e,damage,source);};
p.useSkill=function(id){if(covered(this)&&id!=='dash'){this.emit('homeNotice',{message:'Под листом ты скрыт. Выйди из укрытия, чтобы атаковать.'});return false;}return base.useSkill.call(this,id);};
p.kill=function(e){if(e.dead)return;const special=e.habitatPredator;base.kill.call(this,e);if(special){const h=prepare(this.save);h.predator='eaten';h.predatorHealth=0;rememberMoment(this,'predator');}};
const complete=E.completeMicro;E.completeMicro=s=>{const born=complete(s);if(born){born.habitat=JSON.parse(JSON.stringify(prepare(s)));}return born;};
const valid=E.validSave;E.validSave=s=>{if(!valid(s))return false;const h=s.habitat;if(h===undefined)return true;return !!(h&&h.version===1&&typeof h.sheltered==='boolean'&&['alive','eaten'].includes(h.predator)&&Number.isFinite(h.predatorHealth)&&h.predatorHealth>=0&&h.predatorHealth<=1&&['whole','broken'].includes(h.den)&&['whole','absorbed'].includes(h.pond)&&typeof h.relic==='boolean'&&(!h.relic||h.pond==='absorbed')&&(h.den!=='broken'||h.predator==='eaten')&&(h.pond!=='absorbed'||h.den==='broken')&&Array.isArray(h.notices)&&h.notices.length<=4&&h.notices.every(k=>['outgrown','hunter','den-ready','pond-ready'].includes(k))&&new Set(h.notices).size===h.notices.length);};
const read=E.readProfile;E.readProfile=raw=>({...read(raw),memories:Array.isArray(raw?.memories)?[...new Set(raw.memories.filter(id=>MEMORIES.includes(id)))]:[]});
const remember=E.remember;E.remember=(profile,s)=>{remember(profile,s);profile.memories||=[];const h=prepare(s),ids=[h.sheltered&&'shelter',h.predator==='eaten'&&'predator',h.den==='broken'&&'den',h.pond==='absorbed'&&'pond'].filter(Boolean);for(const id of ids)if(!profile.memories.includes(id))profile.memories.push(id);return profile;};
Object.assign(E,{HOME,HOME_MEMORIES:MEMORIES,prepareHabitat:prepare,inShelter:covered,ensureHabitat:ensure,homeObjective:objective,seekHome:seek,consumeHabitat:consume});
if(typeof module!=='undefined'&&module.exports)module.exports=E;
})(typeof window!=='undefined'?window:globalThis);
