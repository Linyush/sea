/* ============================================================
   MULTI-TANK MANAGEMENT
   ============================================================ */
const TK_LIST_KEY='reef_tanks';
const TK_ACTIVE_KEY='reef_active';
let _tanks=[];
let _activeTank='';

// --- Migration from old single-tank format ---
function TK_migrate(){
  const existing=_g(TK_LIST_KEY);
  if(existing)return false; // already migrated
  // Check for old data
  const oldW=_g('reef_water_v10');
  const oldL=_g('reef_spectrum_v8');
  const oldC=_g('reef_change_v1');
  const oldT=_g('reef_titrate_v1');
  const hasOld=oldW||oldL||oldC||oldT;
  // Create default tank
  const id='t'+Date.now();
  const tank={id:id,name:'',type:'',volume:'',startDate:'',source:'',price:'',notes:'',order:0};
  _s(TK_LIST_KEY,JSON.stringify([tank]));
  _s(TK_ACTIVE_KEY,id);
  // Copy old data to new keys
  if(oldW) _s('reef_'+id+'_water_v10',oldW);
  if(oldL) _s('reef_'+id+'_spectrum_v8',oldL);
  if(oldC) _s('reef_'+id+'_change_v1',oldC);
  if(oldT) _s('reef_'+id+'_titrate_v1',oldT);
  // Save profile from old change data (extract tankTotal)
  if(oldC){
    try{const cd=JSON.parse(oldC);if(cd.tankTotal)tank.volume=parseFloat(cd.tankTotal)||70;}catch(e){}
  }
  _s(TK_LIST_KEY,JSON.stringify([tank]));
  // Init empty inventory
  _s('reef_'+id+'_inventory',JSON.stringify({livestock:[],equipment:[],consumables:[]}));
  return true;
}

function TK_load(){
  const s=_g(TK_LIST_KEY);
  _tanks=s?JSON.parse(s):[];
  if(!_tanks.length){
    const id='t'+Date.now();
    _tanks=[{id:id,name:'',type:'',volume:'',startDate:'',source:'',price:'',notes:'',order:0}];
    _s(TK_LIST_KEY,JSON.stringify(_tanks));
    _s('reef_'+id+'_inventory',JSON.stringify({livestock:[],equipment:[],consumables:[]}));
  }
  _tanks.sort((a,b)=>(a.order||0)-(b.order||0));
  const active=_g(TK_ACTIVE_KEY);
  _activeTank=(active&&_tanks.some(t=>t.id===active))?active:_tanks[0].id;
  _s(TK_ACTIVE_KEY,_activeTank);
}

function TK_save(){
  _s(TK_LIST_KEY,JSON.stringify(_tanks));
}

function TK_current(){
  return _tanks.find(t=>t.id===_activeTank)||_tanks[0];
}

function TK_switchTo(id){
  if(id===_activeTank)return;
  _activeTank=id;
  _s(TK_ACTIVE_KEY,id);
  // Reset init flags for data pages
  _pageInited.water=false;_pageInited.light=false;_pageInited.change=false;_pageInited.titrate=false;_pageInited.profile=false;
  // Destroy charts
  if(W_chart){W_chart.destroy();W_chart=null;}
  if(L_chart){L_chart.destroy();L_chart=null;}
  // Reset module state
  fields=[];rows=[];
  L_cfg=L_ld();
  // Re-render
  TK_renderBar();
  // Re-init current page
  const page=_currentPage;
  _pageInited[page]=true;
  if(page==='profile') initProfile();
  else if(page==='water') initWater();
  else if(page==='light') initLight();
  else if(page==='change') initChange();
  else if(page==='titrate') initTitrate();
  if(page==='profile') renderProfile();
}

function TK_renderBar(){
  const bar=document.getElementById('tankBar');
  if(!bar)return;
  bar.innerHTML='';
  /* Only show bar if >1 tank, or 1 tank with a name */
  if(_tanks.length<=1 && !(_tanks[0]&&_tanks[0].name)){bar.style.display='none';return;}
  bar.style.display='';
  _tanks.forEach(t=>{
    const btn=document.createElement('button');
    btn.className='tank-tab'+(t.id===_activeTank?' active':'');
    btn.innerHTML='<span class="t-dot"></span>'+(t.name||'鱼缸 '+(i+1));
    btn.onclick=()=>TK_switchTo(t.id);
    btn.oncontextmenu=(e)=>{e.preventDefault();TK_showCtx(t.id,e);};
    // Long press for mobile
    let _lp;
    btn.ontouchstart=(e)=>{_lp=setTimeout(()=>{e.preventDefault();TK_showCtx(t.id,e.touches[0]);},500);};
    btn.ontouchend=()=>clearTimeout(_lp);
    btn.ontouchmove=()=>clearTimeout(_lp);
    bar.appendChild(btn);
  });
  const addBtn=document.createElement('button');
  addBtn.className='tank-add';
  addBtn.textContent='+';
  addBtn.title='新建鱼缸';
  addBtn.onclick=()=>TF_open();
  bar.appendChild(addBtn);
}

