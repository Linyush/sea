/* ============================================================
   MAINTENANCE SOP MODULE
   ============================================================ */
function MT_SK(){return 'reef_'+_activeTank+'_maintain_v1';}
function MT_CFG_SK(){return 'reef_'+_activeTank+'_maintain_cfg';}
function MT_LOG_SK(){return 'reef_'+_activeTank+'_maintain_log';}

/* --- Config (settings) --- */
function MT_loadCfg(){
  const s=_g(MT_CFG_SK());
  if(s){try{return JSON.parse(s);}catch(e){}}
  return {supplyChecks:['ATO 储水桶','KH 滴定液','Ca 滴定液','Mg 滴定液'],closeDevices:[],restoreDevices:[],maintDevices:[]};
}
function MT_saveCfg(cfg){_s(MT_CFG_SK(),JSON.stringify(cfg));}

/* --- Log (history) --- */
function MT_loadLog(){
  const s=_g(MT_LOG_SK());
  if(s){try{return JSON.parse(s);}catch(e){}}
  return [];
}
function MT_saveLog(log){_s(MT_LOG_SK(),JSON.stringify(log));}

/* --- Session state --- */
let _mtState={};
function MT_resetState(){
  _mtState={step:0,supply:{},calcVol:'',testData:{},closeDone:[],execVol:'',execNote:'',maintDone:[],restoreDone:[],done:false};
}

/* --- Init --- */
function initMaintain(){
  MT_resetState();
  MT_render();
}

/* --- Render --- */
function MT_render(){
  const container=document.getElementById('mtContainer');
  if(!container)return;
  const cfg=MT_loadCfg();
  const log=MT_loadLog();
  const lastLog=log.length?log[log.length-1]:null;

  let html='';
  // Top bar
  html+='<div class="mt-top-bar">';
  html+='<div class="mt-last">';
  if(lastLog) html+='上次维护：<strong>'+lastLog.date+'</strong>';
  else html+='<span style="color:var(--text5)">暂无维护记录</span>';
  html+='</div>';
  html+='<div class="mt-top-btns">';
  html+='<button class="mt-top-btn" onclick="MT_openHistory()">📋 历史</button>';
  html+='<button class="mt-top-btn" onclick="MT_openSettings()">⚙️ 设置</button>';
  html+='</div></div>';

  // Cards
  const steps=[
    {id:'supply',title:'余量确认',icon:'📦'},
    {id:'calc',title:'换水计算',icon:'🧮'},
    {id:'test',title:'水质检测',icon:'🧪'},
    {id:'close',title:'设备关闭',icon:'🔌'},
    {id:'exec',title:'执行换水',icon:'💧'},
    {id:'maint',title:'设备维护',icon:'🔧'},
    {id:'restore',title:'设备恢复',icon:'✅'}
  ];

  html+='<div class="mt-flow">';
  steps.forEach(function(s,i){
    const isDone=_mtState.step>i||_mtState.done;
    const isOpen=_mtState.step===i&&!_mtState.done;
    const cls='mt-card'+(isDone?' done':'')+(isOpen?' open active':'');
    html+='<div class="'+cls+'" data-idx="'+i+'">';
    html+='<div class="mt-card-hd" onclick="MT_toggle('+i+')">';
    html+='<div class="mt-step"><span>'+s.icon+'</span></div>';
    html+='<div class="mt-card-title">'+s.title+'</div>';
    html+='<div class="mt-card-status">'+(isDone?'已完成':'')+'</div>';
    html+='</div>';
    html+='<div class="mt-card-bd">'+MT_renderStep(i,cfg)+'</div>';
    html+='</div>';
  });
  html+='</div>';

  // Done summary
  if(_mtState.done){
    html+='<div class="mt-actions" style="justify-content:center;margin-top:20px">';
    html+='<button class="mt-btn mt-btn-primary" onclick="MT_finish()">✅ 提交维护记录</button>';
    html+='<button class="mt-btn mt-btn-ghost" onclick="MT_resetAndRender()">重新开始</button>';
    html+='</div>';
  }

  container.innerHTML=html;
}

