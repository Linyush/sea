/* ============================================================
   MAINTENANCE SOP MODULE - Modal Wizard
   ============================================================ */
function MT_CFG_SK(){return 'reef_'+_activeTank+'_maintain_cfg';}
function MT_LOG_SK(){return 'reef_'+_activeTank+'_maintain_log';}

function MT_loadCfg(){
  const s=_g(MT_CFG_SK());
  if(s){try{return JSON.parse(s);}catch(e){}}
  return {supplyChecks:['ATO 储水桶','KH 滴定液','Ca 滴定液','Mg 滴定液'],switchDevices:[],maintDevices:[]};
}
function MT_saveCfg(cfg){_s(MT_CFG_SK(),JSON.stringify(cfg));}

function MT_loadLog(){
  const s=_g(MT_LOG_SK());
  if(s){try{return JSON.parse(s);}catch(e){}}
  return [];
}
function MT_saveLog(log){_s(MT_LOG_SK(),JSON.stringify(log));}

/* --- Build dynamic steps based on config --- */
function MT_buildSteps(){
  const cfg=MT_loadCfg();
  const steps=[];
  steps.push({id:'supply',title:'余量确认',type:'multi'});
  steps.push({id:'calc',title:'换水计算',type:'single'});
  steps.push({id:'test',title:'水质检测',type:'single'});
  if(cfg.switchDevices&&cfg.switchDevices.length){
    steps.push({id:'close',title:'设备关闭',type:'multi'});
  }
  steps.push({id:'exec',title:'执行换水',type:'single'});
  if(cfg.maintDevices&&cfg.maintDevices.length){
    steps.push({id:'maint',title:'设备维护',type:'multi'});
  }
  if(cfg.switchDevices&&cfg.switchDevices.length){
    steps.push({id:'restore',title:'设备恢复',type:'multi'});
  }
  return steps;
}

/* --- Session state --- */
let _mt={steps:[],stepIdx:0,subIdx:0,supply:{},testData:{},closeDone:[],execVol:'',execNote:'',maintDone:[],restoreDone:[],calcVol:''};

function MT_resetSession(){
  _mt={steps:MT_buildSteps(),stepIdx:0,subIdx:0,supply:{},testData:{},closeDone:[],execVol:'',execNote:'',maintDone:[],restoreDone:[],calcVol:''};
}

/* --- Open/Close wizard modal --- */
function MT_startWizard(){
  MT_resetSession();
  const html='<div class="mt-wizard-overlay" id="mtWizardOverlay"><div class="mt-wizard-box"><div class="mt-wiz-header" id="mtWizHeader"></div><div class="mt-wiz-body" id="mtWizBody"></div><div class="mt-wiz-footer" id="mtWizFooter"></div></div></div>';
  document.body.insertAdjacentHTML('beforeend',html);
  const overlay=document.getElementById('mtWizardOverlay');
  overlay.addEventListener('click',function(e){if(e.target===overlay)MT_tryClose();});
  document.addEventListener('keydown',MT_escHandler);
  MT_renderWizard();
}

function MT_escHandler(e){if(e.key==='Escape')MT_tryClose();}

function MT_tryClose(){
  if(_mt.stepIdx>0){
    if(!confirm('维护未完成，确认退出？'))return;
  }
  MT_closeWizard();
}

function MT_closeWizard(){
  const el=document.getElementById('mtWizardOverlay');
  if(el)el.remove();
  document.removeEventListener('keydown',MT_escHandler);
}

/* --- Render wizard --- */
function MT_renderWizard(){
  const step=_mt.steps[_mt.stepIdx];
  if(!step){MT_finishWizard();return;}
  const total=_mt.steps.length;

  // Header with progress
  const header=document.getElementById('mtWizHeader');
  header.innerHTML='<div class="mt-wiz-progress"><span class="mt-wiz-step-num">'+(_mt.stepIdx+1)+'/'+total+'</span><span class="mt-wiz-step-title">'+step.title+'</span></div><button class="mt-wiz-close" onclick="MT_tryClose()">✕</button>';

  // Body
  const body=document.getElementById('mtWizBody');
  body.innerHTML=MT_renderStepContent(step);

  // Footer
  const footer=document.getElementById('mtWizFooter');
  if(step.type==='multi'){
    const items=MT_getMultiItems(step.id);
    const allDone=MT_allSubDone(step.id);
    footer.innerHTML='<button class="mt-btn mt-btn-ghost" onclick="MT_confirmAll()">全部确认</button><button class="mt-btn mt-btn-primary'+(allDone?'':' disabled')+'" onclick="MT_nextStep()"'+(allDone?'':' disabled')+'>下一步 →</button>';
  }else{
    footer.innerHTML='<button class="mt-btn mt-btn-primary" onclick="MT_nextStep()">确认 →</button>';
  }
}

