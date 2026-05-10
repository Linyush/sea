/* ============================================================
   SHARED UTILITIES
   ============================================================ */
let darkMode=false;
function _g(k){try{return localStorage.getItem(k)}catch(e){return null}}
function _s(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function _r(k){try{localStorage.removeItem(k)}catch(e){}}
function getCS(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}
function loadTheme(){
  const t=_g('reef_theme');
  if(t==='dark'){darkMode=true;document.documentElement.classList.remove('light');}
  else{darkMode=false;document.documentElement.classList.add('light');}
  document.getElementById('themeBtn').textContent=darkMode?'🌙':'☀️';
}
function toggleTheme(){
  darkMode=!darkMode;
  document.documentElement.classList.toggle('light',!darkMode);
  document.getElementById('themeBtn').textContent=darkMode?'🌙':'☀️';
  _s('reef_theme',darkMode?'dark':'light');
  // Delay chart re-render to let CSS vars settle
  setTimeout(()=>{
    if(W_chart&&_currentPage==='water') renderChart();
    if(L_chart){L_chart.options.scales.x.ticks.color=getCS('--text3');L_chart.options.scales.y.ticks.color=getCS('--text3');L_chart.options.scales.x.grid.color=getCS('--border')+'40';L_chart.options.scales.y.grid.color=getCS('--border')+'40';L_chart.options.plugins.legend.labels.color=getCS('--text3');L_chart.update();}
  },80);
}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}


/* System confirm modal (replaces native confirm) */
var _sysConfirmCb=null;
function sysConfirm(msg,okText,cb){
  let ov=document.getElementById('sysCfmOverlay');
  if(!ov){
    document.body.insertAdjacentHTML('beforeend','<div class="cfm-overlay" id="sysCfmOverlay" style="z-index:9999" onclick="if(event.target===this)sysConfirmCancel()"><div class="cfm-box"><p id="sysCfmMsg"></p><div class="cfm-btns"><button class="btn-ghost" onclick="sysConfirmCancel()">取消</button><button class="btn-del" id="sysCfmOk">确定</button></div></div></div>');
    ov=document.getElementById('sysCfmOverlay');
  }
  document.getElementById('sysCfmMsg').textContent=msg;
  const okBtn=document.getElementById('sysCfmOk');okBtn.textContent=okText||'确定';
  _sysConfirmCb=cb;
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
  okBtn.onclick=function(){sysConfirmCancel();if(_sysConfirmCb)_sysConfirmCb();};
}
function sysConfirmCancel(){const ov=document.getElementById('sysCfmOverlay');if(ov){ov.classList.remove('open');ov.style.display='none';}_sysConfirmCb=null;}
