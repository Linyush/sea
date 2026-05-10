/* ============================================================
   WATER QUALITY MODULE
   ============================================================ */
const CA_TABLE=[[0,500],[.02,490],[.04,480],[.06,470],[.08,460],[.10,450],[.12,440],[.14,430],[.16,420],[.18,410],[.20,400],[.22,390],[.24,380],[.26,370],[.28,360],[.30,350],[.32,340],[.34,330],[.36,320],[.38,310],[.40,300],[.42,290],[.44,280],[.46,270],[.48,260],[.50,250]];
const MG_TABLE=[[0,1500],[.02,1470],[.04,1440],[.06,1410],[.08,1380],[.10,1350],[.12,1320],[.14,1290],[.16,1260],[.18,1230],[.20,1200],[.22,1170],[.24,1140],[.26,1110],[.28,1080],[.30,1050],[.32,1020],[.34,990],[.36,960],[.38,930],[.40,900],[.42,870],[.44,840],[.46,810],[.48,780],[.50,750]];
function lookupTable(tbl,v){
  if(v<=tbl[0][0])return tbl[0][1];if(v>=tbl[tbl.length-1][0])return tbl[tbl.length-1][1];
  for(let i=0;i<tbl.length-1;i++){if(v>=tbl[i][0]&&v<=tbl[i+1][0]){const t=(v-tbl[i][0])/(tbl[i+1][0]-tbl[i][0]);return Math.round(tbl[i][1]+(tbl[i+1][1]-tbl[i][1])*t);}}
  return tbl[tbl.length-1][1];
}
function W_SK(){return 'reef_'+_activeTank+'_water_v10';}
const DEF_FIELDS=[
  {key:'no3',name:'NO₃',color:'#f0c040',tgt:5,lo:0,hi:10},
  {key:'po4',name:'PO₄',color:'#4499ee',tgt:0.05,lo:0,hi:0.1},
  {key:'kh', name:'KH', color:'#aa66dd',tgt:8.2,lo:7,hi:9},
  {key:'ca', name:'Ca', color:'#f59e0b',tgt:450,lo:400,hi:480},
  {key:'mg', name:'Mg', color:'#22bbaa',tgt:1350,lo:1250,hi:1450},
];
const SEED=[];
let fields=[],rows=[],expanded=false,W_chart=null,_chartTheme=null;


