/* ============================================================
   PROFILE / INVENTORY MODULE
   ============================================================ */
const P_INV_KEY=()=>'reef_'+_activeTank+'_inventory';
const P_STATUS_LABELS={
  alive:'存活',dead:'死亡',sold:'售出',moved:'转缸',
  active:'使用中',standby:'闲置',broken:'损坏',
  sealed:'未开封',inuse:'使用中',empty:'已用完'
};
const P_SPECIES_OPTS=['鱼','珊瑚','无脊椎','藻','其他'];
const P_EQ_CATS=['水泵','灯','造浪','蛋分','加热棒','冷水机','温度计','滴定','钙反','煮豆机','补水器','杀菌灯','滤布机','喂食器','检测设备','插座','其他'];
const P_CM_CATS=['盐','食物','添加剂','试剂','药品','其他'];
const P_ICONS={'fish':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 40c8-12 24-12 34-6l8-8v28l-8-8c-10 6-26 6-34-6z"/><circle cx="28" cy="38" r="2" fill="currentColor" stroke="none"/><path d="M38 35v10"/></svg>',
'coral':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M40 65V45"/><path d="M40 45c-4-6-10-8-10-16 0-4 3-6 5-4 3 3 5 8 5 8s2-5 5-8c2-2 5 0 5 4 0 8-6 10-10 16z"/><path d="M30 65h20"/><path d="M28 40c-3-4-6-5-6-10 0-3 2-4 4-3 2 2 3 5 3 5"/></svg>',
'invert':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 48c0-8 8-14 18-14s18 6 18 14-8 14-18 14-18-6-18-14z"/><path d="M30 44c0-4 4-7 10-7s10 3 10 7"/><circle cx="34" cy="51" r="2"/><circle cx="46" cy="51" r="2"/><path d="M26 34l-4-8m28 8l4-8"/></svg>',
'algae':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M40 65V50c0-4-2-6-2-10s2-8 2-12"/><path d="M32 65V54c0-3-1.5-5-1.5-8s1.5-6 1.5-10"/><path d="M48 65V54c0-3 1.5-5 1.5-8s-1.5-6-1.5-10"/></svg>',
'other_live':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="40" r="16"/><path d="M36 36h1m6 0h1"/><path d="M34 46c3 3 9 3 12 0"/></svg>',
'pump':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="24" y="30" width="36" height="22" rx="3"/><line x1="32" y1="34" x2="32" y2="48"/><line x1="38" y1="34" x2="38" y2="48"/><line x1="44" y1="34" x2="44" y2="48"/><line x1="50" y1="34" x2="50" y2="48"/><rect x="14" y="33" width="10" height="16" rx="2"/><path d="M19 33v-8h6"/><line x1="20" y1="52" x2="20" y2="58"/><line x1="54" y1="52" x2="54" y2="58"/><line x1="16" y1="58" x2="58" y2="58"/></svg>',
'light':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="28" width="44" height="12" rx="3"/><path d="M26 40v4m10-4v4m8-4v4m10-4v4"/><path d="M30 48l-4 10m24-10l4 10"/><line x1="14" y1="28" x2="14" y2="40"/><line x1="66" y1="28" x2="66" y2="40"/></svg>',
'wave':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="40" r="14"/><circle cx="40" cy="40" r="6"/><path d="M34 40l-8 0m20 0h8"/><path d="M40 34v-8m0 20v8"/><rect x="56" y="36" width="10" height="8" rx="2"/></svg>',
'skimmer':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="28" y="14" width="24" height="52" rx="5"/><path d="M28 24h24"/><path d="M28 56h24"/><circle cx="40" cy="40" r="4"/><path d="M36 62v4m8-4v4"/><path d="M34 18h12"/></svg>',
'heater':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="34" y="14" width="12" height="52" rx="6"/><path d="M38 26h4m-4 8h4m-4 8h4m-4 8h4"/><path d="M34 14h12"/><circle cx="40" cy="58" r="3"/></svg>',
'chiller':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="22" width="48" height="36" rx="4"/><rect x="24" y="30" width="14" height="14" rx="7"/><path d="M31 34v8m-3-4h6"/><line x1="48" y1="30" x2="48" y2="44"/><line x1="54" y1="30" x2="54" y2="44"/><line x1="20" y1="58" x2="20" y2="64"/><line x1="60" y1="58" x2="60" y2="64"/></svg>',
'thermo':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="34" y="14" width="12" height="38" rx="6"/><circle cx="40" cy="56" r="8"/><circle cx="40" cy="56" r="4" fill="currentColor" stroke="none"/><line x1="40" y1="52" x2="40" y2="28"/><path d="M46 20h6m-6 8h6"/></svg>',
'doser':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="22" y="24" width="36" height="32" rx="4"/><circle cx="33" cy="40" r="5"/><circle cx="47" cy="40" r="5"/><path d="M30 24v-6m10 6v-6m10 6v-6"/><path d="M30 56v6m10-6v6m10-6v6"/></svg>',
'reactor':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="28" y="14" width="20" height="52" rx="4"/><path d="M28 24h20m-20 14h20m-20 14h20"/><circle cx="38" cy="45" r="2"/><circle cx="38" cy="38" r="1.5"/><path d="M52 20h6v16h-6"/><circle cx="55" cy="30" r="2"/></svg>',
'beansoup':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="26" y="18" width="22" height="44" rx="4"/><path d="M26 28h22"/><circle cx="37" cy="38" r="2"/><circle cx="33" cy="44" r="1.5"/><circle cx="40" cy="48" r="1.5"/><circle cx="35" cy="52" r="1.5"/><path d="M48 34h8v12h-8"/><line x1="32" y1="62" x2="32" y2="68"/><line x1="42" y1="62" x2="42" y2="68"/></svg>',
'ato':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="24" width="24" height="36" rx="3"/><path d="M20 42h16"/><path d="M28 42v-8"/><rect x="48" y="38" width="16" height="20" rx="3"/><path d="M56 38v-8"/><path d="M40 44h8"/><circle cx="56" cy="50" r="3"/></svg>',
'uv':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="28" y="18" width="12" height="44" rx="6"/><path d="M22 30l4 2m-4 16l4-2"/><path d="M46 30l-4 2m4 16l-4-2"/><path d="M28 26h12m-12 28h12"/><path d="M34 14v4m0 44v4"/></svg>',
'roller':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="22" width="40" height="36" rx="4"/><circle cx="34" cy="34" r="6"/><circle cx="46" cy="50" r="6"/><path d="M38 30l4 16"/><path d="M20 42h40"/></svg>',
'feeder':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="38" r="14"/><path d="M40 24v14l10 6"/><rect x="36" y="52" width="8" height="12" rx="2"/><path d="M54 38h10v8"/><line x1="40" y1="64" x2="40" y2="68"/></svg>',
'tester':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="24" y="14" width="24" height="16" rx="3"/><path d="M30 30v26c0 4 2 8 6 8s6-4 6-8V30"/><path d="M30 42h12m-12 8h12"/><path d="M52 20h10v10h-10"/><path d="M57 30v10"/></svg>',
'socket':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="28" width="52" height="24" rx="4"/><circle cx="28" cy="40" r="4"/><circle cx="42" cy="40" r="4"/><circle cx="56" cy="40" r="4"/><line x1="24" y1="52" x2="24" y2="56"/><line x1="56" y1="52" x2="56" y2="56"/><circle cx="18" cy="32" r="1.5" fill="currentColor" stroke="none"/></svg>',
'other_eq':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="40" r="14"/><circle cx="40" cy="40" r="6"/><path d="M40 20v6m0 28v6m-20-20h6m28 0h6"/><path d="M26 26l4 4m20 20l4 4m0-28l-4 4m-20 20l-4 4"/></svg>',
'salt':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 26h32l-4 38H28l-4-38z"/><path d="M28 18h24v8H28z"/><path d="M32 36h8m-4-4v8"/><path d="M38 26c0-4 8-4 8 0"/></svg>',
'food':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="26" y="22" width="28" height="38" rx="6"/><path d="M26 32h28"/><circle cx="36" cy="42" r="2" fill="currentColor" stroke="none"/><circle cx="44" cy="46" r="2" fill="currentColor" stroke="none"/><circle cx="38" cy="50" r="1.5" fill="currentColor" stroke="none"/><path d="M36 22v-6h8v6"/></svg>',
'additive':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M30 28h20l-2 36H32l-2-36z"/><rect x="34" y="18" width="12" height="10" rx="2"/><path d="M40 18v-4"/><path d="M30 44h20"/></svg>',
'reagent':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="22" width="48" height="36" rx="4"/><rect x="22" y="30" width="8" height="20" rx="2"/><rect x="34" y="30" width="8" height="20" rx="2"/><rect x="46" y="30" width="8" height="20" rx="2"/><path d="M16 22h48"/></svg>',
'medicine':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="28" y="22" width="24" height="38" rx="5"/><path d="M28 32h24"/><path d="M36 42h8m-4-4v8"/><rect x="34" y="14" width="12" height="8" rx="2"/></svg>',
'other_cm':'<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="40" cy="40" r="16"/><path d="M40 30v6l4 4"/><circle cx="40" cy="40" r="2" fill="currentColor" stroke="none"/></svg>'};
const P_ICON_MAP={livestock:{'鱼':'fish','珊瑚':'coral','无脊椎':'invert','藻':'algae','其他':'other_live'},equipment:{'水泵':'pump','灯':'light','造浪':'wave','蛋分':'skimmer','加热棒':'heater','冷水机':'chiller','温度计':'thermo','滴定':'doser','钙反':'reactor','煮豆机':'beansoup','补水器':'ato','杀菌灯':'uv','滤布机':'roller','喂食器':'feeder','检测设备':'tester','插座':'socket','其他':'other_eq'},consumable:{'盐':'salt','食物':'food','添加剂':'additive','试剂':'reagent','药品':'medicine','其他':'other_cm'}};
const P_ICON_NAMES={pump:'水泵',light:'灯',wave:'造浪',skimmer:'蛋分',heater:'加热棒',chiller:'冷水机',thermo:'温度计',doser:'滴定泵',reactor:'钙反',beansoup:'煮豆机',ato:'补水器',uv:'杀菌灯',roller:'滤布机',feeder:'喂食器',tester:'检测',socket:'智能插座',other_eq:'其他',fish:'鱼',coral:'珊瑚',invert:'无脊椎',algae:'藻',other_live:'其他',salt:'海盐',food:'鱼粮',additive:'添加剂',reagent:'试剂',medicine:'药品',other_cm:'其他'};
function P_getIcon(type,cat){const key=P_ICON_MAP[type]&&P_ICON_MAP[type][cat];return key&&P_ICONS[key]?P_ICONS[key]:'';}