function MT_renderStep(idx,cfg){
  switch(idx){
    case 0: return MT_renderSupply(cfg);
    case 1: return MT_renderCalc();
    case 2: return MT_renderTest();
    case 3: return MT_renderClose(cfg);
    case 4: return MT_renderExec();
    case 5: return MT_renderMaint(cfg);
    case 6: return MT_renderRestore(cfg);
    default: return '';
  }
}

/* --- Step 1: Supply check --- */
function MT_renderSupply(cfg){
  const items=cfg.supplyChecks||[];
  if(!items.length) return '<p style="font-size:12px;color:var(--text4)">未配置检查项，请前往设置添加</p><div class="mt-actions"><button class="mt-btn mt-btn-ghost" onclick="MT_next()">跳过</button></div>';
  let html='<div class="mt-supply-list">';
  items.forEach(function(name,i){
    const st=_mtState.supply[i]||'';
    html+='<div class="mt-supply-row">';
    html+='<span class="mt-supply-name">'+name+'</span>';
    html+='<div class="mt-supply-btns">';
    html+='<button class="mt-supply-btn'+(st==='ok'?' active-ok':'')+'" onclick="MT_setSupply('+i+',\'ok\')">✅ 充足</button>';
    html+='<button class="mt-supply-btn'+(st==='warn'?' active-warn':'')+'" onclick="MT_setSupply('+i+',\'warn\')">⚠️ 需补充</button>';
    html+='</div></div>';
  });
  html+='</div>';
  html+='<div class="mt-actions"><button class="mt-btn mt-btn-primary" onclick="MT_next()">下一步</button></div>';
  return html;
}

/* --- Step 2: Calc --- */
function MT_renderCalc(){
  const tank=TK_current();
  const vol=_mtState.calcVol||'12';
  const tankTotal=tank.volume||70;
  let html='<div class="mt-calc-row">';
  html+='<div class="mt-calc-item"><label>缸水量(L)</label><input type="number" id="mtTankVol" value="'+tankTotal+'" oninput="MT_recalc()"></div>';
  html+='<div class="mt-calc-item"><label>换水量(L)</label><input type="number" id="mtChgVol" value="'+vol+'" oninput="MT_recalc()"></div>';
  html+='<div class="mt-calc-item"><label>盐度(‰)</label><input type="number" id="mtSal" value="35" oninput="MT_recalc()"></div>';
  html+='</div>';
  html+='<div class="mt-calc-result" id="mtCalcResult">'+MT_calcResultHTML(tankTotal,parseFloat(vol),35)+'</div>';
  html+='<div class="mt-actions"><button class="mt-btn mt-btn-primary" onclick="MT_next()">下一步</button></div>';
  return html;
}
function MT_calcResultHTML(tankTotal,vol,sal){
  const salt=Math.round(vol*sal);
  const ratio=tankTotal>0?(vol/tankTotal*100).toFixed(1):'0.0';
  _mtState.calcVol=String(vol);
  return '<div class="mt-r"><div class="val">'+salt+'g</div><div class="lbl">需要盐量</div></div>'+
         '<div class="mt-r"><div class="val">'+ratio+'%</div><div class="lbl">换水比例</div></div>';
}
function MT_recalc(){
  const vol=parseFloat(document.getElementById('mtChgVol').value)||0;
  const sal=parseFloat(document.getElementById('mtSal').value)||35;
  const tankTotal=parseFloat(document.getElementById('mtTankVol').value)||70;
  const el=document.getElementById('mtCalcResult');
  if(el) el.innerHTML=MT_calcResultHTML(tankTotal,vol,sal);
}

