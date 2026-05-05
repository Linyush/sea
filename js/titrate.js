/* ============================================================
   TITRATION MODULE
   ============================================================ */
function T_SK(){return 'reef_'+_activeTank+'_titrate_v1';}

// Fixed conversion factors (g needed per L of tank per ppm)
const T_ELEM={
  Ca:{factor:0.004, defW:1000, defG:100, vf:0.2,  hasH:true},
  Mg:{factor:0.009, defW:1000, defG:500, vf:0.64, hasH:true},
  KH:{factor:0.03,  defW:1000, defG:50,  vf:0.4,  hasH:true},
  K: {factor:0.002, defW:1000, defG:200, vf:0,    hasH:false},
};

function tCalc(){
  const tank=parseFloat(document.getElementById('tTank').value)||70;

  // Solution table
  const elems=['Ca','Mg','KH','K'];
  const solutions={};

  elems.forEach(e=>{
    const W=parseFloat(document.getElementById('t'+e+'W').value)||1000;
    const G=parseFloat(document.getElementById('t'+e+'G').value)||1;
    const F=W/G;
    const Gml=F*T_ELEM[e].factor;
    const H=Math.round(W+G*T_ELEM[e].vf);
    solutions[e]={W,G,F,Gml,H};

    document.getElementById('t'+e+'F').textContent=F%1===0?F:F.toFixed(1);
    document.getElementById('t'+e+'ML').textContent=Gml<0.01?Gml.toFixed(4):Gml<1?Gml.toFixed(3):Gml.toFixed(2);
    const hEl=document.getElementById('t'+e+'H');
    if(hEl&&T_ELEM[e].hasH)hEl.textContent=H;
  });

  // Titration table
  elems.forEach(e=>{
    const v1=parseFloat(document.getElementById('t'+e+'1').value)||0;
    const v2=parseFloat(document.getElementById('t'+e+'2').value)||0;
    const days=parseFloat(document.getElementById('t'+e+'D').value)||1;
    const drop=v1-v2;
    const daily=drop/days;

    document.getElementById('t'+e+'Drop').textContent=drop%1===0?drop:drop.toFixed(2);
    document.getElementById('t'+e+'Daily').textContent=daily<0.01?daily.toFixed(4):daily.toFixed(2);

    let titration;
    if(e==='K'){
      titration=daily*solutions[e].Gml*tank;
    }else{
      titration=solutions[e].Gml*daily*tank*solutions[e].H/solutions[e].W;
    }

    const el=document.getElementById('t'+e+'Result');
    if(drop<=0){el.textContent='—';el.style.color='var(--text4)';}
    else{el.textContent=titration.toFixed(2)+' ml';el.style.color='';}
  });

  tSave();
}

function tSave(){
  const ids=['tTank','tCaW','tCaG','tMgW','tMgG','tKHW','tKHG',
    'tKW','tKG',
    'tCa1','tCa2','tCaD','tMg1','tMg2','tMgD','tKH1','tKH2','tKHD',
    'tK1','tK2','tKD'];
  const d={};ids.forEach(id=>{const el=document.getElementById(id);if(el)d[id]=el.value;});
  _s(T_SK(),JSON.stringify(d));
}

function tLoad(){
  const s=_g(T_SK());if(!s)return;
  try{const d=JSON.parse(s);for(const k in d){const el=document.getElementById(k);if(el)el.value=d[k];}}catch(e){}
}

function initTitrate(){
  tLoad();
  const s=_g(T_SK());
  if(!s){const t=TK_current();document.getElementById('tTank').value=t.volume||70;}
  tCalc();
}