// Default icons per category
const P_DEF_ICONS={
  // Species
  '鱼':'🐠','珊瑚':'🪸','无脊椎':'🦐','藻':'🌿','其他':'🔵',
  // Equipment
  '水泵':'💧','灯':'💡','造浪':'🌊','蛋分':'🫧','加热棒':'🌡️','冷水机':'❄️',
  '温度计':'🌡️','滴定':'🧪','钙反':'⚗️','煮豆机':'♨️','补水器':'🚰',
  '杀菌灯':'🔦','滤布机':'🧻','喂食器':'🍽️','检测设备':'📊','插座':'🔌',
  // Consumable
  '盐':'🧂','食物':'🐟','添加剂':'💊','试剂':'🧪','药品':'💉',
};

function P_loadInv(){
  const s=_g(P_INV_KEY());
  if(s){try{return JSON.parse(s);}catch(e){}}
  return{livestock:[],equipment:[],consumables:[]};
}
function P_saveInv(inv){
  _s(P_INV_KEY(),JSON.stringify(inv));
}

function renderProfile(){
  const t=TK_current();
  // Header
  const hdr=document.getElementById('profileHeader');
  const daysSince=t.startDate?Math.floor((Date.now()-new Date(t.startDate+'T00:00:00').getTime())/(86400000)):-1;
  hdr.innerHTML='<div class="profile-avatar">🐠</div><div class="profile-info"><h2>'+t.name+'</h2><div class="meta">'+t.type+(daysSince>=0?' · 开缸 '+daysSince+' 天':'')+'</div></div><button class="profile-edit-btn" onclick="TF_open(&#39;'+t.id+'&#39;)">编辑</button>';
  // Grid
  const grid=document.getElementById('profileGrid');
  let gh='';
  gh+='<div class="profile-field"><div class="pf-label">类型</div><div class="pf-value">'+t.type+'</div></div>';
  gh+='<div class="profile-field"><div class="pf-label">水体</div><div class="pf-value accent">'+t.volume+' L</div></div>';
  if(t.startDate)gh+='<div class="profile-field"><div class="pf-label">开缸日期</div><div class="pf-value">'+t.startDate+'</div></div>';
  if(daysSince>=0)gh+='<div class="profile-field"><div class="pf-label">开缸天数</div><div class="pf-value accent">'+daysSince+' 天</div></div>';
  if(t.source)gh+='<div class="profile-field"><div class="pf-label">购入渠道</div><div class="pf-value">'+t.source+'</div></div>';
  if(t.price)gh+='<div class="profile-field"><div class="pf-label">价格</div><div class="pf-value">¥'+t.price+'</div></div>';
  if(t.notes)gh+='<div class="profile-field" style="grid-column:1/-1"><div class="pf-label">备注</div><div class="pf-value" style="font-size:13px;font-weight:400">'+t.notes+'</div></div>';
  grid.innerHTML=gh;
  // Inventory
  const inv=P_loadInv();
  P_renderInvSection('ls',inv.livestock||[],'livestock');
  P_renderInvSection('eq',inv.equipment||[],'equipment');
  P_renderInvSection('cm',inv.consumables||[],'consumable');
}


