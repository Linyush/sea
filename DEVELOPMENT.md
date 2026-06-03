# 礁岩日记（REEF LOG）项目开发规范

## 一、项目概述

礁岩日记是一款纯前端海水缸管理工具，采用单页应用（SPA）架构，零框架依赖（原生 HTML/CSS/JS），数据存储在浏览器 localStorage 中。

**技术栈：** 原生 HTML5 + CSS3 + JavaScript（ES6+），第三方库仅 Chart.js + QRCode.js

**部署：** 静态文件托管，Git 仓库 `main` 分支

---

## 二、项目结构

```
sea/repo/
├── index.html              # 单页入口，所有页面 section + 弹窗 DOM
├── nginx.conf              # Nginx 部署配置
├── css/
│   ├── base.css            # CSS 变量定义（亮/暗主题）
│   ├── header.css          # 顶部导航栏
│   ├── pages.css           # 页面通用布局
│   ├── water.css           # 水质页样式
│   ├── light.css           # 光谱页样式
│   ├── change.css          # 换水页样式
│   ├── titrate.css         # 滴定页样式
│   ├── tank.css            # 鱼缸管理样式
│   ├── maintain.css        # 维护模块样式
│   └── profile.css         # 概览页样式（含封面、投资等）
└── js/
    ├── utils.js            # 全局工具函数（最先加载）
    ├── tank.js             # 多鱼缸管理（数据结构、增删改查）
    ├── profile.js          # 概览页 + 生物/设备/耗材库存
    ├── backup.js           # 数据备份与恢复
    ├── router.js           # SPA 路由
    ├── water.js            # 水质记录与折线图
    ├── light.js            # 光谱配置与生成
    ├── maintain.js         # 维护向导、设置、历史
    ├── change.js           # 换水计算
    ├── titrate.js          # 滴定计算
    ├── init.js             # 全局初始化 + 键盘事件（最后加载）
    ├── chart.umd.min.js    # Chart.js（第三方，勿改）
    ├── chartjs-adapter-date-fns.min.js  # Chart.js 日期适配器（勿改）
    └── qrcode.min.js       # QRCode 生成器（勿改）
```

---

## 三、JS 加载顺序

加载顺序严格固定，函数依赖关系依赖此顺序：

```
Chart.js → chartjs-adapter → qrcode → utils.js → tank.js → profile.js → backup.js → router.js → water.js → light.js → maintain.js → change.js → titrate.js → init.js
```

**关键依赖：**
- `utils.js` 定义 `_g()` / `_s()` / `_r()` / `sysConfirm()` / `toast()` 等全局函数，所有模块依赖
- `tank.js` 定义 `_activeTank` / `TK_current()` 等，所有数据模块依赖
- `init.js` 最后加载，执行全局初始化

---

## 四、命名规范

### 4.1 函数命名

采用**模块前缀 + 功能名**方式，避免命名冲突：

| 模块 | 前缀 | 示例 |
|---|---|---|
| 鱼缸管理 | `TK_` / `TF_` | `TK_switchTo()`, `TF_save()` |
| 概览页 | `P_` / `PF_` | `P_switchTab()`, `PF_fullCover()` |
| 库存表单 | `IF_` | `IF_save()`, `IF_collectVals()` |
| 图标选择器 | `IP_` | `IP_open()`, `IP_close()` |
| 水质 | `W_` | `W_showEditModal()`, `W_closeEdit()` |
| 光谱 | `L_` | `L_ld()`, `L_sv()` |
| 维护 | `MT_` | `MT_openSettings()`, `MT_rerenderSettings()` |
| 换水 | `C_` / `CE_` | `C_SK()`, `CE_save()` |
| 滴定 | `T_` | `T_SK()` |
| 备份 | `BK_` | `BK_export()`, `BK_import()` |
| 全局工具 | 无前缀 | `toast()`, `sysConfirm()`, `localDate()` |

### 4.2 Storage Key 命名

所有 localStorage key **必须以 `reef_` 开头**，便于备份全量抓取：

```
reef_tanks                          # 鱼缸列表
reef_active                         # 当前选中鱼缸 ID
reef_theme                          # 主题设置
reef_last_backup                    # 上次备份时间戳
reef_{tankId}_water_v10             # 水质数据
reef_{tankId}_spectrum_v8           # 光谱配置
reef_{tankId}_change_v1             # 换水记录
reef_{tankId}_titrate_v1            # 滴定数据
reef_{tankId}_maintain_cfg          # 维护设置
reef_{tankId}_maintain_log          # 维护历史
reef_{tankId}_inventory             # 生物/设备/耗材
```

