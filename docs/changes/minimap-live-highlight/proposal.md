# 变更提案：minimap-live-highlight（缩略图 + 代码块输入时高亮）

| 项 | 内容 |
|---|---|
| 状态 | 🚧 实现中 |
| 对象 spec | `MAP`（新增 MAP-06）、`TXT`（修改 TXT-04） |
| 分支 | `feat/mvp-editor`（mvp-editor 尚未提交，暂叠在同一工作区） |
| 批准 | ✅ 2026-10-31 用户批准 |

## 为什么（起因）

用户试用第一版后提出（2026-10-31）：

1. 导图变大后（如 K8s 导图 96 个主题）缺少全局视图，希望有缩略图。
2. 代码块的高亮只在退出编辑后出现，输入时看不到，希望边输入边高亮。

## 意图

> ⚠️ 由 Claude 起草，请用户确认或改写。

大导图里能一眼看到全貌和自己在哪，并能在缩略图上快速跳转；写代码块时即时看到语法高亮，体验接近代码编辑器。两项都不改变数据格式，已有的 `.mindmap.json` 文件不受影响。

## 技术验证（2026-10-31 spike，临时目录，未入库）

- ✅ **输入时高亮**：启用 Quill 自带的 syntax 模块（传入我们注册好语言的 highlight.js）。实测在代码块里输入 `image: "nginx" # web`，约 150ms 内属性名、字符串、注释分别上色。
- ✅ **数据保持干净**：syntax 模块会在编辑框 DOM 里插入高亮用的 `<span class="ql-token">` 和一个语言 `<select>`，而库保存时直接读编辑框的 innerHTML。用库的配置项 `beforeHideRichTextEdit`，在读取前去掉这两样。实测保存下来的 HTML 与现在完全一致（只有纯代码块 + `data-language`）；重新进入编辑后自动恢复高亮。
- **需要扩大补丁**：Quill 的格式白名单要加入 `code-token`，`initQuillEditor` 的 modules 里要能传入 syntax 配置（从插件参数读取）。仍是同一个 patch 文件，增加约 5 行。
- ✅ **缩略图**：库自带 MiniMap 插件，提供 `calculationMiniMap(宽, 高)`（返回缩略图 SVG 和视口框位置）以及拖动视口框的处理函数，只需写一个渲染它的小组件。缩略图只显示节点框和连线，不显示文字（插件的设计）。

## 需求差分

### ADDED Requirements

- **MAP-06** 画布右下角显示缩略图，呈现整张导图的结构和当前可见区域（视口框）。导图内容或画布平移 / 缩放变化后，缩略图随之更新。在缩略图上拖动视口框或点击某处，画布移动到对应位置。缩略图可以通过按钮收起 / 展开。
  - 验证：打开 K8s 导图，缩略图显示全貌；平移画布后视口框跟着移动；拖动视口框画布随之移动；点击收起按钮后缩略图隐藏，再点展开恢复。

### MODIFIED Requirements

- **TXT-04**（修改）代码块可以指定语言，至少支持 yaml、bash、json、python、javascript、typescript、go，按所选语言做语法高亮；未指定语言时不高亮。**编辑时，输入停顿后约 150ms 内即更新高亮，不必等退出编辑。保存的数据只含纯代码块（语言记录在 `data-language`），不含高亮标记。**
  - 验证：同一段代码切换语言，高亮随之变化；在代码块中输入新的一行，不退出编辑即可看到高亮；保存后检查节点 HTML 中没有 `ql-token` / `<select>`；重新打开后语言选择保留、高亮正常。

### REMOVED Requirements

无。

## 非目标

- 缩略图里显示节点文字（插件只画框和连线）
- 缩略图的位置 / 尺寸可调、收起状态跨会话记忆
- 编辑时的代码自动补全、括号匹配等代码编辑器功能

## 验收标准

- [x] `npm run build` / `npm run lint` / `npm test` 通过（8/8）
- [x] MAP-06、TXT-04 的 `验证:` 在 Chrome 中实际操作确认（2026-10-31，内置浏览器，K8s 导图：缩略图全貌、平移联动、点击跳转、拖动视口框、收起 / 展开；输入时约 150ms 内高亮、编辑中切换语言立即重算、保存数据无 `ql-token` / `<select>`）
- [x] 回归：mvp-editor 中代码块的 Tab / Shift+Tab、Shift+Enter 继承缩进、复制保留换行仍然正常。回归中发现 Shift+Enter 继承缩进失效（高亮把一行拆成多个片段），已在补丁中改为按整行取缩进后通过
- [x] 回归：用 mvp-editor 保存的旧 `.mindmap.json` 能正常打开（数据格式未变：保存的 HTML 仍只含纯代码块 + `data-language`）

## 影响范围

- `frontend/patches/simple-mind-map+0.14.0-fix.3.patch`：+约 5 行
- `frontend/src/mindmap/createMindMap.ts`：启用 MiniMap 插件、传入 syntax 配置、`beforeHideRichTextEdit` 清理（约 20 行）
- `frontend/src/components/MiniMap.tsx`：新组件（约 80 行）
- `frontend/src/styles.css`：缩略图样式、隐藏 syntax 模块自带的语言下拉框（约 30 行）
- 文档：`decisions.md` 补充「编辑态高亮用 Quill syntax 模块、保存前清理」
