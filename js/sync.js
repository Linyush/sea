/* ============================================================
   CLOUD BACKUP MODULE - Multi-Provider
   ============================================================ */
const SYNC_API='http://glata-dev-tools.bytedance.net/token';
const SYNC_DEFAULT_PROVIDER='glata'; // 'glata' 或 'qiniu'，切换同步后端改这里
const SYNC_ACCOUNT_KEY='reef_account';
const SYNC_PWD_KEY='reef_account_pwd';
const SYNC_VERSION_KEY='reef_sync_version';
const SYNC_DIRTY_KEY='reef_sync_dirty';
const SYNC_TIME_KEY='reef_sync_time';
const SYNC_RETRY_MS=3*60*1000;
const SYNC_PULL_TIMEOUT=8000;

/* 七牛云配置 */
const QINIU_AK='hM7c2ac1AvHVaEjFu2JjIrLMIgTPIJbLTGPsunB-';
const QINIU_SK='5qHgCxIQi5jG-TMbyjkxTicpj14kXuNHT0LYjMuF';
const QINIU_BUCKET='reeflog';
const QINIU_REGION='z2';
const QINIU_DOMAIN='tg8rkhdmv.hn-bkt.clouddn.com';
const QINIU_UPLOAD_HOSTS={z0:'https://upload.qiniup.com',z1:'https://upload-z1.qiniup.com',z2:'https://upload-z2.qiniup.com',na0:'https://upload-na0.qiniup.com',as0:'https://upload-as0.qiniup.com'};

let _retryTimer=null;
let _syncStatus='idle'; // idle|synced|pushing|pulling|failed
let _hasDiff=false; // 本地与远端数据是否有差异
let _syncMsg='';
let _syncBusy=false;
let _initDone=false;
function SYNC_setInitDone(){_initDone=true;}

/* --- Provider --- */
function SYNC_currentProvider(){return SYNC_DEFAULT_PROVIDER;}

/* --- Internal keys (not synced) --- */
const _SYNC_INTERNAL=new Set([SYNC_ACCOUNT_KEY,SYNC_PWD_KEY,SYNC_VERSION_KEY,SYNC_DIRTY_KEY,SYNC_TIME_KEY,'reef_active','reef_tanks','reef_theme']);

/* --- Account --- */
function SYNC_getAccount(){return _g(SYNC_ACCOUNT_KEY);}
function SYNC_getPwd(){return _g(SYNC_PWD_KEY);}
function SYNC_setAccount(name,pwd){
  localStorage.setItem(SYNC_ACCOUNT_KEY,name);
  localStorage.setItem(SYNC_PWD_KEY,pwd);
  localStorage.setItem(SYNC_DIRTY_KEY,'1');
  SYNC_updateIcon();
}

/* --- Version & time --- */
function SYNC_getVersion(){return parseInt(_g(SYNC_VERSION_KEY))||0;}
function SYNC_setVersion(v){localStorage.setItem(SYNC_VERSION_KEY,String(v));}
function SYNC_bumpVersion(){const v=Date.now();SYNC_setVersion(v);return v;}
function SYNC_getTime(){return parseInt(_g(SYNC_TIME_KEY))||0;}
function SYNC_setTime(v){localStorage.setItem(SYNC_TIME_KEY,String(v));}

/* --- Is configured? --- */
function SYNC_isConfigured(){
  const p=SYNC_currentProvider();
  if(p==='qiniu')return true;
  return !!SYNC_getAccount();
}

/* --- Collect / Apply --- */
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

/* ========== Glata Provider ========== */
async function _glataPush(payload){
  const account=SYNC_getAccount(),pwd=SYNC_getPwd();
  const resp=await fetch(SYNC_API+'?keyword='+encodeURIComponent(account),{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({version:payload.version,data:payload.data,pwd})
  });
  if(!resp.ok) throw new Error('HTTP '+resp.status);
}
async function _glataPull(){
  const account=SYNC_getAccount();
  try{
    const ctrl=new AbortController();
    const tid=setTimeout(()=>ctrl.abort(),SYNC_PULL_TIMEOUT);
    const resp=await fetch(SYNC_API+'?keyword='+encodeURIComponent(account),{signal:ctrl.signal});
    clearTimeout(tid);
    if(!resp.ok) return null;
    const json=await resp.json();
    if(json&&json.code===0&&json.data){
      return typeof json.data==='string'?JSON.parse(json.data):json.data;
    }
    if(json&&json.version) return json;
    return null;
  }catch(e){console.warn('[SYNC] glata pull failed:',e);return null;}
}

