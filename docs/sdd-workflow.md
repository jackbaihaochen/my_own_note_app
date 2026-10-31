# SDD 工作流手册

本项目的变更都经过 spec（规格）管理。`CLAUDE.md` §7 是摘要，本文是完整规则。新的流程规则加在这里，不要加到 `CLAUDE.md`。

## 1. 文档地图

| 文件 | 作用 |
|---|---|
| `PROGRESS.md` | 工作日志：现在在哪、最近做完了什么。Plan 只到 Phase 级 |
| `docs/specs/<area>.md` | 各领域**当前**的需求（现在时，可验证），每条有 ID |
| `docs/changes/<slug>/` | 进行中的变更：`proposal.md`（A 类）+ `tasks.md` |
| `docs/changes/archive/` | 已完成的变更 |
| `docs/decisions.md` | 设计决定及理由（按主题、带日期） |
| `docs/open-questions.md` | 未决问题与有意识的临时妥协 |
| `docs/feature-list.md` | 功能清单（已同意但未必已做） |
| `docs/history.md` | 从 `PROGRESS.md` 滚动下来的旧 Completed 条目 |

## 2. 变更分类（A / B / C）

先问：**这个变更会让某条成文需求变假，或需要一条新需求吗？**

| | 判断 | 做法 |
|:--:|---|---|
| **A** | 新增 / 修改 / 删除需求 | 写 `docs/changes/<slug>/proposal.md`，**用户批准后才写代码** |
| **B** | 需求没错，实现没达到（bug） | 只写 `docs/changes/<slug>/tasks.md`，首行 `对象需求:` 写需求 ID |
| **C** | 不碰任何需求 | 直接改，`PROGRESS.md` 记一行 |

C 包括：错别字、注释、格式、不改行为的重构、依赖升级、日志/报错文案、纯视觉微调、测试加固。日常工作应以 C 为主。

**绝对规则：不准悄悄改需求。** 实现中发现需求写错了，停下来提 A 类差分；禁止改 `tasks.md` 来掩盖。

## 3. proposal.md 格式

1. **头部表格**：状态 / 对象 spec / 分支 / 批准
2. **为什么（起因）**：具体的触发点
3. **意图**：一段话，归用户所有；用户只给了一句话时由 Claude 起草并标注待确认
4. **需求差分**：`### ADDED` / `### MODIFIED` / `### REMOVED`。每条：ID + **现在时、可验证**的陈述 + `- 验证:` 行
5. **非目标**：明确不做的事；延后的放进 `open-questions.md`
6. **验收标准**：勾选框。总是包含 `npm run build`、`npm run lint`、`npm test`，加上本变更特有的真机检查
7. **影响范围**：文件与大致规模

批准后在同目录写 `tasks.md`，然后实现。完成后用 `/sync` 把差分并入 `docs/specs/` 并归档。

## 4. Spec-on-touch

要改的领域在 `docs/specs/` 里还没有 spec 时：先按**现状**写一页 spec，用户确认后再写差分。不要给不碰的领域补 spec。

全新领域（没有现有代码）不适用此条：直接在 proposal 里以 ADDED 形式提出，`/sync` 时生成 spec 页。

## 5. 需求 ID 前缀登记

| 前缀 | 领域 | spec 文件 |
|---|---|---|
| `MAP` | 导图结构、布局与编辑操作 | `docs/specs/map.md`（待 `/sync` 生成） |
| `TXT` | 节点内容与富文本 | `docs/specs/text.md`（待 `/sync` 生成） |
| `FILE` | 文件存取与导入 | `docs/specs/file.md`（待 `/sync` 生成） |

编号在领域内递增，**废止的编号永不复用**。

## 6. open-questions.md 结构

- **§0 未整理**：随手记，`/note` 写入，不分类也不丢
- **§1 阻塞中**：不决定就做不下去的问题，**最多 5 行**，编号 `Q-xxx`
- **§2 待定**：不急的问题，编号 `Q-xxx`
- **§3 技术债**：有意识的临时妥协，编号 `T-xxx`，写明偿还时机

## 7. 提交

见 `CLAUDE.md` §5 / §6：每次提交都要用户明确同意，并同步更新 `PROGRESS.md`。
