---
description: 現在地・進行中の変更・未決の論点を一覧する
---

Give the user one screen showing where the project stands. Read these and report — **do not change anything**.

1. **フェーズの現在地** — `PROGRESS.md` の Plan（Phase 級）と Current Status
2. **進行中の変更** — `ls docs/changes/` excluding `archive/`. For each, read the proposal header: slug, 状態, 承認済みか, and how many boxes in `tasks.md` remain
3. **決めないと進められない論点** — `docs/open-questions.md` §1. Flag it loudly if there are more than 5 rows
4. **人が書き込んだ未整理メモ** — `docs/open-questions.md` §0, plus `problems.md` if it exists (gitignored local scratch). If §0 has more than ~3 items, offer to triage them into §1/§2/§3 or `feature-list.md` — it is a capture buffer, not a home
5. **spec の網羅状況** — `ls docs/specs/`, and which areas of `docs/feature-list.md` still have no spec
6. **直近の作業** — the top 2 Completed entries in `PROGRESS.md`

Keep it to a screen. Lead with anything blocked or overdue; if nothing is, say so plainly rather than padding. Close with one concrete suggestion of what to pick up next, based on the priority ordering in `open-questions.md` §1 — one sentence, not a menu.
