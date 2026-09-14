(function(root){
  'use strict';
  const E=root.Evolution,TAU=Math.PI*2;
  function shade(hex,amount){const v=parseInt(hex.slice(1),16);return '#'+[v>>16,(v>>8)&255,v&255].map(n=>Math.round(E.clamp(n+amount,0,255)).toString(16).padStart(2,'0')).join('');}
  function hash(x,y,k=0){let n=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(k+1,144269);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296;}
  function circle(c,x,y,r,fill,stroke,width=1){c.beginPath();c.arc(x,y,Math.max(0,r),0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  function ellipse(c,x,y,rx,ry,fill,angle=0,stroke,width=1){c.beginPath();c.ellipse(x,y,Math.max(.000001,rx),Math.max(.000001,ry),angle,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  function poly(c,points,fill,stroke,width=1){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  function line(c,points,color,width=1){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
  function eyes(c,x,y,size=.16,hero=false){for(const sign of [-1,1]){ellipse(c,x+sign*.28,y,.16,size*1.4,'#f9ffe8');ellipse(c,x+sign*.26,y+.02,.085,size,'#244747');circle(c,x+sign*.26+.022,y-.04,.035,'#ffffff');}if(hero){ellipse(c,x-.45,y+.24,.13,.065,'#efa6a35c');ellipse(c,x+.45,y+.24,.13,.065,'#efa6a35c');}c.beginPath();c.arc(x,y+.25,.105,0,Math.PI);c.strokeStyle='#376958';c.lineWidth=.045;c.stroke();}
  function creature(c,x,y,r,body,color,time,face=1,hero=false,moving=false,hit=0){
    if(!(r>0)||!Number.isFinite(r))return;c.save();c.translate(x,y);c.scale(r,r);c.lineJoin='round';c.lineCap='round';
    ellipse(c,0,.45,1.05,.3,'#24513a24');const bob=(moving?Math.sin(time*14)*.06:Math.sin(time*2)*.025);c.translate(0,bob);c.scale(face<0?-1:1,1);
    const light=shade(color,24),dark=shade(color,-38),outline=shade(color,-68),gradient=c.createLinearGradient(-.5,-1,.6,.8);gradient.addColorStop(0,light);gradient.addColorStop(1,dark);
    if(body==='cosmic'){
      c.save();c.rotate(time*.16);for(let i=0;i<3;i++){c.rotate(Math.PI/3);ellipse(c,0,0,1.65,.48,null,0,color+'a0',.018);}for(let i=0;i<7;i++){const a=i*TAU/7;circle(c,Math.cos(a)*1.58,Math.sin(a)*1.58,.045,'#fff2b9');}c.restore();
      for(let i=0;i<5;i++){const a=i*TAU/5+time*.2;poly(c,[[Math.cos(a)*.6,Math.sin(a)*.6],[Math.cos(a+.2)*1.2,Math.sin(a+.2)*1.2],[Math.cos(a+.5)*.7,Math.sin(a+.5)*.7]],color+'55');}
      const g=c.createRadialGradient(-.25,-.3,.08,0,0,.95);g.addColorStop(0,'#fffce4');g.addColorStop(.35,light);g.addColorStop(1,shade(color,-40));circle(c,0,0,.87,g,color,.04);circle(c,0,-.07,.48,'#fffce523');eyes(c,0,.02,.15,hero);poly(c,[[-.23,-.83],[0,-1.32],[.23,-.83]],'#fff4c3');
    }else if(body==='titan'){
      ellipse(c,-.49,.51,.36,.24,dark);ellipse(c,.49,.51,.36,.24,dark);
      poly(c,[[-.68,-.68],[.57,-.77],[.83,-.24],[.65,.48],[-.58,.48],[-.85,-.05]],gradient,outline,.025);
      for(const sign of [-1,1]){poly(c,[[sign*.58,-.65],[sign*1.0,-.52],[sign*1.19,.16],[sign*.95,.37],[sign*.69,.08]],shade(color,-15),outline,.025);poly(c,[[sign*.43,-.73],[sign*.5,-1.18],[sign*.72,-.64]],'#b8d4b2');}
      poly(c,[[-.42,-.76],[-.18,-1.08],[.26,-1.06],[.48,-.68],[.35,-.2],[-.3,-.2]],light,outline,.025);eyes(c,0,-.59,.12,hero);poly(c,[[-.22,-.04],[0,-.25],[.25,-.02],[0,.25]],'#fff2b8');line(c,[[-.45,.05],[-.55,.29],[-.38,.4]],shade(color,-55),.035);
    }else if(body==='treant'){
      for(const sign of [-1,1]){line(c,[[sign*.4,.24],[sign*.75,.69],[sign*1.07,.72]],'#8c9872',.18);line(c,[[sign*.4,-.22],[sign*.87,-.08],[sign*1.07,-.39]],'#8c9872',.17);}poly(c,[[-.43,-.85],[.44,-.8],[.55,.47],[.08,.66],[-.5,.44]],'#a3a67a','#747f63',.025);for(const [xx,yy,rr] of [[-.5,-.82,.57],[.46,-.88,.64],[0,-1.18,.61]]){circle(c,xx,yy,rr,xx<0?'#91b787':'#aec78e','#648962',.025);ellipse(c,xx-.13,yy-.17,rr*.47,rr*.21,'#d4e3a665');}eyes(c,0,-.08,.13);line(c,[[-.25,.35],[-.1,.42],[.1,.36]],'#768660',.025);
    }else if(body==='frog'){
      ellipse(c,-.73,.37,.5,.33,dark,-.35);ellipse(c,.73,.37,.5,.33,dark,.35);ellipse(c,0,-.03,.91,.69,gradient,0,outline,.025);ellipse(c,0,.28,.58,.34,'#dce3a7');circle(c,-.52,-.66,.34,light,outline,.02);circle(c,.52,-.66,.34,light,outline,.02);for(const sign of [-1,1]){circle(c,sign*.52,-.69,.18,'#fbffd9');ellipse(c,sign*.52,-.68,.055,.13,'#344e37');}c.beginPath();c.arc(0,-.03,.49,.12,Math.PI-.12);c.strokeStyle='#426b3e';c.lineWidth=.035;c.stroke();for(const sign of [-1,1])circle(c,sign*.7,-.02,.06,'#d9df9b88');
    }else if(body==='celestial'){
      c.save();c.rotate(-.14+Math.sin(time)*.02);ellipse(c,0,.12,1.48,.39,null,0,color+'aa',.023);c.restore();
      for(const sign of [-1,1]){poly(c,[[sign*.5,-.15],[sign*1.48,-.47],[sign*1.12,.02],[sign*1.54,.33],[sign*.62,.43]],gradient,outline,.02);line(c,[[sign*.38,-.78],[sign*.61,-1.26],[sign*.83,-1.43]],'#f4e7b1',.065);line(c,[[sign*.58,-1.2],[sign*.33,-1.41]],'#f4e7b1',.04);}
      c.beginPath();c.moveTo(-.65,-.2);c.bezierCurveTo(-.68,-1.01,.7,-1.1,.76,-.16);c.bezierCurveTo(.82,.41,.25,.68,0,.88);c.bezierCurveTo(-.04,.62,-.58,.43,-.65,-.2);c.fillStyle=gradient;c.fill();c.strokeStyle=outline;c.lineWidth=.025;c.stroke();eyes(c,0,-.22,.15,hero);poly(c,[[-.12,-.72],[0,-.95],[.12,-.72],[0,-.5]],'#ffffcf');
    }else if(['fox','horn','wing','dragon','wolf','boar','rabbit'].includes(body)){
      const winged=body==='dragon'||body==='wing';
      if(winged){const wave=Math.sin(time*(moving?7:3))*.13;for(const sign of [-1,1]){c.save();c.scale(sign,1);poly(c,[[.45,-.12],[1.39,-1.05+wave],[1.3,-.29],[1.63,.07+wave],[.65,.39]],shade(color,-7),outline,.025);line(c,[[.51,-.04],[1.39,-1.05+wave],[1.05,-.1],[1.63,.07+wave]],shade(color,38),.024);c.restore();}}
      c.beginPath();c.moveTo(-.38,.37);c.bezierCurveTo(-1.4,.54,-1.36,-.09,-1.05,-.24);c.bezierCurveTo(-1.13,.25,-.66,-.13,-.35,.03);c.closePath();c.fillStyle=dark;c.fill();
      for(const [xx,yy] of [[-.46,.48],[.46,.48],[-.66,.25],[.65,.26]])ellipse(c,xx,yy,.23,.17,dark);
      ellipse(c,0,-.09,.75,.65,gradient,0,outline,.024);
      const ear=body==='rabbit'?1.6:winged?.91:1.12;
      for(const sign of [-1,1]){poly(c,[[sign*.22,-.58],[sign*.52,-ear],[sign*.73,-.57]],light,outline,.026);poly(c,[[sign*.38,-.66],[sign*.52,1-ear-.77],[sign*.61,-.61]],'#f8e8c088');}
      ellipse(c,0,-.36,.67,.56,gradient,0,outline,.024);ellipse(c,.08,-.1,.43,.28,'#e6f4d582');eyes(c,.03,-.38,.15,hero);
      if(body==='boar'){for(const sign of [-1,1])poly(c,[[sign*.32,-.04],[sign*.48,-.42],[sign*.52,.02]],'#fff4c6');ellipse(c,0,-.09,.25,.14,'#c8a497');circle(c,-.09,-.1,.035,'#6e5f58');circle(c,.09,-.1,.035,'#6e5f58');}
      if(['horn','dragon','wing'].includes(body)){for(const sign of [-1,1])poly(c,[[sign*.34,-.68],[sign*.29,-1.27],[sign*.55,-.81]],'#f5ebc1',shade(color,-25),.018);poly(c,[[-.1,-.85],[0,-1.12],[.11,-.85]],shade(color,45));}
      if(body==='dragon'){for(let i=0;i<3;i++)poly(c,[[-.38+i*.25,.2],[-.29+i*.25,.05],[-.2+i*.25,.2]],shade(color,35));}
    }else if(body==='mite'){
      for(const sign of [-1,1])for(let i=0;i<3;i++)line(c,[[sign*.6,-.3+i*.3],[sign*.96,-.39+i*.34],[sign*1.11,-.18+i*.32]],shade(color,-50),.065);
      ellipse(c,0,.08,.75,.69,gradient,0,outline,.028);ellipse(c,0,-.37,.6,.41,light,0,outline,.028);line(c,[[0,.04],[0,.62]],outline,.027);eyes(c,0,-.32,.13);circle(c,-.3,.18,.09,shade(color,24));circle(c,.32,.35,.07,shade(color,24));
    }else if(body==='wisp'){
      const g=c.createRadialGradient(0,0,.1,0,0,1.3);g.addColorStop(0,color+'bb');g.addColorStop(1,color+'00');circle(c,0,0,1.3,g);poly(c,[[-.55,.1],[-1.03,-.23],[-.75,.42]],'#ffffe5bb');poly(c,[[.55,.1],[1.03,-.23],[.75,.42]],'#ffffe5bb');circle(c,0,0,.65,gradient);eyes(c,0,-.08,.12,true);
    }else{
      c.beginPath();c.moveTo(-.82,.14);c.bezierCurveTo(-.88,-.8,-.19,-.71,0,-1.02);c.bezierCurveTo(.17,-.72,.87,-.84,.83,.17);c.bezierCurveTo(.74,.72,-.7,.73,-.82,.14);c.closePath();c.fillStyle=gradient;c.fill();c.strokeStyle=outline;c.lineWidth=.026;c.stroke();ellipse(c,-.31,-.42,.18,.085,'#ffffff7d',-.5);eyes(c,0,-.08,.16,hero);ellipse(c,0,.37,.31,.07,'#d7ffcf66');
    }
    if(hero){circle(c,0,-1.5,.045,'#fffad4');circle(c,.16,-1.57,.026,'#fffad499');}
    if(hit>0){c.globalAlpha=Math.min(.55,hit*3);ellipse(c,0,-.13,.78,.66,'#fffde3');c.globalAlpha=1;}c.restore();
  }
  let portraitSerial=0;
  function portrait(body,color,level=1){
    const gradientId=`evo-body-${++portraitSerial}`;
    const wings=['wing','dragon','celestial','cosmic'].includes(body),horn=['horn','wing','dragon','cosmic'].includes(body),titan=body==='titan';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="${gradientId}" x2=".7" y2="1"><stop stop-color="${shade(color,28)}"/><stop offset="1" stop-color="${shade(color,-24)}"/></linearGradient></defs><ellipse cx="50" cy="85" rx="30" ry="7" fill="#30583b22"/>${wings?`<path d="M34 45 4 25l8 30-7 12 30 3M66 45l30-20-8 30 7 12-30 3" fill="${shade(color,-15)}" stroke="${shade(color,-50)}"/>`:''}${body==='fox'||body==='rabbit'||body==='horn'?`<path d="m22 37 4-27 21 20m6 0 21-20 4 27" fill="${color}" stroke="${shade(color,-50)}"/>`:''}<path d="${titan?'M20 35 35 19h31l15 19-6 37H25z':'M17 60Q13 28 34 27L50 17l16 10q21 1 17 33-1 25-33 26Q18 85 17 60'}" fill="url(#${gradientId})" stroke="${shade(color,-55)}" stroke-width="1.5"/>${horn?'<path d="m28 31 3-25 13 20M56 26 69 6l3 25" fill="#fff3c6"/>':''}${body==='cosmic'?'<ellipse cx="50" cy="51" rx="45" ry="17" fill="none" stroke="#fff0b9" stroke-width="2" transform="rotate(-20 50 51)"/>':''}<ellipse cx="37" cy="50" rx="9" ry="12" fill="#f9ffe7"/><ellipse cx="63" cy="50" rx="9" ry="12" fill="#f9ffe7"/><ellipse cx="39" cy="52" rx="4.5" ry="8" fill="#264d45"/><ellipse cx="61" cy="52" rx="4.5" ry="8" fill="#264d45"/><circle cx="40" cy="48" r="2" fill="white"/><circle cx="62" cy="48" r="2" fill="white"/><path d="M44 65q6 7 12 0" fill="none" stroke="#3b6a51" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="25" cy="63" rx="6" ry="3" fill="#f4b3b180"/><ellipse cx="75" cy="63" rx="6" ry="3" fill="#f4b3b180"/>${level>=400&&body==='fox'?'<path d="M22 75Q-2 68 11 45M79 75q22-7 9-30" fill="none" stroke="#fff0bb" stroke-width="5"/>':''}</svg>`;
  }
  class Renderer{
    constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.cam={x:0,y:0,scale:2};this.time=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.resize();}
    resize(){this.w=innerWidth;this.h=innerHeight;this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*this.dpr);this.canvas.height=Math.round(this.h*this.dpr);}
    screen(x,y){return {x:(x-this.cam.x)*this.cam.scale+this.w/2,y:(y-this.cam.y)*this.cam.scale+this.h*.53};}
    world(x,y){return {x:(x-this.w/2)/this.cam.scale+this.cam.x,y:(y-this.h*.53)/this.cam.scale+this.cam.y};}
    reset(world){this.cam.x=world.player.x;this.cam.y=world.player.y;this.cam.scale=this.targetScale(world);}
    targetScale(world){const index=E.formIndex(world.save.level),a=E.FORMS[index],b=E.FORMS[Math.min(index+1,11)],progress=a===b?0:(world.save.level-a.level)/(b.level-a.level),size=(29+Math.min(index,7)*3+progress*10)*(this.w<600?.82:1);return size/world.player.r;}
    terrain(world){
      const c=this.c,realm=world.realm,W=this.w,H=this.h,scale=this.cam.scale,cam=this.cam;
      c.fillStyle=E.REALMS[realm].color;c.fillRect(0,0,W,H);
      const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,realm>=4?'#777bab10':'#ffffff20');bg.addColorStop(1,realm>=4?'#000c231b':'#3c7a6530');c.fillStyle=bg;c.fillRect(0,0,W,H);
      if(realm>=4){for(let i=0;i<130;i++){const x=hash(i,2)*W,y=hash(i,3)*H,twinkle=.35+Math.sin(this.time*.6+i)*.2;circle(c,x,y,hash(i,5)*1.5+.3,`rgba(230,244,231,${twinkle})`);}const g=c.createRadialGradient(W*.6,H*.5,0,W*.6,H*.5,W*.7);g.addColorStop(0,'#998af025');g.addColorStop(1,'#d1baff00');c.fillStyle=g;c.fillRect(0,0,W,H);}
      c.save();c.translate(W/2,H*.53);c.scale(scale,scale);c.translate(-cam.x,-cam.y);
      const layers=[{cell:80,r:12,type:'grass'},{cell:250,r:33,type:'flower'},{cell:550,r:75,type:'mushroom'},{cell:1700,r:280,type:'tree'},{cell:6500,r:1000,type:'house'},{cell:42000,r:6300,type:'village'},{cell:7e5,r:1.3e5,type:'mountain'},{cell:9e6,r:2.2e6,type:'island'},{cell:1.8e9,r:3.2e8,type:'planet'},{cell:7e10,r:9e9,type:'star'}];
      // Fixed coordinates and physical sizes: zooming out makes the original landmarks shrink.
      for(let li=layers.length-1;li>=0;li--){const layer=layers[li],px=layer.r*scale;if(px<2.2||px>410||layer.cell*scale<34)continue;
        const minX=Math.floor((cam.x-W/scale/2-layer.r*2)/layer.cell),maxX=Math.floor((cam.x+W/scale/2+layer.r*2)/layer.cell),minY=Math.floor((cam.y-H/scale*.53-layer.r*2)/layer.cell),maxY=Math.floor((cam.y+H/scale*.47+layer.r*2)/layer.cell);
        let count=0;for(let iy=minY;iy<=maxY;iy++)for(let ix=minX;ix<=maxX;ix++){if(++count>280)break;const h=hash(ix,iy,li);if(h<.24)continue;const x=(ix+.16+hash(ix,iy,li+10)*.7)*layer.cell,y=(iy+.13+hash(ix,iy,li+11)*.7)*layer.cell,rr=layer.r*(.7+h*.5);if(Math.hypot(x-world.player.x,y-world.player.y)<world.player.r*2.6+rr*.7)continue;
          c.save();c.globalAlpha=E.clamp((px-2.2)/8,0,1);this.decor(layer.type,x,y,rr,h,realm);c.restore();}
      }
      const pondPx=75*scale;if(pondPx>1&&pondPx<700){this.pond(211,-178,88);}
      if(realm>=4){const rr=3e8;const pos=this.screen(0,0);if(Math.abs(pos.x-W/2)<W/2+rr*scale&&Math.abs(pos.y-H/2)<H/2+rr*scale)this.decor('home',0,0,rr,.4,realm);}
      c.restore();
      // Soft foreground pollen, or drifting stardust, at screen scale.
      for(let i=0;i<27;i++){const x=(hash(i,22)*W+Math.sin(this.time*.11+i)*15),y=(hash(i,23)*H-this.time*(3+i%5))%(H+10);circle(c,x,y<0?y+H:y,hash(i,20)*1.5+.5,realm>=4?'#f6e9ba48':'#f9f8b17d');}
    }
    pond(x,y,r){const c=this.c;c.save();c.translate(x,y);c.scale(r,r);ellipse(c,0,.03,1.19,.79,'#65996640',-.2);ellipse(c,0,1e-8+0,1.1,.72,'#e3ebaa',-.2);ellipse(c,0,-.04,1.03,.66,'#8ccfb7',-.2);ellipse(c,-.1,-.06,.92,.54,'#69bcb7',-.2);ellipse(c,-.16,-.13,.56,.28,'#83d4c080',-.2);for(let i=0;i<4;i++)ellipse(c,-.5+i*.27,-.21+(i%2)*.25,.1,.07,'#a1d193');line(c,[[-.61,.15],[-.3,.18],[-.02,.14]],'#d5ead280',.012);c.restore();}
    decor(type,x,y,r,seed,realm){const c=this.c;c.save();c.translate(x,y);c.scale(r,r);
      if(type==='grass'){for(let i=0;i<3;i++){const xx=(i-1)*.25;c.beginPath();c.moveTo(xx,.34);c.quadraticCurveTo(xx-.18,-.2,xx-.32,-.68-i*.13);c.quadraticCurveTo(xx+.19,-.19,xx+.07,.34);c.fillStyle=i===1?'#72a36599':'#8eb379bb';c.fill();}}
      else if(type==='flower'){for(let i=0;i<5;i++){const a=i*TAU/5;ellipse(c,Math.cos(a)*.25,Math.sin(a)*.25,.21,.14,seed>.65?'#f0d7ba':'#e9edb5',a);}circle(c,0,0,.12,'#d4b66d');line(c,[[0,.4],[0,.06]],'#7aaf73',.05);}
      else if(type==='mushroom'){ellipse(c,0,.55,.85,.26,'#486f4325');poly(c,[[-.19,-.24],[.17,-.26],[.29,.47],[.06,.63],[-.23,.49]],'#eee6bc','#d1cc9e',.016);c.beginPath();c.moveTo(-1,-.16);c.bezierCurveTo(-.81,-1.32,.71,-1.21,.98,-.13);c.bezierCurveTo(.64,.17,-.75,.17,-1,-.16);c.fillStyle=seed>.6?'#d5a5a0':'#dcb78c';c.fill();ellipse(c,0,-.13,.95,.22,seed>.6?'#b5847c':'#b99b77');ellipse(c,-.19,-.8,.16,.07,'#f3e7c7',-.2);ellipse(c,.41,-.5,.18,.08,'#f3e7c7',.3);ellipse(c,-.56,-.39,.1,.06,'#f3e7c7');line(c,[[-.12,.2],[-.09,.47]],'#fff8d777',.04);}
      else if(type==='tree'){ellipse(c,.14,.34,.94,.42,'#3d6b462b');poly(c,[[-.13,-.46],[.13,-.52],[.19,.54],[0,.67],[-.16,.49]],'#b19a70');for(const [xx,yy,rr,col] of [[-.47,-.58,.64,'#7da77c'],[.44,-.6,.62,'#88b081'],[0,-1.04,.72,'#9abd87']]){circle(c,xx+.035,yy+.09,rr,'#668e703b');circle(c,xx,yy,rr,col);ellipse(c,xx-.11,yy-.19,rr*.59,rr*.28,'#c0d59656',-.2);}circle(c,-.38,-1.08,.05,'#e6deb380');circle(c,.46,-.63,.06,'#e6deb380');}
      else if(type==='house'||type==='village'){const n=type==='village'?5:1;for(let i=0;i<n;i++){c.save();if(n>1){c.translate((i%3-1)*1.2,(Math.floor(i/3)-.5)*1.1);c.scale(.55,.55);}ellipse(c,.1,.48,.84,.28,'#42674b20');poly(c,[[-.65,-.13],[.12,-.38],[.73,-.09],[.73,.48],[.03,.74],[-.65,.43]],'#d9d5b3','#a2ae94',.018);poly(c,[[.03,-.05],[.73,-.09],[.73,.48],[.03,.74]],'#bfc4a5');poly(c,[[-.84,-.14],[-.25,-.8],[.51,-.56],[.91,-.08],[.13,.2]],seed>.6?'#b89a83':'#88a5a2','#768e7c',.02);poly(c,[[.13,.2],[-.25,-.8],[.51,-.56],[.91,-.08]],seed>.6?'#c2ac92':'#a7bdad');poly(c,[[-.44,.12],[-.18,.04],[-.18,.57],[-.44,.48]],'#6e8c7c');poly(c,[[.3,.25],[.5,.18],[.5,.36],[.3,.43]],'#f5e5a7');c.restore();}}
      else if(type==='mountain'){ellipse(c,.12,.45,1.3,.5,'#49645b14');poly(c,[[-1.2,.39],[-.18,-1.26],[1.27,.53],[.08,.93]],'#a8b9b0');poly(c,[[-.18,-1.26],[.1,.64],[1.27,.53]],'#859f9c');poly(c,[[-.18,-1.26],[-.65,-.54],[-.26,-.69],[-.1,-.36],[.08,-.69],[.43,-.46]],'#e8edda');line(c,[[.1,.64],[.42,.25],[.7,.33]],'#b8c8b677',.025);}
      else if(type==='island'){ellipse(c,0,.06,1.3,.68,'#bddac032',-.3);c.beginPath();for(let i=0;i<13;i++){const a=i*TAU/12,rr=.78+.17*Math.sin(i*4+seed*10);const xx=Math.cos(a)*rr,yy=Math.sin(a)*rr*.64;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.closePath();c.fillStyle='#dfdeb0';c.fill();c.save();c.scale(.87,.87);c.fillStyle='#95b98a';c.fill();c.restore();for(let i=0;i<9;i++)circle(c,Math.sin(i*6.7+seed)*.5,Math.cos(i*1.7+seed)*.31,.085,'#6c987f');poly(c,[[-.23,.03],[.02,-.44],[.27,.11]],'#bac9ae');poly(c,[[.02,-.44],[.07,.04],[.27,.11]],'#93aaa0');}
      else if(type==='planet'||type==='home'){const g=c.createRadialGradient(-.4,-.5,.05,.1,.1,1.2);g.addColorStop(0,type==='home'?'#addfd5':'#e3c9bb');g.addColorStop(.5,type==='home'?'#78b6c5':'#b59bb9');g.addColorStop(1,type==='home'?'#375d85':'#625780');circle(c,0,0,1.04,'#8bd6d32b');circle(c,0,0,1,g);c.save();c.beginPath();c.arc(0,0,.995,0,TAU);c.clip();for(let i=0;i<5;i++){const xx=Math.sin(i*5+seed)*.7,yy=Math.cos(i*3+seed)*.7;ellipse(c,xx,yy,.3+seed*.1,.18,type==='home'?'#b5c997':'#d5bfb2',i*1.1);circle(c,xx-.1,yy+.1,.15,type==='home'?'#9db987':'#c9afa5');}ellipse(c,-.2,-.63,.75,.08,'#f5f8df66',-.2);ellipse(c,.2,.35,.9,.08,'#f5f8df33',-.2);c.restore();}
      else if(type==='star'){const g=c.createRadialGradient(0,0,.1,0,0,1.5);g.addColorStop(0,'#fff7b4');g.addColorStop(.45,'#fbc77bd9');g.addColorStop(1,'#fdc88700');circle(c,0,0,1.5,g);circle(c,0,0,.7,'#fff1b6');}
      c.restore();
    }
    draw(world,state,time,dt){
      this.time=time;const c=this.c;c.setTransform(this.dpr,0,0,this.dpr,0,0);
      if(!world){this.menu(time);return;}
      const p=world.player,target=this.targetScale(world),easing=1-Math.exp(-dt*2.2);this.cam.scale=Math.exp(Math.log(this.cam.scale)+(Math.log(target)-Math.log(this.cam.scale))*easing);const follow=1-Math.exp(-dt*8);this.cam.x+=(p.x-this.cam.x)*follow;this.cam.y+=(p.y-this.cam.y)*follow;
      this.terrain(world);c.save();const shake=this.reduced?0:world.shake;c.translate(this.w/2+(Math.random()-.5)*shake,this.h*.53+(Math.random()-.5)*shake);c.scale(this.cam.scale,this.cam.scale);c.translate(-this.cam.x,-this.cam.y);
      for(const w of world.warnings){circle(c,w.x,w.y,w.r,'#ec72532b','#cf5c4380',1.5/this.cam.scale);circle(c,w.x,w.y,w.r*(1-w.life/w.max),null,'#e35f44',2/this.cam.scale);}
      if(world.moveTarget){const t=world.moveTarget;circle(c,t.x,t.y,p.r*.35,null,'#fffbead9',2/this.cam.scale);circle(c,t.x,t.y,p.r*.13,'#fffbea9c');}
      const all=world.enemies.map(e=>({type:'enemy',y:e.y,object:e}));all.push({type:'hero',y:p.y,object:p});world.pets.forEach(e=>all.push({type:'pet',y:e.y,object:e}));all.sort((a,b)=>a.y-b.y);
      for(const row of all){const e=row.object,pos=this.screen(e.x,e.y),rr=(row.type==='enemy'?e.r:row.type==='pet'?p.r*.44:p.r),size=rr*this.cam.scale;if(pos.x<-size*2||pos.x>this.w+size*2||pos.y<-size*2||pos.y>this.h+size*2)continue;
        if(row.type==='hero'){const f=E.FORMS[E.formIndex(world.save.level)];ellipse(c,p.x,p.y+p.r*.3,p.r*1.21,p.r*.59,null,0,'#fff6c8ac',1.6/this.cam.scale);if(p.dash>0)ellipse(c,p.x,p.y,p.r*1.4,p.r*.8,'#f9ffd637');creature(c,p.x,p.y,p.r,f.body,f.color,time,p.face,true,Math.hypot(p.vx,p.vy)>.01,p.hit);}
        else if(row.type==='pet'){const f=E.PETS.find(q=>q.id===e.id);creature(c,e.x,e.y,rr,f.body,f.color,time+iSafe(row.y),1,true,true);}
        else{if(size<2){circle(c,e.x,e.y,e.r,e.color);continue;}if(e.id===world.targetId)ellipse(c,e.x,e.y+e.r*.3,e.r*1.25,e.r*.6,null,0,e.level>world.save.level*1.55?'#d85d43':'#fff4a4',2.5/this.cam.scale);c.globalAlpha=e.spawn>0?.5+(1-e.spawn/.7)*.5:1;creature(c,e.x,e.y,e.r,e.body,e.color,time,e.angle,false,true,e.hit);c.globalAlpha=1;}
      }
      for(const fx of world.effects){const t=1-fx.life/fx.max;c.globalAlpha=1-t;
        if(fx.type==='absorb'){const xx=fx.x+(p.x-fx.x)*t,yy=fx.y+(p.y-fx.y)*t;for(let i=0;i<5;i++){const a=i*TAU/5+t*3;circle(c,xx+Math.cos(a)*fx.r*(1-t),yy+Math.sin(a)*fx.r*(1-t),Math.min(fx.r,p.r)*.11,'#fff5b5');}}
        if(fx.type==='slash'){c.beginPath();c.arc(fx.x,fx.y,fx.r*(.6+t*.3),fx.angle-.85,fx.angle+.85);c.strokeStyle=fx.color;c.lineWidth=p.r*.12*(1-t);c.stroke();}
        if(fx.type==='nova'){circle(c,fx.x,fx.y,fx.r*t,null,fx.color,4/this.cam.scale);circle(c,fx.x,fx.y,fx.r*t*.9,fx.color+'19');}
        if(fx.type==='vortex'){for(let i=0;i<4;i++){c.beginPath();c.arc(fx.x,fx.y,fx.r*(1-t),i*TAU/4+t*7,i*TAU/4+t*7+1.1);c.strokeStyle=fx.color;c.lineWidth=(3+i)/this.cam.scale;c.stroke();}}
        if(fx.type==='ghost')ellipse(c,fx.x,fx.y,fx.r*.85,fx.r*.65,fx.color+'66');
        if(fx.type==='bolt'){line(c,[[fx.x+fx.r*.1,fx.y-fx.r],[fx.x-fx.r*.17,fx.y-fx.r*.4],[fx.x+fx.r*.1,fx.y-fx.r*.45],[fx.x,fx.y]],fx.color,4/this.cam.scale);circle(c,fx.x,fx.y,fx.r*.3*t,null,'#fff6c6',3/this.cam.scale);}
        if(fx.type==='link'){line(c,[[fx.x,fx.y],[fx.x+(fx.x2-fx.x)*.5+(Math.random()-.5)*p.r*.4,fx.y+(fx.y2-fx.y)*.5],[fx.x2,fx.y2]],fx.color,2/this.cam.scale);}c.globalAlpha=1;
      }
      for(const q of world.particles){c.globalAlpha=Math.max(0,q.life/q.max);circle(c,q.x,q.y,q.size,q.color);}c.globalAlpha=1;c.restore();
      this.labels(world);if(p.hit>0&&!this.reduced){c.fillStyle=`rgba(239,130,108,${p.hit*.19})`;c.fillRect(0,0,this.w,this.h);}
    }
    labels(world){const c=this.c,p=world.player;const crowded=world.enemies.length>45;const near=[...world.enemies].sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
      for(let i=0;i<near.length;i++){const e=near[i],pos=this.screen(e.x,e.y),r=e.r*this.cam.scale;if(r<7||r>350||pos.x<-90||pos.x>this.w+90||pos.y<-50||pos.y>this.h+50)continue;if(crowded&&i>30&&!e.boss)continue;
        const strong=e.level>world.save.level*1.55,equal=e.level>world.save.level,color=strong?'#bf6855':equal?'#947848':'#537b55';const text=(e.boss?'♛ ':'')+e.level.toLocaleString('ru-RU'),fs=e.boss?13:11;c.font=`800 ${fs}px Segoe UI`;c.textAlign='center';const width=c.measureText(text).width+17,x=pos.x,y=pos.y-r*1.5;
        c.fillStyle=strong?'#fae4d9ed':equal?'#fff0ceed':'#f6ffe7ed';c.beginPath();c.roundRect(x-width/2,y-12,width,19,7);c.fill();c.fillStyle=color;c.fillText(text,x,y+1);
        if(e.hp<e.maxHp){const bw=Math.max(25,Math.min(85,r*1.5));c.fillStyle='#42695125';c.fillRect(x-bw/2,y+11,bw,3);c.fillStyle=strong?'#da8b73':'#79b691';c.fillRect(x-bw/2,y+11,bw*e.hp/e.maxHp,3);}
        if(e.boss&&r>20){c.font='10px Segoe UI';c.fillStyle=world.realm>=4?'#f8f4e2':'#4b6755';c.fillText(e.name,x,y-20);}
      }
      const here=this.screen(p.x,p.y),r=p.r*this.cam.scale;c.textAlign='center';c.font='900 19px Segoe UI';const text='УР. '+world.save.level.toLocaleString('ru-RU');c.strokeStyle='#397362';c.lineWidth=4;c.strokeText(text,here.x,here.y-r*1.85);c.fillStyle='#fffce4';c.fillText(text,here.x,here.y-r*1.85);
      for(const q of world.texts){const pos=this.screen(q.x,q.y);c.globalAlpha=Math.min(1,q.life*2);c.font=`${q.big?800:700} ${q.big?14:12}px Segoe UI`;c.lineWidth=3;c.strokeStyle='#365a416b';c.strokeText(q.text,pos.x,pos.y);c.fillStyle=q.color;c.fillText(q.text,pos.x,pos.y);}c.globalAlpha=1;
      if(world.realm>=4){const home=this.screen(0,0),rr=3e8*this.cam.scale;if(home.x>-150&&home.x<this.w+150&&home.y>-100&&home.y<this.h+100&&rr<160){c.font='10px Segoe UI';c.fillStyle='#d3e5d3';c.fillText('ТВОЙ ПЕРВЫЙ МИР',home.x,home.y+rr+18);}}
      if(world.save.kills<3){const prey=world.nearest(p.x,p.y,p.r*18,e=>e.level<=world.save.level),pos=prey?this.screen(prey.x,prey.y):null;if(pos){const yy=pos.y-prey.r*this.cam.scale*1.6-28+Math.sin(this.time*5)*5;poly(c,[[pos.x-7,yy-8],[pos.x+7,yy-8],[pos.x,yy]],'#fcffdf','#6e9670',1.3);}}
      if(world.player.hp/E.stats(world.save).hp<.25){const g=c.createRadialGradient(this.w/2,this.h/2,this.h*.2,this.w/2,this.h/2,this.h*.8);g.addColorStop(0,'#eb735500');g.addColorStop(1,'#d7654740');c.fillStyle=g;c.fillRect(0,0,this.w,this.h);}
    }
    menu(time){
      const c=this.c,W=this.w,H=this.h;c.fillStyle='#c0dcaa';c.fillRect(0,0,W,H);const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ebf0d6');g.addColorStop(1,'#8ebfa1');c.fillStyle=g;c.fillRect(0,0,W,H);
      const x=W*(W<650?.79:.73),y=H*.52,r=Math.min(W*.17,H*.27);c.save();c.translate(x,y);ellipse(c,10,r*.62,r*1.55,r*.55,'#517e5c24');ellipse(c,0,r*.32,r*1.7,r*.92,'#dce4b6');ellipse(c,0,r*.26,r*1.62,r*.84,'#9cbf8a');ellipse(c,-r*.15,r*.22,r*1.37,r*.63,'#aecb92');c.restore();
      this.decor('mushroom',x+r*1.0,y-r*.52,r*.53,.8,0);this.decor('mushroom',x-r*.97,y+r*.02,r*.34,.3,0);this.decor('tree',x+r*1.03,y+r*.1,r*.33,.4,0);this.decor('flower',x-r*.63,y+r*.78,r*.21,.3,0);this.decor('grass',x+r*.98,y+r*.64,r*.26,.3,0);
      creature(c,x,y,r*.68,'horn','#7bd8ce',time,1,true,false);creature(c,x+r*.77,y+r*.56,r*.19,'wisp','#ffeba0',time,1,true);creature(c,x-r*.92,y+r*.47,r*.14,'mite','#d5b295',time,-1,false,true);
      for(let i=0;i<35;i++){const xx=hash(i,12)*W,yy=(hash(i,13)*H-time*(i%3+2)+H)%H;circle(c,xx,yy,hash(i,14)*2+.6,'#fff7c873');}
      c.textAlign='center';c.font='800 13px Segoe UI';c.fillStyle='#ecf8d4';c.strokeStyle='#537a5b';c.lineWidth=3;c.strokeText('СЕЙЧАС — МАЛЕНЬКИЙ.',x,y-r*1.29);c.fillText('СЕЙЧАС — МАЛЕНЬКИЙ.',x,y-r*1.29);
    }
  }
  function iSafe(n){return Math.sin(n)*2;}
  root.EvolutionArt={Renderer,portrait,creature,shade};
})(window);