/* --- Multi-item helpers --- */
function MT_getMultiItems(stepId){
  const cfg=MT_loadCfg();
  switch(stepId){
    case 'supply': return cfg.supplyChecks||[];
    case 'close': return (cfg.switchDevices||[]).map(function(n){return '关闭 '+n;});
    case 'restore': return (cfg.switchDevices||[]).map(function(n){return '开启 '+n;});
    case 'maint': return cfg.maintDevices||[];
    default: return [];
  }
}

function MT_getSubDoneArr(stepId){
  switch(stepId){
    case 'supply': return null; // supply uses supply obj
    case 'close': return _mt.closeDone;
    case 'restore': return _mt.restoreDone;
    case 'maint': return _mt.maintDone;
    default: return [];
  }
}

function MT_allSubDone(stepId){
  const items=MT_getMultiItems(stepId);
  if(stepId==='supply'){
    return items.every(function(_,i){return _mt.supply[i];});
  }
  const arr=MT_getSubDoneArr(stepId);
  return arr.length>=items.length;
}

/* --- Step content rendering --- */
function MT_renderStepContent(step){
  switch(step.id){
    case 'supply': return MT_renderWizSupply();
    case 'calc': return MT_renderWizCalc();
    case 'test': return MT_renderWizTest();
    case 'close': return MT_renderWizChecklist('close');
    case 'exec': return MT_renderWizExec();
    case 'maint': return MT_renderWizChecklist('maint');
    case 'restore': return MT_renderWizChecklist('restore');
    default: return '';
  }
}

/* Supply */
function MT_renderWizSupply(){
  const cfg=MT_loadCfg();
  const items=cfg.supplyChecks||[];
  if(!items.length) return '<p style="font-size:13px;color:var(--text4)">未配置检查项</p>';
  let html='<div class="mt-supply-list">';
  items.forEach(function(name,i){
    const st=_mt.supply[i]||'';
    const isCurrent=!st&&!items.slice(0,i).some(function(_,j){return !_mt.supply[j];})===false;
    const isNext=!st&&items.slice(0,i).every(function(_,j){return _mt.supply[j];});
    const cls='mt-supply-row'+(isNext?' mt-highlight':'');
    html+='<div class="'+cls+'">';
    html+='<span class="mt-supply-name">'+name+'</span>';
    html+='<div class="mt-supply-btns">';
    html+='<button class="mt-supply-btn'+(st==='ok'?' active-ok':'')+'" onclick="MT_setSupply('+i+',\'ok\')">✅ 充足</button>';
    html+='<button class="mt-supply-btn'+(st==='warn'?' active-warn':'')+'" onclick="MT_setSupply('+i+',\'warn\')">⚠️ 需补充</button>';
    html+='</div></div>';
  });
  html+='</div>';
  return html;
}

function MT_setSupply(i,val){
  _mt.supply[i]=val;
  MT_renderWizard();
}

