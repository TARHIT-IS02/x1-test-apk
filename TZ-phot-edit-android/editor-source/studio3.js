/* ================= EFFECTS ================= */
const FX_PRESETS=[
 {id:'none',n:'Original',f:''},
 {id:'vivid',n:'Vivid',f:'saturate(1.55) contrast(1.1)'},
 {id:'warm',n:'Warm',f:'sepia(.22) saturate(1.25) brightness(1.04)',ov:['#ff9a3c','soft-light',.4]},
 {id:'cool',n:'Cool',f:'saturate(1.1) hue-rotate(-8deg)',ov:['#3c7bff','soft-light',.4]},
 {id:'vintage',n:'Vintage',f:'sepia(.5) contrast(.9) brightness(1.08) saturate(.9)',vig:.35,fade:.12},
 {id:'noir',n:'Noir',f:'grayscale(1) contrast(1.35) brightness(.95)',vig:.3},
 {id:'bw',n:'B&W',f:'grayscale(1)'},
 {id:'fade',n:'Fade',f:'contrast(.85) brightness(1.1) saturate(.8)',fade:.1},
 {id:'drama',n:'Dramatic',f:'contrast(1.4) saturate(1.2) brightness(.92)',vig:.45},
 {id:'sepia',n:'Sepia',f:'sepia(1)'},
 {id:'pop',n:'Pop',f:'contrast(1.2) saturate(1.8)'},
 {id:'matte',n:'Matte',f:'contrast(.9) saturate(.85) brightness(1.05)',fade:.2},
 {id:'sunset',n:'Sunset',f:'saturate(1.3) contrast(1.05)',ov:['#ff5e3a','overlay',.35]},
 {id:'teal',n:'Teal & Orange',f:'contrast(1.1) saturate(1.2)',ov:['#00a3b4','soft-light',.45],ov2:['#ff8a3d','overlay',.2]},
 {id:'mint',n:'Mint',f:'saturate(1.1) brightness(1.05)',ov:['#7dffd0','soft-light',.35]},
 {id:'invert',n:'Invert',f:'invert(1)'}
];
let _noiseTile=null;
function noiseTile(){
  if(_noiseTile) return _noiseTile; const c=mkCanvas(256,256), x=c.getContext('2d'), d=x.createImageData(256,256);
  let s=12345; const rnd=()=>{ s^=s<<13; s^=s>>>17; s^=s<<5; return ((s>>>0)%1000)/1000; };
  for(let i=0;i<d.data.length;i+=4){ const v=Math.floor(rnd()*255); d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=255; }
  x.putImageData(d,0,0); return _noiseTile=c;
}
function fxState(){ return {preset:'none',amount:100,bright:0,contrast:0,sat:0,warmth:0,vignette:0,grain:0,blur:0,pixel:0,sharpen:0}; }
function fxIsNeutral(st){ return st.preset==='none'&&!st.bright&&!st.contrast&&!st.sat&&!st.warmth&&!st.vignette&&!st.grain&&!st.blur&&!st.pixel&&!st.sharpen; }
function applyFx(src,st,sc){
  sc=sc||1; const w=src.width,h=src.height, p=FX_PRESETS.find(x=>x.id===st.preset)||FX_PRESETS[0];
  const f=mkCanvas(w,h), fc=f.getContext('2d',{willReadFrequently:true});
  const adj='brightness('+(1+st.bright/100)+') contrast('+(1+st.contrast/100)+') saturate('+(1+st.sat/100)+')'+(st.blur>0?' blur('+(st.blur*sc)+'px)':'');
  fc.filter=(p.f?p.f+' ':'')+adj; fc.drawImage(src,0,0); fc.filter='none';
  const blend=(col,mode,a)=>{ fc.save(); fc.globalCompositeOperation=mode; fc.globalAlpha=a; fc.fillStyle=col; fc.fillRect(0,0,w,h); fc.restore(); fc.save(); fc.globalCompositeOperation='destination-in'; fc.drawImage(src,0,0); fc.restore(); };
  if(p.ov) blend(p.ov[0],p.ov[1],p.ov[2]); if(p.ov2) blend(p.ov2[0],p.ov2[1],p.ov2[2]);
  if(st.warmth) blend(st.warmth>0?'#ff9a3c':'#3c7bff','soft-light',Math.min(1,Math.abs(st.warmth)/100*.9));
  if(p.fade) blend('#d8d8dc','screen',p.fade);
  const vg=Math.max(p.vig||0,0)+st.vignette/100*.9;
  if(vg>0){ fc.save(); fc.globalCompositeOperation='source-atop'; const r=Math.hypot(w,h)/2, g=fc.createRadialGradient(w/2,h/2,r*.35,w/2,h/2,r); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,'+Math.min(.95,vg)+')'); fc.fillStyle=g; fc.fillRect(0,0,w,h); fc.restore(); }
  if(st.grain>0){ fc.save(); fc.globalCompositeOperation='overlay'; fc.globalAlpha=st.grain/100*.8; fc.fillStyle=fc.createPattern(noiseTile(),'repeat'); fc.fillRect(0,0,w,h); fc.restore(); fc.save(); fc.globalCompositeOperation='destination-in'; fc.drawImage(src,0,0); fc.restore(); }
  let res=f;
  if(st.pixel>0){ const sz=Math.max(2,Math.round(st.pixel*sc)), sw=Math.max(1,Math.ceil(w/sz)), sh=Math.max(1,Math.ceil(h/sz)); const sm=mkCanvas(sw,sh); const sx=sm.getContext('2d'); sx.imageSmoothingEnabled=true; sx.drawImage(f,0,0,sw,sh); const pc=mkCanvas(w,h), px2=pc.getContext('2d',{willReadFrequently:true}); px2.imageSmoothingEnabled=false; px2.drawImage(sm,0,0,sw,sh,0,0,sw*sz,sh*sz); res=pc; }
  if(st.sharpen>0){ const rc=res.getContext('2d',{willReadFrequently:true}), id=rc.getImageData(0,0,w,h), d=id.data, o=new Uint8ClampedArray(d), a=st.sharpen/100*1.2;
    for(let y=1;y<h-1;y++){ for(let x=1;x<w-1;x++){ const i=(y*w+x)*4; for(let k=0;k<3;k++){ const v=d[i+k]*(1+4*a)-a*(d[i-4+k]+d[i+4+k]+d[i-w*4+k]+d[i+w*4+k]); o[i+k]=v<0?0:v>255?255:v; } o[i+3]=d[i+3]; } }
    id.data.set(o); rc.putImageData(id,0,0); }
  const out=mkCanvas(w,h), oc=out.getContext('2d',{willReadFrequently:true});
  if(st.amount>=100){ oc.drawImage(res,0,0); } else { oc.drawImage(src,0,0); oc.globalAlpha=st.amount/100; oc.drawImage(res,0,0); }
  return out;
}
function fxSession(){
  const l=activeLayer(); if(!canEdit(l)) return null;
  const full=l.canvas, st=fxState(), ps=Math.min(1,720/Math.max(full.width,full.height));
  const prevSrc=mkCanvas(full.width*ps,full.height*ps); prevSrc.getContext('2d').drawImage(full,0,0,prevSrc.width,prevSrc.height);
  const thSrc=mkCanvas(96*full.width/Math.max(full.width,full.height),96*full.height/Math.max(full.width,full.height)); thSrc.getContext('2d').drawImage(full,0,0,thSrc.width,thSrc.height);
  const draw=stuRaf(()=>{ const o=applyFx(prevSrc,st,ps); stuCv.width=o.width; stuCv.height=o.height; stuCv.getContext('2d').drawImage(o,0,0); });
  const ch=()=>draw();
  const tabs=[
   ['filters','Filters',b=>{
     const g=stuH('div','stu-grid g4');
     FX_PRESETS.forEach(p=>{ const it=stuH('button','stu-it'+(st.preset===p.id?' on':''),'<canvas width="'+thSrc.width+'" height="'+thSrc.height+'"></canvas><span>'+p.n+'</span>'); const cv=it.querySelector('canvas');
       const t=applyFx(thSrc,Object.assign(fxState(),{preset:p.id}),thSrc.width/full.width); cv.getContext('2d').drawImage(t,0,0); cv.style.aspectRatio=thSrc.width+'/'+thSrc.height; cv.style.objectFit='cover';
       it.onclick=()=>{ st.preset=p.id; g.querySelectorAll('.stu-it').forEach(x=>x.classList.toggle('on',x===it)); ch(); }; g.appendChild(it); });
     b.appendChild(g); stuRange(b,'Intensity',st,'amount',0,100,1,v=>v+'%',ch);
   }],
   ['adjust','Adjust',b=>{
     stuRange(b,'Brightness',st,'bright',-60,60,1,null,ch); stuRange(b,'Contrast',st,'contrast',-60,60,1,null,ch); stuRange(b,'Saturation',st,'sat',-100,100,1,null,ch);
     stuRange(b,'Warmth',st,'warmth',-100,100,1,null,ch); stuRange(b,'Sharpen',st,'sharpen',0,100,1,null,ch);
   }],
   ['fx','Effects',b=>{
     stuRange(b,'Vignette',st,'vignette',0,100,1,null,ch); stuRange(b,'Film grain',st,'grain',0,100,1,null,ch);
     stuRange(b,'Blur',st,'blur',0,40,1,v=>v+' px',ch); stuRange(b,'Pixelate',st,'pixel',0,60,1,v=>v?v+' px':'Off',ch);
     b.appendChild(stuH('div','stu-hint','Effects apply to the selected layer. Merge layers first to style the whole picture.'));
   }]
  ];
  return {title:'Effects',preview:true,tabs,okLabel:'Apply',init:()=>draw(),
   ok:()=>{
     if(fxIsNeutral(st)){ stuClose(); return; }
     stuOk.disabled=true; stuOk.textContent='Applying…';
     setTimeout(()=>{
       try{ const l2=activeLayer(); if(!canEdit(l2)){ stuOk.disabled=false; return; }
         pushHistory(); rasterize(l2);
         const o=applyFx(l2.canvas,st,1); const c=l2.ctx; c.save(); c.setTransform(1,0,0,1,0,0); c.globalAlpha=1; c.globalCompositeOperation='source-over'; c.clearRect(0,0,l2.canvas.width,l2.canvas.height); c.drawImage(o,0,0); c.restore();
         l2.baseImageData=null; l2.bboxDirty=true; scheduleThumbs(); renderLayers(); stuClose(); toast('Effects applied');
       }catch(e){ console.error(e); toast('Could not apply effects'); stuOk.disabled=false; stuOk.textContent='Apply'; }
     },30);
   }};
}
function stuOpenEffects(){ const s=fxSession(); if(!s) return; closeTool(); stuOpen(s); }

