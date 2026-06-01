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
  // Add metadata for integrity verification
  const tanks=data['reef_tanks']||[];
  const meta={
    _backup_version:2,
    _backup_time:new Date().toISOString(),
    _tank_count:Array.isArray(tanks)?tanks.length:0,
    _key_count:Object.keys(data).length,
    _tank_names:Array.isArray(tanks)?tanks.map(t=>t.name):[]
  };
  const exportData={_meta:meta,...data};
  const json=JSON.stringify(exportData,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  const d=new Date();
  const ts=d.getFullYear()+''+(d.getMonth()+1+'').padStart(2,'0')+(d.getDate()+'').padStart(2,'0')+'_'+(d.getHours()+'').padStart(2,'0')+(d.getMinutes()+'').padStart(2,'0');
  a.download='reef_backup_'+ts+'.json';
  a.click();
  URL.revokeObjectURL(url);
  const count=Object.keys(data).length;
  const size=(json.length/1024).toFixed(1);
  document.getElementById('bkInfo').innerHTML='<div class="bk-success">✅ 已导出 '+count+' 条数据（'+size+' KB），含 '+meta._tank_count+' 个鱼缸</div>';
  _s('reef_last_backup',Date.now()+'');
}

function BK_import(e){
  const file=e.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=function(ev){
    try{
      const raw=JSON.parse(ev.target.result);
      // Separate meta from data
      const meta=raw._meta||null;
      const data={};
      Object.keys(raw).forEach(k=>{if(k!=='_meta')data[k]=raw[k];});
      const keys=Object.keys(data).filter(k=>k.startsWith('reef_'));
      if(!keys.length){
        document.getElementById('bkInfo').innerHTML='<div class="bk-error">❌ 无效的备份文件，未找到有效数据</div>';
        return;
      }
      // Validate essential keys
      if(!data['reef_tanks']){
        document.getElementById('bkInfo').innerHTML='<div class="bk-error">❌ 备份文件缺少鱼缸数据（reef_tanks），可能已损坏</div>';
        return;
      }
      // Build confirmation message
      let msg='确定要恢复备份？这将覆盖当前所有数据。\n\n';
      msg+='备份包含 '+keys.length+' 条记录';
      if(meta){
        msg+='\n备份时间：'+meta._backup_time;
        if(meta._tank_names&&meta._tank_names.length) msg+='\n鱼缸：'+meta._tank_names.join('、');
      }
      sysConfirm(msg,'恢复',function(){
        // 先清理现有 reef_ 数据，再写入备份
        for(var i=localStorage.length-1;i>=0;i--){
          var ek=localStorage.key(i);
          if(ek&&ek.startsWith('reef_'))localStorage.removeItem(ek);
        }
        keys.forEach(k=>{
          const v=typeof data[k]==='string'?data[k]:JSON.stringify(data[k]);
          localStorage.setItem(k,v);
        });
        // Verify write
        const written=keys.filter(k=>localStorage.getItem(k)!==null).length;
        if(written<keys.length){
          document.getElementById('bkInfo').innerHTML='<div class="bk-error">⚠️ 部分数据写入失败（'+written+'/'+keys.length+'），可能存储空间不足</div>';
        }else{
          document.getElementById('bkInfo').innerHTML='<div class="bk-success">✅ 已恢复 '+keys.length+' 条数据记录，页面将刷新...</div>';
          setTimeout(()=>location.reload(),1200);
        }
      });
    }catch(err){
      document.getElementById('bkInfo').innerHTML='<div class="bk-error">❌ 文件解析失败：'+err.message+'</div>';
    }
  };
  reader.readAsText(file);
  e.target.value='';
}

/* === Auto backup reminder === */
function BK_checkReminder(){
  const lastKey='reef_last_backup';
  const last=_g(lastKey);
  const now=Date.now();
  const WEEK=7*24*60*60*1000;
  if(!last||now-parseInt(last)>WEEK){
    // 超过7天未备份，在概览页显示提示
    setTimeout(function(){
      const box=document.getElementById('pfMaintBox');
      if(box&&!document.getElementById('bkReminder')){
        const div=document.createElement('div');
        div.id='bkReminder';
        div.className='pf-maint-row warn';
        div.innerHTML='<span class="pf-maint-icon">💾</span><span>已超过7天未备份数据，建议 <a href="javascript:BK_doExportAndMark()" style="color:var(--accent);text-decoration:underline">立即备份</a></span>';
        box.appendChild(div);
      }
    },1000);
  }
}
function BK_doExportAndMark(){
  BK_export();
  _s('reef_last_backup',Date.now()+'');
  const r=document.getElementById('bkReminder');
  if(r)r.remove();
}