/* Calc */
function MT_renderWizCalc(){
  const tank=TK_current();
  const csk='reef_'+_activeTank+'_change_v1';
  let saved={};try{saved=JSON.parse(_g(csk))||{};}catch(e){}
  const tankTotal=saved.tankTotal||tank.volume||70;
  const salinity=saved.salinity||'35';
  const sg=saved.sg||(1+parseFloat(salinity)*0.000753).toFixed(3);
  const waterVol=saved.waterVolume||'12';
  const roomTemp=saved.roomTemp||'25';
  const adjTemp=saved.adjTemp||'2';
  const targetTemp=saved.targetTemp||'25';

  let html='<div class="mt-calc-section">';
  html+='<div class="config-row">';
  html+='<div class="config-item"><label>🐠 缸水体</label><input type="number" id="mtTankTotal" value="'+tankTotal+'" step="1" oninput="MT_calc()"><span class="unit">L</span></div>';
  html+='<div class="config-item"><label>🧂 盐度</label><input type="number" id="mtSalinity" value="'+salinity+'" step="0.5" oninput="MT_salFromPPT()"><span class="unit">‰</span>';
  html+='<span class="unit" style="margin:0 2px;color:var(--text5)">/</span>';
  html+='<input type="number" id="mtSG" value="'+sg+'" step="0.001" oninput="MT_salFromSG()" style="width:64px"><span class="unit">SG</span></div>';
  html+='</div>';
  html+='<div class="input-row" style="margin-top:12px">';
  html+='<div class="input-group"><label>换水量 <span class="unit">(L)</span></label><input type="number" id="mtWaterVol" value="'+waterVol+'" step="1" oninput="MT_calc()"></div>';
  html+='<div class="input-group"><label>室内温度 <span class="unit">(°C)</span></label><input type="number" id="mtRoomTemp" value="'+roomTemp+'" step="0.5" oninput="MT_calc()"></div>';
  html+='<div class="input-group"><label>调温水温度 <span class="unit">(°C)</span></label><input type="number" id="mtAdjTemp" value="'+adjTemp+'" step="0.5" oninput="MT_calc()"></div>';
  html+='<div class="input-group"><label>目标温度 <span class="unit">(°C)</span></label><input type="number" id="mtTargetTemp" value="'+targetTemp+'" step="0.5" oninput="MT_calc()"></div>';
  html+='</div>';
  html+='<div class="sep"></div>';
  html+='<div class="result-row" id="mtCalcResults">'+MT_calcHTML(parseFloat(waterVol),parseFloat(tankTotal),parseFloat(salinity),parseFloat(roomTemp),parseFloat(adjTemp),parseFloat(targetTemp))+'</div>';
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
  _mt.calcVol=String(vol);

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
  html+='<div class="result-card rc-purple"><div class="r-icon">📐</div><div class="r-label">比例</div><div class="r-value">'+ratio.toFixed(1)+'<span class="r-unit">%</span></div></div>';
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
}

/* Test */
function MT_renderWizTest(){
  const wsk='reef_'+_activeTank+'_water_v10';
  let wData;try{wData=JSON.parse(_g(wsk))||{};}catch(e){wData={};}
  const wFields=wData.fields||[{key:'kh',name:'KH'},{key:'ca',name:'Ca'},{key:'mg',name:'Mg'},{key:'no3',name:'NO3'},{key:'po4',name:'PO4'}];
  let html='<div class="mt-test-grid">';
  html+='<div class="mt-test-item"><label>日期</label><input type="date" id="mtTestDate" value="'+new Date().toISOString().slice(0,10)+'"></div>';
  wFields.forEach(function(f){
    const val=_mt.testData[f.key]||'';
    html+='<div class="mt-test-item"><label>'+f.name+'</label><input type="number" step="any" id="mtTest_'+f.key+'" value="'+val+'" placeholder="-" onchange="MT_saveTestVal(\''+f.key+'\',this.value)"></div>';
  });
  html+='</div>';
  return html;
}
function MT_saveTestVal(key,val){_mt.testData[key]=val;}

/* Checklist (close/maint/restore) */
function MT_renderWizChecklist(stepId){
  const items=MT_getMultiItems(stepId);
  const arr=MT_getSubDoneArr(stepId);
  // Find first unchecked
  let firstUnchecked=-1;
  for(var i=0;i<items.length;i++){if(!arr.includes(i)){firstUnchecked=i;break;}}

  let html='<ul class="mt-checklist">';
  items.forEach(function(name,i){
    const ck=arr.includes(i);
    const highlight=(!ck&&i===firstUnchecked);
    html+='<li class="'+(ck?'checked':'')+(highlight?' mt-highlight':'')+'" onclick="MT_confirmItem(\''+stepId+'\','+i+')"><div class="mt-ck">✓</div><span class="mt-ck-label">'+name+'</span></li>';
  });
  html+='</ul>';
  return html;
}