**重要：新增任何存储 key，必须以 `reef_` 开头，否则备份逻辑无法覆盖。**

### 4.3 CSS 类命名

使用**模块前缀 + 短横线**方式（BEM 简化版）：

```
.pf-cover-bg        # profile 封面背景
.mt-wizard-box      # maintain 向导容器
.w-edit-row          # water 编辑行
.tgt-card            # target 指标卡片
.if-row              # inventory form 行
.inv-ft              # inventory filter 按钮
```

### 4.4 CSS 变量

所有颜色使用 CSS 变量，定义在 `base.css` 的 `:root`（暗色）和 `.light`（亮色）中：

```css
--bg, --card, --card-rgb            # 背景色
--text, --text2, --text3, --text4   # 文字层级
--accent                             # 主题强调色
--border, --border2                  # 边框
--warn                               # 警告红
```

---

## 五、UI/交互规范

### 5.1 弹窗/模态窗口

**所有弹窗必须支持三种关闭方式：**
1. 点击关闭按钮 / 取消按钮
2. 点击遮罩层（overlay 外部区域）
3. 按 ESC 键

ESC 键的优先级处理在 `init.js` 中统一管理，按层级从上到下依次判断。

### 5.2 二次确认

**禁止使用原生 `confirm()`**，统一使用 `sysConfirm(msg, okText, callback)`：

```javascript
sysConfirm('确定要删除？', '删除', function(){
  // 确认后的操作
});
```

特点：
- 每次调用重建 DOM，避免复用冲突
- `z-index: 9999`，保证在最上层
- 使用 `addEventListener` 绑定事件，不用 `onclick` 属性
- 回调先存引用再销毁 DOM，防止回调丢失

### 5.3 隐藏/显示 Icon

统一使用 👁（当前可见）和 🙈（当前隐藏），**icon 表示当前状态，不是操作后状态**。

### 5.4 日期输入

统一使用原生 `<input type="date">`，新建表单时默认填入当天日期。

### 5.5 封面系统

- 有封面时隐藏鱼缸 🐠 图标
- 封面覆盖整个卡片（`position:absolute; inset:0`），用渐变遮罩过渡
- 有封面时文字加阴影/半透明底色增强可读性（通过 `.pf-cover-bg.active~` 兄弟选择器）
- 无封面时上述样式不生效
- 视频/图片 DOM 带缓存判断（`_pfCoverKey`），切 tab 不重建

### 5.6 设置页局部更新

维护设置的增删改操作使用 `MT_rerenderSettings()` 局部更新 `.mt-settings-box` 的 innerHTML，**禁止关闭重开整个弹窗**（会闪屏）。

---

## 六、数据规范

### 6.1 备份系统

- 导出文件包含 `_meta` 元数据（版本号、时间、鱼缸名称）
- 恢复前校验 `reef_tanks` 是否存在
- 恢复时先清理所有现有 `reef_*` key，再写入
- 恢复后逐条验证写入是否成功
- 超过 7 天未备份，概览页显示提醒

### 6.2 Ca/Mg 自动换算

在水质页回车提交（`quickAdd()` / `addRow()`）时，必须先触发 `autoConvert()` 执行 Ca/Mg 单位换算，再读取值保存。维护向导中同理使用 `MT_autoConvTest()`。

---

## 七、Git 规范

### 7.1 分支策略

- 主分支：`main`
- **禁止 `git push -f`（强制推送）**
- 遇到冲突使用 `git pull --rebase` 解决

### 7.2 Commit 格式

```
<type>: <description>

type 取值：
  feat     新功能
  fix      修复
  refactor 重构
  style    样式调整
  chore    杂项
```

示例：
```
feat: add sold filter to consumables, default today for date fields
fix: preserve hidden amount blur when cover is active
```

---

## 八、性能注意事项

1. **避免不必要的 DOM 重建** — 如封面视频使用 `_pfCoverKey` 缓存判断，URL 和位置不变则跳过 innerHTML
2. **localStorage 读写使用 try-catch** — `_g()` / `_s()` / `_r()` 已封装异常处理
3. **图表渲染** — 切换页面时检查是否需要重绘（主题变化/尺寸变化），不盲目 destroy+recreate
4. **页面滚动** — `history.scrollRestoration = 'manual'` + `scrollTo(0,0)`，防止 SPA 刷新后偏移

---

## 九、沟通约定

- 思考过程和描述使用**中文**
- 代码本身（变量名、注释等）使用**英文**
- Commit message 使用**英文**
