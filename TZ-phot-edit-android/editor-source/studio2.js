/* ================= TEXT STUDIO ================= */
const QUOTES={
 Motivation:['Start where you are. Use what you have. Do what you can.','Small steps every day add up to big change.','Dream big. Work hard. Stay humble.','Your only limit is you.','Make today so good that yesterday gets jealous.','Don\u2019t wait for the perfect moment. Take the moment and make it perfect.','Progress, not perfection.','Fall seven times, stand up eight.','Be the energy you want to attract.','Hustle in silence, let success make the noise.'],
 Love:['You are my favorite hello.','Home is wherever I\u2019m with you.','Love is a quiet kind of magic.','Together is my favorite place to be.','You had me at hello.','My heart knows your name.','Every love story is beautiful, but ours is my favorite.','Forever starts today.'],
 Life:['Life is short. Smile while you still have teeth.','Collect moments, not things.','Breathe. It\u2019s just a bad day, not a bad life.','Choose joy.','Good vibes only.','Stay wild, moon child.','Be kind. Always.','Enjoy the little things.','Today is a gift. That\u2019s why it\u2019s called the present.','Every sunset brings the promise of a new dawn.'],
 Funny:['I\u2019m not lazy, I\u2019m on energy-saving mode.','Coffee first. Adulting later.','I followed my heart. It led me to the fridge.','Sorry I\u2019m late. I didn\u2019t want to come.','Nap. Eat. Repeat.','I need a six-month vacation, twice a year.','Professional overthinker.','Running on caffeine and chaos.'],
 Friends:['Friends are the family we choose.','Good friends are like stars: you don\u2019t always see them, but you know they\u2019re there.','Best friends make the best memories.','Cheers to us!','Squad goals.','Life is better with friends.']
};
function stuTextSession(edit){
  const saved=(()=>{ try{ return JSON.parse(localStorage.getItem('tz_text_style')||'{}'); }catch(e){ return {}; } })();
  const T=Object.assign({},TEXT_DEFAULT,saved,edit?edit.o.tx:{});
  if(!edit && !saved.text) T.text='Your text'; else if(!edit) T.text='Your text';
  const draw=stuRaf(()=>{
    try{ const c=textRender(T,1); stuCv.width=c.width; stuCv.height=c.height; stuCv.getContext('2d').drawImage(c,0,0); }catch(e){ console.error(e); }
  });
  const ch=()=>draw();
  const tabs=[
   ['text','Text',(b)=>{
     const ta=stuH('textarea','stu-ta'); ta.value=T.text; ta.placeholder='Type your text…'; ta.spellcheck=false;
     ta.oninput=()=>{ T.text=ta.value; ch(); }; b.appendChild(ta);
     b.appendChild(stuH('div','stu-hint','Tip: press Enter for a new line.'));
     stuToggleBtns(b,[['bold','B'],['italic','I'],['underline','U'],['strike','S'],['upper','AA']],T,ch);
     const sg=b.lastChild; sg.children[0].style.fontWeight=900; sg.children[1].style.fontStyle='italic'; sg.children[2].style.textDecoration='underline'; sg.children[3].style.textDecoration='line-through';
     stuSeg(b,[['left','Left'],['center','Center'],['right','Right']],()=>T.align,v=>{ T.align=v; ch(); });
     stuRange(b,'Size',T,'size',16,600,1,v=>v+' px',ch);
     stuRange(b,'Opacity',T,'opacity',5,100,1,v=>v+'%',ch);
     setTimeout(()=>{ if(!edit){ ta.focus(); ta.select(); } },200);
   }],
   ['font','Font',(b)=>{
     const grid=stuH('div','stu-grid g3');
     const build=()=>{ grid.innerHTML=''; STU_FONTS.forEach(f=>{ const it=stuH('button','stu-it stu-font'+(T.font===f.name?' on':''),'<span style="font-family:'+f.css.replace(/"/g,"'")+';font-size:18px;font-weight:'+(f.name==='Light'?300:600)+'">'+esc(f.name)+'</span>');
       it.onclick=()=>{ T.font=f.name; build(); ch(); }; grid.appendChild(it); }); };
     build(); b.appendChild(grid);
     const imp=stuH('button','btn','Import font file (.ttf / .otf / .woff)'); imp.style.width='100%'; imp.style.marginBottom='8px';
     const fi=stuH('input'); fi.type='file'; fi.accept='.ttf,.otf,.woff,.woff2,font/*'; fi.multiple=true; fi.style.display='none';
     imp.onclick=()=>fi.click();
     fi.onchange=async()=>{
       for(const f of fi.files){
         try{ const buf=await f.arrayBuffer(); const name=f.name.replace(/\.[^.]+$/,'').replace(/[^\w\- ]/g,'').slice(0,30)||'Font';
           await registerFont(name,buf.slice(0)); await DB.put('fonts',{name,buf}); T.font=name; toast('Font added: '+name); }
         catch(e){ toast('Could not load '+f.name); }
       }
       build(); ch(); fi.value='';
     };
     b.appendChild(imp); b.appendChild(fi);
     b.appendChild(stuH('div','stu-hint','Imported fonts are saved on this device and work in every project.'));
   }],
   ['style','Style',(b)=>{
     stuColor(b,'Text color',T,'color',ch);
     stuSwatches(b,STU_SWATCH,T,'color',ch,()=>{ b.querySelector('input[type=color]').value=T.color; });
     stuCard(b,'Gradient fill',T,'grad',ch,s=>{ stuColor(s,'Second color',T,'color2',ch); stuRange(s,'Angle',T,'gradAngle',0,360,1,v=>v+'°',ch); });
   }],
   ['fx','Effects',(b)=>{
     stuCard(b,'Outline',T,'stroke',ch,s=>{ stuColor(s,'Color',T,'strokeColor',ch); stuRange(s,'Width',T,'strokeW',1,40,1,v=>v+' px',ch); });
     stuCard(b,'Shadow',T,'shadow',ch,s=>{ stuColor(s,'Color',T,'shColor',ch); stuRange(s,'Blur',T,'shBlur',0,60,1,null,ch); stuRange(s,'Offset X',T,'shX',-60,60,1,null,ch); stuRange(s,'Offset Y',T,'shY',-60,60,1,null,ch); stuRange(s,'Opacity',T,'shOp',5,100,1,v=>v+'%',ch); });
     stuCard(b,'Glow',T,'glow',ch,s=>{ stuColor(s,'Color',T,'glowColor',ch); stuRange(s,'Strength',T,'glowBlur',2,80,1,null,ch); });
   }],
   ['layout','Layout',(b)=>{
     stuRange(b,'Letter spacing',T,'ls',-20,80,1,v=>v+' px',ch);
     stuRange(b,'Line height',T,'lh',0.6,2.5,0.05,v=>v.toFixed(2),ch);
     stuRange(b,'Curve',T,'curve',-360,360,1,v=>v+'°',ch);
     stuCard(b,'Background box',T,'bg',ch,s=>{ stuColor(s,'Color',T,'bgColor',ch); stuRange(s,'Opacity',T,'bgOp',5,100,1,v=>v+'%',ch); stuRange(s,'Padding',T,'bgPad',0,120,1,null,ch); stuRange(s,'Corner radius',T,'bgRad',0,120,1,null,ch); });
   }],
   ['quotes','Quotes',(b)=>{
     const cats=Object.keys(QUOTES); let cur=cats[0];
     const chips=stuH('div','stu-chips'), list=stuH('div');
     const show=()=>{ chips.innerHTML=''; cats.forEach(c=>{ const x=stuH('button',c===cur?'on':'',c); x.onclick=()=>{ cur=c; show(); }; chips.appendChild(x); });
       list.innerHTML=''; QUOTES[cur].forEach(q=>{ const x=stuH('button','stu-quote',esc(q)); x.onclick=()=>{ T.text=q; ch(); stuTab(0); toast('Quote added'); }; list.appendChild(x); }); };
     show(); b.appendChild(chips); b.appendChild(list);
   }]
  ];
  return {title:edit?'Edit Text':'Text Studio', preview:true, tabs, okLabel:edit?'Update':'Add Text',
    init:()=>{ draw(); },
    ok:()=>{
      if(!T.text.trim()){ toast('Type some text first'); return; }
      const bmp0=textRender(T,1), t=trimCanvas(bmp0); if(!t){ toast('Nothing to add'); return; }
      const bmp=t.c;
      try{ const keep=Object.assign({},T); localStorage.setItem('tz_text_style',JSON.stringify(keep)); }catch(e){}
      if(edit){
        const {o,l}=edit; if(l.locked){ toast('Layer is locked'); return; }
        pushHistory();
        const dx=(o.w-bmp.width)/2, dy=(o.h-bmp.height)/2;
        const m=mulM(o.m,[1,0,0,1,dx,dy]);
        o.c=bmp; o.w=bmp.width; o.h=bmp.height; o.m=m; o.m0=m.slice(); o.tx=Object.assign({},T); o.name='Text: '+T.text.replace(/\s+/g,' ').slice(0,14);
        renderObjs(l); renderLayers(); stuClose(); toast('Text updated'); return;
      }
      const l=stuEnsureLayer(); if(!l) return;
      const o=placeObject('text','Text: '+T.text.replace(/\s+/g,' ').slice(0,14),bmp,stuCenterMatrix(bmp,.92));
      if(o){ o.tx=Object.assign({},T); stuClose(); toast('Text added · use Edit Text in the Select tool to change it'); }
    }};
}
function stuOpenText(){ if(!stuEnsureLayer()) return; closeTool(); stuOpen(stuTextSession(null)); }
function stuEditSelectedText(){
  const list=selObjList().filter(it=>it.o.tx);
  if(!list.length){ toast('Select a text object first'); return; }
  stuOpen(stuTextSession({o:list[0].o,l:list[0].l}));
}

/* ================= STICKERS ================= */
function starPath(n,ri,ro,rot){ let d=''; for(let i=0;i<n*2;i++){ const r=i%2?ri:ro, a=(Math.PI*i/n)+(rot||-Math.PI/2); d+=(i?'L':'M')+(50+r*Math.cos(a)).toFixed(2)+' '+(50+r*Math.sin(a)).toFixed(2); } return d+'Z'; }
function polyPath(n,r,rot){ let d=''; for(let i=0;i<n;i++){ const a=2*Math.PI*i/n+(rot||-Math.PI/2); d+=(i?'L':'M')+(50+r*Math.cos(a)).toFixed(2)+' '+(50+r*Math.sin(a)).toFixed(2); } return d+'Z'; }
function scallopPath(n,r,amp){ let d=''; for(let i=0;i<=n*8;i++){ const a=2*Math.PI*i/(n*8), rr=r+amp*Math.cos(n*a); d+=(i?'L':'M')+(50+rr*Math.cos(a)).toFixed(2)+' '+(50+rr*Math.sin(a)).toFixed(2); } return d+'Z'; }
function flowerPath(n,pr,or){ let d=''; for(let i=0;i<n;i++){ const a=2*Math.PI*i/n, cx=50+or*Math.cos(a), cy=50+or*Math.sin(a); d+='M'+(cx+pr).toFixed(2)+' '+cy.toFixed(2)+'A'+pr+' '+pr+' 0 1 0 '+(cx-pr).toFixed(2)+' '+cy.toFixed(2)+'A'+pr+' '+pr+' 0 1 0 '+(cx+pr).toFixed(2)+' '+cy.toFixed(2)+'Z'; } d+='M'+(50+or*.8)+' 50A'+or*.8+' '+or*.8+' 0 1 0 '+(50-or*.8)+' 50A'+or*.8+' '+or*.8+' 0 1 0 '+(50+or*.8)+' 50Z'; return d; }
function sunPath(){ let d='M72 50A22 22 0 1 0 28 50A22 22 0 1 0 72 50Z'; for(let i=0;i<12;i++){ const a=Math.PI*2*i/12, a1=a-.14, a2=a+.14; d+='M'+(50+30*Math.cos(a1))+' '+(50+30*Math.sin(a1))+'L'+(50+47*Math.cos(a))+' '+(50+47*Math.sin(a))+'L'+(50+30*Math.cos(a2))+' '+(50+30*Math.sin(a2))+'Z'; } return d; }
const ring=(r1,r2)=>'M50 '+(50-r1)+'A'+r1+' '+r1+' 0 1 0 50 '+(50+r1)+'A'+r1+' '+r1+' 0 1 0 50 '+(50-r1)+'Z M50 '+(50-r2)+'A'+r2+' '+r2+' 0 1 1 50 '+(50+r2)+'A'+r2+' '+r2+' 0 1 1 50 '+(50-r2)+'Z';
const rrect=(x,y,w,h,r)=>'M'+(x+r)+' '+y+'H'+(x+w-r)+'A'+r+' '+r+' 0 0 1 '+(x+w)+' '+(y+r)+'V'+(y+h-r)+'A'+r+' '+r+' 0 0 1 '+(x+w-r)+' '+(y+h)+'H'+(x+r)+'A'+r+' '+r+' 0 0 1 '+x+' '+(y+h-r)+'V'+(y+r)+'A'+r+' '+r+' 0 0 1 '+(x+r)+' '+y+'Z';
const STICKERS=[
 {c:'Shapes',n:'Heart',d:'M50 88C20 66 6 48 6 32 6 18 17 9 29 9c9 0 17 5 21 13 4-8 12-13 21-13 12 0 23 9 23 23 0 16-14 34-44 56z'},
 {c:'Shapes',n:'Star',d:starPath(5,19,46)},{c:'Shapes',n:'Star 6',d:starPath(6,26,46)},{c:'Shapes',n:'Burst',d:starPath(14,34,48)},
 {c:'Shapes',n:'Diamond',d:'M50 6L92 38 50 94 8 38z'},{c:'Shapes',n:'Hexagon',d:polyPath(6,46)},{c:'Shapes',n:'Octagon',d:polyPath(8,47,Math.PI/8)},{c:'Shapes',n:'Triangle',d:'M50 8L94 88H6z'},
 {c:'Shapes',n:'Drop',d:'M50 6C50 6 18 44 18 64c0 18 14 30 32 30s32-12 32-30C82 44 50 6 50 6z'},
 {c:'Shapes',n:'Cloud',d:'M25 80C10 80 4 66 8 56c4-10 14-12 20-10 0-14 14-24 28-18 8-10 26-6 28 10 12 0 16 14 12 24-4 12-14 18-21 18z'},
 {c:'Shapes',n:'Moon',d:'M62 8C34 12 14 34 14 60c0 22 18 36 40 34 16-1 30-10 36-24-20 4-40-8-40-28 0-14 4-26 12-34z'},
 {c:'Shapes',n:'Sun',d:sunPath(),eo:false},{c:'Shapes',n:'Flower',d:flowerPath(6,15,26)},
 {c:'Shapes',n:'Bolt',d:'M58 4L16 56h28L36 96 84 38H54z'},
 {c:'Shapes',n:'Flame',d:'M50 4C58 24 82 38 82 62c0 18-14 32-32 32S18 80 18 62c0-14 8-22 14-28 0 12 6 18 12 20C40 36 44 18 50 4z'},
 {c:'Shapes',n:'Leaf',d:'M10 90C10 40 40 10 92 8c0 52-30 82-78 82z'},
 {c:'Shapes',n:'Shield',d:'M50 6L88 20v30c0 24-18 38-38 46C30 88 12 74 12 50V20z'},
 {c:'Shapes',n:'Crown',d:'M8 78L14 30l20 22 16-32 16 32 20-22 6 48zM10 84h80v10H10z'},
 {c:'Shapes',n:'Pin',d:'M50 4C30 4 16 18 16 38c0 24 34 58 34 58s34-34 34-58C84 18 70 4 50 4zM50 26a12 12 0 1 1 0 24 12 12 0 0 1 0-24z',eo:true},
 {c:'Shapes',n:'Tag',d:'M8 14h44l42 42-38 38L8 46zM26 28a6 6 0 1 1 0 12 6 6 0 0 1 0-12z',eo:true},
 {c:'Shapes',n:'Note',d:'M38 12L88 4v64a14 11 0 1 1-8-10V26L46 32v44a14 11 0 1 1-8-10z'},
 {c:'Bubbles',n:'Round',d:'M50 10C25 10 6 26 6 46c0 12 6 22 16 29L16 92l22-12c4 1 8 2 12 2 25 0 44-16 44-36S75 10 50 10z'},
 {c:'Bubbles',n:'Box',d:'M16 10h68a10 10 0 0 1 10 10v38a10 10 0 0 1-10 10H44L24 90V68h-8A10 10 0 0 1 6 58V20a10 10 0 0 1 10-10z'},
 {c:'Bubbles',n:'Thought',d:'M50 12a40 28 0 1 0 .01 0zM22 78a7 7 0 1 0 .01 0zM10 92a4.5 4.5 0 1 0 .01 0z'},
 {c:'Bubbles',n:'Shout',d:starPath(12,34,48,0)},
 {c:'Bubbles',n:'Banner',d:'M4 28h24l10-10h24l10 10h24l-12 22 12 22H72L62 82H38L28 72H4l12-22z'},
 {c:'Bubbles',n:'Ticket',d:'M6 22h88v16a12 12 0 0 0 0 24v16H6V62a12 12 0 0 0 0-24z'},
 {c:'Arrows',n:'Arrow',d:'M6 38h50V18l38 32-38 32V62H6z'},{c:'Arrows',n:'Double',d:'M4 50l24-24v16h44V26l24 24-24 24V58H28v16z'},
 {c:'Arrows',n:'Chevron',d:'M30 8l42 42-42 42-10-10 32-32-32-32z'},{c:'Arrows',n:'Check',d:'M6 54l16-16 18 18 38-42 16 16-54 60z'},
 {c:'Arrows',n:'Cross',d:'M20 8l30 30L80 8l12 12-30 30 30 30-12 12-30-30-30 30L8 80l30-30L8 20z'},{c:'Arrows',n:'Plus',d:'M38 8h24v30h30v24H62v30H38V62H8V38h30z'},
 {c:'Arrows',n:'Pointer',d:'M20 6l60 44-26 6 16 30-14 8-16-30-20 18z'},
 {c:'Frames',n:'Ring',d:ring(46,38),eo:true},{c:'Frames',n:'Ring 2',d:ring(46,42)+ring(34,30),eo:true},
 {c:'Frames',n:'Square',d:rrect(6,6,88,88,6)+rrect(14,14,72,72,2),eo:true},{c:'Frames',n:'Rounded',d:rrect(6,6,88,88,26)+rrect(15,15,70,70,17),eo:true},
 {c:'Frames',n:'Badge',d:scallopPath(16,43,3)+ring(34,30).replace(/^M50 16[^M]*/,''),eo:false},{c:'Frames',n:'Seal',d:scallopPath(12,42,5)},
 {c:'Frames',n:'Wide',d:rrect(4,22,92,56,10)+rrect(11,29,78,42,4),eo:true},{c:'Frames',n:'Hex ring',d:polyPath(6,47)+polyPath(6,38),eo:true}
];
const EMOJI={
 Smileys:'😀😃😄😁😆😅😂🤣🥲😊😇🙂😉😌😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🥸🤩🥳😏😒😞😔😟😕🙁😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😱😨😰😥😓🤗🤔🫣🤭🫢🤫🫠🤥😶😐😑😬🙄😯😦😧😮😲🥱😴🤤😪😵🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀☠️👽👾🤖🎃',
 Gestures:'👋🤚🖐️✋🖖👌🤌🤏✌️🤞🤟🤘🤙👈👉👆👇☝️👍👎✊👊🤛🤜👏🙌👐🤲🤝🙏✍️💅🤳💪🦾🦵🦶👂👃🧠👀👁️👅👄',
 Hearts:'❤️🧡💛💚💙💜🖤🤍🤎💔❣️💕💞💓💗💖💘💝💟♥️😻💋💌',
 Nature:'🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🙈🙉🙊🐔🐧🐦🦆🦅🦉🦇🐺🐗🐴🦄🐝🪲🦋🐌🐞🐜🐢🐍🦖🐙🦑🦐🦀🐠🐟🐬🐳🦈🌵🎄🌲🌳🌴🌱🌿☘️🍀🍁🍂🍃🌺🌻🌹🥀🌷🌼🌸💐🍄🌾⭐🌟✨⚡☄️💥🔥🌈☀️🌤️⛅☁️🌧️⛈️❄️☃️💧🌊',
 Food:'🍏🍎🍐🍊🍋🍌🍉🍇🍓🫐🍈🍒🍑🥭🍍🥥🥝🍅🍆🥑🥦🥕🌽🌶️🥔🍞🥐🥖🧀🥚🍳🥞🧇🥓🍔🍟🍕🌭🥪🌮🌯🍝🍜🍲🍣🍱🍤🍙🍚🍦🍧🍨🍩🍪🎂🍰🧁🍫🍬🍭🍮🍯🍼☕🍵🧃🥤🍺🍻🥂🍷🍸🍹🍾',
 Travel:'🚗🚕🚙🚌🏎️🚓🚑🚒🚚🚜🛵🏍️🚲🛴✈️🚀🛸🚁⛵🚤🛳️⚓🗼🗽🗿🏰🏯🎡🎢🎠⛲🏖️🏝️🏔️🗻🌋🏕️🏠🏡🏢🌅🌄🌃🌉🌌',
 Objects:'⌚📱💻⌨️🖥️📷📸🎥🎬📺📻🎙️🎧🎤🎵🎶🎸🎹🥁🎷🎺🎻📚📖📝✏️🖊️🖌️🎨🧩🎮🕹️🎲🎯🎳⚽🏀🏈⚾🎾🏐🏉🥇🏆🏅🎖️💡🔦🕯️💰💎🔑🗝️🔒🔓🎁🎈🎉🎊🛍️🧸🪄🔮📌📍✂️📎🔔🔭🔬🧲💣',
 Symbols:'✅❌❓❗‼️💯🔴🟠🟡🟢🔵🟣⚫⚪🟤🔶🔷🔸🔹▶️⏸️⏹️⏺️⏭️⏮️🔀🔁🔂➕➖➗✖️♾️💲™️©️®️🆒🆕🆗🆙🆓🏳️🏴🚩🏁🔰⚜️💠♻️🔱📛☮️✝️☯️🕉️♈♉♊♋♌♍♎♏♐♑♒♓'
};
const STK={cat:'Emoji',fill:'#ffcc00',stroke:'#1c1c1e',outline:false,ow:5,eCat:'Smileys'};
function stuStickerBitmap(def,S2){
  const sz=512, pad=24, cv=mkCanvas(sz+pad*2,sz+pad*2), c=cv.getContext('2d',{willReadFrequently:true});
  c.translate(pad,pad); c.scale(sz/100,sz/100);
  const p=new Path2D(def.d);
  c.fillStyle=S2.fill; c.fill(p,def.eo?'evenodd':'nonzero');
  if(S2.outline){ c.lineWidth=S2.ow; c.strokeStyle=S2.stroke; c.lineJoin='round'; c.stroke(p); }
  const t=trimCanvas(cv); return t&&t.c;
}
function emojiList(str){ try{ return [...new Intl.Segmenter('en',{granularity:'grapheme'}).segment(str)].map(x=>x.segment).filter(x=>x.trim()); }catch(e){ return Array.from(str).filter(x=>x.trim()&&x!=='\uFE0F'); } }
function stuEmojiBitmap(ch){
  const cv=mkCanvas(640,640), c=cv.getContext('2d',{willReadFrequently:true});
  c.font='400 440px "Apple Color Emoji","Noto Color Emoji","Segoe UI Emoji","Twemoji Mozilla",sans-serif'; c.textAlign='center'; c.textBaseline='middle';
  c.fillText(ch,320,340);
  const t=trimCanvas(cv); return t&&t.c;
}
function stuPlaceSticker(bmp,name){
  if(!bmp){ toast('Could not draw this sticker'); return; }
  const l=stuEnsureLayer(); if(!l) return;
  const W=S.artboard.w,H=S.artboard.h, s=Math.min(W,H)*.38/Math.max(bmp.width,bmp.height);
  const o=placeObject('sticker',name,bmp,[s,0,0,s,(W-bmp.width*s)/2,(H-bmp.height*s)/2]);
  if(o){ toast(name+' added'); }
}
function stuStickerSession(){
  const cats=['Emoji','Shapes','Bubbles','Arrows','Frames'];
  const mk=(cat)=>[cat.toLowerCase(),cat,(b)=>{
    STK.cat=cat;
    if(cat==='Emoji'){
      const chips=stuH('div','stu-chips'), g=stuH('div','stu-grid g6');
      const show=()=>{ chips.innerHTML=''; Object.keys(EMOJI).forEach(k=>{ const x=stuH('button',k===STK.eCat?'on':'',k); x.onclick=()=>{ STK.eCat=k; show(); }; chips.appendChild(x); });
        g.innerHTML=''; emojiList(EMOJI[STK.eCat]).forEach(e=>{ const x=stuH('button','stu-emo',e); x.onclick=()=>{ stuPlaceSticker(stuEmojiBitmap(e),'Emoji '+e); }; g.appendChild(x); }); };
      show(); b.appendChild(chips); b.appendChild(g); return;
    }
    stuColor(b,'Fill color',STK,'fill',()=>redraw());
    stuSwatches(b,STU_SWATCH,STK,'fill',()=>redraw(),()=>{ b.querySelector('input[type=color]').value=STK.fill; });
    stuCard(b,'Outline',STK,'outline',()=>redraw(),s=>{ stuColor(s,'Color',STK,'stroke',()=>redraw()); stuRange(s,'Width',STK,'ow',1,14,1,null,()=>redraw()); });
    const g=stuH('div','stu-grid g4'); b.appendChild(g);
    const list=STICKERS.filter(s=>s.c===cat);
    function redraw(){ g.innerHTML=''; list.forEach(def=>{
      const it=stuH('button','stu-it','<canvas width="96" height="96"></canvas><span>'+def.n+'</span>'), cv=it.querySelector('canvas'), c=cv.getContext('2d');
      c.translate(8,8); c.scale(.8*.96,.8*.96); const p=new Path2D(def.d); c.fillStyle=STK.fill; c.fill(p,def.eo?'evenodd':'nonzero'); if(STK.outline){ c.lineWidth=STK.ow; c.strokeStyle=STK.stroke; c.lineJoin='round'; c.stroke(p); }
      it.onclick=()=>stuPlaceSticker(stuStickerBitmap(def,STK),def.n); g.appendChild(it); }); }
    redraw();
  }];
  return {title:'Stickers', preview:false, noFoot:true, tabs:cats.map(mk)};
}
function stuOpenStickers(){ if(!stuEnsureLayer()) return; closeTool(); stuOpen(stuStickerSession()); }