function _param(k){try{return new URLSearchParams(window.location.search).get(k)}catch(e){return null}}
function _hasAutoBack(){return _param('autoBack')==='1';}
function localDate(){const n=new Date();return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');}
function pd(s){return new Date(s+'T00:00:00')}
function fd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function fs(s){const d=pd(s);return(d.getMonth()+1)+'/'+d.getDate();}
function chartFields(){return fields.filter(f=>!f.hidden);}
function calcBands(){
  const cf=chartFields(),n=cf.length;if(!n)return{};
  const gap=0.04,totalGap=gap*(n-1),bandH=(1-totalGap)/n,bands={};
  cf.forEach((f,i)=>{bands[f.key]={top:i*(bandH+gap),bot:i*(bandH+gap)+bandH};});
  return bands;
}
function load(){
  const s=_g(W_SK());
  if(s){try{const o=JSON.parse(s);
    fields=(o.fields||[]).length?o.fields:DEF_FIELDS.map(f=>({...f}));
    const _extraColors=['#e879f9','#38bdf8','#a3e635','#fb923c','#67e8f9','#fda4af'];fields=fields.map((f,i)=>{const d=DEF_FIELDS.find(x=>x.key===f.key);if(d){f.color=d.color;if(f.lo==null||isNaN(f.lo))f.lo=d.lo;if(f.hi==null||isNaN(f.hi))f.hi=d.hi;if(f.tgt==null||isNaN(f.tgt))f.tgt=d.tgt;}else if(!f.color){f.color=_extraColors[i%_extraColors.length];}return f;});
    rows=o.rows||[];
  }catch(e){_init();}}
  else{_init();}
  rows.sort((a,b)=>a.date.localeCompare(b.date));
}
function _init(){fields=DEF_FIELDS.map(f=>({...f}));rows=[];}
function save(){const sf=fields.map(f=>{const {color,...rest}=f;return rest;});_s(W_SK(),JSON.stringify({fields:sf,rows}));}
function cutoff(){if(!rows.length)return new Date();const l=pd(rows[rows.length-1].date);return new Date(l.getFullYear(),l.getMonth()-3,l.getDate());}
function isOOR(fk,v){if(v==null)return false;const fi=fields.find(x=>x.key===fk);if(!fi)return false;return v<fi.lo||v>fi.hi;}
function calcAxisRange(fi){
  const k=fi.key,vals=rows.filter(r=>r[k]!=null).map(r=>r[k]);
  const tgt=isFinite(fi.tgt)?fi.tgt:0,lo=isFinite(fi.lo)?fi.lo:tgt,hi=isFinite(fi.hi)?fi.hi:tgt;
  vals.push(tgt,lo,hi);if(!vals.length)return{min:0,max:1};
  let mn=Math.min(...vals),mx=Math.max(...vals);
  const rng=mx-mn||mx*0.1||1;mn-=rng*0.15;mx+=rng*0.25;
  const bandSize=hi-lo;
  if(bandSize>0){const needed=bandSize/0.4,center=(lo+hi)/2,half=needed/2;mn=Math.min(mn,center-half);mx=Math.max(mx,center+half);}
  return{min:mn,max:mx};
}
function bandAxisRange(fi,bands){
  const{min:dMin,max:dMax}=calcAxisRange(fi),dRange=dMax-dMin,b=bands[fi.key],bH=b.bot-b.top;
  return{min:dMin-dRange*(1-b.bot)/bH,max:dMax+dRange*b.top/bH};
}
function valToY(fi,v,area,bands){
  const ar=bandAxisRange(fi,bands),h=area.bottom-area.top;
  return area.bottom-(v-ar.min)/(ar.max-ar.min)*h;
}

const lanePlugin={
  id:'lanes',
  beforeDatasetsDraw(c){
    const ctx=c.ctx,area=c.chartArea,h=area.bottom-area.top,bands=calcBands(),n=chartFields().length;
    ctx.save();
    chartFields().forEach(fi=>{
      const yHi=valToY(fi,fi.hi,area,bands),yLo=valToY(fi,fi.lo,area,bands);
      ctx.fillStyle=fi.color+'0D';ctx.fillRect(area.left,yHi,area.right-area.left,yLo-yHi);
      [yHi,yLo].forEach(y=>{ctx.beginPath();ctx.moveTo(area.left,y);ctx.lineTo(area.right,y);ctx.strokeStyle=fi.color+'20';ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.stroke();ctx.setLineDash([]);});
    });
    if(n>1){const gap=0.04,bandH=(1-gap*(n-1))/n;
      for(let i=1;i<n;i++){const y=area.top+h*(i*(bandH+gap)-gap/2);ctx.beginPath();ctx.moveTo(area.left,y);ctx.lineTo(area.right,y);ctx.strokeStyle=getCS('--border');ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);}
    }
    ctx.restore();
  }
};
const dlPlugin={
  id:'dl',
  afterDatasetsDraw(c){
    const ctx=c.ctx;
    c.data.datasets.forEach((ds,di)=>{
      if(ds._isTgt)return;const fk=ds._field;if(!fk)return;
      const meta=c.getDatasetMeta(di);if(meta.hidden)return;
      ctx.save();
      meta.data.forEach((pt,i)=>{
        const v=ds.data[i].y,oor=isOOR(fk,v);
        ctx.font=(oor?'bold ':'')+'11px -apple-system,sans-serif';
        ctx.textAlign='center';
        if(oor){
          /* OOR: value in warn color with contrast outline */
          const warnC='#ff4444';
          ctx.strokeStyle=getCS('--card');ctx.lineWidth=3;ctx.strokeText(v,pt.x,pt.y-10);
          ctx.fillStyle=warnC;ctx.fillText(v,pt.x,pt.y-10);
          /* Triangle marker with white outline */
          const tw2=ctx.measureText(String(v)).width,tx=pt.x+tw2/2+6,ty=pt.y-14;
          ctx.beginPath();ctx.moveTo(tx,ty-6);ctx.lineTo(tx-4,ty+2.5);ctx.lineTo(tx+4,ty+2.5);ctx.closePath();
          ctx.strokeStyle=getCS('--card');ctx.lineWidth=2;ctx.stroke();
          ctx.fillStyle=warnC;ctx.fill();
          ctx.font='bold 6px sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('!',tx,ty+1);

        } else {
          if(!_overviewMode){ctx.fillStyle=ds.borderColor;ctx.fillText(v,pt.x,pt.y-10);}
        }
      });
      ctx.restore();
    });
  }
};

