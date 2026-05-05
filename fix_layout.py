#!/usr/bin/env python3
"""
Redesign: bigger add buttons, bigger form with icon top-right,
icon picker left-right split, rename 档案→概览, fix icon_picker on all types.
"""
import re

# ===== Fix index.html =====
with open('index.html', 'r') as f:
    html = f.read()

# 1. Rename "档案" in nav tab
html = html.replace(
    "📋 档案",
    "📋 概览"
)

# 2. Replace inv-add-btn CSS to make bigger add buttons
old_add_btn = """.inv-add-btn{background:none;border:1px dashed var(--border);color:var(--text4);padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;transition:all .2s}
.inv-add-btn:hover{border-color:var(--accent);color:var(--accent)}"""

new_add_btn = """.inv-add-btn{background:none;border:1.5px dashed var(--accent);color:var(--accent);padding:10px 0;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;width:100%;display:block;text-align:center;margin-top:12px;opacity:.7}
.inv-add-btn:hover{opacity:1;background:color-mix(in srgb,var(--accent) 6%,transparent)}"""

html = html.replace(old_add_btn, new_add_btn)

# 3. Move add button from header to after grid
# In HTML: move from inside inv-header to after the grid div
# livestock
html = html.replace(
    '''<div class="inv-header">
          <h3>🐠 生物 <span class="count" id="lsCount"></span></h3>
          <button class="inv-add-btn" onclick="P_openForm('livestock')">+ 添加</button>
        </div>
        <div id="lsGrid"></div>''',
    '''<div class="inv-header">
          <h3>🐠 生物 <span class="count" id="lsCount"></span></h3>
        </div>
        <div id="lsGrid"></div>
        <button class="inv-add-btn" onclick="P_openForm('livestock')">+ 添加生物</button>'''
)
# equipment
html = html.replace(
    '''<div class="inv-header">
          <h3>⚙️ 设备 <span class="count" id="eqCount"></span></h3>
          <button class="inv-add-btn" onclick="P_openForm('equipment')">+ 添加</button>
        </div>
        <div id="eqGrid"></div>''',
    '''<div class="inv-header">
          <h3>⚙️ 设备 <span class="count" id="eqCount"></span></h3>
        </div>
        <div id="eqGrid"></div>
        <button class="inv-add-btn" onclick="P_openForm('equipment')">+ 添加设备</button>'''
)
# consumable
html = html.replace(
    '''<div class="inv-header">
          <h3>📦 耗材 <span class="count" id="cmCount"></span></h3>
          <button class="inv-add-btn" onclick="P_openForm('consumable')">+ 添加</button>
        </div>
        <div id="cmGrid"></div>''',
    '''<div class="inv-header">
          <h3>📦 耗材 <span class="count" id="cmCount"></span></h3>
        </div>
        <div id="cmGrid"></div>
        <button class="inv-add-btn" onclick="P_openForm('consumable')">+ 添加耗材</button>'''
)

# 4. Make form bigger (max-width 520px) and add icon display area in top-right
old_if_box = ".if-box{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;max-width:420px;width:94%;max-height:80vh;overflow-y:auto;transform:scale(.92);opacity:0;transition:transform .3s cubic-bezier(.22,1,.36,1),opacity .25s}"
new_if_box = ".if-box{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;max-width:520px;width:94%;max-height:85vh;overflow-y:auto;transform:scale(.92);opacity:0;transition:transform .3s cubic-bezier(.22,1,.36,1),opacity .25s;position:relative}"
html = html.replace(old_if_box, new_if_box)

# 5. Update form header style to allow space for icon
old_if_h4 = ".if-box h4{font-size:15px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}"
new_if_h4 = ".if-box h4{font-size:15px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;padding-right:70px}"
html = html.replace(old_if_h4, new_if_h4)

