/* ============================================================
   LIGHT / SPECTRUM MODULE (prefixed L_)
   ============================================================ */
const L_CH=[
  {key:'white',name:'白色',color:'#f0c040',dS:16,dT:6,dP:4,dW:5,dOn:true},
  {key:'blue',name:'蓝色',color:'#4488ff',dS:14,dT:10,dP:4,dW:60,dOn:true},
  {key:'red',name:'红色',color:'#ff4444',dS:16,dT:6,dP:4,dW:2,dOn:true},
  {key:'green',name:'绿色',color:'#44cc44',dS:16,dT:6,dP:4,dW:2,dOn:true},
  {key:'deep',name:'深蓝',color:'#2244cc',dS:14,dT:10,dP:4,dW:60,dOn:true},
  {key:'purple',name:'紫色',color:'#aa44ff',dS:14,dT:10,dP:4,dW:30,dOn:true},
];
function L_SK(){return 'reef_'+_activeTank+'_spectrum_v8';}
const L_dc=o=>JSON.parse(JSON.stringify(o));
const L_DEF={mode:'quick',g:{s:14,t:10,p:4,w:60},ch:{},qr:'aipai'};
L_CH.forEach(c=>{L_DEF.ch[c.key]={s:c.dS,t:c.dT,p:c.dP,w:c.dW,on:c.dOn}});

function L_ld(){try{const r=localStorage.getItem(L_SK());if(!r)return L_dc(L_DEF);const s=JSON.parse(r),c=L_dc(L_DEF);if(s.mode)c.mode=s.mode;if(s.g)Object.assign(c.g,s.g);if(s.ch)for(const k in c.ch)if(s.ch[k])Object.assign(c.ch[k],s.ch[k]);if(s.qr)c.qr=s.qr;return c}catch(e){return L_dc(L_DEF)}}
function L_sv(c){try{localStorage.setItem(L_SK(),JSON.stringify(c))}catch(e){}}
let L_cfg=L_ld(),L_chart=null;

function L_mkStp(id,val,min,max,step){
  return '<div class="stp"><button type="button" onclick="L_stp(\''+id+'\','+(-step)+')">−</button><input type="number" id="'+id+'" value="'+val+'" min="'+min+'" max="'+max+'"><button type="button" onclick="L_stp(\''+id+'\','+step+')">+</button></div>';
}
window.L_stp=function(id,s){
  const e=document.getElementById(id);let v=parseInt(e.value,10)+s;
  v=Math.max(+e.min,Math.min(+e.max,v));e.value=v;
  e.classList.remove('pulse');void e.offsetWidth;e.classList.add('pulse');
  e.dispatchEvent(new Event('change'));
};
function L_bindInput(id){const e=document.getElementById(id);e.addEventListener('change',L_gen);e.addEventListener('keyup',function(ev){if(ev.key==='ArrowUp'||ev.key==='ArrowDown')L_gen()})}

function L_buildGlobal(){
  document.getElementById('g0').innerHTML=L_mkStp('g_s',L_cfg.g.s,0,23,1);
  document.getElementById('g1').innerHTML=L_mkStp('g_t',L_cfg.g.t,2,24,1);
  document.getElementById('g2').innerHTML=L_mkStp('g_p',L_cfg.g.p,0,24,1);
  document.getElementById('g3').innerHTML=L_mkStp('g_w',L_cfg.g.w,0,100,5);
  ['g_s','g_t','g_p','g_w'].forEach(L_bindInput);
}

function L_buildChannels(){
  const box=document.getElementById('chBody');box.innerHTML='';
  L_CH.forEach(c=>{
    const v=L_cfg.ch[c.key],on=v.on!==false;
    const row=document.createElement('div');
    row.className='prow ch-row'+(on?'':' off');row.id='row_'+c.key;
    row.innerHTML='<div class="pcell"><span class="rlabel"><label class="pill" style="--ch-color:'+c.color+'"><input type="checkbox" id="sw_'+c.key+'"'+(on?' checked':'')+' onchange="L_toggleCh(\''+c.key+'\')"><span class="pill-bg"></span><span class="pill-dot"></span></label><span style="color:'+c.color+'">'+c.name+'</span></span></div><div class="pcell">'+L_mkStp('c_'+c.key+'_s',v.s,0,23,1)+'</div><div class="pcell">'+L_mkStp('c_'+c.key+'_t',v.t,1,24,1)+'</div><div class="pcell">'+L_mkStp('c_'+c.key+'_p',v.p,0,24,1)+'</div><div class="pcell">'+L_mkStp('c_'+c.key+'_w',v.w,0,100,1)+'</div>';
    box.appendChild(row);
    ['s','t','p','w'].forEach(p=>L_bindInput('c_'+c.key+'_'+p));
  });
}