let _hoverX=null;
const crosshairPlugin={
  id:'crosshair',
  afterDraw(c){
    if(_hoverX==null)return;
    const ctx=c.ctx,area=c.chartArea;
    ctx.save();ctx.beginPath();ctx.moveTo(_hoverX,area.top);ctx.lineTo(_hoverX,area.bottom);
    ctx.strokeStyle=getCS('--text4');ctx.lineWidth=1;ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  }
};

function _handleChartHover(mouseX,mouseY){
  const tt=document.getElementById('customTooltip');
  const xScale=W_chart.scales.x;
  let bestDist=Infinity,bestRow=null,bestPx=0;
  rows.forEach(r=>{
    const px=xScale.getPixelForValue(new Date(r.date+'T00:00:00'));
    const d=Math.abs(px-mouseX);
    if(d<bestDist){bestDist=d;bestRow=r;bestPx=px;}
  });
  if(!bestRow||bestDist>30){tt.classList.remove('show');_hoverX=null;W_chart.draw();return;}
  const dateRows=rows.filter(r=>r.date===bestRow.date);
  let html='';
  dateRows.forEach(row=>{
    html+='<div class="tt-title">'+fs(row.date)+'</div>';
    fields.forEach(fi=>{const v=row[fi.key];if(v==null)return;const oor=isOOR(fi.key,v);
      html+='<div class="tt-row"><span class="tt-dot" style="background:'+fi.color+'"></span><span class="tt-name">'+fi.name+'</span><span class="tt-val'+(oor?' tt-warn':'')+'">'+v+(oor?' ⚠':'')+'</span></div>';
    });
  });
  if(!html){tt.classList.remove('show');_hoverX=null;W_chart.draw();return;}
  tt.innerHTML=html;tt.classList.add('show');
  const outer=document.getElementById('chartOuter'),wrap=document.getElementById('chartWrap');
  const outerRect=outer.getBoundingClientRect(),scrollLeft=wrap.scrollLeft;
  const ttLeft=bestPx-scrollLeft+16,ttTop=mouseY-outerRect.top;
  const ttW=tt.offsetWidth;
  tt.style.left=(ttLeft+ttW>outer.clientWidth-10?(bestPx-scrollLeft-ttW-16):ttLeft)+'px';
  tt.style.top=Math.max(10,Math.min(ttTop-20,outer.clientHeight-tt.offsetHeight-10))+'px';
  _hoverX=bestPx;W_chart.draw();
}

function updateLaneLabels(){
  if(!W_chart)return;const area=W_chart.chartArea;if(!area)return;
  const h=area.bottom-area.top,bands=calcBands(),el=document.getElementById('laneLabels');
  el.innerHTML='';
  chartFields().forEach(fi=>{
    const b=bands[fi.key],yTop=area.top+h*b.top+4;
    const lbl=document.createElement('div');lbl.className='lane-lbl';
    lbl.style.top=yTop+'px';lbl.style.color=fi.color;lbl.textContent=fi.name;
    el.appendChild(lbl);
  });
}