# 6. Add new CSS for icon display in form top-right + icon picker left-right layout
# Find the ip-overlay CSS block and replace entirely
old_ip_css = """.ip-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0);z-index:450;align-items:center;justify-content:center;transition:background .3s}
.ip-overlay.open{background:rgba(0,0,0,.55)}
.ip-box{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:0;max-width:420px;width:94%;max-height:80vh;display:flex;flex-direction:column;transform:scale(.92);opacity:0;transition:transform .3s cubic-bezier(.22,1,.36,1),opacity .25s}
.ip-overlay.open .ip-box{transform:scale(1);opacity:1}
.ip-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border);font-weight:600;font-size:14px}
.ip-body{padding:12px 16px;overflow-y:auto;flex:1}
.ip-group-label{font-size:11px;color:var(--text4);font-weight:600;margin:12px 0 6px;text-transform:uppercase;letter-spacing:1px}
.ip-group-label:first-child{margin-top:0}
.ip-group{display:grid;grid-template-columns:repeat(auto-fill,42px);gap:6px}
.ip-opt{width:42px;height:42px;padding:8px;border:1px solid var(--border);border-radius:8px;color:var(--text3);cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}
.ip-opt:hover{border-color:var(--accent);color:var(--accent);transform:scale(1.1)}
.ip-opt.active{border-color:var(--accent);color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,transparent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 20%,transparent)}
.ip-opt svg{width:24px;height:24px}
.ip-footer{padding:12px 16px;border-top:1px solid var(--border);display:flex;align-items:center;gap:12px}
.ip-color-row{display:flex;align-items:center;gap:10px;flex:1}
.ip-color-label{font-size:12px;color:var(--text3);font-weight:500}
#ipColorInput{width:36px;height:36px;padding:2px;border:1px solid var(--border);border-radius:8px;cursor:pointer;background:var(--card);-webkit-appearance:none;appearance:none}
#ipColorInput::-webkit-color-swatch-wrapper{padding:2px}
#ipColorInput::-webkit-color-swatch{border:none;border-radius:4px}
.ip-preview-box{width:42px;height:42px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:8px}
.ip-preview-box svg{width:28px;height:28px}
.ip-no{font-size:11px;color:var(--text5)}"""

new_ip_css = """/* Icon display in form top-right */
.if-icon-display{position:absolute;top:20px;right:20px;width:56px;height:56px;border:1.5px dashed var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;color:var(--text4)}
.if-icon-display:hover{border-color:var(--accent);color:var(--accent)}
.if-icon-display svg{width:36px;height:36px}
.if-icon-display .if-icon-hint{font-size:10px;color:var(--text5)}
/* Icon picker modal - left-right split */
.ip-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0);z-index:450;align-items:center;justify-content:center;transition:background .3s}
.ip-overlay.open{background:rgba(0,0,0,.55)}
.ip-box{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:0;max-width:560px;width:94%;max-height:80vh;display:flex;flex-direction:column;transform:scale(.92);opacity:0;transition:transform .3s cubic-bezier(.22,1,.36,1),opacity .25s}
.ip-overlay.open .ip-box{transform:scale(1);opacity:1}
.ip-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border);font-weight:600;font-size:14px}
.ip-content{display:flex;flex:1;overflow:hidden;min-height:0}
.ip-left{flex:1;padding:12px 16px;overflow-y:auto;border-right:1px solid var(--border)}
.ip-right{width:180px;display:flex;flex-direction:column;flex-shrink:0}
.ip-right-top{flex:1;display:flex;align-items:center;justify-content:center;padding:20px;border-bottom:1px solid var(--border)}
.ip-right-bottom{padding:16px;display:flex;flex-direction:column;align-items:center;gap:12px}
.ip-big-preview{width:64px;height:64px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:12px;transition:all .2s}
.ip-big-preview svg{width:48px;height:48px}
.ip-big-preview .ip-no{font-size:11px;color:var(--text5)}
.ip-color-wrap{display:flex;align-items:center;gap:8px}
.ip-color-label{font-size:12px;color:var(--text3);font-weight:500}
#ipColorInput{width:36px;height:36px;padding:2px;border:1px solid var(--border);border-radius:8px;cursor:pointer;background:var(--card);-webkit-appearance:none;appearance:none}
#ipColorInput::-webkit-color-swatch-wrapper{padding:2px}
#ipColorInput::-webkit-color-swatch{border:none;border-radius:4px}
.ip-group-label{font-size:11px;color:var(--text4);font-weight:600;margin:12px 0 6px;text-transform:uppercase;letter-spacing:1px}
.ip-group-label:first-child{margin-top:0}
.ip-group{display:grid;grid-template-columns:repeat(auto-fill,42px);gap:6px}
.ip-opt{width:42px;height:42px;padding:8px;border:1px solid var(--border);border-radius:8px;color:var(--text3);cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}
.ip-opt:hover{border-color:var(--accent);color:var(--accent);transform:scale(1.1)}
.ip-opt.active{border-color:var(--accent);color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,transparent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 20%,transparent)}
.ip-opt svg{width:24px;height:24px}
.ip-footer{padding:12px 16px;border-top:1px solid var(--border);display:flex;justify-content:flex-end}
.ip-no{font-size:11px;color:var(--text5)}
/* ip-trigger (inline in form, now hidden since we use if-icon-display) */
.ip-trigger{display:none}
/* Mobile: stack vertically */
@media(max-width:500px){.ip-content{flex-direction:column}.ip-left{border-right:none;border-bottom:1px solid var(--border);max-height:50vh}.ip-right{width:100%;flex-direction:row;padding:12px 16px}.ip-right-top{flex:0;padding:12px}.ip-right-bottom{flex:1;flex-direction:row;padding:12px}}"""

