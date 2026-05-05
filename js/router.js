/* ============================================================
   SPA ROUTER
   ============================================================ */
const PAGE_META={
  profile:{title:'鱼缸档案',badge:'PROFILE'},
  water:{title:'水质记录',badge:'REEF MONITOR'},
  change:{title:'换水计算',badge:'WATER CHANGE'},
  titrate:{title:'滴定计算',badge:'TITRATION'},
  light:{title:'光谱生成器',badge:'SPECTRUM'}
};
let _currentPage='water';
let _pageInited={profile:false,water:false,light:false,change:false,titrate:false};

function switchPage(page){
  if(!PAGE_META[page])return;
  _currentPage=page;
  document.querySelectorAll('.nav-tab').forEach(b=>{
    b.classList.toggle('active',b.dataset.page===page);
  });
  document.getElementById('pageTitle').textContent=PAGE_META[page].title;
  document.getElementById('pageBadge').textContent=PAGE_META[page].badge;
  document.querySelectorAll('.page-section').forEach(s=>{
    s.classList.toggle('active',s.id==='page-'+page);
  });
  history.replaceState(null,null,'#'+page);
  if(!_pageInited[page]){
    _pageInited[page]=true;
    if(page==='profile') initProfile();
    else if(page==='water') initWater();
    else if(page==='light') initLight();
    else if(page==='change') initChange();
    else if(page==='titrate') initTitrate();
  }
  if(page==='profile') renderProfile();
  if(page==='water'&&W_chart){setTimeout(()=>{W_chart.resize();updateLaneLabels();},50);}
  if(page==='light'&&L_chart){setTimeout(()=>{L_chart.resize();},50);}
}
