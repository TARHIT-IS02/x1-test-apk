/* ===================== TZ STUDIO : text, stickers, effects, backdrop, projects ===================== */
const stuEl=$('#stuModal'), stuBody=$('#stuBody'), stuTabs=$('#stuTabs'), stuCv=$('#stuCv'), stuTitle=$('#stuTitle'),
      stuOk=$('#stuOk'), stuCancel=$('#stuCancel'), stuPrev=$('#stuPrev'), stuFoot=$('#stuFoot');
let stuCtx=null;
function stuH(tag,cls,html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function stuClose(){ stuEl.classList.remove('show'); const c=stuCtx; stuCtx=null; if(c&&c.dispose) c.dispose(); const a=document.activeElement; if(a&&a.blur) a.blur(); }
function stuOpen(cfg){
  if(stuCtx) stuClose();
  stuCtx=cfg; stuTitle.textContent=cfg.title;
  stuPrev.classList.toggle('nopv',!cfg.preview);
  stuFoot.style.display=cfg.noFoot?'none':'';
  stuOk.textContent=cfg.okLabel||'Apply'; stuOk.disabled=false;
  stuTabs.innerHTML=''; stuBody.innerHTML='';
  if(cfg.tabs){
    cfg.tabs.forEach((t,i)=>{ const b=stuH('button',i===0?'active':'',t[1]); b.onclick=()=>stuTab(i); stuTabs.appendChild(b); });
    stuTabs.style.display='';
    stuTab(0);
  } else { stuTabs.style.display='none'; cfg.build&&cfg.build(stuBody); }
  stuEl.classList.add('show');
  if(cfg.init) cfg.init();
}
function stuTab(i){
  const c=stuCtx; if(!c) return;
  [...stuTabs.children].forEach((b,j)=>b.classList.toggle('active',j===i));
  c.tab=i; stuBody.innerHTML=''; stuBody.scrollTop=0;
  c.tabs[i][2](stuBody);
}
stuOk.onclick=()=>{ if(stuCtx&&stuCtx.ok) stuCtx.ok(); };
stuCancel.onclick=stuClose; $('#stuClose').onclick=stuClose;
stuEl.addEventListener('pointerdown',e=>{ if(e.target===stuEl && stuCtx && !stuCtx.sticky) stuClose(); });
['pointerdown','pointermove','pointerup','keydown','keyup','wheel'].forEach(ev=>stuEl.addEventListener(ev,e=>e.stopPropagation()));

/* ---- tiny form kit ---- */
function stuRange(parent,label,obj,key,min,max,step,fmt,onch){
  const row=stuH('div','stu-row','<div class="stu-lb"><span>'+label+'</span><b></b></div><input type="range">');
  const inp=row.querySelector('input'), val=row.querySelector('b');
  inp.min=min; inp.max=max; inp.step=step||1; inp.value=obj[key];
  const show=()=>{ val.textContent=fmt?fmt(obj[key]):obj[key]; };
  show();
  inp.oninput=()=>{ obj[key]=parseFloat(inp.value); show(); onch&&onch(); };
  parent.appendChild(row); return row;
}
function stuColor(parent,label,obj,key,onch){
  const row=stuH('div','stu-inline','<div class="stu-lb"><span>'+label+'</span></div><input type="color" class="stu-color">');
  const inp=row.querySelector('input'); inp.value=obj[key];
  inp.oninput=()=>{ obj[key]=inp.value; onch&&onch(); };
  parent.appendChild(row); return row;
}
function stuSwatches(parent,list,obj,key,onch,after){
  const w=stuH('div','stu-sw');
  list.forEach(c=>{ const b=stuH('button',obj[key]===c?'on':''); b.style.background=c; b.setAttribute('aria-label',c);
    b.onclick=()=>{ obj[key]=c; w.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); after&&after(c); onch&&onch(); }; w.appendChild(b); });
  parent.appendChild(w); return w;
}
function stuSeg(parent,items,get,set){
  const s=stuH('div','stu-seg');
  items.forEach(([v,l])=>{ const b=stuH('button',get()===v?'on':'',l); b.onclick=()=>{ set(v); [...s.children].forEach(x=>x.classList.toggle('on',x===b)); }; s.appendChild(b); });
  parent.appendChild(s); return s;
}
function stuToggleBtns(parent,items,obj,onch){
  const s=stuH('div','stu-seg');
  items.forEach(([k,l])=>{ const b=stuH('button',obj[k]?'on':'',l); b.onclick=()=>{ obj[k]=!obj[k]; b.classList.toggle('on',!!obj[k]); onch&&onch(); }; s.appendChild(b); });
  parent.appendChild(s); return s;
}
function stuCard(parent,title,obj,key,onch,fill){
  const card=stuH('div','stu-card'+(obj[key]?'':' off'));
  const head=stuH('div','stu-head','<span>'+title+'</span><label class="switch sm"><input type="checkbox"><span class="slider-tog"></span></label>');
  const cb=head.querySelector('input'); cb.checked=!!obj[key];
  const sub=stuH('div','stu-sub');
  cb.onchange=()=>{ obj[key]=cb.checked; card.classList.toggle('off',!cb.checked); onch&&onch(); };
  card.appendChild(head); card.appendChild(sub); fill(sub); parent.appendChild(card); return card;
}
function stuRaf(fn){ let r=0; return ()=>{ if(r) return; r=requestAnimationFrame(()=>{ r=0; fn(); }); }; }
const STU_SWATCH=['#ffffff','#000000','#ff3b30','#ff9500','#ffcc00','#34c759','#00c7be','#2f6bff','#af52de','#ff2d92','#8e8e93','#5ac8fa','#a2845e','#ffd6a5','#bde0fe','#ffafcc'];

