/* ============================================================
   GLOBAL KEYBOARD + INIT
   ============================================================ */
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    const sysCfm=document.getElementById("sysCfmOverlay");
    if(sysCfm&&sysCfm.classList.contains("open")){sysConfirmCancel();return;}
    const wEdit=document.getElementById("wEditOverlay");
    if(wEdit){W_closeEdit();return;}
    /* Close modals from top layer to bottom */
    const mtWiz=document.getElementById('mtWizardOverlay');
    if(mtWiz){MT_tryClose();return;}
    const mtSet=document.getElementById('mtSettingsOverlay');
    if(mtSet){MT_closeSettings();return;}
    const mtHist=document.getElementById('mtHistoryOverlay');
    if(mtHist){MT_closeHistory();return;}
    const ipOv=document.getElementById('iconPickerOverlay');
    if(ipOv&&ipOv.classList.contains('open')){IP_close();return;}
    const ceOv=document.getElementById('childFormOverlay');
    if(ceOv&&ceOv.classList.contains('open')){CE_close();return;}
    const impOv=document.getElementById('impOverlay');
    if(impOv&&impOv.classList.contains('open')){IMP_close();return;}
    if(document.getElementById('itemFormOverlay').classList.contains('open'))IF_close();
    else if(document.getElementById('tankFormOverlay').classList.contains('open'))TF_close();
    else if(document.getElementById('nfModal').classList.contains('open'))closeNf();
    else if(document.getElementById('delCfm').classList.contains('open'))closeDel();
    else if(document.getElementById('dataModal').classList.contains('open'))closeModal();
    else if(document.getElementById('lightDataModal').classList.contains('open'))L_closeDataModal();
  }
});

if('scrollRestoration' in history) history.scrollRestoration='manual';

document.addEventListener('DOMContentLoaded',function(){
  window.scrollTo(0,0);
  loadTheme();
  // Multi-tank init
  TK_migrate();
  TK_load();
  TK_renderBar();
  // Read hash to determine initial page
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
});