function MT_confirmItem(stepId,i){
  const arr=MT_getSubDoneArr(stepId);
  if(!arr.includes(i)) arr.push(i);
  MT_renderWizard();
}

/* Exec */
function MT_renderWizExec(){
  const vol=_mt.calcVol||'12';
  let html='<div class="mt-exec-row">';
  html+='<span style="font-size:13px;color:var(--text2)">实际换水量</span>';
  html+='<input type="number" id="mtExecVol" value="'+(_mt.execVol||vol)+'" onchange="_mt.execVol=this.value">';
  html+='<span class="unit">L</span>';
  html+='</div>';
  html+='<div class="mt-note"><textarea id="mtExecNote" placeholder="备注（选填）" onchange="_mt.execNote=this.value">'+(_mt.execNote||'')+'</textarea></div>';
  return html;
}

/* --- Navigation --- */
function MT_nextStep(){
  const step=_mt.steps[_mt.stepIdx];
  // For multi: check all done
  if(step&&step.type==='multi'&&!MT_allSubDone(step.id))return;
  _mt.stepIdx++;
  _mt.subIdx=0;
  MT_renderWizard();
}

function MT_confirmAll(){
  const step=_mt.steps[_mt.stepIdx];
  if(!step)return;
  const items=MT_getMultiItems(step.id);
  if(step.id==='supply'){
    items.forEach(function(_,i){if(!_mt.supply[i])_mt.supply[i]='ok';});
  }else{
    const arr=MT_getSubDoneArr(step.id);
    items.forEach(function(_,i){if(!arr.includes(i))arr.push(i);});
  }
  MT_renderWizard();
}

