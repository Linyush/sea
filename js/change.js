/* ============================================================
   WATER CHANGE MODULE
   ============================================================ */
function C_SK(){return 'reef_'+_activeTank+'_change_v1';}

function salFromPPT(){
  const ppt=parseFloat(document.getElementById('salinity').value)||0;
  document.getElementById('sg').value=(1+ppt*0.000753).toFixed(3);
  calc();
}
function salFromSG(){
  const sg=parseFloat(document.getElementById('sg').value)||1;
  document.getElementById('salinity').value=Math.round((sg-1)/0.000753*10)/10;
  calc();
}
function calc(){
  const vol=parseFloat(document.getElementById('waterVolume').value)||0;
  const tankTotal=parseFloat(document.getElementById('tankTotal').value)||70;
  const salinity=parseFloat(document.getElementById('salinity').value)||36;
  const roomT=parseFloat(document.getElementById('roomTemp').value)||25;
  const adjT=parseFloat(document.getElementById('adjTemp').value)||0;
  const targetT=parseFloat(document.getElementById('targetTemp').value)||25;

  let roomW,adjW;
  const denom=adjT-roomT;
  if(Math.abs(denom)<0.01){roomW=vol;adjW=0;}
  else{roomW=vol*(adjT-targetT)/denom;adjW=vol-roomW;}

  const impossible=roomW<-0.01||adjW<-0.01;
  roomW=Math.max(0,roomW);adjW=Math.max(0,adjW);

  const salt=vol*salinity;
  const ratio=tankTotal>0?(vol/tankTotal*100):0;

  if(impossible){
    document.getElementById('rRoom').innerHTML='<span class="result-warn">⚠️ 温度无法达到</span>';
    document.getElementById('rAdj').innerHTML='<span class="result-warn">请检查参数</span>';
  }else{
    document.getElementById('rRoom').innerHTML=C_fmt(roomW)+'<span class="r-unit">L</span>';
    document.getElementById('rAdj').innerHTML=C_fmt(adjW)+'<span class="r-unit">L</span>';
  }
  document.getElementById('rSalt').innerHTML=Math.round(salt)+'<span class="r-unit">g</span>';
  document.getElementById('rRatio').innerHTML=ratio.toFixed(1)+'<span class="r-unit">%</span>';
  C_saveInputs();
}

function C_fmt(v){return v%1===0?String(v):v.toFixed(1);}

function C_saveInputs(){
  const ids=['waterVolume','tankTotal','salinity','sg','roomTemp','adjTemp','targetTemp'];
  const d={};ids.forEach(id=>{d[id]=document.getElementById(id).value;});
  _s(C_SK(),JSON.stringify(d));
}
function C_loadInputs(){
  const s=_g(C_SK());if(!s)return;
  try{const d=JSON.parse(s);for(const k in d){const el=document.getElementById(k);if(el)el.value=d[k];}}catch(e){}
}

function initChange(){
  C_loadInputs();
  // If no saved change data, use tank volume
  const s=_g(C_SK());
  if(!s){const t=TK_current();document.getElementById('tankTotal').value=t.volume||70;}
  salFromPPT();
}