let _ctxTankId='';
function TK_showCtx(id,e){
  _ctxTankId=id;
  const ctx=document.getElementById('tankCtx');
  ctx.style.display='block';
  ctx.style.left=Math.min((e.clientX||e.pageX),window.innerWidth-120)+'px';
  ctx.style.top=Math.min((e.clientY||e.pageY),window.innerHeight-100)+'px';
  setTimeout(()=>{document.addEventListener('click',TK_hideCtx,{once:true});},0);
}
function TK_hideCtx(){document.getElementById('tankCtx').style.display='none';}

function TK_rename(){
  TK_hideCtx();
  const t=_tanks.find(x=>x.id===_ctxTankId);if(!t)return;
  const n=prompt('鱼缸名称',t.name);
  if(n&&n.trim()){t.name=n.trim();TK_save();TK_renderBar();if(_currentPage==='profile')renderProfile();}
}
function TK_edit(){
  TK_hideCtx();
  // Switch to that tank's profile
  if(_ctxTankId!==_activeTank)TK_switchTo(_ctxTankId);
  switchPage('profile');
}
function TK_del(){
  TK_hideCtx();
  if(_tanks.length<=1){toast('至少保留一个鱼缸');return;}
  const t=_tanks.find(x=>x.id===_ctxTankId);if(!t)return;
  if(!confirm('确定删除鱼缸「'+t.name+'」及其所有数据？'))return;
  // Remove data
  ['_water_v10','_spectrum_v8','_change_v1','_titrate_v1','_inventory'].forEach(suffix=>{
    _r('reef_'+t.id+suffix);
  });
  _tanks=_tanks.filter(x=>x.id!==t.id);
  TK_save();
  if(_activeTank===t.id){TK_switchTo(_tanks[0].id);}
  else{TK_renderBar();}
  toast('已删除 '+t.name);
}

// --- Tank Form ---
let _tfEditId='';
function TF_open(editId){
  _tfEditId=editId||'';
  const ov=document.getElementById('tankFormOverlay');
  document.getElementById('tfTitle').textContent=editId?'编辑鱼缸':'新建鱼缸';
  document.getElementById('tfSubmit').textContent=editId?'保存':'创建';
  if(editId){
    const t=_tanks.find(x=>x.id===editId);
    if(t){
      document.getElementById('tfName').value=t.name;
      document.getElementById('tfType').value=t.type||'LPS';
      document.getElementById('tfVolume').value=t.volume||'';
      document.getElementById('tfStart').value=t.startDate||'';
      document.getElementById('tfSource').value=t.source||'';
      document.getElementById('tfPrice').value=t.price||'';
      document.getElementById('tfNotes').value=t.notes||'';
      document.getElementById('tfMaintCycle').value=t.maintCycle||'';
    }
  }else{
    ['tfName','tfVolume','tfStart','tfSource','tfPrice','tfNotes','tfMaintCycle'].forEach(id=>{document.getElementById(id).value='';});
    document.getElementById('tfType').value='LPS';
  }
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}
function TF_close(){
  const ov=document.getElementById('tankFormOverlay');ov.classList.remove('open');setTimeout(()=>{ov.style.display='none';},300);
}
function TF_save(){
  const name=document.getElementById('tfName').value.trim();
  const type=document.getElementById('tfType').value;
  const volume=parseFloat(document.getElementById('tfVolume').value)||0;
  if(!name){toast('请输入鱼缸名称');return;}
  if(!volume){toast('请输入水体体积');return;}
  if(_tfEditId){
    // Edit existing
    const t=_tanks.find(x=>x.id===_tfEditId);
    if(t){
      t.name=name;t.type=type;t.volume=volume;
      t.startDate=document.getElementById('tfStart').value;
      t.source=document.getElementById('tfSource').value.trim();
      t.price=document.getElementById('tfPrice').value;
      t.notes=document.getElementById('tfNotes').value.trim();
      t.maintCycle=parseInt(document.getElementById('tfMaintCycle').value)||0;
      TK_save();TK_renderBar();
      if(_currentPage==='profile')renderProfile();
      toast('已更新 '+name);
    }
  }else{
    // Create new
    const id='t'+Date.now();
    const tank={id,name,type,volume,
      startDate:document.getElementById('tfStart').value,
      source:document.getElementById('tfSource').value.trim(),
      price:document.getElementById('tfPrice').value,
      notes:document.getElementById('tfNotes').value.trim(),
      maintCycle:parseInt(document.getElementById('tfMaintCycle').value)||0,
      order:_tanks.length
    };
    _tanks.push(tank);
    TK_save();
    _s('reef_'+id+'_inventory',JSON.stringify({livestock:[],equipment:[],consumables:[]}));
    TK_switchTo(id);
    toast('已创建 '+name);
  }
  TF_close();
}