/* --- Finish --- */
function MT_finishWizard(){
  const log=MT_loadLog();
  const dateEl=document.getElementById('mtTestDate');
  const date=dateEl?dateEl.value:new Date().toISOString().slice(0,10);
  const cfg=MT_loadCfg();

  const entry={
    date:date,
    vol:_mt.execVol||_mt.calcVol||'',
    supply:Object.assign({},_mt.supply),
    testData:Object.assign({},_mt.testData),
    maintDone:(_mt.maintDone||[]).map(function(i){return (cfg.maintDevices||[])[i];}).filter(Boolean),
    note:_mt.execNote||''
  };
  log.push(entry);
  MT_saveLog(log);
  MT_syncWaterData(entry,date);
  MT_closeWizard();
  toast('维护完成 ✅');
  if(typeof renderProfile==='function') renderProfile();
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

/* --- Delete log entry --- */
function MT_deleteLogEntry(idx){
  const log=MT_loadLog();
  if(idx<0||idx>=log.length)return;
  const entry=log[idx];
  if(entry.date&&entry.testData&&Object.keys(entry.testData).some(function(k){return entry.testData[k];})){
    const wsk='reef_'+_activeTank+'_water_v10';
    let wData;try{wData=JSON.parse(_g(wsk))||{};}catch(e){wData={};}
    if(wData.rows){
      const rowIdx=wData.rows.findIndex(function(r){return r.date===entry.date;});
      if(rowIdx>=0){
        const row=wData.rows[rowIdx];
        let match=true;
        for(var k in entry.testData){
          if(entry.testData[k]){
            const ev=parseFloat(entry.testData[k]),rv=parseFloat(row[k]);
            if(!isNaN(ev)&&!isNaN(rv)&&Math.abs(ev-rv)>0.001){match=false;break;}
          }
        }
        if(match){wData.rows.splice(rowIdx,1);_s(wsk,JSON.stringify(wData));}
      }
    }
  }
  log.splice(idx,1);
  MT_saveLog(log);
  toast('已删除');
  MT_closeHistory();
  MT_openHistory();
  if(typeof renderProfile==='function') renderProfile();
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
    log.slice().reverse().forEach(function(entry,ri){
      const realIdx=log.length-1-ri;
      html+='<div class="mt-history-item">';
      html+='<div style="display:flex;align-items:center;justify-content:space-between"><div class="mt-h-date">'+entry.date+'</div><button class="mt-btn-del-sm" onclick="if(confirm(\'确认删除 '+entry.date+' 的记录？对应水质数据也会清除。\'))MT_deleteLogEntry('+realIdx+')">删除</button></div>';
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

/* --- Settings modal --- */
function MT_openSettings(){
  const cfg=MT_loadCfg();
  const inv=P_loadInv();
  const equipList=(inv.equipment||[]).filter(function(e){return !['broken','sold'].includes(e.status);}).map(function(e){return e.name;});

  let html='<div class="mt-settings-overlay open" id="mtSettingsOverlay" onclick="if(event.target===this)MT_closeSettings()">';
  html+='<div class="mt-settings-box">';
  html+='<h4>⚙️ 维护设置</h4>';

  // Supply checks
  html+='<div class="mt-set-section"><div class="mt-set-label">余量检查项</div><div id="mtSetSupply">';
  (cfg.supplyChecks||[]).forEach(function(name,i){
    html+='<div class="mt-set-row"><input class="mt-set-input" value="'+name+'" onchange="MT_cfgSetSupplyName('+i+',this.value)"><button class="mt-set-del" onclick="MT_cfgRemoveSupply('+i+')">✕</button></div>';
  });
  html+='<button class="mt-set-add" onclick="MT_cfgAddSupply()">+ 添加检查项</button>';
  html+='</div></div>';

  // Switch devices (merged close + restore)
  html+='<div class="mt-set-section"><div class="mt-set-label">开关设备（换水前关闭、换水后开启）</div>';
  html+='<div class="mt-set-chips" id="mtSetSwitch">';
  (cfg.switchDevices||[]).forEach(function(name,i){
    html+='<span class="mt-set-chip-item">'+name+'<button class="mt-chip-del" onclick="MT_cfgRemoveSwitch('+i+')">✕</button></span>';
  });
  // Add button with dropdown
  html+='<button class="mt-set-add-chip" onclick="MT_cfgShowSwitchPicker(this)">+</button>';
  html+='</div>';
  // Hidden picker
  html+='<div class="mt-set-picker" id="mtSwitchPicker" style="display:none">';
  const currentSwitch=cfg.switchDevices||[];
  equipList.filter(function(n){return !currentSwitch.includes(n);}).forEach(function(name){
    html+='<div class="mt-pick-item" onclick="MT_cfgAddSwitch(\''+name.replace(/'/g,"\\'")+'\')">'+name+'</div>';
  });
  if(equipList.filter(function(n){return !currentSwitch.includes(n);}).length===0){
    html+='<div class="mt-pick-empty">无更多设备</div>';
  }
  html+='</div></div>';

  // Maint devices
  html+='<div class="mt-set-section"><div class="mt-set-label">维护项目（换水时顺便清洁/更换）</div><div id="mtSetMaint">';
  (cfg.maintDevices||[]).forEach(function(name,i){
    html+='<div class="mt-set-row"><input class="mt-set-input" value="'+name+'" onchange="MT_cfgSetMaintName('+i+',this.value)"><button class="mt-set-del" onclick="MT_cfgRemoveMaint('+i+')">✕</button></div>';
  });
  html+='<button class="mt-set-add" onclick="MT_cfgAddMaint()">+ 添加维护项</button>';
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
  if(typeof renderProfile==='function') renderProfile();
}

function MT_cfgShowSwitchPicker(btn){
  const picker=document.getElementById('mtSwitchPicker');
  if(picker) picker.style.display=picker.style.display==='none'?'flex':'none';
}

function MT_cfgAddSwitch(name){
  const cfg=MT_loadCfg();
  if(!cfg.switchDevices)cfg.switchDevices=[];
  if(!cfg.switchDevices.includes(name))cfg.switchDevices.push(name);
  MT_saveCfg(cfg);
  MT_closeSettings();MT_openSettings();
}
function MT_cfgRemoveSwitch(i){
  const cfg=MT_loadCfg();
  cfg.switchDevices.splice(i,1);
  MT_saveCfg(cfg);
  MT_closeSettings();MT_openSettings();
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

/* --- Format days for profile display --- */
function MT_fmtDaysAgo(dateStr){
  const today=new Date();today.setHours(0,0,0,0);
  const d=new Date(dateStr+'T00:00:00');
  const days=Math.floor((today-d)/86400000);
  if(days===0) return '今天';
  if(days===1) return '昨天';
  return days+'天前';
}