function P_renderStats(){
  const inv=JSON.parse(localStorage.getItem(P_INV_KEY())||'{}');
  const livestock=inv.livestock||[], equipment=inv.equipment||[], consumables=inv.consumables||[];
  
  /* Count livestock stats */
  const totalLive=livestock.length;
  const alive=livestock.filter(x=>x.status==='alive').length;
  const dead=livestock.filter(x=>x.status==='dead').length;
  const survivalRate=totalLive>0?Math.round(alive/totalLive*100):0;
  
  /* Count equipment */
  const totalEquip=equipment.length;
  const activeEquip=equipment.filter(x=>x.status==='active').length;
  
  /* Cost calculation */
  let totalCost=0;
  livestock.forEach(x=>{if(x.price)totalCost+=parseFloat(x.price)||0;});
  equipment.forEach(x=>{if(x.price)totalCost+=parseFloat(x.price)||0;});
  consumables.forEach(x=>{if(x.price)totalCost+=parseFloat(x.price)||0;});
  
  /* Water records count */
  let waterCount=0;
  try{const wd=JSON.parse(localStorage.getItem(W_SK())||'{}');waterCount=(wd.rows||[]).length;}catch(e){}
  
  /* Format cost */
  const fmtCost=totalCost>=10000?(totalCost/10000).toFixed(1)+'万':totalCost.toFixed(0);
  
  const statsHtml='<div class="pf-stats">'+
    '<div class="pf-stat-card"><div class="pf-stat-val">'+alive+'<span class="pf-stat-unit">/'+totalLive+'</span></div><div class="pf-stat-lbl">生物存活</div>'+(totalLive>0?'<div class="pf-stat-rate'+(survivalRate<70?' low':'')+'">'+survivalRate+'%</div>':'')+'</div>'+
    '<div class="pf-stat-card"><div class="pf-stat-val">'+activeEquip+'<span class="pf-stat-unit">/'+totalEquip+'</span></div><div class="pf-stat-lbl">设备运行</div></div>'+
    '<div class="pf-stat-card"><div class="pf-stat-val">'+consumables.length+'</div><div class="pf-stat-lbl">耗材种类</div></div>'+
    '<div class="pf-stat-card"><div class="pf-stat-val">¥'+fmtCost+'</div><div class="pf-stat-lbl">累计投入</div></div>'+
    '<div class="pf-stat-card"><div class="pf-stat-val">'+waterCount+'</div><div class="pf-stat-lbl">水质记录</div></div>'+
  '</div>';
  
  /* Insert stats at top of profile page, after the tank info section */
  const pfEl=document.getElementById('profilePage');
  if(!pfEl)return;
  const firstInvSec=pfEl.querySelector('.inv-section');
  if(firstInvSec){
    const d=document.createElement('div');d.innerHTML=statsHtml;
    pfEl.insertBefore(d.firstElementChild,firstInvSec);
  }
}
function P_renderInvSection(prefix,items,type){
  const countEl=document.getElementById(prefix+'Count');
  const gridEl=document.getElementById(prefix+'Grid');
  const activeItems=items.filter(x=>x.status!=='sold'&&x.status!=='dead'&&x.status!=='moved'&&x.status!=='empty');
  countEl.textContent=items.length?activeItems.length+'/'+items.length:'';
  const typeName=IF_TITLES[type]||'';
  let h='<div class="inv-grid">';
  items.forEach((item,i)=>{
    const statusCls='s-'+(item.status||'alive');
    const statusTxt=P_STATUS_LABELS[item.status]||item.status||'';
    const _iconRaw=item.icon||'';
    const _iconParts=_iconRaw.split('|');
    const iconKey=_iconParts[0]||'';
    const iconColor=_iconParts[1]||'var(--accent)';
    const hasSvg=iconKey&&P_ICONS[iconKey];
    const iconHtml=hasSvg?'<div class="inv-card-icon" style="color:'+iconColor+'">'+P_ICONS[iconKey]+'</div>':'<div class="inv-icon">📦</div>';
    h+='<div class="inv-card" onclick="P_editItem(&#39;'+type+'&#39;,'+i+')">'+iconHtml;
    h+='<div class="inv-name">'+item.name+'</div>';
    if(item.breed||item.spec)h+='<div class="inv-sub">'+(item.breed||item.spec||'')+'</div>';
    h+='<div class="inv-status '+statusCls+'">'+statusTxt+'</div>';
    h+='</div>';
  });
  /* Add card at the end */
  h+='<div class="inv-card inv-card-add" onclick="P_openForm(&#39;'+type+'&#39;)"><span class="inv-add-plus">+</span><span class="inv-add-label">添加'+typeName+'</span></div>';
  h+='</div>';
  gridEl.innerHTML=h;
}

