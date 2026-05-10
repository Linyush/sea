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
  _mtState={step:0,supply:{},testData:{},closeDone:[],execVol:'',execNote:'',maintDone:[],restoreDone:[],done:false};
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
  if(lastLog) html+='上次维护：<strong>'+MT_fmtDaysAgo(lastLog.date)+'</strong>';
  else html+='<span style="color:var(--text5)">暂无维护记录</span>';
  html+='</div>';
  html+='<div class="mt-top-btns">';
  html+='<button class="mt-top-btn" onclick="MT_openHistory()">📋 历史</button>';
  html+='<button class="mt-top-btn" onclick="MT_openSettings()">⚙️ 设置</button>';
  html+='</div></div>';

  // Steps config
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

  // Fixed bottom action bar
  html+='<div class="mt-fixed-bar">';
  if(_mtState.done){
    html+='<button class="mt-btn mt-btn-primary" onclick="MT_finish()">✅ 提交维护记录</button>';
    html+='<button class="mt-btn mt-btn-ghost" onclick="MT_resetAndRender()">重新开始</button>';
  }else{
    const stepName=steps[_mtState.step]?steps[_mtState.step].title:'';
    html+='<span class="mt-bar-info">'+(_mtState.step+1)+'/7 '+stepName+'</span>';
    html+='<button class="mt-btn mt-btn-ghost" onclick="MT_skip()">跳过</button>';
    html+='<button class="mt-btn mt-btn-primary" onclick="MT_next()">确认 →</button>';
  }
  html+='</div>';

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

/* --- Format days ago --- */
function MT_fmtDaysAgo(dateStr){
  const today=new Date();today.setHours(0,0,0,0);
  const d=new Date(dateStr+'T00:00:00');
  const days=Math.floor((today-d)/86400000);
  if(days===0) return '今天';
  if(days===1) return '昨天';
  return days+'天前';
}

/* --- Step 1: Supply check --- */
function MT_renderSupply(cfg){
  const items=cfg.supplyChecks||[];
  if(!items.length) return '<p style="font-size:12px;color:var(--text4)">未配置检查项，请前往设置添加</p>';
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
  return html;
}

/* --- Step 2: Calc (full version matching original) --- */
function MT_renderCalc(){
  const tank=TK_current();
  const csk=C_SK();
  let saved={};try{saved=JSON.parse(_g(csk))||{};}catch(e){}
  const tankTotal=saved.tankTotal||tank.volume||70;
  const salinity=saved.salinity||'35';
  const sg=saved.sg||(1+parseFloat(salinity)*0.000753).toFixed(3);
  const waterVol=saved.waterVolume||'12';
  const roomTemp=saved.roomTemp||'25';
  const adjTemp=saved.adjTemp||'2';
  const targetTemp=saved.targetTemp||'25';

  let html='<div class="mt-calc-section">';
  // Config row
  html+='<div class="config-row">';
  html+='<div class="config-item"><label>🐠 缸总水体</label><input type="number" id="mtTankTotal" value="'+tankTotal+'" step="1" oninput="MT_calc()"><span class="unit">L</span></div>';
  html+='<div class="config-item"><label>🧂 盐度</label><input type="number" id="mtSalinity" value="'+salinity+'" step="0.5" oninput="MT_salFromPPT()"><span class="unit">‰</span>';
  html+='<span class="unit" style="margin:0 2px;color:var(--text5)">/</span>';
  html+='<input type="number" id="mtSG" value="'+sg+'" step="0.001" oninput="MT_salFromSG()" style="width:64px"><span class="unit">SG</span></div>';
  html+='</div>';
  // Input row
  html+='<div class="sec-label" style="margin-top:14px">📝 本次换水参数</div>';
  html+='<div class="input-row">';
  html+='<div class="input-group"><label>换水量 <span class="unit">(L)</span></label><input type="number" id="mtWaterVol" value="'+waterVol+'" step="1" oninput="MT_calc()"></div>';
  html+='<div class="input-group"><label>室内温度 <span class="unit">(°C)</span></label><input type="number" id="mtRoomTemp" value="'+roomTemp+'" step="0.5" oninput="MT_calc()"></div>';
  html+='<div class="input-group"><label>调温水温度 <span class="unit">(°C)</span></label><input type="number" id="mtAdjTemp" value="'+adjTemp+'" step="0.5" oninput="MT_calc()"></div>';
  html+='<div class="input-group"><label>目标温度 <span class="unit">(°C)</span></label><input type="number" id="mtTargetTemp" value="'+targetTemp+'" step="0.5" oninput="MT_calc()"></div>';
  html+='</div>';
  // Results
  html+='<div class="sep"></div>';
  html+='<div class="sec-label">📊 计算结果</div>';
  html+='<div class="result-row" id="mtCalcResults">'+MT_calcHTML(parseFloat(waterVol),parseFloat(tankTotal),parseFloat(salinity),parseFloat(roomTemp),parseFloat(adjTemp),parseFloat(targetTemp))+'</div>';
  html+='<div class="tip"><strong>💡 说明</strong>　室温水与调温水（热水/冰水）混合达到目标温度</div>';
  html+='</div>';
  return html;
}

