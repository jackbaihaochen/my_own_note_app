# 设计决定

按主题记录，带日期。推翻旧决定时保留新旧两条。

## 产品方向

- **2026-10-31 只向右生长作为默认布局。** XMind 的痛点之一是主题按创建顺序左右交替、不能自由调整；用户实际只需要向右生长的分支。默认采用逻辑结构图（向右）后，「把大主题挪到右边」的问题也随之消失。左右双向布局不在第一版范围内（见 open-questions Q-001）。

## 技术选型

- **2026-10-31 基于 simple-mind-map（MIT）二次开发，不从零自研。** 布局、快捷键、拖拽、撤销、xmind 导入等编辑器基础能力已成熟；从零实现工作量大且难以做到同等手感。代价是受其架构约束，部分能力需要打补丁（见 mvp-editor 提案的「技术验证」）。
- **2026-10-31 纯前端本地网页，无后端。** 个人使用，导图存为本地文件，可自行放进 iCloud / Git 同步。原脚手架里的 FastAPI `backend` 启动配置已删除。
- **2026-10-31 目标浏览器为 Chromium 系（Chrome / Edge / Arc）。** 依赖 File System Access API 实现「Cmd+S 写回原文件」。Safari / Firefox 不支持写回，不作为目标。

## simple-mind-map 的定制方式

- **2026-10-31 库的改动优先用配置项，配置做不到才打补丁。** 补丁（`frontend/patches/`，patch-package，库版本精确锁定）只做三件事：Quill 格式白名单加入 `code` / `code-block` / `link`、代码块内 Shift+Enter 新行继承缩进、编辑态复制改用 `quill.getText`。其余用配置项解决：代码块内 Tab 用 `beforeShortcutRun` 跳过库的「Tab 结束编辑」；触控板平移用 `customCheckIsTouchPad`。升级库时必须重新核对补丁。
- **2026-10-31 代码高亮只作用于渲染后的 DOM，不写进数据。** 数据里只存 Quill 的纯代码块（`data-language` 记录语言），每次渲染后用 highlight.js 上色。上色不改文字，节点尺寸不受影响；数据保持简单，编辑时也不会混进高亮标签。
- **2026-10-31（minimap-live-highlight）编辑态也高亮：用 Quill 自带的 syntax 模块，保存前清掉它的标记。** 仍坚持上一条「高亮不写进数据」：syntax 模块在编辑框里插入的 `.ql-token` 和语言 `<select>`，在 `beforeHideRichTextEdit` 中去掉后才保存，数据格式不变。补丁因此多两处：白名单加 `code-token`、modules 从插件参数读 `syntax`；Shift+Enter 继承缩进改为按整行取（高亮把一行拆成多个片段）。渲染后的上色仍由我们自己的 `highlightCodeBlocks` 负责。
- **2026-10-31 导入的纯文本转为「每行一个 `<p>`、前导空格转 `&nbsp;`」的富文本。** 库默认把纯文本包成单个 `<p>`，换行和缩进都会丢失（XMind 里的 YAML 节点会被压成一行）。

## 浏览器草稿（autosave-draft）

- **2026-11-01 自动保存用 IndexedDB，不用 localStorage。** localStorage 每个网站约 5MB、只能存字符串；导图内嵌图片很容易超限（实测一张截图级大图就 7MB）。IndexedDB 额度大，还能存文件句柄，恢复后 Cmd+S 仍写回原文件。数据库名 `my-own-xmind`，因为线上域名还放着桶里的其他页面。
- **2026-11-01 每次数据变化后立即写入草稿，不防抖、不依赖页面关闭事件。** 实测在 pagehide / visibilitychange 里才开始的 IndexedDB 写入有时落不了盘（是否成功取决于和页面卸载的竞争），刷新前 1 秒内的修改会丢。写入进行中又有变化时只补写一次最新状态，避免拖拽等连续操作堆积写入。
- **2026-11-01 浏览器草稿只是安全网，本地文件仍是正式存档。** 未保存标记表示「还没存进文件」；去掉离开确认。写回文件前比较修改时间，防止覆盖其他电脑经文件同步过来的修改。

## 界面语言（ui-language）

- **2026-11-01 界面提供英 / 中两种语言，不引入 i18n 库。** 几十条文字用一个词表文件（`src/i18n.ts`），中文词表以英文词表为类型，漏翻即类型错误。默认按浏览器语言（`zh*` 用中文，其余英语），顶栏切换，偏好存 localStorage（只是几个字节的个人偏好）。未命名导图不再存死文字（存空串，显示时按当前语言）。新插入节点的默认文字通过库的 `updateConfig` 随语言切换。项目文档仍用中文。

## 部署

- **2026-10-31 部署到账号里已有的 S3 公开桶 + CloudFront 的 `mindmap/` 子目录。** 地址 https://d3s7em05htk44d.cloudfront.net/mindmap/ 。CloudFront 提供 File System Access API 必需的 HTTPS；复用现有设施，不新建桶和分发。页面是公开的，但导图只存在用户本地，不上传。用 `--base=./` 构建以适配子目录；`index.html` 设 `no-cache`、带哈希的 `assets/` 设长缓存，更新时不需要清 CloudFront 缓存。

## 文档

- **2026-10-31 项目文档用中文。** 与用户日常沟通语言一致；`.claude/commands` 中原先「文档用日语」的约定一并改为中文。
