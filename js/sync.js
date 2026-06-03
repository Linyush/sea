/* ============================================================
   CLOUD BACKUP MODULE
   ============================================================ */
const SYNC_API='https://glata-dev-tools.bytedance.net/token';
const SYNC_ACCOUNT_KEY='reef_account';
const SYNC_PWD_KEY='reef_account_pwd';
const SYNC_AUTO_KEY='reef_auto_sync';
const SYNC_VERSION_KEY='reef_sync_version';
const SYNC_DIRTY_KEY='reef_sync_dirty';
const SYNC_TIME_KEY='reef_sync_time';
const SYNC_RETRY_MS=3*60*1000;
const SYNC_DEBOUNCE_MS=3000;
const SYNC_PULL_TIMEOUT=8000;

let _syncDebounce=null;
let _retryTimer=null;
let _syncStatus='idle'; // idle|synced|pushing|pulling|failed
let _syncMsg='';
let _syncBusy=false;
let _initDone=false;
function SYNC_setInitDone(){_initDone=true;}

/* --- Account --- */
function SYNC_getAccount(){return _g(SYNC_ACCOUNT_KEY);}
function SYNC_getPwd(){return _g(SYNC_PWD_KEY);}
function SYNC_setAccount(name,pwd){
  localStorage.setItem(SYNC_ACCOUNT_KEY,name);
  localStorage.setItem(SYNC_PWD_KEY,pwd);
  SYNC_updateIcon();
}

/* --- Auto-sync toggle --- */
function SYNC_isAuto(){return _g(SYNC_AUTO_KEY)==='1';}
function SYNC_setAuto(v){localStorage.setItem(SYNC_AUTO_KEY,v?'1':'0');}

/* --- Version & time --- */
function SYNC_getVersion(){return parseInt(_g(SYNC_VERSION_KEY))||0;}
function SYNC_setVersion(v){localStorage.setItem(SYNC_VERSION_KEY,String(v));}
function SYNC_bumpVersion(){const v=Date.now();SYNC_setVersion(v);return v;}
function SYNC_getTime(){return parseInt(_g(SYNC_TIME_KEY))||0;}
function SYNC_setTime(v){localStorage.setItem(SYNC_TIME_KEY,String(v));}

/* --- Collect / Apply --- */
const _SYNC_INTERNAL=new Set([SYNC_ACCOUNT_KEY,SYNC_PWD_KEY,SYNC_AUTO_KEY,SYNC_VERSION_KEY,SYNC_DIRTY_KEY,SYNC_TIME_KEY,'reef_active','reef_tanks','reef_theme']);
function SYNC_collectData(){
  const data={};
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k&&k.startsWith('reef_')&&!_SYNC_INTERNAL.has(k)){
      try{data[k]=JSON.parse(localStorage.getItem(k));}catch(e){data[k]=localStorage.getItem(k);}
    }
  }
  return data;
}
function SYNC_applyData(data){
  if(!data||typeof data!=='object')return;
  _syncBusy=true;
  try{
    const rm=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k&&k.startsWith('reef_')&&!_SYNC_INTERNAL.has(k)) rm.push(k);
    }
    rm.forEach(k=>localStorage.removeItem(k));
    for(const k in data){
      if(!k.startsWith('reef_')||_SYNC_INTERNAL.has(k))continue;
      const v=typeof data[k]==='string'?data[k]:JSON.stringify(data[k]);
      localStorage.setItem(k,v);
    }
  }finally{_syncBusy=false;}
}

/* --- Push --- */
async function SYNC_push(){
  if(!SYNC_getAccount())return;
  if(_syncStatus==='pushing')return;
  _setStatus('pushing','备份中...');
  const account=SYNC_getAccount(),pwd=SYNC_getPwd(),version=SYNC_getVersion(),data=SYNC_collectData();
  try{
    const resp=await fetch(SYNC_API+'?keyword='+encodeURIComponent(account),{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({version,data,pwd})
    });
    if(!resp.ok) throw new Error('HTTP '+resp.status);
    localStorage.removeItem(SYNC_DIRTY_KEY);
    SYNC_setTime(Date.now());
    _setStatus('synced','备份成功');
    _stopRetry();
  }catch(e){
    console.warn('[SYNC] push failed:',e);
    localStorage.setItem(SYNC_DIRTY_KEY,'1');
    _setStatus('failed','备份失败');
    _startRetry();
  }
}