function MT_calcHTML(vol,tankTotal,salinity,roomT,adjT,targetT){
  let roomW,adjW;
  const denom=adjT-roomT;
  if(Math.abs(denom)<0.01){roomW=vol;adjW=0;}
  else{roomW=vol*(adjT-targetT)/denom;adjW=vol-roomW;}
  const impossible=roomW<-0.01||adjW<-0.01;
  roomW=Math.max(0,roomW);adjW=Math.max(0,adjW);
  const salt=vol*salinity;
  const ratio=tankTotal>0?(vol/tankTotal*100):0;

  let html='';
  html+='<div class="result-card rc-blue"><div class="r-icon">🚰</div><div class="r-label">室温水</div><div class="r-value">';
  if(impossible) html+='<span class="result-warn">⚠️</span>';
  else html+=MT_cfmt(roomW)+'<span class="r-unit">L</span>';
  html+='</div></div>';
  html+='<div class="result-card rc-orange"><div class="r-icon">🌡️</div><div class="r-label">调温水</div><div class="r-value">';
  if(impossible) html+='<span class="result-warn">⚠️</span>';
  else html+=MT_cfmt(adjW)+'<span class="r-unit">L</span>';
  html+='</div></div>';
  html+='<div class="result-card rc-green"><div class="r-icon">🧂</div><div class="r-label">盐量</div><div class="r-value">'+Math.round(salt)+'<span class="r-unit">g</span></div></div>';
  html+='<div class="result-card rc-purple"><div class="r-icon">📐</div><div class="r-label">换水比例</div><div class="r-value">'+ratio.toFixed(1)+'<span class="r-unit">%</span></div></div>';
  return html;
}
function MT_cfmt(v){return v%1===0?String(v):v.toFixed(1);}

function MT_salFromPPT(){
  const ppt=parseFloat(document.getElementById('mtSalinity').value)||0;
  document.getElementById('mtSG').value=(1+ppt*0.000753).toFixed(3);
  MT_calc();
}
function MT_salFromSG(){
  const sg=parseFloat(document.getElementById('mtSG').value)||1;
  document.getElementById('mtSalinity').value=Math.round((sg-1)/0.000753*10)/10;
  MT_calc();
}
function MT_calc(){
  const vol=parseFloat(document.getElementById('mtWaterVol').value)||0;
  const tankTotal=parseFloat(document.getElementById('mtTankTotal').value)||70;
  const salinity=parseFloat(document.getElementById('mtSalinity').value)||35;
  const roomT=parseFloat(document.getElementById('mtRoomTemp').value)||25;
  const adjT=parseFloat(document.getElementById('mtAdjTemp').value)||0;
  const targetT=parseFloat(document.getElementById('mtTargetTemp').value)||25;
  const el=document.getElementById('mtCalcResults');
  if(el) el.innerHTML=MT_calcHTML(vol,tankTotal,salinity,roomT,adjT,targetT);
  _mtState.calcVol=String(vol);
}

/* --- Step 3: Water test --- */
function MT_renderTest(){
  const wsk='reef_'+_activeTank+'_water_v10';
  let wData;try{wData=JSON.parse(_g(wsk))||{};}catch(e){wData={};}
  const wFields=wData.fields||[{key:'kh',name:'KH'},{key:'ca',name:'Ca'},{key:'mg',name:'Mg'},{key:'no3',name:'NO3'},{key:'po4',name:'PO4'}];
  let html='<div class="mt-test-grid">';
  html+='<div class="mt-test-item"><label>日期</label><input type="date" id="mtTestDate" value="'+new Date().toISOString().slice(0,10)+'"></div>';
  wFields.forEach(function(f){
    const val=_mtState.testData[f.key]||'';
    html+='<div class="mt-test-item"><label>'+f.name+'</label><input type="number" step="any" id="mtTest_'+f.key+'" value="'+val+'" placeholder="-" onchange="MT_saveTest(\''+f.key+'\',this.value)"></div>';
  });
  html+='</div>';
  return html;
}
function MT_saveTest(key,val){_mtState.testData[key]=val;}

/* --- Step 4: Close devices --- */
function MT_renderClose(cfg){
  const items=cfg.closeDevices||[];
  if(!items.length) return '<p style="font-size:12px;color:var(--text4)">未配置需关闭的设备，请在设置中选择</p>';
  let html='<ul class="mt-checklist">';
  items.forEach(function(name,i){
    const ck=_mtState.closeDone.includes(i);
    html+='<li class="'+(ck?'checked':'')+'" onclick="MT_toggleCk(\'close\','+i+')"><div class="mt-ck">✓</div><span class="mt-ck-label">关闭 '+name+'</span></li>';
  });
  html+='</ul>';
  return html;
}

