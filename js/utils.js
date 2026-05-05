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
    if(W_chart) renderChart();
    if(L_chart){L_chart.options.scales.x.ticks.color=getCS('--text3');L_chart.options.scales.y.ticks.color=getCS('--text3');L_chart.options.scales.x.grid.color=getCS('--border')+'40';L_chart.options.scales.y.grid.color=getCS('--border')+'40';L_chart.options.plugins.legend.labels.color=getCS('--text3');L_chart.update();}
  },80);
}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
