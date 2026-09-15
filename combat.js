(function(root){
'use strict';
function install(E){
const proto=E.World.prototype,baseUpdate=proto.update,baseHurt=proto.hurt,TAU=Math.PI*2;
const segment=(x,y,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,t=E.clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-ax-t*dx,y-ay-t*dy);};
proto.fx=function(type,x,y,r,color,life=.7,extra={}){this.effects.push({type,x,y,r,color,life,max:life,...extra});};
proto.aim=function(){const p=this.player,e=this.enemies.find(e=>e.id===this.targetId&&e.hp>0)||this.nearest(p.x,p.y,p.r*15);return Math.hypot(p.vx,p.vy)>.1?Math.atan2(p.vy,p.vx):e?Math.atan2(e.y-p.y,e.x-p.x):p.face<0?Math.PI:0;};
proto.areaHit=function(x,y,r,damage,options={}){for(const e of this.enemies){if(e.hp<=0||Math.hypot(e.x-x,e.y-y)>r+e.r*.7)continue;this.hit(e,damage,options.source||'nova');if(e.hp<=0)continue;const d=Math.hypot(e.x-x,e.y-y)||1;if(options.push){e.x+=(e.x-x)/d*options.push;e.y+=(e.y-y)/d*options.push;}if(options.slow)e.slow=Math.max(e.slow,options.slow);if(options.burn){e.burn=options.burn;e.burnDamage=damage*.17;e.burnTick=.5;}}};
proto.projectile=function(angle,kind,damage,speed=14){const p=this.player,r=p.r,col=E.hero(this.save).color;this.bullets.push({x:p.x+Math.cos(angle)*r,y:p.y+Math.sin(angle)*r,vx:Math.cos(angle)*r*speed,vy:Math.sin(angle)*r*speed,r:r*.21,life:1.2,damage,kind,color:col,angle});};
proto.useSkill=function(id){
 const skill=E.skillsFor(this.save).find(s=>s.id===id);
 if(!skill||this.save.level<skill.level||this.cooldowns[id]>0||this.status!=='playing'||this.save.choices>0)return false;
 const p=this.player,r=p.r,s=this.save,h=E.hero(s),damage=E.stats(s).damage,a=this.aim(),col=h.color;
 this.cooldowns[id]=skill.cooldown;this.emit('skillUse',{id,hero:h.id});p.cast=.45;p.castAngle=a;this.skillAreas ||= [];
 const radial=(mult,range,push=0)=>this.areaHit(p.x,p.y,r*range,damage*mult,{push:r*push,slow:1});
 if(id==='dash'){
   this.dashHits=new Set();p.dashX=Math.cos(a);p.dashY=Math.sin(a);p.invuln=.4;
   if(h.id==='void'){const ox=p.x,oy=p.y;p.x+=Math.cos(a)*r*5;p.y+=Math.sin(a)*r*5;p.dash=.03;this.fx('portal',ox,oy,r*1.4,col,.8);this.fx('portal',p.x,p.y,r*1.5,h.accent,.8);this.fx('beam',ox,oy,r*.3,col,.4,{x2:p.x,y2:p.y});}
   else{p.dash=h.id==='titan'?.2:.28;this.fx('dashburst',p.x,p.y,r*1.8,col,.5,{angle:a});}
 }
 if(id==='nova'){
   if(h.id==='dragon'){radial(2.8,4.6,1.5);this.fx('thunderRing',p.x,p.y,r*4.6,col,.85);this.shake=4;}
   if(h.id==='fox'){for(let i=0;i<9;i++)this.projectile(a+(i-4)*.15,'fire',damage*1.55);this.fx('flamecast',p.x,p.y,r*1.8,col,.5,{angle:a});}
   if(h.id==='void'){for(const e of this.enemies){const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;if(d<r*7+e.r&&e.level<s.level*1.8){e.x+=dx*.57;e.y+=dy*.57;e.slow=2.8;this.hit(e,damage*2.4,'nova');}}this.fx('blackhole',p.x,p.y,r*6,col,1.25);this.shake=3;}
   if(h.id==='titan'){for(let i=1;i<=6;i++){const x=p.x+Math.cos(a)*r*i*1.3,y=p.y+Math.sin(a)*r*i*1.3;this.skillAreas.push({kind:'spike',x,y,r:r*1.2,delay:i*.08,life:.2,damage:damage*2.7,color:col,fired:false});this.fx('spike',x,y,r*1.15,col,1.1,{delay:i*.08});}this.shake=5;}
 }
 if(id==='storm'){
   if(h.id==='dragon'){let x=p.x,y=p.y;const candidates=this.enemies.filter(e=>e.hp>0&&Math.hypot(e.x-p.x,e.y-p.y)<r*11+e.r).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,7);for(const e of candidates){this.fx('chain',x,y,r,col,.6,{x2:e.x,y2:e.y});this.hit(e,damage*3.8,'nova');e.slow=1.4;x=e.x;y=e.y;}this.shake=3;}
   if(h.id==='fox'){p.phantoms=6;p.phantomTick=0;this.fx('solarRing',p.x,p.y,r*3.5,col,.6);}
   if(h.id==='void'){for(let i=0;i<12;i++)this.projectile(a+i*TAU/12,'crystal',damage*2.8,12);this.fx('shatter',p.x,p.y,r*4,col,.7);this.shake=4;}
   if(h.id==='titan'){p.shield=E.stats(s).hp*.45;p.shieldTime=6;this.fx('shieldburst',p.x,p.y,r*2,col,.8);this.emit('shield');}
 }
 if(id==='devour'){
   if(h.id==='dragon'){p.tempest=5;p.tempestTick=0;this.fx('stormEye',p.x,p.y,r*7,col,1.1);}
   if(h.id==='fox'){this.areaHit(p.x,p.y,r*6.5,damage*5,{burn:4,push:r*1.2});this.fx('sunburst',p.x,p.y,r*6.5,col,1.25);this.shake=7;}
   if(h.id==='void'){for(const e of this.enemies){if(e.hp<=0||Math.hypot(e.x-p.x,e.y-p.y)>r*8+e.r)continue;if(e.level<s.level*.72&&!e.boss)this.kill(e);else this.hit(e,damage*4.4,'nova');}p.hp=Math.min(E.stats(s).hp,p.hp+E.stats(s).hp*.2);this.fx('devour',p.x,p.y,r*8,col,1.3);this.shake=6;}
   if(h.id==='titan'){for(let i=0;i<3;i++)this.skillAreas.push({kind:'quake',x:p.x,y:p.y,r:r*(4+i),delay:i*.65,life:.1,damage:damage*3,color:col,fired:false});this.shake=7;}
 }
 return true;
};
proto.hurt=function(damage){const p=this.player;if(p.invuln>0||p.dash>0)return;if(p.shield>0){const reduced=damage*E.stats(this.save).protection,blocked=Math.min(p.shield,reduced);p.shield-=blocked;this.fx('shieldhit',p.x,p.y,p.r*1.6,E.hero(this.save).color,.4);if(blocked>=reduced){p.invuln=.3;this.addText(p.x,p.y-p.r,'ЩИТ','#b8ffc9');return;}damage=(reduced-blocked)/E.stats(this.save).protection;}baseHurt.call(this,damage);};
proto.update=function(dt,input){
 if(this.status!=='playing'||this.save.choices>0)return;
 const p=this.player,oldX=p.x,oldY=p.y,wasDash=p.dash>0;dt=E.clamp(dt,0,.05);baseUpdate.call(this,dt,input);
 if(this.status!=='playing'||this.save.choices>0)return;
 const h=E.hero(this.save),r=p.r,damage=E.stats(this.save).damage;
 p.cast=Math.max(0,(p.cast||0)-dt);
 if(wasDash&&h.id!=='void'){for(const e of this.enemies){if(e.hp>0&&!this.dashHits?.has(e.id)&&segment(e.x,e.y,oldX,oldY,p.x,p.y)<r*.8+e.r*.7){this.dashHits?.add(e.id);this.hit(e,damage*(h.id==='dragon'?2:1.5),'nova');}}
   if(h.id==='fox'){this.fireStep=(this.fireStep||0)-dt;if(this.fireStep<=0){this.fireStep=.06;this.skillAreas ||= [];this.skillAreas.push({kind:'fire',x:p.x,y:p.y,r:r*.8,delay:0,life:2.6,damage:damage*.24,color:h.color,tick:0});}}
   if(h.id==='titan'&&p.dash<=0){this.areaHit(p.x,p.y,r*2.8,damage*2,{push:r,slow:1});this.fx('quake',p.x,p.y,r*2.8,h.color,.65);}}
 if(p.shieldTime>0){p.shieldTime-=dt;if(p.shieldTime<=0)p.shield=0;}
 for(const e of this.enemies){if(e.burn>0&&e.hp>0){e.burn-=dt;e.burnTick-=dt;if(e.burnTick<=0){e.burnTick=.5;this.hit(e,e.burnDamage,'fire');this.fx('ember',e.x,e.y,e.r,'#ffb86b',.5);}}}
 if(p.tempest>0){p.tempest-=dt;p.tempestTick-=dt;if(p.tempestTick<=0){p.tempestTick=.45;const e=this.nearest(p.x,p.y,r*8,q=>q.level<this.save.level*1.7);if(e){this.hit(e,damage*2.2,'nova');this.fx('lightning',e.x,e.y,r*3,h.color,.6);}}}
 if(p.phantoms>0){p.phantoms-=dt;p.phantomTick-=dt;if(p.phantomTick<=0){p.phantomTick=.65;for(let i=0;i<3;i++){const a=this.time*1.4+i*TAU/3,x=p.x+Math.cos(a)*r*2.5,y=p.y+Math.sin(a)*r*1.6,e=this.nearest(x,y,r*6,q=>q.level<this.save.level*1.6);if(e){this.fx('firelink',x,y,r,h.color,.5,{x2:e.x,y2:e.y});this.hit(e,damage*.95,'fire');}}}}
 for(const b of this.bullets){b.life-=dt;if(b.life<=0)continue;const x=b.x,y=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;const e=this.enemies.find(e=>e.hp>0&&segment(e.x,e.y,x,y,b.x,b.y)<e.r*.65+b.r);if(e){b.life=0;this.hit(e,b.damage,'nova');this.fx(b.kind==='fire'?'ember':'shatter',e.x,e.y,Math.max(e.r,b.r*3),b.color,.5);}}
 this.bullets=this.bullets.filter(b=>b.life>0).slice(-120);
 for(const q of this.skillAreas||[]){q.delay-=dt;if(q.delay>0)continue;q.life-=dt;if(q.kind==='fire'){q.tick-=dt;if(q.tick<=0){q.tick=.4;this.areaHit(q.x,q.y,q.r,q.damage);}}else if(!q.fired){q.fired=true;this.areaHit(q.x,q.y,q.r,q.damage,{slow:1.2,push:q.kind==='quake'?r*.6:0});if(q.kind==='quake'){this.fx('quake',q.x,q.y,q.r,q.color,.8);this.shake=5;}}}
 this.skillAreas=(this.skillAreas||[]).filter(q=>q.delay>0||q.life>0).slice(-80);
};
}
if(typeof module!=='undefined'&&module.exports)module.exports=install;else root.EvolutionCombat=install;
})(typeof window!=='undefined'?window:globalThis);