window.L_toggleCh=function(key){
  const row=document.getElementById('row_'+key),cb=document.getElementById('sw_'+key);
  if(cb.checked)row.classList.remove('off');else row.classList.add('off');
  L_gen();
};

window.L_setMode=function(m){L_cfg.mode=m;L_applyMode();L_gen()};

function L_applyMode(){
  const qp=document.getElementById('quickPanel'),ap=document.getElementById('advPanel');
  const seg=document.getElementById('seg'),sQ=document.getElementById('segQ'),sA=document.getElementById('segA');
  if(L_cfg.mode==='adv'){qp.classList.add('hidden');ap.classList.add('visible');seg.classList.add('right');sQ.classList.remove('active');sA.classList.add('active');}
  else{qp.classList.remove('hidden');ap.classList.remove('visible');seg.classList.remove('right');sQ.classList.add('active');sA.classList.remove('active');}
}

function L_readG(){return{s:+document.getElementById('g_s').value,t:+document.getElementById('g_t').value,p:+document.getElementById('g_p').value,w:+document.getElementById('g_w').value}}
function L_readCh(k){return{s:+document.getElementById('c_'+k+'_s').value,t:+document.getElementById('c_'+k+'_t').value,p:+document.getElementById('c_'+k+'_p').value,w:+document.getElementById('c_'+k+'_w').value,on:document.getElementById('sw_'+k).checked}}

window.L_openDataModal=function(){
  const m=document.getElementById('lightDataModal');m.style.display='flex';requestAnimationFrame(()=>m.classList.add('open'));
};
window.L_closeDataModal=function(){
  const m=document.getElementById('lightDataModal');m.classList.remove('open');setTimeout(()=>{m.style.display='none'},350);
};

function L_genCh(total,pd,pv,ramp){
  const n=total+1,ctr=total/2,ps=ctr-pd/2,pe=ctr+pd/2,v=[];
  for(let t=0;t<n;t++){
    if(t>=ps&&t<=pe)v.push(pv);
    else if(ramp&&t<ps)v.push(Math.round(pv*t/ps));
    else if(ramp&&t>pe)v.push(Math.round(pv*(total-t)/(total-pe)));
    else v.push(0);
  }
  v[0]=0;v[n-1]=0;return v;
}

function L_getParams(){
  if(L_cfg.mode==='quick'){
    const g=L_readG(),ramp=Math.floor((g.t-g.p)/2);
    return L_CH.map(c=>{
      const isR=c.key==='blue'||c.key==='deep'||c.key==='purple';
      let pw;if(c.key==='white')pw=5;else if(c.key==='red')pw=2;else if(c.key==='green')pw=2;else if(c.key==='purple')pw=Math.round(g.w/2);else pw=g.w;
      if(isR){return{s:g.s,t:g.t,p:g.p,w:pw,ramp:true,on:true};}
      const nrPad=1,nrT=g.p+nrPad*2;return{s:(g.s+ramp-nrPad+24)%24,t:nrT,p:g.p,w:pw,ramp:true,on:true};
    });
  }else{
    return L_CH.map(c=>{const v=L_readCh(c.key);return{s:v.s,t:v.t,p:Math.min(v.p,v.t),w:v.w,ramp:v.t>v.p,on:v.on}});
  }
}

