# PROGRESS

只向右生长、节点支持代码与富文本的本地思维导图工具。文档入口：[docs/README.md](docs/README.md)。

启动：`cd frontend && npm install && npm run dev`，用 Chrome 打开 http://localhost:5173。

线上版：https://d3s7em05htk44d.cloudfront.net/mindmap/（S3 `my-htmls-yeah/mindmap/` + 已有的 CloudFront，部署方式见 `docs/decisions.md`「部署」）。

## Current Status

- 2026-11-01：[ui-language](docs/changes/archive/2026-11-01-ui-language/proposal.md)（界面中英双语与语言设置）已上线、sync 进 [ui.md](docs/specs/ui.md) 并归档；`feat/ui-language`、`feat/autosave-draft` 均已合并到 main 并推送。没有进行中的变更。
- 2026-11-01：[autosave-draft](docs/changes/archive/2026-11-01-autosave-draft/proposal.md)（浏览器内自动保存与恢复）已上线、sync 进 [file.md](docs/specs/file.md) 并归档。
- 2026-10-31：Phase 1 完成。[mvp-editor](docs/changes/archive/2026-10-31-mvp-editor/proposal.md) 与 [minimap-live-highlight](docs/changes/archive/2026-10-31-minimap-live-highlight/proposal.md) 已 sync 进 [docs/specs/](docs/specs/README.md) 并归档，已部署到线上（见上），`feat/mvp-editor` 已合并到 main 并推送。

## Blockers

- 无。

## Plan

- [x] Phase 1：第一版编辑器（mvp-editor）——向右布局、富文本与代码、本地文件、xmind 导入（含缩略图、实时高亮；已上线）
- [ ] Phase 2：按实际使用反馈处理 open-questions §2（待定）

## Completed

### 2026-11-01 sync：ui-language

- 线上确认 UI-01、UI-02（默认英语、旧草稿未命名显示为 Untitled、切到中文即时生效且内容不变）。
- 新建 [ui.md](docs/specs/ui.md)（UI-01、UI-02）；归档到 `docs/changes/archive/2026-11-01-ui-language/`；sdd-workflow §5、specs/README、feature-list 更新。
- 验证：build / lint / test 12/12 通过。分支 `feat/ui-language`（已提交），合并到 main 并推送。

### 2026-11-01 ui-language 实现

- 新增 `src/i18n.ts`：英 / 中词表（类型保证条目一致）、按浏览器语言选默认、localStorage 记住选择。顶栏右侧加语言切换。顶栏、格式工具栏、缩略图、全部弹窗、文件类型说明、新建导图与新插入节点的默认文字（库 `updateConfig`）都随语言切换；`<html lang>` 跟随，`index.html` 静态标题改为 "Mind Map"。
- 未命名导图改存空串、显示时按语言；兼容旧草稿里的「未命名」。`parseMapFile` 改抛 `InvalidMapFileError`，提示文字由界面按语言显示。
- 验证：tsc / lint / test 12/12（新增词表一致、浏览器语言判断 2 项）。内置浏览器（en-US）逐项确认 UI-01、UI-02 与回归；搜索确认词表外无界面中文字符串。
- 分支：`feat/ui-language`（已提交，已部署）。

### 2026-11-01 sync：autosave-draft

- 用户在线上版用真实文件确认 FILE-05（打开 → 修改 → 关闭再打开 → Cmd+S 写回）。
- [file.md](docs/specs/file.md)：新增 FILE-05、FILE-06，FILE-03 改为不弹离开确认。归档到 `docs/changes/archive/2026-11-01-autosave-draft/`；feature-list ✅；open-questions 移出 Q-004，新增 Q-007（多标签页同时编辑的草稿冲突）。
- 验证：build / lint / test 10/10 通过。分支 `feat/autosave-draft`（已提交），合并到 main（未推送）。

### 2026-11-01 autosave-draft 实现

- 新增 `draftStore.ts`（IndexedDB，单连接复用）：当前导图的内容、文件名、文件句柄、文件修改时间、未保存标记。启动时先读草稿再创建导图；每次数据变化立即写入。
- 去掉离开确认（FILE-03）；Cmd+S 写回前请求写权限并比较修改时间，文件被外部改过则确认（FILE-06）。
- 实现中发现：页面关闭时才开始的 IndexedDB 写入不可靠（实测连不带句柄的简单写入也时有丢失），原计划「防抖 1 秒 + 关闭时写入」会丢最后 1 秒的修改，改为立即写入，proposal 设计要点 3 与 FILE-05 文字已同步修改。
- 验证：tsc / lint / test 10/10（新增草稿读写 2 项，devDependency `fake-indexeddb` 6.2.6）。内置浏览器中：编辑后立刻刷新内容与标记都在；打开文件 → 修改 → 立刻刷新 → Cmd+S 无对话框写回原文件；外部改文件后 Cmd+S 弹确认（取消不写、确认覆盖、之后不再弹）；7.4MB 图片自动保存并恢复；新建 / 撤销 / 另存为回归正常。文件对话框以浏览器沙盒文件代替。
- 分支：`feat/autosave-draft`（已提交，已部署）。

### 2026-11-01 节点文字按单词换行（C 类）

- 库给节点文字设了 `word-break: break-all`，英文单词和行内代码会在行尾被拆开（如 `de` / `fault`）。`styles.css` 覆盖为按单词换行，放不下的超长串才强制断开；渲染节点与编辑框一致。K8s 导图 137 个节点检查无拆词、无溢出；build / lint / test 8/8 通过。分支 `main`（已提交，已部署）。

| 日期 | 摘要 |
|---|---|
| 2026-10-31 | sync mvp-editor + minimap-live-highlight，生成 MAP / TXT / FILE spec（详见 history.md） |
| 2026-10-31 | 部署到 S3 + CloudFront，修复首次访问白屏（详见 history.md） |
| 2026-10-31 | minimap-live-highlight 实现：缩略图 + 代码块输入时高亮（详见 history.md） |
| 2026-10-31 | mvp-editor 实现：第一版编辑器，补丁 + 浏览器逐条验证（详见 history.md） |
| 2026-10-31 | 项目启动与文档骨架：确定方向、spike、建立 docs 骨架（详见 history.md） |
| — | 更早的条目滚动到 [docs/history.md](docs/history.md) |