/* ========== Qiniu Provider ========== */
function _base64UrlStr(str){return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function _base64UrlBuf(buf){
  let b='';const bytes=new Uint8Array(buf);
  for(let i=0;i<bytes.length;i++) b+=String.fromCharCode(bytes[i]);
  return btoa(b).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

/* 纯 JS SHA-1（crypto.subtle 不可用时降级） */
const _sha1=(function(){
  function rotl(n,s){return n<<s|n>>>32-s;}
  return function(msg){
    let h0=0x67452301,h1=0xEFCDAB89,h2=0x98BADCFE,h3=0x10325476,h4=0xC3D2E1F0;
    const buf=new Uint8Array(msg);
    const len=buf.length;
    const words=new Uint32Array((len+8>>6)+1);
    for(let i=0;i<len;i++) words[i>>2]|=buf[i]<<(24-(i&3)*8);
    words[len>>2]|=0x80<<(24-(len&3)*8);
    words[words.length-1]=len*8;
    for(let i=0;i<words.length;i+=16){
      const w=new Uint32Array(80);
      for(let j=0;j<16;j++) w[j]=words[i+j];
      for(let j=16;j<80;j++) w[j]=rotl(w[j-3]^w[j-8]^w[j-14]^w[j-16],1);
      let a=h0,b=h1,c=h2,d=h3,e=h4;
      for(let j=0;j<80;j++){
        const f=j<20?(b&c|~b&d)+0x5A827999:j<40?(b^c^d)+0x6ED9EBA1:j<60?(b&c|b&d|c&d)+0x8F1BBCDC:(b^c^d)+0xCA62C1D6;
        const tmp=rotl(a,5)+f+e+w[j];
        e=d;d=c;c=rotl(b,30);b=a;a=tmp;
      }
      h0+=a;h1+=b;h2+=c;h3+=d;h4+=e;
    }
    return new Uint8Array([(h0>>24)&0xff,(h0>>16)&0xff,(h0>>8)&0xff,h0&0xff,(h1>>24)&0xff,(h1>>16)&0xff,(h1>>8)&0xff,h1&0xff,(h2>>24)&0xff,(h2>>16)&0xff,(h2>>8)&0xff,h2&0xff,(h3>>24)&0xff,(h3>>16)&0xff,(h3>>8)&0xff,h3&0xff,(h4>>24)&0xff,(h4>>16)&0xff,(h4>>8)&0xff,h4&0xff]);
  };
})();

function _hmacSha1Sync(key,data){
  const enc=new TextEncoder();
  const kb=enc.encode(key);
  const block=64;
  let kPad=new Uint8Array(block),kIpad=new Uint8Array(block),kOpad=new Uint8Array(block);
  if(kb.length>block){const h=_sha1(kb);for(let i=0;i<20;i++) kPad[i]=h[i];}else{for(let i=0;i<kb.length;i++) kPad[i]=kb[i];}
  for(let i=0;i<block;i++){kIpad[i]=kPad[i]^0x36;kOpad[i]=kPad[i]^0x5c;}
  const inner=new Uint8Array(block+new TextEncoder().encode(data).length);
  inner.set(kIpad);inner.set(enc.encode(data),block);
  const innerHash=_sha1(inner);
  const outer=new Uint8Array(block+20);
  outer.set(kOpad);outer.set(innerHash,block);
  return _base64UrlBuf(_sha1(outer));
}

async function _hmacSha1(key,data){
  try{
    const enc=new TextEncoder();
    const ck=await crypto.subtle.importKey('raw',enc.encode(key),{name:'HMAC',hash:'SHA-1'},false,['sign']);
    const sig=await crypto.subtle.sign('HMAC',ck,enc.encode(data));
    return _base64UrlBuf(sig);
  }catch(e){
    return _hmacSha1Sync(key,data);
  }
}
async function _qiniuUploadToken(ak,sk,bucket){
  const deadline=Math.floor(Date.now()/1000)+3600;
  const putPolicy=JSON.stringify({scope:bucket,deadline});
  const encoded=_base64UrlStr(putPolicy);
  const sign=await _hmacSha1(sk,encoded);
  return ak+':'+sign+':'+encoded;
}
async function _qiniuPush(payload){
  const token=await _qiniuUploadToken(QINIU_AK,QINIU_SK,QINIU_BUCKET);
  const host=QINIU_UPLOAD_HOSTS[QINIU_REGION]||QINIU_UPLOAD_HOSTS.z0;
  const key='reef-backup.json';
  const fd=new FormData();
  fd.append('token',token);
  fd.append('key',key);
  fd.append('file',new Blob([JSON.stringify(payload)],{type:'application/json'}));
  const resp=await fetch(host,{method:'POST',body:fd});
  if(!resp.ok) throw new Error('HTTP '+resp.status);
  const r=await resp.json();
  if(r.error) throw new Error(r.error);
}
async function _qiniuPull(){
  const key='reef-backup.json';
  const deadline=Math.floor(Date.now()/1000)+3600;
  const rawUrl='https://'+QINIU_DOMAIN+'/'+key+'?e='+deadline;
  const sign=await _hmacSha1(QINIU_SK,rawUrl);
  const url=rawUrl+'&token='+QINIU_AK+':'+sign;
  try{
    const resp=await fetch(url);
    if(!resp.ok) return null;
    return await resp.json();
  }catch(e){console.warn('[SYNC] qiniu pull failed:',e);return null;}
}

/* ========== Generic Push / Pull ========== */
async function SYNC_push(){
  if(!SYNC_isConfigured())return;
  if(_syncStatus==='pushing')return;
  _setStatus('pushing','备份中...');
  const provider=SYNC_currentProvider();
  const version=SYNC_getVersion(),data=SYNC_collectData();
  const payload={version,data};
  if(provider==='glata') payload.pwd=SYNC_getPwd();
  try{
    if(provider==='glata') await _glataPush(payload);
    else await _qiniuPush(payload);
    localStorage.removeItem(SYNC_DIRTY_KEY);
    SYNC_setTime(Date.now());
    _setStatus('synced','备份成功');_hasDiff=false;
    _stopRetry();
  }catch(e){
    console.warn('[SYNC] push failed:',e);
    localStorage.setItem(SYNC_DIRTY_KEY,'1');
    _setStatus('failed','备份失败');
    _startRetry();
  }
}
async function SYNC_pull(){
  if(!SYNC_isConfigured())return null;
  const provider=SYNC_currentProvider();
  if(provider==='glata') return await _glataPull();
  return await _qiniuPull();
}

/* --- Mark dirty (no auto-push) --- */
function SYNC_markDirty(){
  if(!SYNC_isConfigured())return;
  SYNC_bumpVersion();
  localStorage.setItem(SYNC_DIRTY_KEY,'1');
  SYNC_refreshPanel();
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
  if(SYNC_isConfigured()) SYNC_checkRemote();
}
function SYNC_closePanel(){
  const ov=document.getElementById('cloudOverlay');
  if(ov){ov.classList.remove('open');setTimeout(()=>{ov.style.display='none';},300);}
}
async function SYNC_checkRemote(){
  const remote=await SYNC_pull();
  if(!remote||!remote.data){
    _hasDiff=SYNC_isConfigured();
    SYNC_refreshPanel();
    return;
  }
  const t=remote.version||0;
  if(t>0) SYNC_setTime(t);
  const localData=SYNC_collectData();
  const diffs=_dataDiff(localData,remote.data);
  _hasDiff=diffs.length>0;
  if(!_hasDiff) localStorage.removeItem(SYNC_DIRTY_KEY);
  SYNC_refreshPanel();
}

function SYNC_refreshPanel(){
  const provider=SYNC_currentProvider();
  const configured=SYNC_isConfigured();
  const lastTime=SYNC_getTime();
  const dirty=localStorage.getItem(SYNC_DIRTY_KEY)==='1';

  // Account
  const account=SYNC_getAccount();
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

  // Last backup time
  const timeEl=document.getElementById('cloudLastTime');
  if(timeEl){
    if(!configured) timeEl.textContent='—';
    else if(_syncStatus==='pushing') timeEl.textContent='备份中...';
    else if(_syncStatus==='pulling') timeEl.textContent='恢复中...';
    else if(_syncStatus==='failed') timeEl.textContent='备份失败';
    else timeEl.textContent=lastTime?_fmtTime(lastTime):'—';
  }

  // Sync status badge on title row
  const syncSt=document.getElementById('cloudSyncStatus');
  if(syncSt){
    if(!configured){syncSt.style.display='none';syncSt.onclick=null;}
    else if(_syncStatus==='pushing'){syncSt.textContent='备份中...';syncSt.className='cloud-sync-status';syncSt.style.display='';syncSt.onclick=null;}
    else if(_syncStatus==='pulling'){syncSt.textContent='恢复中...';syncSt.className='cloud-sync-status';syncSt.style.display='';syncSt.onclick=null;}
    else if(_syncStatus==='failed'||_hasDiff){syncSt.textContent='本地有修改';syncSt.className='cloud-sync-status dirty';syncSt.style.display='';syncSt.onclick=SYNC_showDiff;}
    else{syncSt.textContent='已备份';syncSt.className='cloud-sync-status synced';syncSt.style.display='';syncSt.onclick=null;}
  }

  // Action links: show when configured
  const actionLinks=document.getElementById('cloudActionLinks');
  if(actionLinks) actionLinks.style.display=configured?'':'none';

  // Button states
  const backupBtn=document.getElementById('cloudBackupBtn');
  const restoreBtn=document.getElementById('cloudRestoreBtn');
  if(backupBtn) backupBtn.disabled=_syncStatus==='pushing';
  if(restoreBtn) restoreBtn.disabled=_syncStatus==='pulling';
}

function _fmtTime(ts){
  if(!ts)return '—';
  const d=new Date(ts),pad=n=>(n+'').padStart(2,'0');
  return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
}

/* --- Manual backup / restore --- */
async function SYNC_manualBackup(){await SYNC_push();SYNC_refreshPanel();}
async function SYNC_manualRestore(){
  if(!SYNC_isConfigured())return;
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

/* --- Account management (Glata) --- */
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
function SYNC_switchAccount(){AF_open('switch');}
function SYNC_changePwd(){AF_open('changepwd');}

/* --- Qiniu config --- */

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

/* --- Data diff --- */
let _cachedRemote=null;
function _humanKey(k){
  const m=k.match(/^reef_t\d+_(.+)/);
  const suffix=m?m[1]:k.replace('reef_','');
  const map={water_v10:'水质',spectrum_v8:'光谱',change_v1:'换水',titrate_v1:'滴定',maintain_cfg:'维护设置',maintain_log:'维护日志',inventory:'库存'};
  return map[suffix]||suffix;
}
function _parseVal(v){try{return typeof v==='string'?JSON.parse(v):v;}catch(e){return v;}}
function _detailFor(key,val){
  if(key.endsWith('_inventory')){
    const inv=_parseVal(val);
    const ls=(inv.livestock||[]).length,eq=(inv.equipment||[]).length,cm=(inv.consumables||[]).length;
    return '生物'+ls+' / 设备'+eq+' / 耗材'+cm;
  }
  if(key.endsWith('_water_v10')){
    const w=_parseVal(val);
    return (w.rows||[]).length+'条记录';
  }
  if(key.endsWith('_maintain_log')){
    const ml=_parseVal(val);
    return (Array.isArray(ml)?ml.length:0)+'条日志';
  }
  return '';
}
function _dataDiff(localData,remoteData){
  const diffs=[];
  const allKeys=new Set([...Object.keys(localData),...Object.keys(remoteData)]);
  allKeys.forEach(k=>{
    if(!k.startsWith('reef_')||_SYNC_INTERNAL.has(k))return;
    const lv=localData[k],rv=remoteData[k];
    const name=_humanKey(k);
    if(rv===undefined){
      diffs.push({key:k,name,status:'removed',detail:_detailFor(k,lv)});
    }else if(lv===undefined){
      diffs.push({key:k,name,status:'added',detail:_detailFor(k,rv)});
    }else{
      const lp=_parseVal(lv),rp=_parseVal(rv);
      if(JSON.stringify(lp)!==JSON.stringify(rp)){
        diffs.push({key:k,name,status:'changed',localDetail:_detailFor(k,lv),remoteDetail:_detailFor(k,rv)});
      }
    }
  });
  return diffs;
}
function _buildDiffHTML(diffs,mode){
  if(!diffs.length) return '';
  let h='<div class="cloud-diff">';
  const added=diffs.filter(d=>d.status==='added');
  const removed=diffs.filter(d=>d.status==='removed');
  const changed=diffs.filter(d=>d.status==='changed');
  if(added.length){
    h+='<div class="cloud-diff-sec"><span class="cloud-diff-badge add">新增</span>';
    added.forEach(d=>{h+='<div class="cloud-diff-item"><span class="cloud-diff-name">'+d.name+'</span>'+(d.detail?'<span class="cloud-diff-detail">'+d.detail+'</span>':'')+'</div>';});
    h+='</div>';
  }
  if(removed.length){
    h+='<div class="cloud-diff-sec"><span class="cloud-diff-badge del">删除</span>';
    removed.forEach(d=>{h+='<div class="cloud-diff-item"><span class="cloud-diff-name">'+d.name+'</span>'+(d.detail?'<span class="cloud-diff-detail">'+d.detail+'</span>':'')+'</div>';});
    h+='</div>';
  }
  if(changed.length){
    h+='<div class="cloud-diff-sec"><span class="cloud-diff-badge chg">修改</span>';
    changed.forEach(d=>{
      h+='<div class="cloud-diff-item"><span class="cloud-diff-name">'+d.name+'</span>';
      if(d.localDetail&&d.remoteDetail&&d.localDetail!==d.remoteDetail) h+='<span class="cloud-diff-detail">本地:'+d.localDetail+' → 云端:'+d.remoteDetail+'</span>';
      else if(d.localDetail) h+='<span class="cloud-diff-detail">'+d.localDetail+'</span>';
      h+='</div>';
    });
    h+='</div>';
  }
  h+='</div>';
  return h;
}
function _diffClose(){
  const box=document.getElementById('cloudDiffBox');
  if(!box)return;
  box.classList.remove('open');
  box.style.maxHeight='0';
}
async function SYNC_showDiff(){
  const box=document.getElementById('cloudDiffBox');
  if(!box)return;
  if(box.classList.contains('open')){_diffClose();return;}
  // Fetch data first, then open in one step
  const remote=await SYNC_pull();
  if(!remote||!remote.data){
    box.innerHTML='<div class="cloud-diff"><div class="cloud-diff-empty">无法获取云端数据</div></div>';
    box.classList.add('open');
    box.style.maxHeight='60px';
    return;
  }
  _cachedRemote=remote.data;
  const localData=SYNC_collectData();
  const diffs=_dataDiff(localData,_cachedRemote);
  if(!diffs.length){
    localStorage.removeItem(SYNC_DIRTY_KEY);
    if(remote.version)SYNC_setVersion(remote.version);
    SYNC_refreshPanel();
    toast('数据与云端一致');
    return;
  }
  box.innerHTML=_buildDiffHTML(diffs,'backup');
  box.classList.add('open');
  const h=box.querySelector('.cloud-diff').offsetHeight;
  box.style.maxHeight=Math.min(h+16,220)+'px';
}
async function SYNC_showRestoreDiff(){
  const box=document.getElementById('cloudDiffBox');
  if(!box)return;
  const remote=await SYNC_pull();
  if(!remote||!remote.data){
    box.innerHTML='<div class="cloud-diff"><div class="cloud-diff-empty">无法获取云端数据</div></div>';
    box.classList.add('open');
    box.style.maxHeight='60px';
    return;
  }
  _cachedRemote=remote.data;
  const localData=SYNC_collectData();
  const diffs=_dataDiff(localData,_cachedRemote);
  if(!diffs.length){
    box.innerHTML='<div class="cloud-diff"><div class="cloud-diff-empty">数据一致，无差异</div></div>';
    box.classList.add('open');
    box.style.maxHeight='60px';
    return;
  }
  box.innerHTML=_buildDiffHTML(diffs,'restore');
  box.classList.add('open');
  const h=box.querySelector('.cloud-diff').offsetHeight;
  box.style.maxHeight=Math.min(h+16,220)+'px';
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