let _overviewMode=false;
function toggleOverview(){
  _overviewMode=!_overviewMode;
  const btn=document.getElementById('overviewBtn');if(btn)btn.classList.toggle('active',_overviewMode);
  renderChart();
}
function renderChart(){
  const labels=rows.map(r=>r.date);
  const outer=document.getElementById("chartOuter");
  const emptyEl=document.getElementById("chartEmpty");
  if(!rows.length||!labels.length){if(outer)outer.style.display="none";if(emptyEl)emptyEl.style.display="";return;}
  if(outer)outer.style.display="";if(emptyEl)emptyEl.style.display="none";
  const bands=calcBands(),ds=[],cs=getComputedStyle(document.documentElement);
  const firstDate=rows[0].date,lastDate=rows[rows.length-1].date;
  const scales={x:{type:'time',time:{unit:'day',tooltipFormat:'M/d',displayFormats:{day:'M/d',week:'M/d',month:'yyyy/M'}},min:firstDate,max:fd(new Date(pd(lastDate).getTime()+30*86400000)),ticks:{color:cs.getPropertyValue('--text3').trim(),font:{size:11,weight:'500'},maxRotation:45,autoSkip:true,maxTicksLimit:_overviewMode?20:15},grid:{color:cs.getPropertyValue('--border').trim()+'40'}}};
  chartFields().forEach(fi=>{
    const k=fi.key,c=fi.color,yId='y_'+k,ar=bandAxisRange(fi,bands);
    const pts=rows.filter(r=>r[k]!=null&&!r._hidden).map(r=>({x:r.date,y:r[k],_date:r.date,_dateLabel:fs(r.date)}));
    ds.push({label:fi.name,data:pts,borderColor:c,backgroundColor:c+'22',borderWidth:_overviewMode?1.8:2.5,pointRadius:_overviewMode?2.5:4.5,pointBackgroundColor:c,pointBorderColor:cs.getPropertyValue('--card').trim(),pointBorderWidth:_overviewMode?1:2,pointHoverRadius:_overviewMode?4:7,pointHitRadius:12,tension:.3,yAxisID:yId,spanGaps:true,_field:k});
    if(fi.tgt!=null&&rows.length>=2)ds.push({label:fi.name+' tgt',data:[{x:firstDate,y:fi.tgt},{x:lastDate,y:fi.tgt}],borderColor:c+'55',borderWidth:1.5,borderDash:[6,4],pointRadius:0,pointHitRadius:0,tension:0,yAxisID:yId,_isTgt:true});
    scales[yId]={type:'linear',display:false,min:ar.min,max:ar.max};
  });
  const innerEl=document.getElementById('chartInner');
  const wrapW=document.getElementById('chartWrap').clientWidth;
  if(_overviewMode){
    innerEl.style.width=wrapW+'px';
  } else {
    const totalDays=Math.max(1,Math.round((pd(lastDate).getTime()-pd(firstDate).getTime())/86400000));
    const vis90=112;
    const perDay=wrapW/Math.min(totalDays,vis90);
    innerEl.style.width=Math.round(Math.max(totalDays*perDay,wrapW))+'px';
  }
  if(W_chart)W_chart.destroy();
  _hoverX=null;
  const _cw=document.getElementById('chartWrap');if(_cw&&!_overviewMode)_cw.scrollLeft=_cw.scrollWidth;
  W_chart=new Chart(document.getElementById('mainChart'),{type:'line',data:{datasets:ds},options:{
    responsive:true,maintainAspectRatio:false,
    animation:{duration:600,easing:'easeOutQuart',onComplete:()=>updateLaneLabels()},
    interaction:{mode:'nearest',intersect:false,axis:'x'},
    plugins:{legend:{display:false},tooltip:{enabled:false}},
    scales:scales,onHover:function(){}
  },plugins:[lanePlugin,dlPlugin,crosshairPlugin]});
  updateLaneLabels();
  const canvas=document.getElementById('mainChart');
  canvas.onmousemove=function(e){if(!W_chart)return;const rect=canvas.getBoundingClientRect();const mouseX=e.clientX-rect.left;const mouseY=e.clientY;_handleChartHover(mouseX,mouseY);};
  canvas.onmouseleave=function(){document.getElementById('customTooltip').classList.remove('show');_hoverX=null;if(W_chart)W_chart.draw();};
  canvas.ondblclick=function(e){if(!W_chart)return;const rect=canvas.getBoundingClientRect();const mouseX=e.clientX-rect.left;W_openEditRow(mouseX);};
  _chartTheme=document.documentElement.classList.contains("light")?"light":"dark";
}