/* ================= FONTS ================= */
const STU_FONTS=[
 {name:'Sans',css:'sans-serif'},{name:'Serif',css:'serif'},{name:'Mono',css:'monospace'},
 {name:'Condensed',css:'sans-serif-condensed,"Arial Narrow","Roboto Condensed",sans-serif'},
 {name:'Light',css:'sans-serif-light,"Helvetica Neue",sans-serif'},{name:'Medium',css:'sans-serif-medium,sans-serif'},
 {name:'Black',css:'sans-serif-black,"Arial Black",sans-serif'},{name:'Impact',css:'Impact,"Arial Black",sans-serif'},
 {name:'Georgia',css:'Georgia,serif'},{name:'Times',css:'"Times New Roman",Times,serif'},
 {name:'Courier',css:'"Courier New",Courier,monospace'},{name:'Cursive',css:'cursive'},
 {name:'Casual',css:'casual,"Comic Sans MS",cursive'},{name:'Script',css:'"Segoe Script","Snell Roundhand","Brush Script MT",cursive'},
 {name:'Handwriting',css:'"Segoe Print","Bradley Hand",Noteworthy,cursive'},{name:'Small Caps',css:'sans-serif-smallcaps,sans-serif'},
 {name:'Fantasy',css:'fantasy'}
];
const STU_BUILTIN=STU_FONTS.length;
function fontCss(n){ const f=STU_FONTS.find(x=>x.name===n); return f?f.css:'"'+n+'",sans-serif'; }
function registerFont(name,buf){
  return new FontFace(name,buf).load().then(ff=>{ document.fonts.add(ff); if(!STU_FONTS.find(f=>f.name===name)) STU_FONTS.push({name,css:'"'+name+'",sans-serif',custom:true}); return ff; });
}

/* ================= TEXT RENDERER ================= */
const TEXT_DEFAULT={ text:'Your text', font:'Sans', size:140, bold:true, italic:false, underline:false, strike:false, upper:false,
  align:'center', ls:0, lh:1.15, color:'#ffffff', grad:false, color2:'#ff3b30', gradAngle:90, opacity:100,
  stroke:false, strokeColor:'#000000', strokeW:8, shadow:false, shColor:'#000000', shBlur:14, shX:6, shY:8, shOp:60,
  glow:false, glowColor:'#2f6bff', glowBlur:26, bg:false, bgColor:'#000000', bgOp:100, bgPad:32, bgRad:24, curve:0 };
