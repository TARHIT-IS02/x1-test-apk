/* ================= STORAGE (IndexedDB): projects + fonts ================= */
const DB={ db:null,
  open(){ return new Promise((res,rej)=>{ if(DB.db) return res(DB.db); if(!window.indexedDB) return rej(new Error('no idb'));
    const r=indexedDB.open('tz_studio',1);
    r.onupgradeneeded=()=>{ const d=r.result; if(!d.objectStoreNames.contains('projects')) d.createObjectStore('projects',{keyPath:'id'}); if(!d.objectStoreNames.contains('fonts')) d.createObjectStore('fonts',{keyPath:'name'}); };
    r.onsuccess=()=>{ DB.db=r.result; res(DB.db); }; r.onerror=()=>rej(r.error); }); },
  run(store,mode,fn){ return DB.open().then(db=>new Promise((res,rej)=>{ const t=db.transaction(store,mode); const rq=fn(t.objectStore(store)); t.oncomplete=()=>res(rq&&rq.result); t.onerror=()=>rej(t.error); t.onabort=()=>rej(t.error); })); },
  put(s,v){ return DB.run(s,'readwrite',o=>o.put(v)); }, get(s,k){ return DB.run(s,'readonly',o=>o.get(k)); },
  del(s,k){ return DB.run(s,'readwrite',o=>o.delete(k)); }, all(s){ return DB.run(s,'readonly',o=>o.getAll()); }
};
DB.all('fonts').then(list=>{ (list||[]).forEach(f=>registerFont(f.name,f.buf.slice(0)).catch(()=>{})); }).catch(()=>{});

