with open('js/router.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_meta = """const PAGE_META={
  profile:{title:'礁岩日记',badge:'概览'},
  water:{title:'礁岩日记',badge:'水质记录'},
  change:{title:'礁岩日记',badge:'换水计算'},
  titrate:{title:'礁岩日记',badge:'滴定计算'},
  light:{title:'礁岩日记',badge:'光谱生成'}
};"""

new_meta = """const PAGE_META={
  profile:{title:'礁岩日记',badge:'',badgeEn:''},
  water:{title:'礁岩日记',badge:'水质记录',badgeEn:'WATER QUALITY'},
  change:{title:'礁岩日记',badge:'换水计算',badgeEn:'WATER CHANGE'},
  titrate:{title:'礁岩日记',badge:'滴定计算',badgeEn:'TITRATION'},
  light:{title:'礁岩日记',badge:'光谱生成',badgeEn:'SPECTRUM'}
};"""

if old_meta in content:
    content = content.replace(old_meta, new_meta)
    print("OK: PAGE_META 已更新")
else:
    print("ERROR: 未找到 PAGE_META")

# 更新 badge 设置逻辑
old_badge = "document.getElementById('pageBadge').textContent=PAGE_META[page].badge;"
new_badge = "const _pb=document.getElementById('pageBadge');if(PAGE_META[page].badge){_pb.innerHTML=PAGE_META[page].badge+'<span class=\"brand-sub-en\">'+PAGE_META[page].badgeEn+'</span>';_pb.style.display='';}else{_pb.innerHTML='';_pb.style.display='none';}"

if old_badge in content:
    content = content.replace(old_badge, new_badge)
    print("OK: badge 逻辑已更新")
else:
    print("ERROR: 未找到 badge 逻辑")

with open('js/router.js', 'w', encoding='utf-8') as f:
    f.write(content)