/* --- Step 3: Water test --- */
function MT_renderTest(){
  const wsk='reef_'+_activeTank+'_water_v10';
  let wData;try{wData=JSON.parse(_g(wsk))||{};}catch(e){wData={};}
  const wFields=wData.fields||[{key:'kh',name:'KH',color:'#f59e0b'},{key:'ca',name:'Ca',color:'#22bbaa'},{key:'mg',name:'Mg',color:'#6366f1'},{key:'no3',name:'NO3',color:'#ef4444'},{key:'po4',name:'PO4',color:'#8b5cf6'}];
  let html='<div class="mt-test-grid">';
  html+='<div class="mt-test-item"><label>日期</label><input type="date" id="mtTestDate" value="'+new Date().toISOString().slice(0,10)+'"></div>';
  wFields.forEach(function(f){
    const val=_mtState.testData[f.key]||'';
    html+='<div class="mt-test-item"><label>'+f.name+'</label><input type="number" step="any" id="mtTest_'+f.key+'" value="'+val+'" placeholder="-" onchange="MT_saveTest(\''+f.key+'\',this.value)"></div>';
  });
  html+='</div>';
  html+='<div class="mt-actions"><button class="mt-btn mt-btn-primary" onclick="MT_next()">下一步</button><button class="mt-btn-skip" onclick="MT_next()">跳过</button></div>';
  return html;
}
function MT_saveTest(key,val){_mtState.testData[key]=val;}

/* --- Step 4: Close devices --- */
function MT_renderClose(cfg){
  const items=cfg.closeDevices||[];
  if(!items.length) return '<p style="font-size:12px;color:var(--text4)">未配置需关闭的设备，请在设置中选择</p><div class="mt-actions"><button class="mt-btn mt-btn-ghost" onclick="MT_next()">跳过</button></div>';
  let html='<ul class="mt-checklist">';
  items.forEach(function(name,i){
    const ck=_mtState.closeDone.includes(i);
    html+='<li class="'+(ck?'checked':'')+'" onclick="MT_toggleCk(\'close\','+i+')"><div class="mt-ck">✓</div><span class="mt-ck-label">关闭 '+name+'</span></li>';
  });
  html+='</ul>';
  html+='<div class="mt-actions"><button class="mt-btn mt-btn-primary" onclick="MT_next()">下一步</button></div>';
  return html;
}

/* --- Step 5: Execute --- */
function MT_renderExec(){
  const vol=_mtState.calcVol||'12';
  let html='<div class="mt-exec-row">';
  html+='<span style="font-size:13px;color:var(--text2)">实际换水量</span>';
  html+='<input type="number" id="mtExecVol" value="'+(_mtState.execVol||vol)+'" onchange="_mtState.execVol=this.value">';
  html+='<span class="unit">L</span>';
  html+='</div>';
  html+='<div class="mt-note"><textarea id="mtExecNote" placeholder="备注（选填，如：顺便吸了底砂）" onchange="_mtState.execNote=this.value">'+(_mtState.execNote||'')+'</textarea></div>';
  html+='<div class="mt-actions"><button class="mt-btn mt-btn-primary" onclick="MT_next()">换水完成 →</button></div>';
  return html;
}

/* --- Step 6: Maintenance --- */
function MT_renderMaint(cfg){
  const items=cfg.maintDevices||[];
  if(!items.length) return '<p style="font-size:12px;color:var(--text4)">未配置维护项目，请在设置中添加</p><div class="mt-actions"><button class="mt-btn mt-btn-ghost" onclick="MT_next()">跳过</button></div>';
  let html='<ul class="mt-checklist">';
  items.forEach(function(name,i){
    const ck=_mtState.maintDone.includes(i);
    html+='<li class="'+(ck?'checked':'')+'" onclick="MT_toggleCk(\'maint\','+i+')"><div class="mt-ck">✓</div><span class="mt-ck-label">'+name+'</span></li>';
  });
  html+='</ul>';
  html+='<div class="mt-actions"><button class="mt-btn mt-btn-primary" onclick="MT_next()">下一步</button><button class="mt-btn-skip" onclick="MT_next()">本次跳过</button></div>';
  return html;
}

