/* === Backup & Restore === */
function BK_open(){
  document.getElementById('bkOverlay').classList.add('show');
  document.getElementById('bkInfo').innerHTML='';
}
function BK_close(){
  document.getElementById('bkOverlay').classList.remove('show');
}

function BK_export(){
  const data={};
  // Collect all reef_ keys from localStorage
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k&&k.startsWith('reef_')){
      try{data[k]=JSON.parse(localStorage.getItem(k));}
      catch(e){data[k]=localStorage.getItem(k);}
    }
  }
  const json=JSON.stringify(data,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  const d=new Date();
  const ts=d.getFullYear()+''+(d.getMonth()+1+'').padStart(2,'0')+(d.getDate()+'').padStart(2,'0');
  a.download='reef_backup_'+ts+'.json';
  a.click();
  URL.revokeObjectURL(url);
  const count=Object.keys(data).length;
  document.getElementById('bkInfo').innerHTML='<div class="bk-success">✅ 已导出 '+count+' 条数据记录</div>';
}

function BK_import(e){
  const file=e.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=function(ev){
    try{
      const data=JSON.parse(ev.target.result);
      const keys=Object.keys(data).filter(k=>k.startsWith('reef_'));
      if(!keys.length){
        document.getElementById('bkInfo').innerHTML='<div class="bk-error">❌ 无效的备份文件，未找到有效数据</div>';
        return;
      }
      if(!confirm('确定要恢复备份？这将覆盖当前所有数据（共 '+keys.length+' 条记录）。'))return;
      keys.forEach(k=>{
        const v=typeof data[k]==='string'?data[k]:JSON.stringify(data[k]);
        localStorage.setItem(k,v);
      });
      document.getElementById('bkInfo').innerHTML='<div class="bk-success">✅ 已恢复 '+keys.length+' 条数据记录，页面将刷新...</div>';
      setTimeout(()=>location.reload(),1200);
    }catch(err){
      document.getElementById('bkInfo').innerHTML='<div class="bk-error">❌ 文件解析失败：'+err.message+'</div>';
    }
  };
  reader.readAsText(file);
  e.target.value='';
}
