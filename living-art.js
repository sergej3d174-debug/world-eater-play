(() => {
'use strict';
const E=window.Evolution,A=window.EvolutionArt,bank=A.bank,TAU=Math.PI*2;
function centered(c,cell,x,y,size,alpha=1,angle=0){const item=bank.items.habitat,b=item?.rects[cell];if(!b)return;c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);const scale=size/Math.max(b.w,b.h);c.drawImage(item.img,b.x,b.y,b.w,b.h,-b.w*scale/2,-b.h*scale/2,b.w*scale,b.h*scale);c.restore();}
A.homePortrait=id=>id==='predator'?bank.portrait('enemies-1',1):bank.portrait('habitat',E.HOME[id==='shelter'?'leaf':id]?.cell||0);
class LivingRenderer extends A.Renderer {
 targetScale(w){return super.targetScale(w)*(w.homeScene?.kind==='pond'?.72:1);}
 terrain(w){super.terrain(w);if(w.isMicro)return;const h=E.prepareHabitat(w.save),c=this.c,s=this.cam.scale;
  if(h.pond==='whole')this.homeObject(E.HOME.pond,2,1);
  else{const p=this.screen(E.HOME.pond.x,E.HOME.pond.y),r=E.HOME.pond.r*s;if(r>3&&r<2500){c.save();c.fillStyle='#74624b36';c.strokeStyle='#c9d3a950';c.lineWidth=1.5;c.setLineDash([3,7]);c.beginPath();c.ellipse(p.x,p.y,r,r*.64,0,0,TAU);c.fill();c.stroke();c.restore();}}
  if(h.den==='whole')this.homeObject(E.HOME.den,1,1);else if(h.pond==='whole'){const p=this.screen(E.HOME.den.x,E.HOME.den.y),r=E.HOME.den.r*s;c.save();c.globalAlpha=.6;c.fillStyle='#8e7856';for(let i=0;i<9;i++){const a=i*TAU/9;c.beginPath();c.ellipse(p.x+Math.cos(a)*r*.65,p.y+Math.sin(a)*r*.35,Math.max(.5,r*.12),Math.max(.5,r*.05),a,0,TAU);c.fill();}c.restore();}
  if(h.pond==='whole'){const l=E.HOME.leaf,p=this.screen(l.x,l.y),r=l.r*s;c.save();c.fillStyle='#10261955';c.beginPath();c.ellipse(p.x,p.y,r*1.15,r*.65,0,0,TAU);c.fill();c.restore();}
  if(w.homeScene){const q=w.homeScene,t=1-q.life/q.max,p=this.screen(q.x+(w.player.x-q.x)*t,q.y+(w.player.y-q.y)*t);centered(c,E.HOME[q.kind].cell,p.x,p.y,q.r*s*2*(1-t)**.8,1-t*.7,t*3);}
  if(w.habitatChannel){const q=w.habitatChannel,o=E.HOME[q.kind],p=this.screen(o.x,o.y),r=Math.max(18,o.r*s),hero=this.screen(w.player.x,w.player.y);c.save();c.strokeStyle='#d2f3c1';c.lineWidth=2;c.globalAlpha=.7;c.beginPath();c.ellipse(p.x,p.y,r*1.2,r*.8,-this.time*.4,-Math.PI/2,-Math.PI/2+TAU*q.elapsed/q.duration);c.stroke();for(let i=0;i<5;i++){const t=(this.time*.7+i*.2)%1;c.fillStyle='#c2ffe0';c.beginPath();c.arc(p.x+(hero.x-p.x)*t+Math.sin(t*TAU)*r*.3,p.y+(hero.y-p.y)*t,2,0,TAU);c.fill();}c.restore();}
 }
 homeObject(o,cell,alpha){const p=this.screen(o.x,o.y),r=o.r*this.cam.scale;if(r<2||p.x+r*1.5<0||p.x-r*1.5>this.w||p.y+r*1.5<0||p.y-r*1.5>this.h)return;centered(this.c,cell,p.x,p.y,r*2.5,alpha);}
 draw(w,state,time,dt){super.draw(w,state,time,dt);if(!w||w.isMicro)return;const h=E.prepareHabitat(w.save),c=this.c,l=E.HOME.leaf,hidden=E.inShelter(w);
  if(h.pond==='whole'){this.homeObject(l,0,hidden?.62:.96);if(hidden){const p=this.screen(w.player.x,w.player.y),r=w.player.r*this.cam.scale;c.save();c.textAlign='center';c.font='600 11px system-ui';c.fillStyle='#def4bc';c.shadowColor='#102d26';c.shadowBlur=9;c.fillText('ПОД ЛИСТОМ · СКРЫТ',p.x,p.y+r*1.45);c.restore();}}
  const o=E.homeObjective(w);if(o.id==='complete'||o.id==='leaf'&&w.save.level>=14)return;const p=this.screen(o.x,o.y),r=(o.r||50)*this.cam.scale;const label=o.id==='predator'?'Шорох · он помнит твой запах':o.name;
  if(p.x>110&&p.x<this.w-110&&p.y-r>170&&p.y-r<this.h-150){c.save();c.textAlign='center';c.font='600 10px system-ui';const width=c.measureText(label).width+22;c.fillStyle='#13372fdd';c.beginPath();c.roundRect(p.x-width/2,p.y-r-31,width,22,7);c.fill();c.fillStyle='#e1e9bf';c.fillText(label,p.x,p.y-r-16);c.restore();}
 }
}
A.Renderer=LivingRenderer;
})();