html = html.replace(old_ip_css, new_ip_css)

# 7. Replace the icon picker modal HTML with left-right split structure
old_ip_html = """<!-- ========== Icon Picker Modal ========== -->
  <div class="ip-overlay" id="iconPickerOverlay">
    <div class="ip-box">
      <div class="ip-header"><span>选择图标</span><button class="modal-close" onclick="IP_close()">✕</button></div>
      <div class="ip-body" id="ipGrid"></div>
      <div class="ip-footer">
        <div class="ip-color-row">
          <span class="ip-color-label">颜色</span>
          <input type="color" id="ipColorInput" value="#4a90d9" oninput="IP_onColor(this.value)">
          <div class="ip-preview-box" id="ipPreview"></div>
        </div>
        <button class="btn" onclick="IP_confirm()">确认</button>
      </div>
    </div>
  </div>"""

new_ip_html = """<!-- ========== Icon Picker Modal ========== -->
  <div class="ip-overlay" id="iconPickerOverlay">
    <div class="ip-box">
      <div class="ip-header"><span>选择图标</span><button class="modal-close" onclick="IP_close()">✕</button></div>
      <div class="ip-content">
        <div class="ip-left" id="ipGrid"></div>
        <div class="ip-right">
          <div class="ip-right-top"><div class="ip-big-preview" id="ipPreview"><span class="ip-no">未选择</span></div></div>
          <div class="ip-right-bottom">
            <div class="ip-color-wrap"><span class="ip-color-label">颜色</span><input type="color" id="ipColorInput" value="#4a90d9" oninput="IP_onColor(this.value)"></div>
          </div>
        </div>
      </div>
      <div class="ip-footer"><button class="btn" onclick="IP_confirm()">确认</button></div>
    </div>
  </div>"""

html = html.replace(old_ip_html, new_ip_html)

# 8. Update item form HTML to include icon display in top-right
old_form_html = """<div class="if-overlay" id="itemFormOverlay" onclick="if(event.target===this)IF_close()">
  <div class="if-box">
    <h4 id="ifTitle">添加生物</h4>
    <div id="ifFields"></div>
    <div class="if-actions"><button class="btn-ghost" onclick="IF_close()">取消</button><button class="btn-del" id="ifDelBtn" style="display:none" onclick="IF_del()">删除</button><button class="btn" onclick="IF_save()">保存</button></div>
  </div>
</div>"""

new_form_html = """<div class="if-overlay" id="itemFormOverlay" onclick="if(event.target===this)IF_close()">
  <div class="if-box">
    <h4 id="ifTitle">添加生物</h4>
    <div class="if-icon-display" id="ifIconDisplay" onclick="IP_open()" title="选择图标"><span class="if-icon-hint">图标</span></div>
    <div id="ifFields"></div>
    <div class="if-actions"><button class="btn-ghost" onclick="IF_close()">取消</button><button class="btn-del" id="ifDelBtn" style="display:none" onclick="IF_del()">删除</button><button class="btn" onclick="IF_save()">保存</button></div>
  </div>
</div>"""

html = html.replace(old_form_html, new_form_html)

with open('index.html', 'w') as f:
    f.write(html)

print("index.html updated.")