/* --- Pull --- */
async function SYNC_pull(){
  if(!SYNC_getAccount())return null;
  const account=SYNC_getAccount();
  try{
    const ctrl=new AbortController();
    const tid=setTimeout(()=>ctrl.abort(),SYNC_PULL_TIMEOUT);
    const resp=await fetch(SYNC_API+'?keyword='+encodeURIComponent(account),{signal:ctrl.signal});
    clearTimeout(tid);
    if(!resp.ok) return null;
    const json=await resp.json();
    // API returns {code, data: "<json-string>"} — parse the inner data
    if(json&&json.code===0&&json.data){
      const inner=typeof json.data==='string'?JSON.parse(json.data):json.data;
      return inner;
    }
    // Fallback: maybe already flat
    if(json&&json.version) return json;
    return null;
  }catch(e){console.warn('[SYNC] pull failed:',e);return null;}
}

/* --- Auto pull on start (only if auto-sync is ON) --- */
async function SYNC_pullOnStart(){
  if(!SYNC_getAccount()||!SYNC_isAuto())return;
  _syncStatus='pulling';_syncMsg='拉取云端数据...';SYNC_refreshPanel();
  const remote=await SYNC_pull();
  if(!remote){_syncStatus='idle';_syncMsg='';SYNC_updateIcon();SYNC_refreshPanel();return;}
  if(remote.pwd){
    const localPwd=SYNC_getPwd();
    if(!localPwd){_setStatus('idle','');await SYNC_showLogin(remote);return;}
    if(localPwd!==remote.pwd){_setStatus('failed','密码错误');await SYNC_showLogin(remote);return;}
  }
  const remoteVer=remote.version||0,localVer=SYNC_getVersion();
  if(remoteVer>localVer&&remote.data){
    SYNC_applyData(remote.data);SYNC_setVersion(remoteVer);SYNC_setTime(remoteVer);
    _setStatus('synced','已恢复云端数据');
    setTimeout(()=>location.reload(),600);
    return;
  }
  if(remoteVer) SYNC_setTime(remoteVer);
  if(localStorage.getItem(SYNC_DIRTY_KEY)==='1') SYNC_push();
  else _setStatus('synced','已同步');
}

/* --- Mark dirty --- */
function SYNC_markDirty(){
  if(!SYNC_getAccount())return;
  SYNC_bumpVersion();
  localStorage.setItem(SYNC_DIRTY_KEY,'1');
  if(SYNC_isAuto()){
    if(_syncDebounce) clearTimeout(_syncDebounce);
    _syncDebounce=setTimeout(()=>{SYNC_push();},SYNC_DEBOUNCE_MS);
  }
}

/* --- Retry --- */
function _startRetry(){
  if(_retryTimer)return;
  _retryTimer=setInterval(()=>{
    if(localStorage.getItem(SYNC_DIRTY_KEY)==='1') SYNC_push();
    else _stopRetry();
  },SYNC_RETRY_MS);
}
function _stopRetry(){if(_retryTimer){clearInterval(_retryTimer);_retryTimer=null;}}

/* --- Status icon --- */
function _setStatus(status,msg){_syncStatus=status;_syncMsg=msg;SYNC_updateIcon();SYNC_refreshPanel();}
function SYNC_updateIcon(){
  const el=document.getElementById('avatarBtn');
  if(!el)return;
  el.className='avatar-btn';
  el.title=_syncMsg||'账号管理';
}

/* --- Cloud panel --- */
function SYNC_openPanel(){
  const ov=document.getElementById('cloudOverlay');
  if(!ov)return;
  ov.style.display='flex';
  requestAnimationFrame(()=>ov.classList.add('open'));
  SYNC_refreshPanel();
  if(SYNC_getAccount()) SYNC_fetchRemoteTime();
}
function SYNC_closePanel(){
  const ov=document.getElementById('cloudOverlay');
  if(ov){ov.classList.remove('open');setTimeout(()=>{ov.style.display='none';},300);}
}
async function SYNC_fetchRemoteTime(){
  const remote=await SYNC_pull();
  if(!remote)return;
  const t=remote.version||0;
  if(t>0){
    SYNC_setTime(t);
    const timeEl=document.getElementById('cloudLastTime');
    if(timeEl) timeEl.textContent=_fmtTime(t);
    // Also update dirty status
    SYNC_refreshPanel();
  }
}