// --- Item Form ---
let _ifType='',_ifIdx=-1;
const IF_FIELDS={
  livestock:[
    {key:'name',label:'名称',type:'text',required:true,top:true},
    {key:'breed',label:'品种',type:'text',top:true},
    {key:'size',label:'尺寸',type:'text',placeholder:'如 5cm',top:true},
    {key:'icon',label:'图标',type:'icon_picker'},
    {key:'addDate',label:'购入日期',type:'date'},
    {key:'source',label:'购入渠道',type:'text'},
    {key:'price',label:'价格',type:'number',placeholder:'¥'},
    {key:'status',label:'状态',type:'select',opts:['alive','dead','sold','moved'],labels:['存活','死亡','售出','转缸'],required:true,default:'alive'},
    {key:'value',label:'价值',type:'number',placeholder:'¥',showWhen:{status:'alive'}},
    {key:'deathDate',label:'死亡时间',type:'date',showWhen:{status:'dead'}},
    {key:'sellDate',label:'售出时间',type:'date',showWhen:{status:'sold'}},
    {key:'sellPrice',label:'售出价格',type:'number',placeholder:'¥',showWhen:{status:'sold'}},
    {key:'moveDate',label:'转缸时间',type:'date',showWhen:{status:'moved'}},
    {key:'notes',label:'备注',type:'textarea'},
  ],
  equipment:[
    {key:'name',label:'名称',type:'text',required:true,top:true},
    {key:'brand',label:'品牌',type:'text',top:true},
    {key:'spec',label:'规格',type:'text',top:true},
    {key:'icon',label:'图标',type:'icon_picker'},
    {key:'addDate',label:'购入日期',type:'date'},
    {key:'source',label:'购入渠道',type:'text'},
    {key:'price',label:'价格',type:'number',placeholder:'¥'},
    {key:'status',label:'状态',type:'select',opts:['active','broken','sold','moved'],labels:['使用中','损坏','售出','转缸'],required:true,default:'active'},
    {key:'brokenDate',label:'损坏时间',type:'date',showWhen:{status:'broken'}},
    {key:'sellDate',label:'售出时间',type:'date',showWhen:{status:'sold'}},
    {key:'sellPrice',label:'售出价格',type:'number',placeholder:'¥',showWhen:{status:'sold'}},
    {key:'moveDate',label:'转缸时间',type:'date',showWhen:{status:'moved'}},
    {key:'notes',label:'备注',type:'textarea'},
  ],
  consumable:[
    {key:'name',label:'名称',type:'text',required:true,top:true},
    {key:'brand',label:'品牌',type:'text',top:true},
    {key:'spec',label:'规格',type:'text',placeholder:'如 22kg',top:true},
    {key:'icon',label:'图标',type:'icon_picker'},
    {key:'addDate',label:'购入日期',type:'date'},
    {key:'source',label:'购入渠道',type:'text'},
    {key:'price',label:'价格',type:'number',placeholder:'¥'},
    {key:'status',label:'状态',type:'select',opts:['sealed','inuse','empty','sold','expired'],labels:['未开封','使用中','已用完','已售出','已过期'],required:true,default:'sealed'},
    {key:'replaceDate',label:'建议更换',type:'date',showWhen:{status:'inuse'}},
    {key:'emptyDate',label:'用完时间',type:'date',showWhen:{status:'empty'}},
    {key:'sellDate',label:'售出时间',type:'date',showWhen:{status:'sold'}},
    {key:'sellPrice',label:'售出价格',type:'number',placeholder:'¥',showWhen:{status:'sold'}},
    {key:'expireDate',label:'过期时间',type:'date',showWhen:{status:'expired'}},
    {key:'notes',label:'备注',type:'textarea'},
  ]
};
const IF_TITLES={livestock:'生物',equipment:'设备',consumable:'耗材'};