/* Import / Export */
function _ts(){const n=new Date();return n.getFullYear()+String(n.getMonth()+1).padStart(2,'0')+String(n.getDate()).padStart(2,'0')+'_'+String(n.getHours()).padStart(2,'0')+String(n.getMinutes()).padStart(2,'0')+String(n.getSeconds()).padStart(2,'0');}
function doExport(){
  const data=JSON.stringify({fields,rows},null,2);const blob=new Blob([data],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='reef_water_'+_ts()+'.json';a.click();URL.revokeObjectURL(a.href);toast('已导出 '+a.download);
}
function doImport(input){
  const file=input.files[0];if(!file)return;
  sysConfirm('导入将覆盖当前所有数据（包括目标值和记录），确定继续？','导入',function(){W_doImport(input);});
}
function W_doImport(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{const o=JSON.parse(e.target.result);
      if(!o.fields||!Array.isArray(o.fields)||!o.rows||!Array.isArray(o.rows)){toast('文件格式不正确');input.value='';return;}
      fields=o.fields;rows=o.rows;rows.sort((a,b)=>a.date.localeCompare(b.date));
      save();renderModal();renderChart();renderQuickBar();toast('已导入 '+rows.length+' 条记录');
    }catch(err){toast('解析失败: '+err.message);}
    input.value='';
  };reader.readAsText(file);
}
function autoBackup(){if(!_hasAutoBack())return;doExport();}

