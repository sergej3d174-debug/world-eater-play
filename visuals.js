(function(root){
'use strict';
const E=root.Evolution,A=root.EvolutionArt,Legacy=A.Renderer,TAU=Math.PI*2;
const circle=(c,x,y,r,fill,stroke,width=1)=>{c.beginPath();c.arc(x,y,Math.max(.001,r),0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}};
const ellipse=(c,x,y,rx,ry,fill,stroke,width=1)=>{c.beginPath();c.ellipse(x,y,Math.max(.001,rx),Math.max(.001,ry),0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}};
const line=(c,points,col,w=1)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();};
const hash=(x,y,k=0)=>{let n=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(k+1,144269);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296;};
// Source rectangles isolate atlas frames, including uneven margins between generations.
const frames={
 'companions':[[0,0,535,510],[545,0,480,510],[1030,0,506,510],[0,512,541,512],[545,512,478,512],[1030,512,506,512]],
 'micro-dragon':[[0,0,627,590],[627,0,627,590],[0,620,627,634],[627,600,627,654]],
 'micro-fox':[[0,0,639,590],[639,0,639,590],[0,615,639,615],[639,600,639,630]],
 'micro-enemies':[[0,0,512,455],[512,0,512,455],[1024,0,512,455],[0,455,512,569],[512,455,512,569],[1024,450,512,574]],
 'hero-dragon':[[65,185,520,420],[650,0,600,600],[0,650,592,600],[594,590,660,664]],
 'hero-titan':[[150,80,380,480],[680,0,570,575],[0,605,635,610],[635,590,619,650]],
 'enemies-1':[[0,0,627,530],[627,0,627,530],[0,570,627,684],[627,530,627,724]],
 'enemies-2':[[0,0,628,550],[675,0,637,540],[0,557,627,642],[638,547,674,652]]
};
class SpriteBank{
 constructor(){this.items={};this.jobs=[];for(const h of E.HEROES)this.load('hero-'+h.id,'art/sprites/hero-'+h.id+'.png',2,2);for(let i=0;i<6;i++)this.load('enemies-'+i,'art/sprites/enemies-'+i+'.png',2,2);this.load('terrain','art/terrain/terrain.png',3,2,false);this.load('props','art/sprites/props.png',3,2);for(const h of E.HEROES)this.load('micro-'+h.id,'art/sprites/micro-'+h.id+'.png',2,2);this.load('micro-enemies','art/sprites/micro-enemies.png',3,2);this.load('micro-terrain','art/terrain/micro-terrain.png',3,1,false);this.load('micro-props','art/sprites/micro-props.png',3,1);this.load('companions','art/sprites/companions.png',3,2);this.load('landmarks','art/sprites/landmarks.png',3,1);this.load('habitat','art/sprites/habitat.png',3,1);this.ready=Promise.allSettled(this.jobs);}
 load(key,url,cols,rows,trim=true){const img=new Image(),item={img,url,cols,rows,rects:[],ready:false};this.items[key]=item;this.jobs.push(new Promise(resolve=>{img.onload=()=>{const w=img.naturalWidth/cols,h=img.naturalHeight/rows;let pixels=null;try{if(trim){const cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(img,0,0);pixels=cx.getImageData(0,0,cv.width,cv.height).data;}}catch{}for(let i=0;i<cols*rows;i++){let x=Math.floor(i%cols*w),y=Math.floor(Math.floor(i/cols)*h),bw=Math.floor(w),bh=Math.floor(h);if(frames[key]){const f=frames[key][i],factor=1;x=Math.floor(f[0]*factor);y=Math.floor(f[1]*factor);bw=Math.min(img.naturalWidth-x,Math.floor(f[2]*factor));bh=Math.min(img.naturalHeight-y,Math.floor(f[3]*factor));}if(pixels){let l=bw,t=bh,r=0,b=0;for(let yy=0;yy<bh;yy+=2)for(let xx=0;xx<bw;xx+=2){if(pixels[((y+yy)*img.naturalWidth+x+xx)*4+3]>30){l=Math.min(l,xx);r=Math.max(r,xx);t=Math.min(t,yy);b=Math.max(b,yy);}}if(r>l&&b>t){x+=Math.max(0,l-2);y+=Math.max(0,t-2);bw=Math.min(bw-l,r-l+5);bh=Math.min(bh-t,b-t+5);}}item.rects.push({x,y,w:bw,h:bh});}item.ready=true;resolve(true);};img.onerror=()=>{item.failed=true;resolve(false);};img.src=url;}));}
 draw(c,key,cell,x,y,size,face=1,phase=0,walk=false,hit=0){const item=this.items[key];if(!item?.ready)return false;const b=item.rects[cell]||item.rects[0],ratio=Math.min(size/b.w,size/b.h),w=b.w*ratio,h=b.h*ratio,bob=walk?Math.sin(phase*12)*size*.02:Math.sin(phase*2)*size*.006;c.save();c.translate(x,y+bob);c.scale(face<0?-1:1,walk?1+Math.sin(phase*12)*.018:1);if(walk)c.rotate(Math.sin(phase*6)*.012);if(hit>0)c.filter='brightness(1.6)';c.drawImage(item.img,b.x,b.y,b.w,b.h,-w/2,-h+size*.22,w,h);c.restore();return true;}
 portrait(key,cell=0){const item=this.items[key],b=item?.rects[cell];if(b)return '<svg overflow="hidden" viewBox="'+[b.x,b.y,b.w,b.h].join(' ')+'" aria-hidden="true"><svg x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" viewBox="'+[b.x,b.y,b.w,b.h].join(' ')+'" overflow="hidden"><image href="'+item.url+'" width="'+item.img.naturalWidth+'" height="'+item.img.naturalHeight+'"/></svg></svg>';return '<span class="sprite-portrait" style="background-image:url('+item.url+');background-position:'+(cell%2?'100%':'0')+' '+(cell>1?'100%':'0')+'"></span>';}
}
const bank=new SpriteBank(),oldPortrait=A.portrait;
A.bank=bank;A.ready=bank.ready;A.heroPortrait=(s,i=E.formIndex(s.level))=>bank.portrait('hero-'+E.hero(s).id,Math.min(3,Math.floor(i/3)));
A.portrait=(body,color,level=1)=>E.HEROES.some(h=>h.id===body)?bank.portrait('hero-'+body,Math.min(3,Math.floor(E.formIndex(level)/3))):oldPortrait(body,color,level);
const iconPaths={
bolt:'m14 2-9 12h6l-1 8 9-13h-6z',ring:'M3 12a9 9 0 1 0 18 0M7 12a5 5 0 1 0 10 0M12 2v9m-3-3 3 3 3-3',chain:'m3 4 6 5-3 5 8-3-2 7 9 2M2 4h2m16 16h2',storm:'M4 13a5 5 0 0 1 3-9 6 6 0 0 1 11 1 4 4 0 0 1 1 8M11 10l-4 7h5l-2 5 7-10h-5',
flame:'M12 2c3 6 8 8 7 14a7 7 0 0 1-14 0c-1-4 2-7 4-9-1 4 2 5 3 6 2-3 2-6 0-11z',fan:'m12 20-9-9m9 9-5-14m5 14V3m0 17L17 6m-5 14 9-9M2 12l1-4 4 1m10 0 4-1 1 4',fox:'m4 3 2 10 6 8 6-8 2-10-7 6h-2zM8 13l2 1m4 0 2-1m-6 4h4',sun:'M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2M7 12a5 5 0 1 0 10 0 5 5 0 1 0-10 0',
portal:'M10 2C1 3 1 21 10 22M14 2c9 1 9 19 0 20M6 12h12m-4-4 4 4-4 4',vortex:'M12 12c4-3 7 3 2 5-7 3-11-6-5-11 7-5 15 3 10 11M5 3l-2 7 6-1',shards:'m12 2 3 7-3 4-3-4zm0 20-3-6 3-3 3 3zM2 9l6 1 4 3-7 1zm20 0-6 1-4 3 7 1z',maw:'M3 7q9-8 18 0l-2 11q-7 8-14 0zM5 6l3 5 2-7m4 0 2 7 3-5M6 18l3-4 3 6 3-6 3 4',
fist:'m5 8 3-5 4 1 3-1 4 4 1 9-4 5H9l-5-8zM8 4v6m4-6v5m4-5v6M5 12l5 2',spikes:'M2 21 7 8l3 13M8 21 13 2l5 19M16 21l4-12 3 12z',shield:'m12 2 9 4-1 9-8 7-8-7-1-9zM8 12l3 3 5-6',quake:'M2 17h5l3-5 3 9 3-7 6 3M6 3l3 4m9-4-3 4M12 2v6'};
A.skillIcon=skill=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="'+(iconPaths[skill.icon]||iconPaths.bolt)+'"/></svg>';
class Renderer extends Legacy{
 constructor(canvas){super(canvas);this.previewHero='dragon';this.previewStage=2;this.theme=0;this.lastRealm=-1;this.realmFlash=0;this.tiles={};}
 targetScale(w){return super.targetScale(w)*1.13;}
 tile(c,realm,scale,cam){const it=bank.items.terrain;if(!it.ready)return;const rect=it.rects[realm],unit=E.FORMS.find(f=>f.realm===realm).radius*16,size=E.clamp(unit*scale,140,650),ix=Math.floor(cam.x*scale/size),iy=Math.floor(cam.y*scale/size),ox=ix*size-cam.x*scale,oy=iy*size-cam.y*scale;for(let row=0,y=oy;y<this.h;row++,y+=size)for(let col=0,x=ox;x<this.w;col++,x+=size){const flipX=(ix+col)%2!==0,flipY=(iy+row)%2!==0;c.save();c.translate(x+(flipX?size:0),y+(flipY?size:0));c.scale(flipX?-1:1,flipY?-1:1);c.drawImage(it.img,rect.x+3,rect.y+3,rect.w-6,rect.h-6,0,0,size+.5,size+.5);c.restore();}}
 terrain(world){
 const c=this.c,realm=world.realm,scale=this.cam.scale,p=world.player,W=this.w,H=this.h;
 c.fillStyle=['#496d38','#264b39','#566279','#247686','#142744','#281f40'][realm];c.fillRect(0,0,W,H);this.tile(c,realm,scale,this.cam);
 c.fillStyle=realm<3?'#b8dcac19':'#04112128';c.fillRect(0,0,W,H);
 const layers=[{r:13,cell:95,type:'grass'},{r:28,cell:270,type:'flower'},{r:80,cell:640,slot:0},{r:320,cell:2100,slot:1},{r:2200,cell:14500,slot:2},{r:1.25e5,cell:8e5,slot:3},{r:2.2e6,cell:1.6e7,slot:4},{r:3.2e8,cell:2.6e9,slot:5}];
 for(let k=layers.length-1;k>=0;k--){const l=layers[k],px=l.r*scale;if(px<4||px>490||l.cell*scale<40)continue;const minX=Math.floor((this.cam.x-W/scale/2)/l.cell)-1,maxX=Math.floor((this.cam.x+W/scale/2)/l.cell)+1,minY=Math.floor((this.cam.y-H/scale/2)/l.cell)-1,maxY=Math.floor((this.cam.y+H/scale/2)/l.cell)+1;
 for(let iy=minY;iy<=maxY;iy++)for(let ix=minX;ix<=maxX;ix++){const seed=hash(ix,iy,k);if(seed<.4)continue;const wx=(ix+.15+hash(ix,iy,k+10)*.7)*l.cell,wy=(iy+.15+hash(ix,iy,k+20)*.7)*l.cell,rr=l.r*(.8+seed*.35);if(Math.hypot(wx-p.x,wy-p.y)<p.r*2+rr*.7)continue;const pos=this.screen(wx,wy);if(pos.x<-px*2||pos.x>W+px*2||pos.y<-px*2||pos.y>H+px*2)continue;c.save();c.globalAlpha=E.clamp((px-4)/12,0,1);if(l.slot!==undefined){ellipse(c,pos.x,pos.y+px*.2,px*.8,px*.23,'#08181233');if(!bank.draw(c,'props',l.slot,pos.x,pos.y,px*2.5,1,0,false))super.decor(['mushroom','tree','village','mountain','island','planet'][l.slot],pos.x,pos.y,px,seed,realm);}else super.decor(l.type,pos.x,pos.y,px,seed,realm);c.restore();}}
 if(realm===0){const pos=this.screen(211,-178),rr=88*scale;if(rr>3&&rr<550){c.save();c.globalAlpha=.82;super.pond(pos.x,pos.y,rr);c.restore();}}
 if(realm>=4){const pos=this.screen(0,0),rr=3e8*scale;if(rr<800)bank.draw(c,'props',5,pos.x,pos.y,rr*2.2,1,0);}
 if(realm===2){for(let i=0;i<6;i++){const x=hash(i,81)*W,y=hash(i,82)*H;const g=c.createRadialGradient(x,y,0,x,y,100);g.addColorStop(0,'#ba92ea0f');g.addColorStop(1,'#ba92ea00');c.fillStyle=g;c.fillRect(x-100,y-100,200,200);}}
 for(let i=0;i<32;i++){const x=(hash(i,42)*W+Math.sin(this.time*.1+i)*25),y=((hash(i,43)*H-this.time*(2+i%5))%H+H)%H;circle(c,x,y,hash(i,44)*1.5+.5,realm>=4?'#bce9ff66':'#e8fdb055');}
 const g=c.createRadialGradient(W*.5,H*.5,H*.15,W*.5,H*.5,Math.max(W,H)*.62);g.addColorStop(0,'#09172700');g.addColorStop(1,'#07152878');c.fillStyle=g;c.fillRect(0,0,W,H);
 }
 glow(x,y,r,color,alpha=.35){const c=this.c,g=c.createRadialGradient(x,y,0,x,y,Math.max(1,r));g.addColorStop(0,color);g.addColorStop(1,color+'00');c.save();c.globalAlpha=alpha;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
 bolt(x,y,x2,y2,col,width=2,seed=0){const pts=[];for(let i=0;i<=9;i++){const t=i/9,w=i===0||i===9?0:Math.sin(i*17+seed)*12;pts.push([x+(x2-x)*t+w,y+(y2-y)*t+w*.4]);}line(this.c,pts,col,width*2.7);line(this.c,pts,'#f8ffff',width*.65);}
 fx(f,world){
 const c=this.c,p=this.screen(f.x,f.y),r=f.r*this.cam.scale,t=E.clamp(1-f.life/f.max,0,1),col=f.color||'#a9e6ff',hero=this.screen(world.player.x,world.player.y);
 if(r<.2||p.x<-r*2||p.x>this.w+r*2||p.y<-r*2||p.y>this.h+r*2)return;c.save();c.globalAlpha=1-t;c.globalCompositeOperation='lighter';
 if(['chain','link','beam','firelink'].includes(f.type)){const to=this.screen(f.x2,f.y2);if(f.type==='chain'||f.type==='link')this.bolt(p.x,p.y,to.x,to.y,col,f.type==='chain'?2:1,this.time*17);else{line(c,[[p.x,p.y],[to.x,to.y]],col,f.type==='beam'?9*(1-t):4);this.glow(to.x,to.y,16,col);}}
 else if(['bolt','lightning'].includes(f.type)){this.bolt(p.x+20,p.y-r*2,p.x,p.y,col,3,this.time*7);circle(c,p.x,p.y,r*t*.65,null,col,2);this.glow(p.x,p.y,r*.7,col,.45);}
 else if(['blackhole','devour','vortex','portal'].includes(f.type)){
  const radius=r*(f.type==='portal'?.8:1-t*.8);this.glow(p.x,p.y,r*.7,col,.25);c.globalCompositeOperation='source-over';ellipse(c,p.x,p.y,radius*.6,radius*.35,'#101020b9');c.globalCompositeOperation='lighter';
  for(let i=0;i<4;i++){c.beginPath();c.ellipse(p.x,p.y,radius*(.45+i*.16),radius*(.28+i*.07),f.type==='portal'?Math.PI/2:0,t*8+i*1.4,t*8+i*1.4+2.1);c.strokeStyle=i%2?col:'#73f4e1';c.lineWidth=3-i*.45;c.stroke();}
  for(let i=0;i<18;i++){const a=i*TAU/18+t*5,d=radius*(.4+hash(i,2)*.65);circle(c,p.x+Math.cos(a)*d,p.y+Math.sin(a)*d*.65,1.5,col);}
 }
 else if(['spike','shatter'].includes(f.type)){
  if(f.delay&&t*f.max<f.delay){c.restore();return;}const n=f.type==='spike'?5:14;
  for(let i=0;i<n;i++){const a=i*TAU/n,d=f.type==='spike'?r*.45:r*t,x=p.x+Math.cos(a)*d,y=p.y+Math.sin(a)*d*.65,len=r*(f.type==='spike'?.8:.26)*(1-t*.35);c.beginPath();c.moveTo(x-len*.23,y);c.lineTo(x,y-len);c.lineTo(x+len*.25,y-len*.16);c.lineTo(x,y+len*.13);c.closePath();c.fillStyle=i%2?col:'#f4e3b4';c.fill();}this.glow(p.x,p.y,r,col,.13);
 }
 else if(f.type==='slash'){c.beginPath();c.ellipse(p.x,p.y,r*(.7+t*.25),r*(.55+t*.2),0,f.angle-.7,f.angle+.9);c.lineWidth=Math.max(2,r*.075*(1-t));c.strokeStyle=E.hero(world.save).color;c.stroke();}
 else if(f.type==='absorb'){for(let i=0;i<7;i++){const a=i*TAU/7+t*5,x=p.x+(hero.x-p.x)*t+Math.cos(a)*r*(1-t),y=p.y+(hero.y-p.y)*t+Math.sin(a)*r*(1-t);circle(c,x,y,2.5,'#ffe4a0');}}
 else if(f.type==='ghost'||f.type==='dashburst'){const a=f.angle||0;for(let i=0;i<5;i++){const off=(i-2)*r*.2;line(c,[[p.x-Math.cos(a)*r*(1+t)-Math.sin(a)*off,p.y-Math.sin(a)*r*(1+t)+Math.cos(a)*off],[p.x-Math.sin(a)*off,p.y+Math.cos(a)*off]],col,2*(1-t));}}
 else if(['ember','flamecast'].includes(f.type)){for(let i=0;i<9;i++){const a=i*TAU/9+t,d=r*t;ellipse(c,p.x+Math.cos(a)*d,p.y+Math.sin(a)*d*.55-r*t*.3,r*.08,r*.2,col);}this.glow(p.x,p.y,r,col,.25);}
 else{
  const radius=r*Math.min(1,t*1.5),ellipseY=f.type==='shieldhit'||f.type==='shieldburst'?1:.65;
  if(f.type==='sunburst'){this.glow(p.x,p.y,r*(1-t*.3),'#ffc376',.6);circle(c,p.x,p.y,radius*.65,'#ffda7855');}
  else this.glow(p.x,p.y,r*(.5+t*.4),col,.13);
  for(let j=0;j<3;j++)ellipse(c,p.x,p.y,radius*(1-j*.07),radius*ellipseY*(1-j*.07),null,j===1?'#fff4c1':col,(3-j*.5)*(1-t*.4));
  if(['quake','thunderRing','stormEye'].includes(f.type))for(let i=0;i<15;i++){const a=i*TAU/15,rr=radius*(.8+hash(i,6)*.2),x=p.x+Math.cos(a)*rr,y=p.y+Math.sin(a)*rr*.65;if(f.type==='thunderRing')this.bolt(x,y,x+Math.cos(a)*r*.15,y-15,col,1,i);else{c.save();c.translate(x,y);c.rotate(a);c.fillStyle=i%2?col:'#ddcaa4';c.fillRect(-3,-3,6+r*.01,6+r*.02);c.restore();}}
 }c.restore();
 }
 draw(world,state,time,dt){
 this.time=time;const c=this.c;c.setTransform(this.dpr,0,0,this.dpr,0,0);if(!world){this.menu(time);return;}if(world.shake>0&&!this.reduced)c.translate(Math.sin(time*93)*world.shake*.6,Math.cos(time*117)*world.shake*.4);
 const p=world.player,h=E.hero(world.save),scale=this.targetScale(world),smooth=1-Math.exp(-dt*2.5);this.cam.scale=Math.exp(Math.log(this.cam.scale)+(Math.log(scale)-Math.log(this.cam.scale))*smooth);const follow=1-Math.exp(-dt*8);this.cam.x+=(p.x-this.cam.x)*follow;this.cam.y+=(p.y-this.cam.y)*follow;this.terrain(world);
 if(this.lastRealm!==world.realm){if(this.lastRealm>=0)this.realmFlash=3;this.lastRealm=world.realm;}
 const ps=this.screen(p.x,p.y),pr=p.r*this.cam.scale;
 for(const q of world.skillAreas||[]){if(q.kind==='fire'&&q.life>0){const pos=this.screen(q.x,q.y),r=q.r*this.cam.scale;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,q.life);ellipse(c,pos.x,pos.y,r,r*.5,'#fd792d30');for(let i=0;i<5;i++){const xx=pos.x+Math.sin(i*7)*r*.8,yy=pos.y-Math.abs(Math.sin(time*5+i))*r*.5;ellipse(c,xx,yy,3,7,'#ffc37b88');}c.restore();}} 
 for(const w of world.warnings){const pos=this.screen(w.x,w.y),r=w.r*this.cam.scale;c.save();ellipse(c,pos.x,pos.y,r,r*.8,'#ff3d342f','#ff8e70',2);ellipse(c,pos.x,pos.y,r*(1-w.life/w.max),r*.8*(1-w.life/w.max),null,'#ffe8af',2);c.restore();}
 if(world.moveTarget){const pos=this.screen(world.moveTarget.x,world.moveTarget.y);circle(c,pos.x,pos.y,8,null,'#e5fbca88',1.5);}
 const actors=world.enemies.map(e=>({type:'enemy',e}));actors.push({type:'hero',e:p});world.pets.forEach(e=>actors.push({type:'pet',e}));actors.sort((a,b)=>(world.isMicro?Number(a.type==='hero')-Number(b.type==='hero'):0)||a.e.y-b.e.y);
 for(const {type,e} of actors){const pos=this.screen(e.x,e.y),r=(type==='pet'?p.r*.42:e.r)*this.cam.scale;if(r<1.4||pos.x<-r*2||pos.x>this.w+r*2||pos.y<-r*2||pos.y>this.h+r*2)continue;
  c.save();ellipse(c,pos.x,pos.y+r*.45,r*.85,r*.26,'#05121949');
  let key,cell,face=1,walk=true,hit=e.hit||0;if(type==='hero'){key=(world.isMicro?'micro-':'hero-')+h.id;cell=E.formFor(world.save).stage;face=p.face;walk=Math.hypot(p.vx,p.vy)>.05;ellipse(c,pos.x,pos.y+r*.38,r*1.1,r*.38,null,h.color+'aa',1.6);if(cell>=1){this.glow(pos.x,pos.y,r*1.5,h.color,.1);for(let i=0;i<cell*3;i++){const a=time*.7+i*TAU/(cell*3);circle(c,pos.x+Math.cos(a)*r*1.1,pos.y+Math.sin(a)*r*.4+r*.2,1.6,h.accent);}}}
  else if(type==='pet'){const pet=E.PETS.find(q=>q.id===e.id);if(e.id==='wisp'){A.creature(c,pos.x,pos.y,r,'wisp',pet.color,time,1,true,true);c.restore();continue;}key='hero-'+({fox:'fox',rock:'titan',dragon:'dragon',star:'void'}[e.id]);cell=world.save.level>=pet.level*8?1:0;face=p.face;}
  else{key=world.isMicro?'micro-enemies':'enemies-'+e.artTier;cell=e.artSlot;face=e.angle<0?-1:1;if((e.artTier===2&&cell===1)||(e.artTier===3&&cell===1)||(e.artTier===4&&cell===2)||(e.artTier===5&&cell===0))face*=-1;if(e.id===world.targetId)ellipse(c,pos.x,pos.y+r*.4,r*1.1,r*.4,null,e.level>world.save.level?'#ff9c83':'#ffedbc',2.2);if(e.boss)this.glow(pos.x,pos.y,r*1.3,'#fbba74',.09);c.globalAlpha=e.spawn>0?.4+(1-e.spawn/.7)*.6:1;}
  if(key==='hero-void'&&cell>0)face*=-1;if(world.isMicro&&type==='hero'&&cell===3&&h.id!=='void')face*=-1;
  if(!bank.draw(c,key,cell,pos.x,pos.y,r*2.8,face,time+(typeof e.id==='number'?e.id:0),walk,hit))A.creature(c,pos.x,pos.y,r,type==='hero'?'dragon':e.body||'wisp',type==='hero'?h.color:e.color||'#faf1c1',time,face,type==='hero',walk,hit);
  if(type==='hero'&&p.cast>0){c.globalAlpha=p.cast;ellipse(c,pos.x,pos.y+r*.4,r*1.4,r*.5,null,h.accent,2);}c.restore();
 }
 if(p.phantoms>0){for(let i=0;i<3;i++){const a=time*1.4+i*TAU/3;c.save();c.globalAlpha=.55;c.globalCompositeOperation='lighter';bank.draw(c,world.isMicro?'micro-fox':'hero-fox',world.isMicro?2:1,ps.x+Math.cos(a)*pr*2.5,ps.y+Math.sin(a)*pr*1.6,pr*1.9,Math.cos(a)>0?1:-1,time,true);c.restore();}}
 if(p.tempest>0){this.glow(ps.x,ps.y,pr*6,h.color,.055);c.save();c.globalAlpha=.3;ellipse(c,ps.x,ps.y,pr*5,pr*3,null,h.color,1);c.restore();}
 for(const b of world.bullets){const pos=this.screen(b.x,b.y),r=Math.max(3,b.r*this.cam.scale);c.save();c.translate(pos.x,pos.y);c.rotate(b.angle);c.globalCompositeOperation='lighter';if(b.kind==='fire'){line(c,[[-r*5,0],[0,0]],'#ff9e61',r);ellipse(c,0,0,r*1.5,r,'#ffeba7');}else{c.beginPath();c.moveTo(r*2,0);c.lineTo(-r,-r);c.lineTo(-r*2,0);c.lineTo(-r,r);c.closePath();c.fillStyle='#d0b5ff';c.fill();}c.restore();}
 for(const f of world.effects)this.fx(f,world);
 for(const q of world.particles){const pos=this.screen(q.x,q.y);c.globalAlpha=E.clamp(q.life/q.max,0,1);circle(c,pos.x,pos.y,Math.max(.5,Math.min(5,q.size*this.cam.scale)),q.color);}c.globalAlpha=1;
 if(p.shield>0){c.save();c.globalCompositeOperation='lighter';const rr=pr*1.6;circle(c,ps.x,ps.y-pr*.55,rr,'#87f0ba13','#b2ffc7',2);for(let i=0;i<6;i++){const a=i*TAU/6;line(c,[[ps.x,ps.y-pr*.55],[ps.x+Math.cos(a)*rr,ps.y-pr*.55+Math.sin(a)*rr]],'#a4ffc74a',1);}c.restore();}
 this.labels(world);
 if(this.realmFlash>0){this.realmFlash-=dt;c.save();c.globalAlpha=Math.min(1,this.realmFlash,3-this.realmFlash);c.textAlign='center';c.font='700 28px Segoe UI';c.fillStyle='#fff2cd';c.shadowColor='#081c28';c.shadowBlur=15;c.fillText((world.isMicro?E.MICRO_REALMS:E.REALMS)[world.realm].name,this.w/2,this.h*.25);c.font='10px Segoe UI';c.fillText(world.isMicro?'ЖИЗНЬ СТАНОВИТСЯ СЛОЖНЕЕ':'ТВОЙ МИР СТАЛ БОЛЬШЕ',this.w/2,this.h*.25+23);c.restore();}
 }
 menu(time){const c=this.c,W=this.w,H=this.h,h=E.hero(this.previewHero);c.fillStyle='#102326';c.fillRect(0,0,W,H);const fake={realm:0,player:{x:0,y:0,r:12}};this.cam={x:0,y:0,scale:.9};this.tile(c,0,.9,this.cam);const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#091f25ee');g.addColorStop(.5,'#132727aa');g.addColorStop(1,'#16393166');c.fillStyle=g;c.fillRect(0,0,W,H);const x=W*(W<600?.72:.74),y=H*.66,r=Math.min(W*.24,H*.4);this.glow(x,y-r*.3,r*1.3,h.color,.12);ellipse(c,x,y+r*.14,r*.85,r*.23,'#050e1677');ellipse(c,x,y+r*.1,r*.86,r*.25,null,h.color+'50',1);bank.draw(c,'hero-'+h.id,this.previewStage,x,y,r*1.9,1,time,false);for(let i=0;i<38;i++){const xx=hash(i,55)*W,yy=((hash(i,56)*H-time*(i%4+2))%H+H)%H;circle(c,xx,yy,hash(i,57)*1.5+.4,h.color+'66');}}
}
A.Renderer=Renderer;
})(window);
