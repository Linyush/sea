/* ============================================================
   GLOBAL KEYBOARD + INIT
   ============================================================ */
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    const sysCfm=document.getElementById("sysCfmOverlay");
    if(sysCfm&&sysCfm.classList.contains("open")){sysConfirmCancel();return;}
    const wEdit=document.getElementById("wEditOverlay");
    if(wEdit){W_closeEdit();return;}
    const mtWiz=document.getElementById('mtWizardOverlay');
    if(mtWiz){MT_tryClose();return;}
    const mtSet=document.getElementById('mtSettingsOverlay');
    if(mtSet){MT_closeSettings();return;}
    const mtEditOv=document.getElementById('mtEditOverlay');
    if(mtEditOv){MT_closeEditLog();return;}
    const mtHist=document.getElementById('mtHistoryOverlay');
    if(mtHist){MT_closeHistory();return;}
    const ipOv=document.getElementById('iconPickerOverlay');
    if(ipOv&&ipOv.classList.contains('open')){IP_close();return;}
    const ceOv=document.getElementById('childFormOverlay');
    if(ceOv&&ceOv.classList.contains('open')){CE_close();return;}
    const rpOv=document.getElementById('rpFormOverlay');
    if(rpOv){RP_closeForm();return;}
    const spOv=document.getElementById('mtSpecialOverlay');
    if(spOv){MT_closeSpecialForm();return;}
    const impOv=document.getElementById('impOverlay');
    if(impOv&&impOv.classList.contains('open')){IMP_close();return;}
    const afOv=document.getElementById('accountFormOverlay');
    if(afOv&&afOv.classList.contains('open')){AF_cancel();return;}
    const slOv=document.getElementById('syncLoginOverlay');
    if(slOv&&slOv.classList.contains('open')){SYNC_loginCancel();return;}
    const cloudOv=document.getElementById('cloudOverlay');
    if(cloudOv&&cloudOv.classList.contains('open')){SYNC_closePanel();return;}
    if(document.getElementById('itemFormOverlay').classList.contains('open'))IF_close();
    else if(document.getElementById('tankFormOverlay').classList.contains('open'))TF_close();
    else if(document.getElementById('nfModal').classList.contains('open'))closeNf();
    else if(document.getElementById('delCfm').classList.contains('open'))closeDel();
    else if(document.getElementById('dataModal').classList.contains('open'))closeModal();
    else if(document.getElementById('lightDataModal').classList.contains('open'))L_closeDataModal();
  }
});

if('scrollRestoration' in history) history.scrollRestoration='manual';

document.addEventListener('DOMContentLoaded',async function(){
  window.scrollTo(0,0);
  loadTheme();

  // Init sync module (register _onDataChange hook)
  SYNC_init();

  // If auto-sync is ON and account is set, pull cloud data first
  await SYNC_pullOnStart();

  // Normal app init
  TK_migrate();
  TK_load();
  TK_renderBar();
  const hash=window.location.hash.replace('#','');
  const startPage=PAGE_META[hash]?hash:'profile';
  _pageInited[startPage]=true;
  switchPage(startPage);
  if(startPage==='profile') initProfile();
  else if(startPage==='water') initWater();
  else if(startPage==='light') initLight();
  else if(startPage==='change') initChange();
  else if(startPage==='titrate') initTitrate();
  if(startPage==='profile') renderProfile();
  SYNC_setInitDone();
});