# ===== Fix js/router.js =====
with open('js/router.js', 'r') as f:
    router = f.read()

router = router.replace("profile:{title:'鱼缸档案',badge:'PROFILE'}", "profile:{title:'概览',badge:'OVERVIEW'}")
with open('js/router.js', 'w') as f:
    f.write(router)
print("router.js updated.")

# ===== Fix js/profile.js =====
with open('js/profile.js', 'r') as f:
    prof = f.read()

# Fix equipment icon field: change from type:'text' to type:'icon_picker'
prof = prof.replace(
    "{key:'icon',label:'图标',type:'text',placeholder:'emoji'}",
    "{key:'icon',label:'图标',type:'icon_picker'}"
)
# There might be two occurrences (equipment + consumable)
# Let's check - the first replace only changes one. If both are identical, need a different approach.
# Actually they're both the same string, so let's just replace all.
# The replace above already replaces ALL occurrences.

# Update IP_confirm to also update the if-icon-display in form header
old_ip_confirm = """function IP_confirm(){
  const val=_ipIcon?_ipIcon+'|'+_ipColor:'';
  const trigger=document.getElementById('if_icon');
  if(trigger){
    trigger.dataset.val=val;
    const iconSvg=_ipIcon&&P_ICONS[_ipIcon]?P_ICONS[_ipIcon]:'';
    trigger.innerHTML=(iconSvg?'<span class="ip-preview" style="color:'+_ipColor+'">'+iconSvg+'</span>':'<span class="ip-placeholder">选择图标</span>')+'<span class="ip-arrow">›</span>';
  }
  IP_close();
}"""

new_ip_confirm = """function IP_confirm(){
  const val=_ipIcon?_ipIcon+'|'+_ipColor:'';
  const trigger=document.getElementById('if_icon');
  if(trigger) trigger.dataset.val=val;
  // Update form header icon display
  const disp=document.getElementById('ifIconDisplay');
  if(disp){
    if(_ipIcon&&P_ICONS[_ipIcon]){
      disp.innerHTML='<span style="color:'+_ipColor+'">'+P_ICONS[_ipIcon]+'</span>';
    }else{
      disp.innerHTML='<span class="if-icon-hint">图标</span>';
    }
  }
  IP_close();
}"""

prof = prof.replace(old_ip_confirm, new_ip_confirm)

# Update IP_open to read from ifIconDisplay data-val
old_ip_open = """function IP_open(){
  const trigger=document.getElementById('if_icon');
  const curVal=trigger?trigger.dataset.val:'';
  if(curVal&&curVal.includes('|')){_ipIcon=curVal.split('|')[0];_ipColor=curVal.split('|')[1];}
  else if(curVal){_ipIcon=curVal;_ipColor='#4a90d9';}
  else{_ipIcon='';_ipColor='#4a90d9';}
  IP_render();"""

new_ip_open = """function IP_open(){
  // Read current value from hidden trigger or ifIconDisplay
  const trigger=document.getElementById('if_icon');
  const disp=document.getElementById('ifIconDisplay');
  const curVal=trigger?trigger.dataset.val:(disp?disp.dataset.val:'');
  if(curVal&&curVal.includes('|')){_ipIcon=curVal.split('|')[0];_ipColor=curVal.split('|')[1];}
  else if(curVal){_ipIcon=curVal;_ipColor='#4a90d9';}
  else{_ipIcon='';_ipColor='#4a90d9';}
  IP_render();"""

prof = prof.replace(old_ip_open, new_ip_open)

# Update _ifRenderAll or P_openForm to also set ifIconDisplay state when form opens
# We need to find where the form icon is initialized. Let's look for _ifRenderAll
# Actually the icon field is rendered via _ifRenderField which creates the ip-trigger.
# Since we now hide ip-trigger via CSS (display:none), it still holds data-val.
# We just need to also update ifIconDisplay when form opens.
# Let's add a function call after _ifRenderAll

old_render_all_call_open = """  _ifRenderAll(type,{});
  const ov=document.getElementById('itemFormOverlay');
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}"""

new_render_all_call_open = """  _ifRenderAll(type,{});
  _syncIconDisplay('');
  const ov=document.getElementById('itemFormOverlay');
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}"""