/* --- Step 5: Execute --- */
function MT_renderExec(){
  const vol=_mtState.calcVol||document.getElementById('mtWaterVol')?.value||'12';
  let html='<div class="mt-exec-row">';
  html+='<span style="font-size:13px;color:var(--text2)">实际换水量</span>';
  html+='<input type="number" id="mtExecVol" value="'+(_mtState.execVol||vol)+'" onchange="_mtState.execVol=this.value">';
  html+='<span class="unit">L</span>';
  html+='</div>';
  html+='<div class="mt-note"><textarea id="mtExecNote" placeholder="备注（选填，如：顺便吸了底砂）" onchange="_mtState.execNote=this.value">'+(_mtState.execNote||'')+'</textarea></div>';
  return html;
}

/* --- Step 6: Maintenance --- */
function MT_renderMaint(cfg){
  const items=cfg.maintDevices||[];
  if(!items.length) return '<p style="font-size:12px;color:var(--text4)">未配置维护项目，请在设置中添加</p>';
  let html='<ul class="mt-checklist">';
  items.forEach(function(name,i){
    const ck=_mtState.maintDone.includes(i);
    html+='<li class="'+(ck?'checked':'')+'" onclick="MT_toggleCk(\'maint\','+i+')"><div class="mt-ck">✓</div><span class="mt-ck-label">'+name+'</span></li>';
  });
  html+='</ul>';
  return html;
}

/* --- Step 7: Restore --- */
function MT_renderRestore(cfg){
  const items=(cfg.restoreDevices&&cfg.restoreDevices.length)?cfg.restoreDevices:(cfg.closeDevices||[]);
  if(!items.length) return '<p style="font-size:12px;color:var(--text4)">无需恢复的设备</p>';
  let html='<ul class="mt-checklist">';
  items.forEach(function(name,i){
    const ck=_mtState.restoreDone.includes(i);
    html+='<li class="'+(ck?'checked':'')+'" onclick="MT_toggleCk(\'restore\','+i+')"><div class="mt-ck">✓</div><span class="mt-ck-label">开启 '+name+'</span></li>';
  });
  html+='</ul>';
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

function MT_skip(){
  MT_next();
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
  const dateEl=document.getElementById('mtTestDate');
  const date=dateEl?dateEl.value:new Date().toISOString().slice(0,10);
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

/* --- Delete log entry + corresponding water row --- */
function MT_deleteLogEntry(idx){
  const log=MT_loadLog();
  if(idx<0||idx>=log.length)return;
  const entry=log[idx];

  // Remove corresponding water data row (only if date matches AND the test data matches)
  if(entry.date&&entry.testData&&Object.keys(entry.testData).some(function(k){return entry.testData[k];})){
    const wsk='reef_'+_activeTank+'_water_v10';
    let wData;try{wData=JSON.parse(_g(wsk))||{};}catch(e){wData={};}
    if(wData.rows){
      const rowIdx=wData.rows.findIndex(function(r){return r.date===entry.date;});
      if(rowIdx>=0){
        // Verify this row was created by this maintenance entry (check values match)
        const row=wData.rows[rowIdx];
        let match=true;
        for(var k in entry.testData){
          if(entry.testData[k]){
            const entryVal=parseFloat(entry.testData[k]);
            const rowVal=parseFloat(row[k]);
            if(!isNaN(entryVal)&&!isNaN(rowVal)&&Math.abs(entryVal-rowVal)>0.001){match=false;break;}
          }
        }
        if(match){
          wData.rows.splice(rowIdx,1);
          _s(wsk,JSON.stringify(wData));
        }
      }
    }
  }

  log.splice(idx,1);
  MT_saveLog(log);
  toast('已删除维护记录');
  MT_closeHistory();
  MT_openHistory();
  MT_render();
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

/* --- History modal (with delete) --- */
function MT_openHistory(){
  const log=MT_loadLog();
  let html='<div class="mt-settings-overlay open" id="mtHistoryOverlay" onclick="if(event.target===this)MT_closeHistory()">';
  html+='<div class="mt-settings-box">';
  html+='<h4>📋 维护历史</h4>';
  if(!log.length){
    html+='<p style="font-size:13px;color:var(--text4)">暂无维护记录</p>';
  }else{
    html+='<div class="mt-history-list">';
    log.slice().reverse().forEach(function(entry,ri){
      const realIdx=log.length-1-ri;
      html+='<div class="mt-history-item">';
      html+='<div style="display:flex;align-items:center;justify-content:space-between"><div class="mt-h-date">'+entry.date+'</div><button class="mt-btn-skip" style="color:var(--text4);font-size:11px" onclick="if(confirm(\'确认删除 '+entry.date+' 的维护记录？对应水质数据也会清除。\'))MT_deleteLogEntry('+realIdx+')">删除</button></div>';
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
