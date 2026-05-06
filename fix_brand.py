with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_header = """    <div class="left">
      <h1>礁岩日记</h1>
      <span class="badge" id="pageBadge">概览</span>
    </div>"""

new_header = """    <div class="left">
      <div class="brand-title">
        <h1>礁岩日记<span class="brand-en">REEF LOG</span></h1>
        <span class="brand-sub" id="pageBadge"></span>
      </div>
    </div>"""

if old_header in content:
    content = content.replace(old_header, new_header)
    print("OK: header 已更新")
else:
    print("ERROR: 未找到 header")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