function openModal(){const m=document.getElementById('dataModal');m.style.display='flex';requestAnimationFrame(()=>m.classList.add('open'));renderModal();}
function closeModal(){const m=document.getElementById('dataModal');m.classList.remove('open');setTimeout(()=>{m.style.display='none';},350);}
function renderTgtGrid(){
  let h='';
  fields.forEach((fi,i)=>{
    const custom=!DEF_FIELDS.some(d=>d.key===fi.key);
    h+='<div class="tgt-card"><div class="tgt-hd"><div class="left"><span class="sw" style="background:'+fi.color+'"></span><span style="color:'+fi.color+'">'+fi.name+'</span></div><div class="tgt-hd-right"><button class="tgt-hide-btn'+(fi.hidden?' active':'')+'" onclick="toggleFieldHidden('+i+',!fields['+i+'].hidden)" title="'+(fi.hidden?'显示折线图':'隐藏折线图')+'">'+(fi.hidden?'🙈':'👁')+'</button>'+(custom?'<button class="del-field-btn" onclick="delField('+i+')" title="删除">✕</button>':'')+'</div></div><div class="tgt-row"><span class="rl">目标</span><input class="tgt-v" type="text" inputmode="decimal" value="'+fi.tgt+'" onchange="chgField('+i+',\'tgt\',this.value)"></div><div class="tgt-row"><span class="rl">下限</span><input type="text" inputmode="decimal" value="'+fi.lo+'" onchange="chgField('+i+',\'lo\',this.value)"></div><div class="tgt-row"><span class="rl">上限</span><input type="text" inputmode="decimal" value="'+fi.hi+'" onchange="chgField('+i+',\'hi\',this.value)"></div></div>';
  });
  h+='<div class="add-field-card" onclick="openNf()"><span>+</span></div>';
  document.getElementById('tgtGrid').innerHTML=h;
}
function chgField(i,prop,v){const n=parseFloat(v);if(!isNaN(n)){fields[i][prop]=n;save();renderChart();if(prop!=='tgt')renderTable();toast(fields[i].name+' 已更新');}}
function renderThead(){document.getElementById('thead').innerHTML='<tr><th style="width:96px">日期</th>'+fields.map(fi=>'<th><span class="th-dot" style="background:'+fi.color+'"></span>'+fi.name+'</th>').join('')+'<th style="width:30px"></th><th style="width:30px"></th></tr>';}
function renderTable(){
  const tb=document.getElementById('tbody'),co=cutoff(),rev=rows.slice().reverse(),dd=localDate();
  let h='<tr class="add-row"><td><input type="text" id="iDate" value="'+dd+'" placeholder="YYYY-MM-DD"></td>';
  fields.forEach(fi=>{
    const isCaMg=(fi.key==='ca'||fi.key==='mg');
    h+='<td style="position:relative"><input type="text" id="i'+fi.key+'" placeholder="'+fi.name+'"'+(isCaMg?' onblur="autoConvert(\''+fi.key+'\',this)"':'')+'>';
    if(isCaMg)h+='<span class="conv-hint" id="hint_'+fi.key+'"></span>';h+='</td>';
  });
  h+='<td></td><td style="text-align:center"><button class="btn-sm" onclick="addRow()">+</button></td></tr>';
  rev.forEach((r,ri)=>{
    const idx=rows.length-1-ri,old=pd(r.date)<co,hide=old&&!expanded;
    h+='<tr'+(old?' class="old-row"':'')+(hide?' style="display:none"':'')+'><td class="dc">'+fs(r.date)+'</td>'+fields.map(fi=>{const v=r[fi.key],oor=isOOR(fi.key,v);return '<td><input class="'+(oor?'val-warn':'')+'" value="'+(v!=null?v:'')+'" placeholder="-" onchange="editCell('+idx+',\''+fi.key+'\',this)" onfocus="this.select()"></td>';}).join('')+'<td><button class="del-btn hide-row-btn'+(r._hidden?' active':'')+'" onclick="toggleRowHidden('+idx+')" title="'+(r._hidden?'显示':'隐藏')+'">'+(r._hidden?'🙈':'👁')+'</button></td><td><button class="del-btn" onclick="askDel('+idx+')">✕</button></td></tr>';
  });
  tb.innerHTML=h;
  document.getElementById('expandBar').style.display=rows.some(r=>pd(r.date)<co)?'':'none';
}
function autoConvert(fk,el){
  const v=parseFloat(el.value);if(isNaN(v)||v>=1)return;
  const tbl=fk==='ca'?CA_TABLE:MG_TABLE;const ppm=lookupTable(tbl,v);el.value=ppm;
  const hint=document.getElementById('hint_'+fk);
  if(hint){hint.textContent='读数 '+v+' → '+ppm+'ppm';hint.classList.add('show');setTimeout(()=>hint.classList.remove('show'),3000);}
}
function toggleExpand(){
  expanded=!expanded;const b=document.getElementById('expandBtn');
  b.classList.toggle('open',expanded);b.querySelector('.arrow').style.transform=expanded?'rotate(180deg)':'';
  b.childNodes[0].textContent=expanded?'收起旧数据 ':'查看更早数据 ';
  document.querySelectorAll('.old-row').forEach(tr=>{tr.style.display=expanded?'':'none';});
}
function editCell(idx,fk,el){
  const v=el.value.trim();rows[idx][fk]=v===''?null:parseFloat(v);
  el.classList.add('pulse');setTimeout(()=>el.classList.remove('pulse'),400);
  el.classList.toggle('val-warn',isOOR(fk,rows[idx][fk]));save();renderChart();
}
function parseDate(s){
  let m;
  if((m=s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/)))return m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0');
  if((m=s.match(/^(\d{4})(\d{2})(\d{2})$/)))return m[1]+'-'+m[2]+'-'+m[3];
  if((m=s.match(/^(\d{1,2})[-\/.](\d{1,2})$/)))return new Date().getFullYear()+'-'+m[1].padStart(2,'0')+'-'+m[2].padStart(2,'0');
  return null;
}
function addRow(){
  fields.forEach(fi=>{if(fi.key==="ca"||fi.key==="mg"){var el=document.getElementById("i"+fi.key);if(el)autoConvert(fi.key,el);}});
  const raw=document.getElementById('iDate').value.trim(),dv=parseDate(raw);
  if(!dv){toast('日期格式不正确');return;}
  if(rows.some(r=>r.date===dv)){toast('该日期已存在');return;}
  const r={date:dv};
  fields.forEach(fi=>{const el=document.getElementById('i'+fi.key);const v=el.value.trim();r[fi.key]=v===''?null:parseFloat(v);});
  rows.push(r);rows.sort((a,b)=>a.date.localeCompare(b.date));save();
  fields.forEach(fi=>{document.getElementById('i'+fi.key).value='';});
  renderTable();renderChart();toast('已添加 '+fs(dv));autoBackup();
}
let _di=-1;
function askDel(i){
  _di=i;document.getElementById('delMsg').textContent='确定删除 '+fs(rows[i].date)+' 的记录？';
  const m=document.getElementById('delCfm');m.style.display='flex';requestAnimationFrame(()=>m.classList.add('open'));
  document.getElementById('delOk').onclick=()=>{rows.splice(_di,1);save();renderTable();renderChart();closeDel();toast('已删除');};
}
function closeDel(){const m=document.getElementById('delCfm');m.classList.remove('open');setTimeout(()=>{m.style.display='none';},300);}
function resetAll(){sysConfirm('确定恢复默认目标值并清空所有数据？','重置',function(){_r(W_SK());load();renderModal();renderChart();toast('已重置');});}
function openNf(){const m=document.getElementById('nfModal');m.style.display='flex';requestAnimationFrame(()=>m.classList.add('open'));}
function closeNf(){const m=document.getElementById('nfModal');m.classList.remove('open');setTimeout(()=>{m.style.display='none';},300);}
function doAddField(){
  const key=document.getElementById('nfKey').value.trim().toLowerCase(),name=document.getElementById('nfName').value.trim(),color=document.getElementById('nfColor').value;
  const tgtV=parseFloat(document.getElementById('nfTgt').value),lo=parseFloat(document.getElementById('nfLo').value),hi=parseFloat(document.getElementById('nfHi').value);
  if(!key||!name){toast('请填写标识和名称');return;}
  if(!/^[a-z][a-z0-9_]*$/.test(key)){toast('标识需英文小写字母开头');return;}
  if(fields.some(f=>f.key===key)){toast('标识已存在');return;}
  fields.push({key,name,color,tgt:isNaN(tgtV)?0:tgtV,lo:isNaN(lo)?0:lo,hi:isNaN(hi)?0:hi});
  save();closeNf();renderModal();renderChart();renderQuickBar();toast(name+' 已添加');
  ['nfKey','nfName','nfTgt','nfLo','nfHi'].forEach(id=>{document.getElementById(id).value='';});
}
function delField(i){
  sysConfirm('确定删除指标 '+fields[i].name+'？','删除',function(){
    const key=fields[i].key;fields.splice(i,1);rows.forEach(r=>{delete r[key];});
    save();renderModal();renderChart();renderQuickBar();toast('已删除');
  });
}
function renderModal(){renderTgtGrid();renderThead();renderTable();}
function renderQuickBar(){
  const el=document.getElementById('qbFields');
  el.innerHTML=fields.map(fi=>{
    const isCaMg=(fi.key==='ca'||fi.key==='mg');
    return '<div class="qb-field"><span class="qd" style="background:'+fi.color+'"></span><input type="text" id="q'+fi.key+'" placeholder="'+fi.name+'"'+(isCaMg?' onblur="autoConvert(\''+fi.key+'\',this)"':'')+' onkeydown="if(event.key===\'Enter\')quickAdd()"></div>';
  }).join('');
  document.getElementById('qDate').value=localDate();
}
function quickAdd(){
  fields.forEach(fi=>{if(fi.key==="ca"||fi.key==="mg"){var el=document.getElementById("q"+fi.key);if(el)autoConvert(fi.key,el);}});
  const raw=document.getElementById('qDate').value.trim(),dv=parseDate(raw);
  if(!dv){toast('日期格式不正确');return;}
  if(rows.some(r=>r.date===dv)){toast('该日期已存在');return;}
  const r={date:dv};let hasVal=false;
  fields.forEach(fi=>{const el=document.getElementById('q'+fi.key);const v=el.value.trim();r[fi.key]=v===''?null:parseFloat(v);if(v!=='')hasVal=true;});
  if(!hasVal){toast('请至少填写一项数据');return;}
  rows.push(r);rows.sort((a,b)=>a.date.localeCompare(b.date));save();
  fields.forEach(fi=>{document.getElementById('q'+fi.key).value='';});
  renderChart();toast('已添加 '+fs(dv));autoBackup();
}


