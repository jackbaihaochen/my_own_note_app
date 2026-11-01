# 历史记录

从 `PROGRESS.md` 滚动下来的旧 Completed 条目，最新的在最上面。

## Completed

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