function L_gen(){
  if(typeof Chart==='undefined'||typeof QRCode==='undefined'){setTimeout(L_gen,100);return}
  const _lScrollY=window.scrollY;
  document.body.style.overflow='hidden';
  const params=L_getParams(),labels=Array.from({length:25},(_,i)=>i),absDS=[];
  const tc=getCS('--text3'),gc=getCS('--border')+'40',lc=getCS('--text3');
  const mob=window.innerWidth<600;
  const datasets=L_CH.map((c,i)=>{
    const p=params[i],d24=new Array(24).fill(0);
    if(p.on){const rel=L_genCh(p.t,p.p,p.w,p.ramp);for(let t=0;t<=p.t;t++){const h=(p.s+t)%24;d24[h]=Math.max(d24[h],rel[t]||0)}}
    absDS.push(d24);
    return{label:c.name,data:[...d24,d24[0]],borderColor:c.color,backgroundColor:c.color+'18',borderWidth:_overviewMode?1.8:2.5,pointRadius:4,pointBackgroundColor:c.color,fill:true,tension:0};
  });
  if(L_chart)L_chart.destroy();
  L_chart=new Chart(document.getElementById('lightChart'),{type:'line',data:{labels,datasets},options:{
    responsive:true,maintainAspectRatio:false,animation:{duration:600,easing:'easeOutQuart'},
    plugins:{legend:{labels:{color:lc,usePointStyle:true,padding:mob?10:20,boxWidth:mob?8:12,font:{size:mob?10:12}}},tooltip:{mode:'index',intersect:false,animation:{duration:150}}},
    scales:{x:{title:{display:!mob,text:'时间点（0-24点）',color:tc},ticks:{color:tc},grid:{color:gc},min:0,max:24},y:{title:{display:!mob,text:'光照强度（%）',color:tc},ticks:{color:tc},grid:{color:gc},min:0,max:100}},
    interaction:{mode:'nearest',axis:'x',intersect:false}
  }});
  const tbl=document.getElementById('dataTable');
  let h='<tr><th>时间</th>';labels.forEach(t=>h+='<th>'+t+'</th>');h+='</tr>';
  datasets.forEach((ds,i)=>{h+='<tr><td style="color:'+L_CH[i].color+'">'+ds.label+'</td>';ds.data.forEach(v=>h+='<td>'+v+'</td>');h+='</tr>'});
  tbl.innerHTML=h;
  const qrC=document.getElementById('qrcode');const _qrH=qrC.offsetHeight;if(_qrH)qrC.style.minHeight=_qrH+'px';qrC.innerHTML='';
  new QRCode(qrC,{text:absDS.map(d=>d.join(',')).join('|'),width:256,height:256,colorDark:'#000',colorLight:'#fff',correctLevel:QRCode.CorrectLevel.L});
  setTimeout(()=>{const cv=qrC.querySelector('canvas'),im=qrC.querySelector('img');if(cv&&im){im.src=cv.toDataURL('image/png');im.style.display='block';im.style.maxWidth='100%';im.style.height='auto';cv.style.display='none'}},50);
  requestAnimationFrame(()=>{window.scrollTo(0,_lScrollY);document.body.style.overflow='';});
  L_persist();
}

function L_persist(){
  L_cfg.g=L_readG();
  L_CH.forEach(c=>{try{L_cfg.ch[c.key]=L_readCh(c.key)}catch(e){}});
  L_cfg.qr=document.getElementById('qrBrand').value;L_sv(L_cfg);
}

window.L_resetAll=function(){
  L_cfg=L_dc(L_DEF);L_buildGlobal();L_buildChannels();L_applyMode();
  document.getElementById('qrBrand').value=L_cfg.qr;L_gen();
};

function initLight(){
  L_buildGlobal();L_buildChannels();L_applyMode();
  document.getElementById('qrBrand').value=L_cfg.qr;
  document.getElementById('qrBrand').addEventListener('change',L_gen);
  document.getElementById('lightDataModal').addEventListener('click',function(e){if(e.target===this)L_closeDataModal()});
  window.addEventListener('resize',function(){clearTimeout(window._lrt);window._lrt=setTimeout(()=>{if(_currentPage==='light')L_gen();},200)});
  (function init(){if(typeof Chart!=='undefined'&&typeof QRCode!=='undefined')L_gen();else setTimeout(init,100)})();
}