const IF_INV_KEYS={livestock:'livestock',equipment:'equipment',consumable:'consumables'};

function _ifRenderField(f,val){
  val=val!=null?val:(f.default||'');
  if(f.type==='icon_picker'){
    /* Compact trigger: show selected icon or placeholder */
    const iconSvg=val&&P_ICONS[val.split('|')[0]]?P_ICONS[val.split('|')[0]]:'';
    const iconColor=val&&val.includes('|')?val.split('|')[1]:'#4a90d9';
    const preview=iconSvg?'<span class="ip-preview" style="color:'+iconColor+'">'+iconSvg+'</span>':'<span class="ip-placeholder">选择图标</span>';
    return '<div class="ip-trigger" id="if_icon" data-val="'+(val||'')+'" onclick="IP_open()">'+preview+'<span class="ip-arrow">›</span></div>';
  }
  if(f.type==='select'&&f.opts&&f.opts.length<=5){
    /* Radio tag group for <=5 options */
    const tags=f.opts.map((o,i)=>{
      const optVal=f.labels?f.opts[i]:o;
      const txt=f.labels?f.labels[i]:o;
      const active=(val===optVal)?' active':'';
      return '<span class="if-tag'+active+'" data-val="'+optVal+'" onclick="IF_pickTag(this)">'+txt+'</span>';
    }).join('');
    return '<div class="if-tags" id="if_'+f.key+'">'+tags+'</div>';
  }else if(f.type==='select'){
    const opts=f.opts.map((o,i)=>{
      const optVal=f.labels?f.opts[i]:o;
      const txt=f.labels?f.labels[i]:o;
      const sel=(val===optVal)?' selected':'';
      return '<option value="'+optVal+'"'+sel+'>'+txt+'</option>';
    }).join('');
    return '<select id="if_'+f.key+'">'+opts+'</select>';
  }else if(f.type==='date'){
    return '<input type="text" id="if_'+f.key+'" value="'+val+'" placeholder="YYYY-MM-DD" maxlength="10" oninput="IF_fmtDate(this)">';
  }else if(f.type==='textarea'){
    return '<textarea id="if_'+f.key+'" rows="2" placeholder="'+(f.placeholder||'')+'">'+val+'</textarea>';
  }else{
    return '<input type="'+(f.type||'text')+'" id="if_'+f.key+'" value="'+val+'" placeholder="'+(f.placeholder||'')+'">';
  }
}
/* Auto-format date: insert dashes as user types */
function IF_fmtDate(el){
  let v=el.value.replace(/[^0-9]/g,'');
  if(v.length>4) v=v.slice(0,4)+'-'+v.slice(4);
  if(v.length>7) v=v.slice(0,7)+'-'+v.slice(7);
  if(v.length>10) v=v.slice(0,10);
  el.value=v;
}
function _ifRenderAll(type,vals){
  const topBox=document.getElementById('ifTopFields');
  const box=document.getElementById('ifFields');
  const status=vals.status||(IF_FIELDS[type].find(f=>f.key==='status')||{}).default||'';
  const fields=IF_FIELDS[type];
  let topH='',restH='';
  fields.forEach(f=>{
    if(f.type==='icon_picker') return; /* icon handled by ifIconDisplay */
    /* Conditional visibility */
    if(f.showWhen){
      const k=Object.keys(f.showWhen)[0];
      const need=f.showWhen[k];
      const cur=vals[k]||status;
      if(cur!==need) return;
    }
    const v=vals[f.key]!=null?vals[f.key]:'';
    const inp=_ifRenderField(f,v);
    const row='<div class="if-row" data-fk="'+f.key+'"><label'+(f.required?' class="req"':'')+'>'+ f.label+'</label>'+inp+'</div>';
    if(f.top) topH+=row;
    else restH+=row;
  });
  topBox.innerHTML=topH;
  box.innerHTML=restH;
}
/* === Icon Picker Modal === */
let _ipIcon='',_ipColor='#4a90d9';
function IP_open(){
  // Read current value from hidden trigger or ifIconDisplay
  const trigger=document.getElementById('if_icon');
  const disp=document.getElementById('ifIconDisplay');
  const curVal=trigger?trigger.dataset.val:(disp?disp.dataset.val:'');
  if(curVal&&curVal.includes('|')){_ipIcon=curVal.split('|')[0];_ipColor=curVal.split('|')[1];}
  else if(curVal){_ipIcon=curVal;_ipColor='#4a90d9';}
  else{_ipIcon='';_ipColor='#4a90d9';}
  IP_render();
  const ov=document.getElementById('iconPickerOverlay');
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}
function IP_close(){
  const ov=document.getElementById('iconPickerOverlay');ov.classList.remove('open');
  setTimeout(()=>ov.style.display='none',300);
}
function IP_render(){
  const box=document.getElementById('ipGrid');
  /* Show only icons for current form type */
  const typeMap={livestock:'livestock',equipment:'equipment',consumable:'consumable'};
  const currentType=typeMap[_ifType]||'equipment';
  const groups=[
    {type:'equipment',label:'设备',keys:Object.values(P_ICON_MAP.equipment||{})},
    {type:'livestock',label:'生物',keys:Object.values(P_ICON_MAP.livestock||{})},
    {type:'consumable',label:'耗材',keys:Object.values(P_ICON_MAP.consumable||{})},
  ];
  let h='';
  /* Show current type first and only that type */
  const group=groups.find(g=>g.type===currentType);
  if(group){
    h+='<div class="ip-group">';
    group.keys.forEach(k=>{
      if(!P_ICONS[k])return;
      const active=(k===_ipIcon)?' active':'';
      const name=P_ICON_NAMES[k]||k;
      h+='<div class="ip-opt'+active+'" data-k="'+k+'" onclick="IP_select(this)" title="'+name+'">'+P_ICONS[k]+'<span class="ip-opt-name">'+name+'</span></div>';
    });
    h+='</div>';
  }
  box.innerHTML=h;
  IP_renderColors();
  IP_updatePreview();
}
const IP_PALETTE=['#4a90d9','#00d2ff','#7b68ee','#22bb88','#f59e0b','#ff6b6b','#ff85c0','#a855f7','#64748b','#e74c3c','#1abc9c','#f39c12','#2ecc71','#3498db','#9b59b6','#e91e63'];
function IP_renderColors(){
  const grid=document.getElementById('ipColorGrid');
  grid.innerHTML=IP_PALETTE.map(c=>{
    const active=(c===_ipColor)?' active':'';
    return '<div class="ip-color-dot'+active+'" style="background:'+c+'" data-c="'+c+'" onclick="IP_pickColor(this)"></div>';
  }).join('');
  const hexIn=document.getElementById('ipHexInput');
  const hexPv=document.getElementById('ipHexPreview');
  if(hexIn) hexIn.value=_ipColor;
  if(hexPv) hexPv.style.background=_ipColor;
}
function IP_pickColor(el){
  _ipColor=el.dataset.c;
  document.querySelectorAll('.ip-color-dot.active').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('ipHexInput').value=_ipColor;
  document.getElementById('ipHexPreview').style.background=_ipColor;
  IP_updatePreview();
}
function IP_onHex(v){
  v=v.trim();
  if(/^#[0-9a-fA-F]{6}$/.test(v)){
    _ipColor=v;
    document.getElementById('ipHexPreview').style.background=v;
    document.querySelectorAll('.ip-color-dot.active').forEach(e=>e.classList.remove('active'));
    IP_updatePreview();
  }
}
function IP_select(el){
  document.querySelectorAll('.ip-opt.active').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  _ipIcon=el.dataset.k;
  IP_updatePreview();
}
function IP_updatePreview(){
  const pv=document.getElementById('ipPreview');
  if(_ipIcon&&P_ICONS[_ipIcon]){
    pv.innerHTML='<span style="color:'+_ipColor+'">'+P_ICONS[_ipIcon]+'</span>';
  }else{
    pv.innerHTML='<span class="ip-no">未选择</span>';
  }
}
function IP_confirm(){
  const val=_ipIcon?_ipIcon+'|'+_ipColor:'';
  const trigger=document.getElementById('if_icon');
  if(trigger) trigger.dataset.val=val;
  // Update form header icon display
  const disp=document.getElementById('ifIconDisplay');
  if(disp) disp.dataset.val=val;
  if(disp){
    if(_ipIcon&&P_ICONS[_ipIcon]){
      disp.innerHTML='<span style="color:'+_ipColor+'">'+P_ICONS[_ipIcon]+'</span>';
    }else{
      disp.innerHTML='<span class="if-icon-plus">+</span><span class="if-icon-hint">图标</span>';
    }
  }
  IP_close();
}

