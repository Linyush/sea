/* ============================================================
   GLOBAL KEYBOARD + INIT
   ============================================================ */
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    /* Close modals from top layer to bottom */
    const ipOv=document.getElementById('iconPickerOverlay');
    if(ipOv&&ipOv.classList.contains('open')){IP_close();return;}
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

document.addEventListener('DOMContentLoaded',function(){
  loadTheme();
  // Multi-tank init
  TK_migrate();
  TK_load();
  TK_renderBar();
  // Read hash to determine initial page
  const hash=window.location.hash.replace('#','');
  const startPage=PAGE_META[hash]?hash:'water';
  _pageInited[startPage]=true;
  switchPage(startPage);
  if(startPage==='profile') initProfile();
  else if(startPage==='water') initWater();
  else if(startPage==='light') initLight();
  else if(startPage==='change') initChange();
  else if(startPage==='titrate') initTitrate();
  if(startPage==='profile') renderProfile();
});