function SYNC_refreshPanel(){
  const account=SYNC_getAccount();
  const autoOn=SYNC_isAuto();
  const lastTime=SYNC_getTime();
  const dirty=localStorage.getItem(SYNC_DIRTY_KEY)==='1';

  // Account: show display or form
  const dispEl=document.getElementById('cloudAccountDisplay');
  const formEl=document.getElementById('cloudAccountForm');
  const accEl=document.getElementById('cloudAccount');
  if(account){
    if(dispEl) dispEl.style.display='';
    if(formEl) formEl.style.display='none';
    if(accEl) accEl.textContent=account;
  }else{
    if(dispEl) dispEl.style.display='none';
    if(formEl) formEl.style.display='';
  }

  // Auto toggle
  const togEl=document.getElementById('cloudAutoToggle');
  if(togEl){togEl.checked=autoOn;togEl.onchange=function(){SYNC_setAuto(this.checked);SYNC_refreshPanel();};}

  // Last backup time
  const timeEl=document.getElementById('cloudLastTime');
  if(timeEl) timeEl.textContent=lastTime?_fmtTime(lastTime):'—';

  // Status with color
  const statusEl=document.getElementById('cloudStatus');
  if(statusEl){
    let s='',cls='';
    if(!account){s='未设置账号';cls='';}
    else if(_syncStatus==='pushing'){s='备份中...';cls='cloud-st-pushing';}
    else if(_syncStatus==='pulling'){s='恢复中...';cls='cloud-st-pulling';}
    else if(_syncStatus==='failed'){s='备份失败'+(dirty?' (待重试)':'');cls='cloud-st-failed';}
    else if(dirty){s='有未备份的修改';cls='cloud-st-dirty';}
    else if(_syncStatus==='synced'){s='已同步';cls='cloud-st-synced';}
    else{s='';cls='';}
    statusEl.textContent=s;
    statusEl.className='cloud-val '+cls;
  }

  // Button states
  const backupBtn=document.getElementById('cloudBackupBtn');
  const restoreBtn=document.getElementById('cloudRestoreBtn');
  if(backupBtn) backupBtn.disabled=!account||_syncStatus==='pushing';
  if(restoreBtn) restoreBtn.disabled=!account||_syncStatus==='pulling';
}

function _fmtTime(ts){
  if(!ts)return '—';
  const d=new Date(ts),pad=n=>(n+'').padStart(2,'0');
  return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
}

/* --- Manual backup / restore --- */
async function SYNC_manualBackup(){await SYNC_push();SYNC_refreshPanel();}
async function SYNC_manualRestore(){
  if(!SYNC_getAccount())return;
  _setStatus('pulling','恢复中...');
  const remote=await SYNC_pull();
  if(!remote){toast('无法连接云端');_setStatus('synced','');SYNC_refreshPanel();return;}
  if(remote.pwd){
    const localPwd=SYNC_getPwd();
    if(!localPwd||localPwd!==remote.pwd){_setStatus('synced','');SYNC_closePanel();await SYNC_showLogin(remote);return;}
  }
  if(!remote.data||!Object.keys(remote.data).length){toast('云端暂无数据');_setStatus('synced','');SYNC_refreshPanel();return;}
  const localVer=SYNC_getVersion(),remoteVer=remote.version||0;
  if(remoteVer<=localVer&&localVer>0){toast('本地数据已是最新');_setStatus('synced','');SYNC_refreshPanel();return;}
  sysConfirm('确定恢复云端数据？本地较新的数据将被覆盖。','恢复',async function(){
    SYNC_applyData(remote.data);SYNC_setVersion(remoteVer);SYNC_setTime(remoteVer);
    _setStatus('synced','已恢复');
    setTimeout(()=>location.reload(),600);
  });
  _setStatus('synced','');
  SYNC_refreshPanel();
}

/* --- Account management (inline) --- */
function SYNC_saveAccount(){
  const nameEl=document.getElementById('cloudNameInput');
  const pwdEl=document.getElementById('cloudPwdInput');
  const name=nameEl.value.trim(),pwd=pwdEl.value;
  if(!name){toast('请输入账号');return;}
  if(!pwd){toast('请设置密码');return;}
  SYNC_setAccount(name,MD5(pwd));
  nameEl.value='';pwdEl.value='';
  SYNC_refreshPanel();
  toast('账号设置成功');
}

function SYNC_switchAccount(){
  AF_open('switch');
}

function SYNC_changePwd(){
  AF_open('changepwd');
}