function _syncIconDisplay(val){
  const disp=document.getElementById('ifIconDisplay');
  if(!disp)return;
  disp.dataset.val=val||'';
  if(val&&val.includes('|')){
    const k=val.split('|')[0],c=val.split('|')[1];
    if(P_ICONS[k]) disp.innerHTML='<span style="color:'+c+'">'+P_ICONS[k]+'</span>';
    else disp.innerHTML='<span class="if-icon-plus">+</span><span class="if-icon-hint">图标</span>';
  }else{
    disp.innerHTML='<span class="if-icon-plus">+</span><span class="if-icon-hint">图标</span>';
  }
}
function IF_pickTag(el){
  el.parentElement.querySelectorAll('.if-tag').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  /* Re-render to show/hide conditional fields */
  const wrap=el.parentElement;
  if(wrap.id==='if_status'){
    const vals=IF_collectVals();
    vals.status=el.dataset.val;
    _ifRenderAll(_ifType,vals);
  }
}
function IF_collectVals(){
  const vals={};
  IF_FIELDS[_ifType].forEach(f=>{
    if(f.type==='icon_picker'){
      /* icon is stored in ifIconDisplay.dataset.val */
      const disp=document.getElementById('ifIconDisplay');
      vals[f.key]=(disp&&disp.dataset.val)||'';
      return;
    }
    const el=document.getElementById('if_'+f.key);
    if(!el)return;
    if(f.type==='select'&&f.opts&&f.opts.length<=5){
      const active=el.querySelector('.if-tag.active');
      vals[f.key]=active?active.dataset.val:'';
    }else{
      vals[f.key]=el.value;
    }
  });
  return vals;
}
function P_openForm(type){
  _ifType=type;_ifIdx=-1;
  document.getElementById('ifTitle').textContent='添加'+IF_TITLES[type];
  document.getElementById('ifDelBtn').style.display='none';
  _ifRenderAll(type,{});
  _syncIconDisplay('');
  const ov=document.getElementById('itemFormOverlay');
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}