/* ================= PROJECTS ================= */
const blobOf=c=>new Promise(r=>c.toBlob(r,'image/png'));
function projThumb(){
  try{ const ctx=flattenVisible(false), c=ctx.canvas, k=Math.min(1,160/Math.max(c.width,c.height)); const t=mkCanvas(c.width*k,c.height*k); t.getContext('2d').drawImage(c,0,0,t.width,t.height); return t.toDataURL('image/jpeg',.8); }catch(e){ return ''; }
}
let projBusy=false, projTimer=0, projDirty=false;
function projMark(){ if(!S.layers.length) return; projDirty=true; clearTimeout(projTimer); projTimer=setTimeout(projSave,2200); }
function stuMarkDirty(){ projMark(); }
async function projSave(force){
  clearTimeout(projTimer);
  if(!S.layers.length||projBusy||(!projDirty&&!force)) return; projBusy=true; projDirty=false;
  try{
    if(!S.projectId){ S.projectId='P'+Date.now().toString(36); S.projectName='Project '+new Date().toLocaleDateString(undefined,{month:'short',day:'numeric'})+' '+new Date().toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'}); }
    const thumb=projThumb(), jobs=[];
    const layers=S.layers.map(l=>{ const {canvas,ctx,baseImageData,bbox,bboxDirty,bboxKey,objs,baseC,...meta}=l;
      const rec={meta,src:blobOf(canvas),baseC:baseC?blobOf(baseC):null,objs:objs.map(o=>{ const {c,...om}=o; return {om:JSON.parse(JSON.stringify(om)),c:blobOf(c)}; })}; return rec; });
    const data={artboard:{...S.artboard},activeLayerId:S.activeLayerId,folders:S.folders.map(f=>({...f})),layers:await Promise.all(layers.map(async L=>({meta:JSON.parse(JSON.stringify(L.meta)),src:await L.src,baseC:L.baseC?await L.baseC:null,objs:await Promise.all(L.objs.map(async o=>({om:o.om,c:await o.c})))})))};
    await DB.put('projects',{id:S.projectId,name:S.projectName,updated:Date.now(),thumb,w:S.artboard.w,h:S.artboard.h,data});
  }catch(e){ console.warn('autosave failed',e); }
  projBusy=false; if(projDirty) projMark();
}
async function projOpen(id){
  const rec=await DB.get('projects',id); if(!rec) { toast('Project not found'); return; }
  const d=rec.data, toCanvas=async b=>{ const bm=await createImageBitmap(b); const c=mkCanvas(bm.width,bm.height); c.getContext('2d',{willReadFrequently:true}).drawImage(bm,0,0); if(bm.close) bm.close(); return c; };
  const layers=[]; let maxId=0; const track=s=>{ const m=/(\d+)$/.exec(s||''); if(m) maxId=Math.max(maxId,+m[1]); };
  for(const L of d.layers){ const src=await toCanvas(L.src); track(L.meta.id); const objs=[]; for(const o of L.objs){ track(o.om.id); objs.push({...o.om,c:await toCanvas(o.c)}); } layers.push({...L.meta,src,baseC:L.baseC?await toCanvas(L.baseC):null,objs}); }
  closeTool(); S.history=[]; S.future=[];
  await restoreSnapshot({artboard:d.artboard,activeLayerId:d.activeLayerId,folders:d.folders||[],layers});
  S.layerSeq=Math.max(S.layerSeq,maxId+1); S.projectId=rec.id; S.projectName=rec.name; projDirty=false;
  updateUndoButtons(); renderToolbar(); renderLayers(); requestAnimationFrame(()=>fitZoom());
  closeModal('startupModal'); stuClose(); toast('Opened "'+rec.name+'"');
}
function projSession(){
  const render=async(b)=>{
    b.innerHTML='<div class="stu-empty">Loading…</div>';
    let list=[]; try{ list=(await DB.all('projects'))||[]; }catch(e){}
    list.sort((a,c)=>c.updated-a.updated); b.innerHTML='';
    const top=stuH('div','stu-inline'); const nb=stuH('button','btn primary',ic('add',16)+' New project'); nb.onclick=()=>{ stuClose(); resetStartupForm(); openModal('startupModal'); };
    const sv=stuH('button','btn',ic('download',16)+' Save now'); sv.onclick=async()=>{ if(!S.layers.length){ toast('Nothing to save'); return; } await projSave(true); toast('Saved'); render(b); };
    top.appendChild(nb); top.appendChild(sv); b.appendChild(top);
    if(!list.length){ b.appendChild(stuH('div','stu-empty','No saved projects yet.<br>Your work is saved automatically while you edit.')); return; }
    list.forEach(p=>{
      const row=stuH('div','stu-proj'); const cur=p.id===S.projectId;
      row.innerHTML='<img alt="">'+'<div class="pi"><div class="pn"></div><div class="pd"></div></div><div class="pa"></div>';
      row.querySelector('img').src=p.thumb||''; row.querySelector('.pn').textContent=p.name+(cur?'  •  open':'');
      row.querySelector('.pd').textContent=p.w+' × '+p.h+' · '+new Date(p.updated).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
      row.querySelector('.pi').onclick=()=>projOpen(p.id);
      const pa=row.querySelector('.pa');
      const rn=stuH('button','stu-ib',ic('pencil',17)); rn.setAttribute('aria-label','Rename');
      rn.onclick=()=>{ const pn=row.querySelector('.pn'); const inp=stuH('input','stu-pin'); inp.value=p.name; pn.replaceWith(inp); inp.focus(); inp.select();
        const done=async()=>{ const v=inp.value.trim()||p.name; const rec=await DB.get('projects',p.id); if(rec){ rec.name=v; await DB.put('projects',rec); } if(S.projectId===p.id) S.projectName=v; render(b); };
        inp.onblur=done; inp.onkeydown=e=>{ if(e.key==='Enter') inp.blur(); }; };
      const dl=stuH('button','stu-ib danger',ic('trash',17)); dl.setAttribute('aria-label','Delete');
      dl.onclick=()=>{ if(dl.dataset.s!=='1'){ dl.dataset.s='1'; dl.style.background='var(--danger)'; dl.style.color='#fff'; toast('Tap again to delete'); setTimeout(()=>{ dl.dataset.s=''; dl.style.background=''; dl.style.color=''; },2500); return; }
        DB.del('projects',p.id).then(()=>{ if(S.projectId===p.id){ S.projectId=null; } render(b); }); };
      pa.appendChild(rn); pa.appendChild(dl); b.appendChild(row);
    });
  };
  return {title:'Projects',preview:false,noFoot:true,build:render};
}
function stuOpenProjects(){ projSave(false); stuOpen(projSession()); }

/* autosave triggers */
window.addEventListener('pointerup',projMark,true);
window.addEventListener('keyup',projMark,true);
document.addEventListener('visibilitychange',()=>{ if(document.hidden){ projDirty=true; projSave(); } });
window.addEventListener('pagehide',()=>{ projDirty=true; projSave(); });
$('#btnProjects').onclick=()=>stuOpenProjects();
$('#spOpenProjects').onclick=()=>{ closeModal('startupModal'); stuOpenProjects(); };
