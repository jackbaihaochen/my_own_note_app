# tasks：mvp-editor

对象需求：MAP-01〜05、TXT-01〜06、FILE-01〜04（见 [proposal.md](proposal.md)）

## 搭建

- [x] `frontend/`：Vite + React + TypeScript，依赖精确锁版本
- [x] `.gitignore` 增加 `node_modules/`、`dist/`
- [x] oxlint、vitest 接入，`npm run build` / `lint` / `test` 可用

## simple-mind-map 补丁（patch-package）

- [x] Quill 格式白名单加入 `code` / `code-block` / `link`
- [x] Shift+Enter 新行继承缩进（补丁）；代码块内 Tab / Shift+Tab 由 Quill 自带键位处理，编辑态库把 Tab 绑定为「结束编辑」，用 `beforeShortcutRun` 在代码块内跳过（不需要补丁）
- [x] 编辑态复制改用 `quill.getText(range)`
- [x] 全新 `npm ci` 时补丁自动应用（已验证）

## 编辑器

- [x] 初始化导图：逻辑结构图布局，RichText / Drag / KeyboardNavigation / NodeImgAdjust 插件（MAP-01〜05）
- [x] Cmd+Shift+Z 重做（MAP-04）
- [x] 空格进入编辑、Esc 结束编辑（MAP-02，库默认没有）
- [x] 触控板按实际滑动距离平移（MAP-05，库默认按固定 100px 步长）
- [x] 浮动格式工具栏：粗体 / 斜体 / 下划线 / 删除线 / 颜色 / 字号 / 行内代码 / 代码块 / 语言 / 链接 / 清除格式（TXT-01〜05）；点击工具栏不结束编辑；靠右时不超出窗口
- [x] Cmd+E 行内代码（TXT-02）
- [x] 代码块样式（等宽、折行，编辑框与渲染一致）与 highlight.js 渲染高亮、语言选择（TXT-03 / 04）
- [x] 非编辑态 Cmd+点击链接新标签页打开，普通点击只选中节点（TXT-05）
- [x] 节点图片：选择文件，base64 内嵌，宽度上限 300px（TXT-06）；粘贴图片走库自带的 Cmd+V 逻辑

## 文件

- [x] `.mindmap.json` 序列化，保证 `smmVersion`（FILE-01）
- [x] Cmd+O / Cmd+S / Cmd+Shift+S（File System Access API）（FILE-02）
- [x] 未保存标记与离开确认；导入的导图一打开即为未保存（FILE-03）
- [x] 导入 .xmind，纯文本转为每行一个 `<p>` 以保留换行和缩进（FILE-04）

## 验收

- [x] vitest：FILE-01 往返、版本号保证、xmind 导入、高亮
- [x] 内置浏览器中逐条验证
- [x] K8s.xmind 导入验证
- [x] 用户手动确认（2026-10-31 确认正常）：系统对话框 + 真实磁盘读写（FILE-02）、剪贴板粘贴图片（TXT-06）