function toggleRowHidden(idx){rows[idx]._hidden=!rows[idx]._hidden;save();renderChart();renderTable();}
function toggleFieldHidden(i,v){fields[i].hidden=v;save();renderChart();renderModal();updateLaneLabels();}

/* --- Double-click edit modal for chart data --- */
function W_openEditRow(mouseX){
  const xScale=W_chart.scales.x;
  let bestDist=Infinity,bestRow=null,bestIdx=-1;
  rows.forEach((r,i)=>{
    const px=xScale.getPixelForValue(new Date(r.date+'T00:00:00'));
    const d=Math.abs(px-mouseX);
    if(d<bestDist){bestDist=d;bestRow=r;bestIdx=i;}
  });
  if(!bestRow||bestDist>40)return;
  W_showEditModal(bestIdx);
}

function W_showEditModal(idx){
  const r=rows[idx];if(!r)return;
  let ex=document.getElementById('wEditOverlay');if(ex)ex.remove();
  let html='<div class="modal-overlay open" id="wEditOverlay" onclick="if(event.target===this)W_closeEdit()" style="z-index:150">';
  html+='<div class="modal" style="max-width:400px;transform:scale(1);opacity:1">';
  html+='<div class="modal-hd"><h3><span class="dot"></span>编辑数据</h3><button class="modal-close" onclick="W_closeEdit()">✕</button></div>';
  html+='<div class="modal-bd" style="padding:16px 20px">';
  html+='<div class="w-edit-list">';
  html+='<div class="w-edit-row"><span class="w-edit-label">日期</span><input type="text" id="wEdit_date" value="'+r.date+'" class="w-edit-input"></div>';
  fields.forEach(fi=>{
    const v=r[fi.key]!=null?r[fi.key]:'';
    html+='<div class="w-edit-row"><span class="w-edit-label" style="color:'+fi.color+'">'+fi.name+'</span><input type="number" step="any" id="wEdit_'+fi.key+'" value="'+v+'" placeholder="-" class="w-edit-input"></div>';
  });
  html+='</div>';
  html+='<div class="w-edit-actions">';
  html+='<button class="btn-ghost" onclick="W_toggleEditHidden('+idx+')" id="wEditHideBtn">'+(r._hidden?'👁 显示此条':'🙈 隐藏此条')+'</button>';
  html+='<span style="flex:1"></span>';
  html+='<button class="btn-ghost" onclick="W_deleteEditRow('+idx+')">🗑️ 删除</button>';
  html+='<button class="btn" onclick="W_saveEdit('+idx+')">保存</button>';
  html+='</div>';
  html+='</div></div></div>';
  document.body.insertAdjacentHTML('beforeend',html);
}