/* --- Step 7: Restore --- */
function MT_renderRestore(cfg){
  const items=(cfg.restoreDevices&&cfg.restoreDevices.length)?cfg.restoreDevices:(cfg.closeDevices||[]);
  if(!items.length) return '<p style="font-size:12px;color:var(--text4)">无需恢复的设备</p><div class="mt-actions"><button class="mt-btn mt-btn-primary" onclick="MT_completeAll()">完成维护</button></div>';
  let html='<ul class="mt-checklist">';
  items.forEach(function(name,i){
    const ck=_mtState.restoreDone.includes(i);
    html+='<li class="'+(ck?'checked':'')+'" onclick="MT_toggleCk(\'restore\','+i+')"><div class="mt-ck">✓</div><span class="mt-ck-label">开启 '+name+'</span></li>';
  });
  html+='</ul>';
  html+='<div class="mt-actions"><button class="mt-btn mt-btn-primary" onclick="MT_completeAll()">完成维护</button></div>';
  return html;
}

/* --- Interactions --- */
function MT_toggle(idx){
  const cards=document.querySelectorAll('.mt-card');
  const card=cards[idx];
  if(!card)return;
  if(card.classList.contains('open')){
    card.classList.remove('open','active');
  }else{
    cards.forEach(function(c){c.classList.remove('open','active');});
    card.classList.add('open','active');
  }
}

function MT_next(){
  _mtState.step++;
  if(_mtState.step>=7){MT_completeAll();return;}
  MT_render();
}

function MT_completeAll(){
  _mtState.done=true;
  MT_render();
}

function MT_setSupply(i,val){
  _mtState.supply[i]=val;
  MT_render();
}

function MT_toggleCk(type,i){
  let arr;
  if(type==='close') arr=_mtState.closeDone;
  else if(type==='maint') arr=_mtState.maintDone;
  else arr=_mtState.restoreDone;
  const idx=arr.indexOf(i);
  if(idx>=0) arr.splice(idx,1);
  else arr.push(i);
  MT_render();
}

function MT_resetAndRender(){
  MT_resetState();
  MT_render();
}

/* --- Finish: save log + sync water data --- */
function MT_finish(){
  const log=MT_loadLog();
  const date=document.getElementById('mtTestDate')?document.getElementById('mtTestDate').value:new Date().toISOString().slice(0,10);
  const cfg=MT_loadCfg();

  const entry={
    date:date,
    vol:_mtState.execVol||_mtState.calcVol||'',
    supply:Object.assign({},_mtState.supply),
    testData:Object.assign({},_mtState.testData),
    maintDone:(_mtState.maintDone||[]).map(function(i){return (cfg.maintDevices||[])[i];}).filter(Boolean),
    note:_mtState.execNote||''
  };
  log.push(entry);
  MT_saveLog(log);

  // Sync water test data
  MT_syncWaterData(entry,date);

  toast('维护记录已保存');
  MT_resetState();
  MT_render();
}

function MT_syncWaterData(entry,date){
  if(!entry.testData||!Object.keys(entry.testData).some(function(k){return entry.testData[k];}))return;
  const wsk='reef_'+_activeTank+'_water_v10';
  let wData;try{wData=JSON.parse(_g(wsk))||{};}catch(e){wData={};}
  if(!wData.rows) wData.rows=[];
  var row=wData.rows.find(function(r){return r.date===date;});
  if(!row){row={date:date};wData.rows.push(row);}
  for(var k in entry.testData){
    if(entry.testData[k]) row[k]=parseFloat(entry.testData[k])||entry.testData[k];
  }
  wData.rows.sort(function(a,b){return a.date.localeCompare(b.date);});
  _s(wsk,JSON.stringify(wData));
}

