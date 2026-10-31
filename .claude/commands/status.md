---
description: 一览当前位置、进行中的变更和未决问题
---

Give the user one screen showing where the project stands. Read these and report — **do not change anything**.

1. **阶段位置** — `PROGRESS.md` 的 Plan（Phase 级）和 Current Status
2. **进行中的变更** — `ls docs/changes/` excluding `archive/`. For each, read the proposal header: slug, 状态, 是否已批准, and how many boxes in `tasks.md` remain
3. **不决定就无法推进的问题** — `docs/open-questions.md` §1. Flag it loudly if there are more than 5 rows
4. **人写下的未整理笔记** — `docs/open-questions.md` §0, plus `problems.md` if it exists (gitignored local scratch). If §0 has more than ~3 items, offer to triage them into §1/§2/§3 or `feature-list.md` — it is a capture buffer, not a home
5. **spec 覆盖情况** — `ls docs/specs/`, and which areas of `docs/feature-list.md` still have no spec
6. **最近的工作** — the top 2 Completed entries in `PROGRESS.md`

Keep it to a screen. Lead with anything blocked or overdue; if nothing is, say so plainly rather than padding. Close with one concrete suggestion of what to pick up next, based on the priority ordering in `open-questions.md` §1 — one sentence, not a menu.