function W_toggleEditHidden(idx){
  rows[idx]._hidden=!rows[idx]._hidden;
  var btn=document.getElementById('wEditHideBtn');
  if(btn) btn.textContent=rows[idx]._hidden?'👁 显示此条':'🙈 隐藏此条';
  save();renderChart();renderTable();
}

function W_closeEdit(){const el=document.getElementById('wEditOverlay');if(el)el.remove();}

function W_saveEdit(idx){
  var dateEl=document.getElementById('wEdit_date');
  if(dateEl){var nd=parseDate(dateEl.value.trim());if(nd)rows[idx].date=nd;}
  fields.forEach(fi=>{
    const el=document.getElementById('wEdit_'+fi.key);
    if(!el)return;
    const v=el.value.trim();
    rows[idx][fi.key]=v===''?null:parseFloat(v);
  });
  rows.sort((a,b)=>a.date.localeCompare(b.date));
  save();renderChart();renderModal();W_closeEdit();toast('已更新');
}

function W_deleteEditRow(idx){
  sysConfirm('确定删除 '+fs(rows[idx].date)+' 的记录？','删除',function(){rows.splice(idx,1);save();renderChart();renderModal();W_closeEdit();toast('已删除');});
}

function initWater(){
  load();renderChart();renderQuickBar();
  document.getElementById('qDate').addEventListener('keydown',function(e){if(e.key==='Enter')quickAdd();});
  if(_hasAutoBack()){const lbl=document.getElementById('autoBackLabel');if(lbl)lbl.style.display='flex';}

}