/* --- Settings modal --- */
function MT_openSettings(){
  const cfg=MT_loadCfg();
  const inv=P_loadInv();
  const equipList=(inv.equipment||[]).filter(function(e){return !['broken','sold'].includes(e.status);}).map(function(e){return e.name;});

  let html='<div class="mt-settings-overlay open" id="mtSettingsOverlay" onclick="if(event.target===this)MT_closeSettings()">';
  html+='<div class="mt-settings-box">';
  html+='<h4>⚙️ 维护设置</h4>';

  // Supply checks
  html+='<div class="mt-set-section"><div class="mt-set-label">余量检查项</div>';
  html+='<div id="mtSetSupply">';
  (cfg.supplyChecks||[]).forEach(function(name,i){
    html+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><input style="flex:1;background:var(--input-bg);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:6px;font-size:12px" value="'+name+'" onchange="MT_cfgSetSupplyName('+i+',this.value)"><button style="border:none;background:none;color:var(--text4);cursor:pointer;font-size:14px" onclick="MT_cfgRemoveSupply('+i+')">✕</button></div>';
  });
  html+='<button class="mt-btn mt-btn-ghost" style="margin-top:6px;font-size:11px;padding:4px 10px" onclick="MT_cfgAddSupply()">+ 添加</button>';
  html+='</div></div>';

  // Close devices
  html+='<div class="mt-set-section"><div class="mt-set-label">换水前需关闭设备</div>';
  html+='<div class="mt-set-list">';
  equipList.forEach(function(name){
    const sel=(cfg.closeDevices||[]).includes(name);
    html+='<div class="mt-set-chip'+(sel?' selected':'')+'" onclick="MT_cfgToggleDevice(\'close\',this)" data-name="'+name.replace(/"/g,'&quot;')+'">'+name+'</div>';
  });
  if(!equipList.length) html+='<span style="font-size:12px;color:var(--text4)">暂无设备，请先在概览页添加</span>';
  html+='</div></div>';

  // Restore devices
  html+='<div class="mt-set-section"><div class="mt-set-label">换水后需恢复设备（默认同关闭列表）</div>';
  html+='<div class="mt-set-list">';
  equipList.forEach(function(name){
    const restoreList=(cfg.restoreDevices&&cfg.restoreDevices.length)?cfg.restoreDevices:(cfg.closeDevices||[]);
    const sel=restoreList.includes(name);
    html+='<div class="mt-set-chip'+(sel?' selected':'')+'" onclick="MT_cfgToggleDevice(\'restore\',this)" data-name="'+name.replace(/"/g,'&quot;')+'">'+name+'</div>';
  });
  if(!equipList.length) html+='<span style="font-size:12px;color:var(--text4)">暂无设备</span>';
  html+='</div></div>';

  // Maint items
  html+='<div class="mt-set-section"><div class="mt-set-label">设备维护项目（换水时顺便清洁/更换）</div>';
  html+='<div id="mtSetMaint">';
  (cfg.maintDevices||[]).forEach(function(name,i){
    html+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><input style="flex:1;background:var(--input-bg);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:6px;font-size:12px" value="'+name+'" onchange="MT_cfgSetMaintName('+i+',this.value)"><button style="border:none;background:none;color:var(--text4);cursor:pointer;font-size:14px" onclick="MT_cfgRemoveMaint('+i+')">✕</button></div>';
  });
  html+='<button class="mt-btn mt-btn-ghost" style="margin-top:6px;font-size:11px;padding:4px 10px" onclick="MT_cfgAddMaint()">+ 添加</button>';
  html+='</div></div>';

  html+='<div class="mt-actions" style="justify-content:flex-end"><button class="mt-btn mt-btn-primary" onclick="MT_closeSettings()">完成</button></div>';
  html+='</div></div>';

  document.body.insertAdjacentHTML('beforeend',html);
  const overlay=document.getElementById('mtSettingsOverlay');
  const escFn=function(e){if(e.key==='Escape'){MT_closeSettings();document.removeEventListener('keydown',escFn);}};
  document.addEventListener('keydown',escFn);
}

function MT_closeSettings(){
  const el=document.getElementById('mtSettingsOverlay');
  if(el)el.remove();
  MT_render();
}

function MT_cfgToggleDevice(type,el){
  const name=el.dataset.name;
  const cfg=MT_loadCfg();
  const key=type==='close'?'closeDevices':'restoreDevices';
  if(!cfg[key])cfg[key]=[];
  const idx=cfg[key].indexOf(name);
  if(idx>=0){cfg[key].splice(idx,1);el.classList.remove('selected');}
  else{cfg[key].push(name);el.classList.add('selected');}
  MT_saveCfg(cfg);
}

function MT_cfgAddSupply(){
  const cfg=MT_loadCfg();
  cfg.supplyChecks.push('新检查项');
  MT_saveCfg(cfg);
  MT_closeSettings();MT_openSettings();
}
function MT_cfgRemoveSupply(i){
  const cfg=MT_loadCfg();
  cfg.supplyChecks.splice(i,1);
  MT_saveCfg(cfg);
  MT_closeSettings();MT_openSettings();
}
function MT_cfgSetSupplyName(i,val){
  const cfg=MT_loadCfg();
  cfg.supplyChecks[i]=val;
  MT_saveCfg(cfg);
}

function MT_cfgAddMaint(){
  const cfg=MT_loadCfg();
  if(!cfg.maintDevices)cfg.maintDevices=[];
  cfg.maintDevices.push('清洗蛋分');
  MT_saveCfg(cfg);
  MT_closeSettings();MT_openSettings();
}
function MT_cfgRemoveMaint(i){
  const cfg=MT_loadCfg();
  cfg.maintDevices.splice(i,1);
  MT_saveCfg(cfg);
  MT_closeSettings();MT_openSettings();
}
function MT_cfgSetMaintName(i,val){
  const cfg=MT_loadCfg();
  cfg.maintDevices[i]=val;
  MT_saveCfg(cfg);
}

/* --- History modal --- */
function MT_openHistory(){
  const log=MT_loadLog();
  let html='<div class="mt-settings-overlay open" id="mtHistoryOverlay" onclick="if(event.target===this)MT_closeHistory()">';
  html+='<div class="mt-settings-box">';
  html+='<h4>📋 维护历史</h4>';
  if(!log.length){
    html+='<p style="font-size:13px;color:var(--text4)">暂无维护记录</p>';
  }else{
    html+='<div class="mt-history-list">';
    log.slice().reverse().forEach(function(entry){
      html+='<div class="mt-history-item">';
      html+='<div class="mt-h-date">'+entry.date+'</div>';
      var details=[];
      if(entry.vol) details.push('换水 '+entry.vol+'L');
      if(entry.testData){
        var tests=Object.entries(entry.testData).filter(function(p){return p[1];}).map(function(p){return p[0].toUpperCase()+': '+p[1];});
        if(tests.length) details.push('水质 '+tests.join(' / '));
      }
      if(entry.maintDone&&entry.maintDone.length) details.push('维护 '+entry.maintDone.join('、'));
      if(entry.note) details.push('备注：'+entry.note);
      html+='<div class="mt-h-detail">'+details.join('<br>')+'</div>';
      html+='</div>';
    });
    html+='</div>';
  }
  html+='<div class="mt-actions" style="justify-content:flex-end;margin-top:16px"><button class="mt-btn mt-btn-ghost" onclick="MT_closeHistory()">关闭</button></div>';
  html+='</div></div>';
  document.body.insertAdjacentHTML('beforeend',html);
  const escFn=function(e){if(e.key==='Escape'){MT_closeHistory();document.removeEventListener('keydown',escFn);}};
  document.addEventListener('keydown',escFn);
}
function MT_closeHistory(){
  const el=document.getElementById('mtHistoryOverlay');
  if(el)el.remove();
}