function P_editItem(type,idx){
  _ifType=type;_ifIdx=idx;
  const inv=P_loadInv();
  const arr=inv[IF_INV_KEYS[type]]||[];
  const item=arr[idx];if(!item)return;
  document.getElementById('ifTitle').textContent='编辑'+IF_TITLES[type];
  document.getElementById('ifDelBtn').style.display='';
  _ifRenderAll(type,item);
  _syncIconDisplay(item.icon||'');
  const ov=document.getElementById('itemFormOverlay');
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}

function IF_close(){
  const ov=document.getElementById('itemFormOverlay');ov.classList.remove('open');setTimeout(()=>{ov.style.display='none';},300);
}

function IF_save(){
  const flds=IF_FIELDS[_ifType];
  const _vals=IF_collectVals();
  const item={};
  for(const f of flds){
    let v=(_vals[f.key]||'').toString().trim();
    if(f.required&&!v){toast('请填写'+f.label);return;}
    if(f.type==='number'&&v)v=parseFloat(v);
    item[f.key]=v||'';
  }
  const inv=P_loadInv();
  const arrKey=IF_INV_KEYS[_ifType];
  if(!inv[arrKey])inv[arrKey]=[];
  if(_ifIdx>=0){inv[arrKey][_ifIdx]=item;}
  else{inv[arrKey].push(item);}
  P_saveInv(inv);
  IF_close();
  renderProfile();
  toast('已保存');
}

function IF_del(){
  if(!confirm('确定删除？'))return;
  const inv=P_loadInv();
  const arrKey=IF_INV_KEYS[_ifType];
  if(inv[arrKey])inv[arrKey].splice(_ifIdx,1);
  P_saveInv(inv);
  IF_close();
  renderProfile();
  toast('已删除');
}

function initProfile(){
  // Profile page is render-only, no special init needed
}