prof = prof.replace(old_render_all_call_open, new_render_all_call_open)

old_render_all_call_edit = """  _ifRenderAll(type,item);
  const ov=document.getElementById('itemFormOverlay');
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}"""

new_render_all_call_edit = """  _ifRenderAll(type,item);
  _syncIconDisplay(item.icon||'');
  const ov=document.getElementById('itemFormOverlay');
  ov.style.display='flex';requestAnimationFrame(()=>ov.classList.add('open'));
}"""

prof = prof.replace(old_render_all_call_edit, new_render_all_call_edit)

# Add _syncIconDisplay function and update IF_collectVals to also read from ifIconDisplay
# Insert after IP_confirm
prof = prof.replace(
    new_ip_confirm,
    new_ip_confirm + """

function _syncIconDisplay(val){
  const disp=document.getElementById('ifIconDisplay');
  if(!disp)return;
  disp.dataset.val=val||'';
  if(val&&val.includes('|')){
    const k=val.split('|')[0],c=val.split('|')[1];
    if(P_ICONS[k]) disp.innerHTML='<span style="color:'+c+'">'+P_ICONS[k]+'</span>';
    else disp.innerHTML='<span class="if-icon-hint">图标</span>';
  }else{
    disp.innerHTML='<span class="if-icon-hint">图标</span>';
  }
}"""
)

# Also update IP_confirm to set data-val on ifIconDisplay
prof = prof.replace(
    "  // Update form header icon display\n  const disp=document.getElementById('ifIconDisplay');",
    "  // Update form header icon display\n  const disp=document.getElementById('ifIconDisplay');\n  if(disp) disp.dataset.val=val;"
)

# Update IF_collectVals to read icon from ifIconDisplay
# Currently it reads from the hidden ip-trigger element with id='if_icon'
# Let's check the current collectVals
old_collect = """function IF_collectVals(){"""
# We need to see the full function. Let's just add a fallback that reads from ifIconDisplay
# Actually the ip-trigger with id=if_icon still exists in DOM (just hidden). data-val is still set by IP_confirm.
# But we also need to make sure IP_confirm sets data-val on ifIconDisplay (already done above).
# The IF_collectVals reads from '#if_icon' dataset.val - this still works since the hidden trigger exists.
# But wait - IP_confirm now sets trigger.dataset.val AND disp.dataset.val. Good.
# However, when opening form for edit, we also need the hidden trigger to get the value.
# Let's check _ifRenderField for icon_picker type - it creates the trigger with data-val set.
# That should be fine since the trigger is still rendered (just hidden by CSS).

# Actually let me also make sure IP_confirm ALSO updates the hidden trigger
# Looking at new_ip_confirm: "if(trigger) trigger.dataset.val=val;" - yes, it does.

# Now let's also fix IF_collectVals to handle case where trigger doesn't exist
# but ifIconDisplay does (fallback)
old_collect_body = """function IF_collectVals(){
  const flds=IF_FIELDS[_ifType];
  const vals={};
  flds.forEach(f=>{
    if(f.key==='sellPrice'&&!document.getElementById('if_sellPrice'))return;
    const el=document.getElementById('if_'+f.key);
    if(!el)return;
    if(f.type==='icon_picker'){
      vals[f.key]=el.dataset.val||'';
    }else if(f.type==='select'&&f.opts&&f.opts.length<=5){
      const active=el.querySelector('.if-tag.active');
      vals[f.key]=active?active.dataset.val:'';
    }else{
      vals[f.key]=el.value;
    }
  });
  return vals;
}"""

new_collect_body = """function IF_collectVals(){
  const flds=IF_FIELDS[_ifType];
  const vals={};
  flds.forEach(f=>{
    if(f.key==='sellPrice'&&!document.getElementById('if_sellPrice'))return;
    if(f.type==='icon_picker'){
      // Read from hidden trigger or ifIconDisplay
      const el=document.getElementById('if_'+f.key);
      const disp=document.getElementById('ifIconDisplay');
      vals[f.key]=(el&&el.dataset.val)||(disp&&disp.dataset.val)||'';
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
}"""

prof = prof.replace(old_collect_body, new_collect_body)

with open('js/profile.js', 'w') as f:
    f.write(prof)
print("profile.js updated.")
print("Done!")
