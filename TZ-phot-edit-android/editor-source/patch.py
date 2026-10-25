import re,sys
src=open('/mnt/user-data/uploads/tz-photo-edit-1.html',encoding='utf-8').read()
css=open('studio.css').read(); js=open('studio.js').read()
def rep(old,new,count=1):
    global src
    n=src.count(old)
    assert n==count, (old[:70], n)
    src=src.replace(old,new)
# 1 css
rep('</head>','<style id="studioCss">'+css+'</style>\n</head>')
# 2 icons
icons='''  <symbol id="i-sticker" viewBox="0 0 24 24"><path d="M21 12.2V12a9 9 0 1 0-9 9h.2"/><path d="M21 12.2c0 4.6-3.7 8.3-8.3 8.3v-3.6a4.7 4.7 0 0 1 4.7-4.7z"/><circle cx="9" cy="9.5" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="9.5" r=".9" fill="currentColor" stroke="none"/><path d="M8.3 14c1 1.3 2.3 2 3.7 2"/></symbol>
  <symbol id="i-fx" viewBox="0 0 24 24"><path d="M10 3.5l1.7 4.5 4.5 1.7-4.5 1.7L10 16 8.3 11.4 3.8 9.7 8.3 8z"/><path d="M18.5 14l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z"/><path d="M18 3.5v3M16.5 5h3"/></symbol>
  <symbol id="i-backdrop" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M3 15l5-4.5 4 3.5 3-2.5L21 16"/><path d="M3 9.5C7 6.5 10 8 12 6.5S17 4 21 6.5" opacity=".55"/></symbol>
  <symbol id="i-pencil" viewBox="0 0 24 24"><path d="M4 20l1-4.2L16.3 4.5a2.1 2.1 0 0 1 3 3L8 18.8z"/><path d="M14.5 6.3l3.2 3.2"/></symbol>
  <symbol id="i-folder" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></symbol>
  <symbol id="i-typeedit" viewBox="0 0 24 24"><path d="M4 7V5h12v2M10 5v12M7.5 17h5"/><path d="M15.5 20.5l.6-2.6 4.4-4.4a1.4 1.4 0 0 1 2 2l-4.4 4.4z"/></symbol>
'''
i=src.index('  <symbol id="i-perspective"'); src=src[:i]+icons+src[i:]
# 3 html
rep('      <button class="hbtn" id="btnNewProj"','      <button class="hbtn" id="btnProjects" title="Projects" aria-label="Projects">\n        <svg class="icon md"><use href="#i-folder"/></svg>\n      </button>\n      <button class="hbtn" id="btnNewProj"')
rep('      <button class="btn primary" id="createProjectBtn" style="flex:1;">Create Project</button>','      <button class="btn" id="spOpenProjects" style="flex:0 0 auto;"><svg class="icon sm"><use href="#i-folder"/></svg>Projects</button>\n      <button class="btn primary" id="createProjectBtn" style="flex:1;">Create Project</button>')
modal='''<div class="modal-overlay stu-ov" id="stuModal">
  <div class="modal stu" role="dialog" aria-modal="true">
    <div class="modal-head"><h2 id="stuTitle">Studio</h2><button class="close-x" id="stuClose" aria-label="Close"><svg class="icon sm"><use href="#i-x"/></svg></button></div>
    <div class="stu-prev" id="stuPrev"><canvas id="stuCv" width="2" height="2"></canvas></div>
    <div class="stu-tabs" id="stuTabs"></div>
    <div class="stu-body" id="stuBody"></div>
    <div class="modal-foot" id="stuFoot"><button class="btn" id="stuCancel">Cancel</button><button class="btn primary" id="stuOk" style="flex:2">Apply</button></div>
  </div>
</div>
'''
rep('<div id="toastWrap"></div>',modal+'<div id="toastWrap"></div>')
# 4 js
rep("  edit:{brightness:0,contrast:0,","  projectId:null, projectName:'',\n  edit:{brightness:0,contrast:0,")
rep("  retouch:{label:'Retouch', icon:ICONS.retouch, adv:'retouch'},\n};","  retouch:{label:'Retouch', icon:ICONS.retouch, adv:'retouch'},\n  effects:{label:'Effects', icon:ic('fx')},\n  backdrop:{label:'Backdrop', icon:ic('backdrop')},\n};")
rep("const DEFAULT_ORDER = ['move','add','shape','edit','cutout','brush','layers','crop','perspective','warp','retouch'];","const DEFAULT_ORDER = ['move','add','shape','edit','effects','cutout','brush','backdrop','layers','crop','perspective','warp','retouch'];")
rep("toolbarVisible: Object.assign({move:true,add:true,shape:false,edit:true,cutout:true,","toolbarVisible: Object.assign({move:true,add:true,shape:false,edit:true,effects:true,backdrop:true,cutout:true,")
rep("""    opt('text',ICONS.text,'Text','data-shape="text"')+
    '</div>'),""","""    opt('text',ICONS.text,'Text','data-shape="text"')+
    '<div class="add-sep" aria-hidden="true"></div>'+
    opt('sticker',ic('sticker'),'Sticker','data-shape="sticker"')+
    '</div>'),""")
rep("""    opt('reset',ic('rotCcw'),'Reset','id="mvReset"')),""","""    opt('editText',ic('typeedit'),'Edit Text','id="mvEditText"')+
    opt('reset',ic('rotCcw'),'Reset','id="mvReset"')),""")
rep("    panel.querySelector('#mvFlipH').onclick=()=>flipLayer('x');","    panel.querySelector('#mvEditText').onclick=()=>stuEditSelectedText();\n    panel.querySelector('#mvFlipH').onclick=()=>flipLayer('x');")
rep("      if(shape==='image'){ $('#addImageInput').click(); return; }","      if(shape==='image'){ $('#addImageInput').click(); return; }\n      if(shape==='text'){ stuOpenText(); return; }\n      if(shape==='sticker'){ stuOpenStickers(); return; }")
rep("function toggleTool(key){\n","function toggleTool(key){\n  if(key==='effects'){ stuOpenEffects(); return; }\n  if(key==='backdrop'){ stuOpenBackdrop(); return; }\n")
rep("function pushHistory(){\n  S.history.push(snapshot());","function pushHistory(){\n  stuMarkDirty();\n  S.history.push(snapshot());")
rep("  S.layers=[]; S.history=[]; S.future=[]; S.activeLayerId=null; S.folders=[]; S.sel=new Set(); S.selObjs=new Set(); S.selFolder=null;\n  setArtboardSize(w,h);","  S.layers=[]; S.history=[]; S.future=[]; S.activeLayerId=null; S.folders=[]; S.sel=new Set(); S.selObjs=new Set(); S.selFolder=null; S.projectId=null; S.projectName='';\n  setArtboardSize(w,h);")
rep("function init(){\n  applyTheme();","/* ---- studio module ---- */\n"+js+"\nfunction init(){\n  applyTheme();")
open('/home/claude/build/tz-photo-edit.html','w',encoding='utf-8').write(src)
print('patched',len(src))
