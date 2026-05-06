/* ============================================================
   SPA ROUTER
   ============================================================ */
const PAGE_META={
  profile:{title:'礁岩日记',badge:'',badgeEn:''},
  water:{title:'礁岩日记',badge:'水质记录',badgeEn:'WATER QUALITY'},
  change:{title:'礁岩日记',badge:'换水计算',badgeEn:'WATER CHANGE'},
  titrate:{title:'礁岩日记',badge:'滴定计算',badgeEn:'TITRATION'},
  light:{title:'礁岩日记',badge:'光谱生成',badgeEn:'SPECTRUM'}
};
let _currentPage='profile';
let _pageInited={profile:false,water:false,light:false,change:false,titrate:false};

function switchPage(page){
  if(!PAGE_META[page])return;
  _currentPage=page;
  document.querySelectorAll('.nav-tab').forEach(b=>{
    b.classList.toggle('active',b.dataset.page===page);
  });
  const _pb=document.getElementById('pageBadge');if(PAGE_META[page].badge){_pb.innerHTML=PAGE_META[page].badge+'<span class="brand-sub-en">'+PAGE_META[page].badgeEn+'</span>';_pb.style.display='';}else{_pb.innerHTML='';_pb.style.display='none';}
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
  if(page==='water'){setTimeout(()=>{const cw=document.getElementById('chartWrap');if(cw&&W_chart){const curTheme=document.documentElement.classList.contains('light')?'light':'dark';const needRedraw=(typeof _chartTheme!=='undefined'&&_chartTheme!==curTheme);const innerW=parseInt(document.getElementById('chartInner').style.width)||0;if(needRedraw||innerW<cw.clientWidth||innerW===0){renderChart();}else{W_chart.resize();updateLaneLabels();}}},50);}
  if(page==='light'&&L_chart){setTimeout(()=>{L_chart.resize();},50);}
}
