# PROGRESS

只向右生长、节点支持代码与富文本的本地思维导图工具。文档入口：[docs/README.md](docs/README.md)。

启动：`cd frontend && npm install && npm run dev`，用 Chrome 打开 http://localhost:5173。

线上版：https://d3s7em05htk44d.cloudfront.net/mindmap/（S3 `my-htmls-yeah/mindmap/` + 已有的 CloudFront，部署方式见 `docs/decisions.md`「部署」）。

## Current Status

- 2026-10-31：已部署到线上（见上）。部署时发现并修复首次访问白屏（已提交）。
- 2026-10-31：第一版编辑器 [mvp-editor](docs/changes/mvp-editor/proposal.md) 已实现；在其上又完成了 [minimap-live-highlight](docs/changes/minimap-live-highlight/proposal.md)（缩略图 + 代码块输入时高亮）。两者已一起提交到分支 `feat/mvp-editor`（未推送、未合并到 main）。build / lint / 8 项单元测试通过。mvp-editor 等用户确认两项手动检查后执行 `/sync`。

## Blockers

- 待用户手动确认：FILE-02 系统打开 / 保存对话框与真实磁盘读写；TXT-06 从剪贴板粘贴图片。自动化环境做不到这两项。

## Plan

- [ ] Phase 1：第一版编辑器（mvp-editor）——向右布局、富文本与代码、本地文件、xmind 导入（实现完成，待手动确认与 `/sync`）
- [ ] Phase 2：按实际使用反馈处理 open-questions §2（待定）

## Completed

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

### 2026-10-31 mvp-editor 实现

- `frontend/`：Vite 8 + React 19 + TypeScript 7，依赖精确锁版本；simple-mind-map 0.14.0-fix.3 + patch-package 补丁（格式白名单、代码块换行继承缩进、复制保留换行），全新 `npm ci` 时自动应用。
- 验证：`npm run build` / `npm run lint` 通过，`npm test` 8/8 通过。浏览器中验证了 MAP-01〜05、TXT-01〜06、FILE-01〜04（七种格式 + 链接 + 图片的保存重开往返；新增 / 改文字 / 删除 / 改格式 / 拖拽的撤销）。用户的 K8s.xmind 导入后 96 个主题与原文件一致；把其中 YAML 节点转成 yaml 代码块后，保存 → 重开 → 再编辑一轮，格式无损。
- 验证中发现并修复：保存失败时没有提示（已补上，与打开 / 导入一致）；编辑态 Tab 在代码块里会结束编辑（随后 Shift+Tab 还会误建父节点）；点击格式工具栏会结束编辑；库默认没有空格进入编辑、Esc 结束编辑；触控板平移步长过大；导入后未显示未保存标记；编辑框里代码块是深色，和渲染不一致。
- FILE-04 的验证数据从「106」改为文件里的实际主题数 96（截图里的 XMind 显示 106，用户提供的文件里是 96）。
- 分支：`feat/mvp-editor`（已提交）。

### 2026-10-31 项目启动与文档骨架

- 确定方向：基于 simple-mind-map、纯前端本地网页、Chromium、文档用中文（见 `docs/decisions.md`）。
- spike（临时目录，未入库）：验证了行内代码、代码块、highlight.js 高亮、编辑往返、JSON 往返、代码块语言保留、粘贴保留缩进；发现 `smmVersion` 缺失会清除富文本样式、编辑态复制会把多行代码压成一行（需补丁）。
- 建立 `docs/` 骨架；`.claude/commands` 改为中文文档约定、检查命令改为 npm；`.claude/launch.json` 删除不用的 `backend` 配置。

| 日期 | 摘要 |
|---|---|
| — | 更早的条目滚动到 [docs/history.md](docs/history.md) |