function rrPath(c,x,y,w,h,r){ r=Math.max(0,Math.min(r,w/2,h/2)); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function hexA(hex,a){ const h=hex.replace('#',''); const n=parseInt(h.length===3?h.replace(/./g,'$&$&'):h,16); return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')'; }
function textBuild(T,k){
  const size=Math.max(1,T.size*k), lh=size*T.lh, ls=T.ls*k;
  const raw=T.upper?T.text.toUpperCase():T.text, lines=(raw.length?raw:' ').split('\n');
  const font=(T.italic?'italic ':'')+(T.bold?'700':'400')+' '+size+'px '+fontCss(T.font);
  const m=document.createElement('canvas').getContext('2d'); m.font=font;
  const adv=s=>{ if(!ls) return m.measureText(s).width; let w=0; const a=[...s]; a.forEach(ch=>{ w+=m.measureText(ch).width+ls; }); return Math.max(0,w-ls); };
  const widths=lines.map(adv), maxW=Math.max(1,...widths);
  const eff=T.stroke?T.strokeW*k:0, shp=T.shadow?T.shBlur*k+Math.max(Math.abs(T.shX),Math.abs(T.shY))*k:0, glp=T.glow?T.glowBlur*k*1.6:0;
  const pad=Math.ceil(size*.3+eff+Math.max(shp,glp)+(T.bg?T.bgPad*k:0));
  const curved=Math.abs(T.curve)>=2;
  const items=[]; let W,H,bx,by,bw,bh;
  if(!curved){
    W=Math.ceil(maxW+pad*2); H=Math.ceil(lines.length*lh+pad*2); bx=pad; by=pad; bw=maxW; bh=lines.length*lh;
    lines.forEach((ln,i)=>{
      const y=pad+i*lh+lh/2, w=widths[i];
      let x0=T.align==='left'?pad:T.align==='right'?pad+maxW-w:pad+(maxW-w)/2;
      if(!ls) items.push({t:ln,x:T.align==='left'?pad:T.align==='right'?pad+maxW:pad+maxW/2,y,rot:0,al:T.align,x0,w});
      else { let cx=x0; [...ln].forEach(ch=>{ items.push({t:ch,x:cx,y,rot:0,al:'left'}); cx+=m.measureText(ch).width+ls; }); items.push({deco:true,x0,w,y}); }
      if(!ls) items.push({deco:true,x0,w,y});
    });
  } else {
    const th=Math.abs(T.curve)*Math.PI/180, R=maxW/th, up=T.curve>0;
    let mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
    lines.forEach((ln,i)=>{
      const r=up?Math.max(lh*.5,R-i*lh):R+i*lh; let cum=-widths[i]/2;
      [...ln].forEach(ch=>{
        const a=m.measureText(ch).width; const s=cum+a/2, phi=s/r; cum+=a+ls;
        const x=r*Math.sin(phi), y=up?-r*Math.cos(phi):r*Math.cos(phi), rot=up?phi:-phi;
        items.push({t:ch,x,y,rot,al:'center'});
        mnx=Math.min(mnx,x-size); mxx=Math.max(mxx,x+size); mny=Math.min(mny,y-size); mxy=Math.max(mxy,y+size);
      });
    });
    const ox=-mnx+pad, oy=-mny+pad; items.forEach(it=>{ if(it.x!=null){ it.x+=ox; it.y+=oy; } });
    W=Math.ceil(mxx-mnx+pad*2); H=Math.ceil(mxy-mny+pad*2); bx=pad; by=pad; bw=W-pad*2; bh=H-pad*2;
  }
  return {size,lh,ls,font,items,W,H,bx,by,bw,bh,pad,curved,eff,k};
}
function textRender(T,kReq){
  let k=kReq||1, B=textBuild(T,k);
  const cap=4096; if(Math.max(B.W,B.H)>cap){ k*=cap/Math.max(B.W,B.H); B=textBuild(T,k); }
  const cv=mkCanvas(B.W,B.H), c=cv.getContext('2d',{willReadFrequently:true});
  const setup=()=>{ c.font=B.font; c.textBaseline='middle'; c.lineJoin='round'; c.lineCap='round'; c.miterLimit=2; };
  const glyphs=(mode)=>{ B.items.forEach(it=>{ if(it.deco||it.t==null) return; c.save(); c.translate(it.x,it.y); if(it.rot) c.rotate(it.rot); c.textAlign=it.al; if(mode==='s') c.strokeText(it.t,0,0); else c.fillText(it.t,0,0); c.restore(); }); };
  setup();
  if(T.bg){ c.fillStyle=hexA(T.bgColor,T.bgOp/100); rrPath(c,B.bx-T.bgPad*k,B.by-T.bgPad*k,B.bw+T.bgPad*2*k,B.bh+T.bgPad*2*k,T.bgRad*k); c.fill(); }
  // fill source (solid or gradient)
  let fillSolid=T.color;
  const fillPass=()=>{
    if(!T.grad){ c.fillStyle=T.color; glyphs('f'); return; }
    const tmp=mkCanvas(B.W,B.H), t=tmp.getContext('2d'); t.font=B.font; t.textBaseline='middle'; t.lineJoin='round';
    const save=c; // draw glyphs onto tmp
    const g2=(mode)=>B.items.forEach(it=>{ if(it.deco||it.t==null) return; t.save(); t.translate(it.x,it.y); if(it.rot) t.rotate(it.rot); t.textAlign=it.al; t.fillStyle='#000'; t.fillText(it.t,0,0); t.restore(); });
    g2();
    const a=T.gradAngle*Math.PI/180, dx=Math.cos(a), dy=Math.sin(a), cx=B.bx+B.bw/2, cy=B.by+B.bh/2, L=(Math.abs(dx)*B.bw+Math.abs(dy)*B.bh)/2||1;
    const gr=t.createLinearGradient(cx-dx*L,cy-dy*L,cx+dx*L,cy+dy*L); gr.addColorStop(0,T.color); gr.addColorStop(1,T.color2);
    t.globalCompositeOperation='source-in'; t.fillStyle=gr; t.fillRect(0,0,B.W,B.H);
    c.drawImage(tmp,0,0);
  };
  const solidColor=T.grad?'#888888':T.color;
  if(T.glow){ c.save(); c.shadowColor=T.glowColor; c.shadowBlur=T.glowBlur*k; c.fillStyle=solidColor; glyphs('f'); glyphs('f'); c.restore(); }
  if(T.shadow){ c.save(); c.shadowColor=hexA(T.shColor,T.shOp/100); c.shadowBlur=T.shBlur*k; c.shadowOffsetX=T.shX*k; c.shadowOffsetY=T.shY*k;
    if(T.stroke){ c.lineWidth=T.strokeW*2*k; c.strokeStyle=T.strokeColor; glyphs('s'); } else { c.fillStyle=solidColor; glyphs('f'); } c.restore(); }
  if(T.stroke){ c.lineWidth=T.strokeW*2*k; c.strokeStyle=T.strokeColor; glyphs('s'); }
  fillPass();
  if(T.underline||T.strike){
    const th=Math.max(1,B.size*.065); c.fillStyle=T.grad?T.color:T.color;
    B.items.forEach(it=>{ if(!it.deco||B.curved) return; if(T.underline) c.fillRect(it.x0,it.y+B.size*.42,it.w,th); if(T.strike) c.fillRect(it.x0,it.y-th/2,it.w,th); });
  }
  let out=cv;
  if(T.opacity<100){ out=mkCanvas(B.W,B.H); const o=out.getContext('2d'); o.globalAlpha=T.opacity/100; o.drawImage(cv,0,0); }
  return out;
}
function stuCenterMatrix(bmp,fitFrac){
  const W=S.artboard.w,H=S.artboard.h; let s=1;
  if(fitFrac){ s=Math.min(1,W*fitFrac/bmp.width,H*fitFrac/bmp.height); }
  return [s,0,0,s,(W-bmp.width*s)/2,(H-bmp.height*s)/2];
}
function stuEnsureLayer(){
  if(!S.layers.length){ toast('Create a project first'); return null; }
  let l=getLayer(S.activeLayerId);
  if(!l||S.noSel){ l=S.layers[S.layers.length-1]; S.noSel=false; S.activeLayerId=l.id; S.sel=new Set([l.id]); }
  return targetLayerForAdd();
}