/* ================= BACKDROP (solid / gradient / texture) ================= */
const BG_SOLID=['#ffffff','#f5f5f7','#e5e5ea','#8e8e93','#1c1c1e','#000000','#ff3b30','#ff9500','#ffcc00','#34c759','#00c7be','#2f6bff','#5856d6','#af52de','#ff2d92','#ffd6a5','#fdffb6','#caffbf','#9bf6ff','#bdb2ff','#ffc6ff','#a2845e','#264653','#e76f51'];
const BG_GRAD=[['#ff9a9e','#fad0c4'],['#a18cd1','#fbc2eb'],['#84fab0','#8fd3f4'],['#fa709a','#fee140'],['#30cfd0','#330867'],['#667eea','#764ba2'],['#f093fb','#f5576c'],['#4facfe','#00f2fe'],['#43e97b','#38f9d7'],['#fddb92','#d1fdff'],['#0f2027','#2c5364'],['#232526','#414345'],['#ff512f','#dd2476'],['#1a2980','#26d0ce'],['#ffecd2','#fcb69f'],['#ffffff','#e6e9f0']];
const BG_TEX=[['paper','Paper'],['grain','Grain'],['linen','Linen'],['stripes','Stripes'],['diag','Diagonal'],['dots','Dots'],['grid','Grid'],['check','Checker'],['waves','Waves']];
function bgState(){ return {tab:'solid',color:'#ffffff',g1:'#667eea',g2:'#764ba2',gType:'linear',gAngle:135,tex:'paper',t1:'#f3ead8',t2:'#c9b98f',tScale:1,tAmt:60}; }
function drawBackdrop(c,W,H,st){
  c.save(); c.setTransform(c.getTransform()); 
  if(st.tab==='solid'){ c.fillStyle=st.color; c.fillRect(0,0,W,H); }
  else if(st.tab==='gradient'){
    let g; if(st.gType==='radial'){ g=c.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.hypot(W,H)/2); }
    else { const a=st.gAngle*Math.PI/180, dx=Math.cos(a), dy=Math.sin(a), L=(Math.abs(dx)*W+Math.abs(dy)*H)/2; g=c.createLinearGradient(W/2-dx*L,H/2-dy*L,W/2+dx*L,H/2+dy*L); }
    g.addColorStop(0,st.g1); g.addColorStop(1,st.g2); c.fillStyle=g; c.fillRect(0,0,W,H);
  } else {
    const u=st.tScale, a=st.tAmt/100; c.fillStyle=st.t1; c.fillRect(0,0,W,H); c.strokeStyle=st.t2; c.fillStyle=st.t2;
    const T=st.tex;
    if(T==='paper'||T==='grain'){
      c.save(); c.globalAlpha=(T==='paper'?.35:.7)*a; c.globalCompositeOperation='overlay'; const pat=c.createPattern(noiseTile(),'repeat'); c.fillStyle=pat; c.fillRect(0,0,W,H); c.restore();
      if(T==='paper'){ let s=7; const rnd=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; c.save(); c.globalAlpha=.06*a; for(let i=0;i<14;i++){ const x=rnd()*W,y=rnd()*H,r=(.2+rnd()*.5)*Math.max(W,H); const g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,st.t2); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(0,0,W,H); } c.restore(); }
    } else if(T==='linen'){ c.save(); c.globalAlpha=.22*a; c.lineWidth=Math.max(1,u); const st2=Math.max(3,4*u); for(let x=0;x<W;x+=st2){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,H); c.stroke(); } for(let y=0;y<H;y+=st2){ c.beginPath(); c.moveTo(0,y); c.lineTo(W,y); c.stroke(); } c.restore(); }
    else if(T==='stripes'||T==='diag'){ const bw=Math.max(4,30*u); c.save(); c.globalAlpha=a; if(T==='diag'){ c.translate(W/2,H/2); c.rotate(-Math.PI/4); c.translate(-W,-W); const L=Math.hypot(W,H)*2; for(let x=0;x<L*1.5;x+=bw*2) c.fillRect(x,0,bw,L*2); } else for(let x=0;x<W;x+=bw*2) c.fillRect(x,0,bw,H); c.restore(); }
    else if(T==='dots'){ const sp=Math.max(10,40*u), r=sp*.2; c.save(); c.globalAlpha=a; for(let y=sp/2,j=0;y<H+sp;y+=sp,j++) for(let x=(j%2?sp:sp/2);x<W+sp;x+=sp){ c.beginPath(); c.arc(x,y,r,0,7); c.fill(); } c.restore(); }
    else if(T==='grid'){ const sp=Math.max(12,60*u); c.save(); c.globalAlpha=a; c.lineWidth=Math.max(1,2*u); for(let x=0;x<W;x+=sp){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,H); c.stroke(); } for(let y=0;y<H;y+=sp){ c.beginPath(); c.moveTo(0,y); c.lineTo(W,y); c.stroke(); } c.restore(); }
    else if(T==='check'){ const sp=Math.max(10,50*u); c.save(); c.globalAlpha=a; for(let y=0,j=0;y<H;y+=sp,j++) for(let x=(j%2?sp:0);x<W;x+=sp*2) c.fillRect(x,y,sp,sp); c.restore(); }
    else if(T==='waves'){ const sp=Math.max(14,46*u), amp=sp*.35; c.save(); c.globalAlpha=a; c.lineWidth=Math.max(1.5,3*u); for(let y=-sp;y<H+sp;y+=sp){ c.beginPath(); for(let x=0;x<=W+8;x+=8){ const yy=y+Math.sin(x/(sp*1.4))*amp; x?c.lineTo(x,yy):c.moveTo(x,yy); } c.stroke(); } c.restore(); }
  }
  c.restore();
}
function bgSession(){
  if(!S.layers.length){ toast('Create a project first'); return null; }
  const st=bgState(), W=S.artboard.w, H=S.artboard.h, k=Math.min(1,720/Math.max(W,H));
  const draw=stuRaf(()=>{ stuCv.width=Math.round(W*k); stuCv.height=Math.round(H*k); const c=stuCv.getContext('2d'); c.scale(k,k); drawBackdrop(c,W,H,st); });
  const ch=()=>draw();
  const tabs=[
   ['solid','Solid',b=>{ st.tab='solid'; ch(); stuColor(b,'Color',st,'color',ch); stuSwatches(b,BG_SOLID,st,'color',ch,()=>{ b.querySelector('input[type=color]').value=st.color; }); }],
   ['gradient','Gradient',b=>{ st.tab='gradient'; ch();
     const g=stuH('div','stu-grid g4'); BG_GRAD.forEach(([a,c2])=>{ const it=stuH('button','stu-it'); it.style.cssText='height:54px;background:linear-gradient(135deg,'+a+','+c2+');padding:0'; it.onclick=()=>{ st.g1=a; st.g2=c2; i1.value=a; i2.value=c2; ch(); }; g.appendChild(it); }); b.appendChild(g);
     const r1=stuColor(b,'Color 1',st,'g1',ch), r2=stuColor(b,'Color 2',st,'g2',ch); const i1=r1.querySelector('input'), i2=r2.querySelector('input');
     stuSeg(b,[['linear','Linear'],['radial','Radial']],()=>st.gType,v=>{ st.gType=v; ch(); }); stuRange(b,'Angle',st,'gAngle',0,360,1,v=>v+'°',ch); }],
   ['texture','Texture',b=>{ st.tab='texture'; ch();
     const g=stuH('div','stu-grid g3'); const draws=[];
     BG_TEX.forEach(([id,n])=>{ const it=stuH('button','stu-it'+(st.tex===id?' on':''),'<canvas width="110" height="110"></canvas><span>'+n+'</span>'); const cv=it.querySelector('canvas');
       const pv=()=>{ const c=cv.getContext('2d'); c.save(); c.scale(110/400,110/400); drawBackdrop(c,400,400,Object.assign({},st,{tab:'texture',tex:id})); c.restore(); }; draws.push(pv); pv();
       it.onclick=()=>{ st.tex=id; g.querySelectorAll('.stu-it').forEach(x=>x.classList.toggle('on',x===it)); ch(); }; g.appendChild(it); }); b.appendChild(g);
     const re=()=>{ ch(); draws.forEach(f=>f()); };
     stuColor(b,'Base color',st,'t1',re); stuColor(b,'Pattern color',st,'t2',re); stuRange(b,'Scale',st,'tScale',0.3,4,0.05,v=>v.toFixed(2)+'×',re); stuRange(b,'Strength',st,'tAmt',5,100,1,v=>v+'%',re); }]
  ];
  return {title:'Backdrop',preview:true,tabs,okLabel:'Apply',init:()=>draw(),
   ok:()=>{
     let l=S.layers.find(x=>x.name==='Background')||S.layers[0];
     if(l.locked){ toast('Background layer is locked'); return; }
     pushHistory();
     const cv=mkCanvas(W,H), c=cv.getContext('2d',{willReadFrequently:true}); drawBackdrop(c,W,H,st);
     if(l.objs.length){ l.baseC=cv; renderObjs(l); }
     else { l.baseC=null; l.ctx.save(); l.ctx.setTransform(1,0,0,1,0,0); l.ctx.clearRect(0,0,W,H); l.ctx.drawImage(cv,0,0); l.ctx.restore(); l.baseImageData=null; l.bboxDirty=true; scheduleThumbs(); }
     renderLayers(); stuClose(); toast('Backdrop applied to "'+l.name+'"');
   }};
}
function stuOpenBackdrop(){ const s=bgSession(); if(!s) return; closeTool(); stuOpen(s); }
