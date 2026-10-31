# tasks：minimap-live-highlight

对象需求：MAP-06（新增）、TXT-04（修改）（见 [proposal.md](proposal.md)）

## 输入时高亮（TXT-04）

- [x] 补丁：格式白名单加入 `code-token`；`initQuillEditor` 的 modules 从插件参数读取 `syntax`
- [x] 补丁：Shift+Enter 继承缩进改为按整行取前导空白（高亮把一行拆成多个片段后，`context.prefix` 只剩光标所在片段）
- [x] `QUILL_SYNTAX_OPTIONS`（highlight.js + 150ms + 语言列表）传给 RichText 插件
- [x] `beforeHideRichTextEdit` 保存前去掉 `.ql-token` 与 `.ql-ui`
- [x] 隐藏 syntax 模块自带的语言下拉框（工具栏已有）
- [x] 工具栏切换语言后强制重新高亮（syntax 模块只在文字变化时重算）

## 缩略图（MAP-06）

- [x] 启用 MiniMap 插件，`MiniMapPanel` 组件：渲染 SVG 与视口框，渲染 / 视图变化时按帧合并更新
- [x] 拖动视口框移动画布；点击缩略图跳转；收起 / 展开

## 验收

- [x] build / lint / test
- [x] MAP-06、TXT-04 在内置浏览器中验证（K8s 导图）
- [x] 回归：Tab / Shift+Tab（单行、多行）、Shift+Enter 继承缩进、复制保留换行、不误建节点
- [x] 回归：数据格式不变（保存的 HTML 只含纯代码块 + `data-language`），旧文件按原路径打开
- [x] 全新 `npm ci` 时补丁自动应用
