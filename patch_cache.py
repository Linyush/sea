import re

with open('js/profile.js','r') as f:
    pf = f.read()

old = '''  var bgEl=document.getElementById('pfCoverBg');
  if(t.cover){
    var isVideo=/\\.(mp4|webm|mov)(\\?|$)/i.test(t.cover);
    var pos=t.coverPos||'center center';
    if(isVideo){
      if(bgEl){
        bgEl.innerHTML='<video src="'+t.cover+'" muted autoplay loop playsinline style="object-position:'+pos+'"></video>';
      }
    }else{
      if(bgEl){
        bgEl.innerHTML='<img src="'+t.cover+'" style="object-position:'+pos+'">';
      }
    }
    if(bgEl) bgEl.classList.add('active');
  }else{
    if(bgEl){bgEl.innerHTML='';bgEl.classList.remove('active');}
  }'''

new = '''  var bgEl=document.getElementById('pfCoverBg');
  if(t.cover){
    var isVideo=/\\.(mp4|webm|mov)(\\?|$)/i.test(t.cover);
    var pos=t.coverPos||'center center';
    // 只有 cover/pos 变化时才重建，避免视频重新加载
    var curMedia=bgEl?bgEl.querySelector('video,img'):null;
    var sameSrc=curMedia&&curMedia.getAttribute('src')===t.cover&&curMedia.style.objectPosition===pos;
    if(!sameSrc&&bgEl){
      if(isVideo){
        bgEl.innerHTML='<video src="'+t.cover+'" muted autoplay loop playsinline style="object-position:'+pos+'"></video>';
      }else{
        bgEl.innerHTML='<img src="'+t.cover+'" style="object-position:'+pos+'">';
      }
    }
    if(bgEl) bgEl.classList.add('active');
  }else{
    if(bgEl){bgEl.innerHTML='';bgEl.classList.remove('active');}
  }'''

if old in pf:
    pf = pf.replace(old, new)
    with open('js/profile.js','w') as f:
        f.write(pf)
    print('OK')
else:
    print('ERROR: block not found')
