# PROGRESS

只向右生长、节点支持代码与富文本的本地思维导图工具。文档入口：[docs/README.md](docs/README.md)。

启动：`cd frontend && npm install && npm run dev`，用 Chrome 打开 http://localhost:5173。

线上版：https://d3s7em05htk44d.cloudfront.net/mindmap/（S3 `my-htmls-yeah/mindmap/` + 已有的 CloudFront，部署方式见 `docs/decisions.md`「部署」）。

## Current Status

- 2026-11-01：[autosave-draft](docs/changes/autosave-draft/proposal.md)（浏览器内自动保存与恢复）已实现并部署，在分支 `feat/autosave-draft`（已提交，未合并到 main）。待：用户在线上确认真实文件读写、`/sync`、合并。
- 2026-10-31：Phase 1 完成。[mvp-editor](docs/changes/archive/2026-10-31-mvp-editor/proposal.md) 与 [minimap-live-highlight](docs/changes/archive/2026-10-31-minimap-live-highlight/proposal.md) 已 sync 进 [docs/specs/](docs/specs/README.md) 并归档，已部署到线上（见上），`feat/mvp-editor` 合并到 main（未推送）。没有进行中的变更。

## Blockers

- 无。

## Plan

- [x] Phase 1：第一版编辑器（mvp-editor）——向右布局、富文本与代码、本地文件、xmind 导入（含缩略图、实时高亮；已上线）
- [ ] Phase 2：按实际使用反馈处理 open-questions §2（待定）

## Completed

### 2026-11-01 autosave-draft 实现

- 新增 `draftStore.ts`（IndexedDB，单连接复用）：当前导图的内容、文件名、文件句柄、文件修改时间、未保存标记。启动时先读草稿再创建导图；每次数据变化立即写入。
- 去掉离开确认（FILE-03）；Cmd+S 写回前请求写权限并比较修改时间，文件被外部改过则确认（FILE-06）。
- 实现中发现：页面关闭时才开始的 IndexedDB 写入不可靠（实测连不带句柄的简单写入也时有丢失），原计划「防抖 1 秒 + 关闭时写入」会丢最后 1 秒的修改，改为立即写入，proposal 设计要点 3 与 FILE-05 文字已同步修改。
- 验证：tsc / lint / test 10/10（新增草稿读写 2 项，devDependency `fake-indexeddb` 6.2.6）。内置浏览器中：编辑后立刻刷新内容与标记都在；打开文件 → 修改 → 立刻刷新 → Cmd+S 无对话框写回原文件；外部改文件后 Cmd+S 弹确认（取消不写、确认覆盖、之后不再弹）；7.4MB 图片自动保存并恢复；新建 / 撤销 / 另存为回归正常。文件对话框以浏览器沙盒文件代替。
- 分支：`feat/autosave-draft`（已提交，已部署）。

### 2026-11-01 节点文字按单词换行（C 类）

- 库给节点文字设了 `word-break: break-all`，英文单词和行内代码会在行尾被拆开（如 `de` / `fault`）。`styles.css` 覆盖为按单词换行，放不下的超长串才强制断开；渲染节点与编辑框一致。K8s 导图 137 个节点检查无拆词、无溢出；build / lint / test 8/8 通过。分支 `main`（已提交，已部署）。

### 2026-10-31 sync：mvp-editor + minimap-live-highlight

- 用户确认 FILE-02（系统对话框 + 真实磁盘读写）与 TXT-06（粘贴图片）手动检查正常，mvp-editor 最后一项验收勾上。
- 需求并入 spec：[map.md](docs/specs/map.md) MAP-01〜06、[text.md](docs/specs/text.md) TXT-01〜06（TXT-04 为修改后的版本）、[file.md](docs/specs/file.md) FILE-01〜04。
- 两个变更归档到 `docs/changes/archive/2026-10-31-*`；更新 feature-list（全部 ✅）、sdd-workflow §5、specs/README；open-questions T-002 备注改为部署后的现状。
- 验证：build / lint / test 8/8 通过。
- 分支：`feat/mvp-editor`（已提交），合并到 main（未推送）。

### 2026-10-31 部署到 S3 + CloudFront

- 复用账号里已有的公开桶 `my-htmls-yeah` 与 CloudFront `d3s7em05htk44d.cloudfront.net`（已强制 HTTPS），放进 `mindmap/` 前缀，不动桶里其他内容。用 `--base=./` 构建；`assets/` 长缓存，`index.html` 设 `no-cache`，更新时不必清 CloudFront 缓存。
- 发现并修复：首次访问（无缓存）时白屏。生产构建里 JS 可能先于样式表生效执行，画布容器为 0×0，库直接抛错。改为用 `ResizeObserver` 等容器有尺寸后再创建导图。用旧 / 新两版 JS 在「样式表延迟 800ms」的条件下对照：旧版报错白屏，新版正常。
- 验证：tsc / lint / test 8/8 通过；线上页面 HTTPS、File System Access API 可用，新建子主题、输入、未保存标记、缩略图正常。
- 分支：`feat/mvp-editor`（已提交）。

### 2026-10-31 minimap-live-highlight 实现

- 缩略图（MAP-06）：启用库的 MiniMap 插件，新组件 `MiniMapPanel`，支持平移联动、点击跳转、拖动视口框、收起 / 展开。
- 代码块输入时高亮（TXT-04 修改）：启用 Quill syntax 模块（150ms），保存前在 `beforeHideRichTextEdit` 中清掉高亮标记，数据格式不变；工具栏切换语言后强制重算高亮。
- 补丁扩展：白名单加 `code-token`、modules 读取 `syntax` 配置；回归中发现 Shift+Enter 继承缩进失效（高亮把一行拆成多个片段），改为按整行取缩进后通过。
- 验证：build / lint / test 8/8 通过；内置浏览器中用 K8s 导图验证了 MAP-06、TXT-04，并回归了 Tab / Shift+Tab、继承缩进、复制、数据格式；全新 `npm ci` 时补丁自动应用。
- jsdom 降到 29.1.1：30.x 要求 Node 24.15 以上，用户的 Node 24.7 安装时会报 EBADENGINE。
- 分支：`feat/mvp-editor`（已提交）。

| 日期 | 摘要 |
|---|---|
| 2026-10-31 | mvp-editor 实现：第一版编辑器，补丁 + 浏览器逐条验证（详见 history.md） |
| 2026-10-31 | 项目启动与文档骨架：确定方向、spike、建立 docs 骨架（详见 history.md） |
| — | 更早的条目滚动到 [docs/history.md](docs/history.md) |