/* --- Account form modal (switch / change password) --- */
let _afMode='switch';
function AF_open(mode){
  _afMode=mode;
  const ov=document.getElementById('accountFormOverlay');
  if(!ov)return;
  const titleEl=document.getElementById('afTitle');
  const nameEl=document.getElementById('afNameInput');
  const pwdEl=document.getElementById('afPwdInput');
  if(mode==='switch'){
    titleEl.textContent='切换账号';
    nameEl.value='';nameEl.placeholder='新账号';nameEl.disabled=false;
    pwdEl.value='';pwdEl.placeholder='密码';
  }else{
    titleEl.textContent='修改密码';
    nameEl.value=SYNC_getAccount();nameEl.disabled=true;
    pwdEl.value='';pwdEl.placeholder='新密码';
  }
  ov.style.display='flex';
  requestAnimationFrame(()=>ov.classList.add('open'));
  if(mode==='switch') nameEl.focus(); else pwdEl.focus();
}
function AF_cancel(){
  const ov=document.getElementById('accountFormOverlay');
  if(ov){ov.classList.remove('open');setTimeout(()=>{ov.style.display='none';},300);}
}
function AF_confirm(){
  const nameEl=document.getElementById('afNameInput');
  const pwdEl=document.getElementById('afPwdInput');
  const name=nameEl.value.trim(),pwd=pwdEl.value;
  if(_afMode==='switch'){
    if(!name){toast('请输入账号');return;}
    if(!pwd){toast('请输入密码');return;}
    SYNC_setAccount(name,MD5(pwd));
    AF_cancel();
    SYNC_refreshPanel();
    toast('账号已切换');
  }else{
    if(!pwd){toast('请输入新密码');return;}
    localStorage.setItem(SYNC_PWD_KEY,MD5(pwd));
    AF_cancel();
    toast('密码已修改');
    SYNC_push();
  }
}

/* --- Login modal (password verify) --- */
let _loginRemote=null;
function SYNC_showLogin(remote){
  return new Promise(resolve=>{
    _loginRemote=remote;
    const ov=document.getElementById('syncLoginOverlay');
    if(!ov){resolve();return;}
    document.getElementById('syncLoginMsg').textContent='账号「'+SYNC_getAccount()+'」已有云端数据，请输入密码验证。';
    ov.style.display='flex';
    requestAnimationFrame(()=>ov.classList.add('open'));
    document.getElementById('syncLoginPwdInput').value='';
    document.getElementById('syncLoginPwdInput').focus();
    window._loginResolve=resolve;
  });
}
function SYNC_loginConfirm(){
  const pwd=document.getElementById('syncLoginPwdInput').value;
  if(!pwd){toast('请输入密码');return;}
  const md5=MD5(pwd);
  if(md5!==_loginRemote.pwd){toast('密码错误');document.getElementById('syncLoginPwdInput').value='';document.getElementById('syncLoginPwdInput').focus();return;}
  localStorage.setItem(SYNC_PWD_KEY,md5);
  const ov=document.getElementById('syncLoginOverlay');
  if(ov){ov.classList.remove('open');setTimeout(()=>{ov.style.display='none';},300);}
  const remote=_loginRemote;_loginRemote=null;
  if(remote.data){
    const remoteVer=remote.version||0,localVer=SYNC_getVersion();
    if(remoteVer>localVer){SYNC_applyData(remote.data);SYNC_setVersion(remoteVer);SYNC_setTime(remoteVer);_setStatus('synced','已恢复');setTimeout(()=>location.reload(),600);}
    else{_setStatus('synced','已同步');if(localStorage.getItem(SYNC_DIRTY_KEY)==='1') SYNC_push();}
  }
  SYNC_refreshPanel();
  if(window._loginResolve){window._loginResolve();window._loginResolve=null;}
}
function SYNC_loginCancel(){
  const ov=document.getElementById('syncLoginOverlay');
  if(ov){ov.classList.remove('open');setTimeout(()=>{ov.style.display='none';},300);}
  localStorage.removeItem(SYNC_ACCOUNT_KEY);localStorage.removeItem(SYNC_PWD_KEY);
  _loginRemote=null;_setStatus('idle','');
  SYNC_refreshPanel();
  if(window._loginResolve){window._loginResolve();window._loginResolve=null;}
}

/* --- Init --- */
function SYNC_init(){
  window._onDataChange=function(key){
    if(_syncBusy||!_initDone)return;
    if(key&&key.startsWith('reef_')&&!_SYNC_INTERNAL.has(key)){
      SYNC_markDirty();
    }
  };
  SYNC_updateIcon();
}
