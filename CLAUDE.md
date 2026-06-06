# CLAUDE.md

## 项目说明
礁岩日记（REEF LOG）- 海水缸管理工具，纯 JS SPA，无构建工具，localStorage 存储。

**技术栈：** 原生 HTML5 + CSS3 + JavaScript（ES6+），第三方库仅 Chart.js + QRCode.js

---

## 项目结构

```
├── index.html              # 单页入口，所有页面 section + 弹窗 DOM
├── nginx.conf              # Nginx 部署配置
├── css/
│   ├── base.css            # CSS 变量定义（亮/暗主题）
│   ├── header.css          # 顶部导航栏 + 云端面板
│   ├── pages.css           # 页面通用布局
│   ├── water.css           # 水质页样式
│   ├── light.css           # 光谱页样式
│   ├── change.css          # 换水页样式
│   ├── titrate.css         # 滴定页样式
│   ├── tank.css            # 右侧书签栏 + 鱼缸/账号 tab
│   ├── maintain.css        # 维护模块样式
│   └── profile.css         # 概览页样式（含封面、投资等）
└── js/
    ├── utils.js            # 全局工具函数（最先加载）
    ├── md5.js              # MD5 哈希（密码加密）
    ├── sync.js             # 云端备份同步模块
    ├── tank.js             # 多鱼缸管理（数据结构、增删改查、右侧栏渲染）
    ├── profile.js          # 概览页 + 生物/设备/耗材库存
    ├── router.js           # SPA 路由
    ├── water.js            # 水质记录与折线图
    ├── light.js            # 光谱配置与生成
    ├── maintain.js         # 维护向导、设置、历史
    ├── change.js           # 换水计算
    ├── titrate.js          # 滴定计算
    ├── init.js             # 全局初始化 + 键盘事件（最后加载）
    ├── chart.umd.min.js    # Chart.js（勿改）
    ├── chartjs-adapter-date-fns.min.js  # 日期适配器（勿改）
    └── qrcode.min.js       # QRCode 生成器（勿改）
```

---

## JS 加载顺序

加载顺序严格固定：

```
Chart.js → chartjs-adapter → qrcode → utils.js → md5.js → sync.js → tank.js → profile.js → router.js → water.js → light.js → maintain.js → change.js → titrate.js → init.js
```

**关键依赖：**
- `utils.js` 定义 `_g()` / `_s()` / `_r()` / `sysConfirm()` / `toast()` 等全局函数，所有模块依赖
- `sync.js` 定义 `SYNC_init()` / `SYNC_markDirty()` 等，`tank.js` 中 `TK_renderBar` 渲染账号 tab
- `tank.js` 定义 `_activeTank` / `TK_current()` 等，所有数据模块依赖
- `init.js` 最后加载，执行全局初始化

---

## 命名规范

### 函数命名

采用**模块前缀 + 功能名**，避免命名冲突：

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
| 云端同步 | `SYNC_` | `SYNC_push()`, `SYNC_pull()`, `SYNC_markDirty()` |
| 账号表单 | `AF_` | `AF_open()`, `AF_confirm()` |
| 全局工具 | 无前缀 | `toast()`, `sysConfirm()`, `localDate()` |

### Storage Key 命名

所有 localStorage key **必须以 `reef_` 开头**，否则备份逻辑无法覆盖：

```
reef_tanks                          # 鱼缸列表
reef_active                         # 当前选中鱼缸 ID
reef_theme                          # 主题设置
reef_account                        # 云同步账号
reef_account_pwd                    # 云同步密码（MD5）
reef_auto_sync                      # 自动同步开关
reef_sync_version                   # 同步版本号
reef_sync_dirty                     # 未同步标记
reef_sync_time                      # 上次同步时间
reef_{tankId}_water_v10             # 水质数据
reef_{tankId}_spectrum_v8           # 光谱配置
reef_{tankId}_change_v1             # 换水记录
reef_{tankId}_titrate_v1            # 滴定数据
reef_{tankId}_maintain_cfg          # 维护设置
reef_{tankId}_maintain_log          # 维护历史
reef_{tankId}_inventory             # 生物/设备/耗材
```

其中 `reef_account`、`reef_account_pwd`、`reef_auto_sync`、`reef_sync_version`、`reef_sync_dirty`、`reef_sync_time` 为云同步内部 key，不参与数据备份。

### CSS 命名

使用**模块前缀 + 短横线**（BEM 简化版）：`.pf-cover-bg`、`.mt-wizard-box`、`.w-edit-row`、`.if-row`

### CSS 变量

所有颜色使用 `base.css` 中 `:root`（暗色）和 `.light`（亮色）定义的变量：`--bg`、`--card`、`--text`/`text2`/`text3`/`text4`、`--accent`、`--border`、`--warn`

---

## UI/交互规范

- **系统风格**：整个系统设计风格为：柔和、简洁，让用户有种进入果冻世界的感受，所有 UI 设计、交互动效都必须符合这一风格
- **弹窗三种关闭方式**：关闭按钮 / 点击遮罩 / ESC 键。ESC 优先级在 `init.js` 统一管理
- **禁止原生 `confirm()`**，统一用 `sysConfirm(msg, okText, callback)`
- **隐藏/显示 Icon**：👁（当前可见）、🙈（当前隐藏），icon 表示当前状态
- **日期输入**：统一 `<input type="date">`，新建表单默认当天
- **封面系统**：有封面时隐藏🐠图标，用渐变遮罩+文字阴影增强可读性，切 tab 不重建 DOM（`_pfCoverKey` 缓存）
- **局部更新**：维护设置用 `MT_rerenderSettings()` 局部刷新，禁止关闭重开弹窗
---

## 云端同步

- API：`https://glata-dev-tools.bytedance.net/token?keyword={account}`，GET 获取 / POST 保存
- API 返回格式：`{code:0, data: "<json-string>"}`，`data` 是 JSON 字符串需二次解析
- 自动同步 ON：进入页面拉远端 → 版本比对 → 覆盖本地；数据修改自动推送（3s 防抖）
- 自动同步 OFF：仅本地数据，手动备份/恢复
- 推送失败后每 3 分钟重试，直到成功
- 密码 MD5 哈希后存储
- 版本号使用 `Date.now()` 时间戳

---

## Git 规范

- 主分支：`main`，**禁止 `git push -f`**
- Commit 格式：`<type>: <description>`，type 取值：feat / fix / refactor / style / chore

---

## 性能注意事项

- 避免不必要的 DOM 重建（封面视频用 `_pfCoverKey` 缓存判断）
- localStorage 读写用 try-catch（`_g()` / `_s()` / `_r()` 已封装）
- 切页面时不盲目 destroy+recreate 图表
- `history.scrollRestoration = 'manual'` + `scrollTo(0,0)`，防 SPA 刷新偏移

---

## 开发规范
- 所有 UI 改动必须打开页面实际验证效果，如果无法在浏览器中直接查看，则截图识别，不能只看代码，每次修改后都需要验证效果

## 个人偏好
- 请保持代码简洁易理解
- 请始终用中文回复
- 代码修改后先运行测试再确认结果，测试不通过则回滚所有修改
- 修改完代码无需帮我打开浏览器，你自己确认效果即可
- 任何情况下修改完代码之后，不要执行 git commit / git push 等操作。代码的提交必须由我自己手动执行
- 新增的文件需要执行 git add 命令添加到暂存区

## 沟通约定
- 思考过程和描述使用中文
- 代码本身（变量名、注释等）使用中文
- Commit message 使用中文
