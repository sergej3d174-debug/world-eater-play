(() => {
'use strict';
const E=window.Evolution,A=window.EvolutionArt,bank=A.bank,TAU=Math.PI*2;
const paths={venom:'M12 3c0 5-6 8-6 12a6 6 0 0 0 12 0c0-4-6-7-6-12Zm-2 13 1 2 3-3',split:'M12 21v-8M12 13 5 6m7 7 7-7M3 9V4h5m8 0h5v5',heart:'M12 21 3 12C-2 4 8 0 12 7c4-7 14-3 9 5Z',pulse:'M2 12h5l3-7 4 14 3-7h5',shield:'m12 2 9 4v7c-1 4-5 7-9 9-4-2-8-5-9-9V6Zm-4 10 3 3 5-6',trail:'M3 7h7M1 12h6M3 17h7m4-13 8 8-8 8m-4-8h12',swarm:'m12 2 3 5-3 5-3-5ZM5 12l3 5-3 5-3-5Zm14 0 3 5-3 5-3-5Z',orbit:'M3 9c3-9 19-5 18 4S4 25 3 15m6-3h6m-3-3v6',vortex:'M21 10C19-1 1 1 3 13s19 10 17-1S6 4 7 13s10 7 10 0-6-5-5 0',egg:'M12 2C8 2 4 10 4 15a8 8 0 0 0 16 0c0-5-4-13-8-13Zm-4 9 4 3-2 4',book:'M3 4q5-1 9 2 4-3 9-2v15q-5-1-9 2-4-3-9-2ZM12 6v15',nest:'M2 15q10 13 20 0M4 12q8 6 16 0M6 9v4m12-4v4M9 10q-1-6 3-6t3 6'};
A.dnaIcon=id=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[id]||paths.pulse}"/></svg>`;
A.eggPortrait=kind=>bank.portrait('companions',E.companion(kind).cell)||A.dnaIcon('egg');
A.companionPortrait=kind=>bank.portrait('companions',E.companion(kind).cell+3)||A.dnaIcon('swarm');
A.nestPortrait=id=>bank.portrait('landmarks',E.nestDef(id).art)||A.dnaIcon('nest');
class ExpeditionRenderer extends A.Renderer {
 terrain(w){super.terrain(w);if(w.isMicro)return;const c=this.c;
  for(const n of w.save.adventure?.nests||[]){if(n.state==='absorbed')continue;const def=E.nestDef(n.id),s=this.screen(n.x,n.y),r=n.r*this.cam.scale;if(r<3||s.x<-r*4||s.x>this.w+r*4||s.y<-r*4||s.y>this.h+r*4)continue;
   c.save();c.globalAlpha=n.state==='cleared'?.55:1;c.strokeStyle=E.companion(def.kind).color+'99';c.lineWidth=1.5;c.setLineDash([4,7]);c.beginPath();c.ellipse(s.x,s.y,r*2.1,r*.9,0,0,TAU);c.stroke();c.setLineDash([]);bank.draw(c,'landmarks',def.art,s.x,s.y,r*4.5,1,this.time*.3);c.restore();
   if(n.state==='sealed'){const a=this.time*.7;c.fillStyle=E.companion(def.kind).color;for(let i=0;i<5;i++){c.globalAlpha=.3+.5*Math.sin(a+i)**2;c.beginPath();c.arc(s.x+Math.cos(a+i*TAU/5)*r*1.5,s.y-r+Math.sin(a*.6+i)*r*.7,2,0,TAU);c.fill();}c.globalAlpha=1;}
  }
 }
 labels(w){super.labels(w);if(w.isMicro)return;const c=this.c;
  for(const n of w.save.adventure?.nests||[]){if(n.state==='absorbed')continue;const def=E.nestDef(n.id),s=this.screen(n.x,n.y),r=n.r*this.cam.scale;if(r<9||s.x<60||s.x>this.w-60||s.y-r*3<165||s.y-r*3>this.h-90)continue;const title=n.state==='cleared'?'Покинутое гнездо':def.name;c.save();c.textAlign='center';c.font='600 11px system-ui';const width=c.measureText(title).width+24;c.fillStyle='#102c2deb';c.beginPath();c.roundRect(s.x-width/2,s.y-r*3-15,width,36,9);c.fill();c.fillStyle='#e4f1d9';c.fillText(title,s.x,s.y-r*3);c.font='9px system-ui';c.fillStyle=E.companion(def.kind).color;c.fillText(n.state==='cleared'?'Однажды ты сможешь поглотить его':`Хранитель · ур. ${def.level} · G — идти`,s.x,s.y-r*3+13);c.restore();}
 }
 draw(w,state,time,dt){super.draw(w,state,time,dt);if(!w)return;const c=this.c,r=w.player.r*this.cam.scale;
  if(w.rarePet){const q=w.rarePet,s=this.screen(q.x,q.y);bank.draw(c,'companions',E.companion(q.kind).cell+3,s.x,s.y,r*1.8,1,time,true);}
  for(const q of w.mutationMinions||[]){if(q.x===undefined)continue;const s=this.screen(q.x,q.y);c.save();c.globalAlpha=Math.min(.85,q.life);if(q.kind==='crystal'){c.translate(s.x,s.y);c.rotate(time);c.fillStyle='#d0b8ff';c.strokeStyle='#f0e9ff';c.beginPath();c.moveTo(0,-r*.5);c.lineTo(r*.25,0);c.lineTo(0,r*.5);c.lineTo(-r*.25,0);c.closePath();c.fill();c.stroke();}else bank.draw(c,(w.isMicro?'micro-':'hero-')+q.kind,0,s.x,s.y,r*1.4,1,time,true);c.restore();}
 }
 fx(f,w){if(f.type!=='dnaPoison'&&f.type!=='dnaPulse')return super.fx(f,w);const c=this.c,s=this.screen(f.x,f.y),t=1-f.life/f.max,r=f.r*this.cam.scale;c.save();c.strokeStyle=f.color;c.fillStyle=f.color;c.globalAlpha=(1-t)*.7;c.lineWidth=2;if(f.type==='dnaPulse'){c.beginPath();c.ellipse(s.x,s.y,r*(.5+t),r*(.25+t*.5),0,0,TAU);c.stroke();}else for(let i=0;i<5;i++){const a=i*TAU/5+t*2;c.beginPath();c.arc(s.x+Math.cos(a)*r*.8,s.y-r*.5+Math.sin(a)*r*.6-t*r*.8,Math.max(1,r*.09*(1-t)),0,TAU);c.fill();}c.restore();}
}
A.Renderer=ExpeditionRenderer;
})();
