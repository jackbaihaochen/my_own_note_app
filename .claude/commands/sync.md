---
description: 把已完成变更的差分并入 specs，归档并更新各台账
---

Close out a completed change. Target: **$ARGUMENTS** (if empty, use the only in-flight change under `docs/changes/`; if there are several, ask which).

## Preconditions — verify, don't assume

- Every box in the proposal's **验收标准** is actually ticked. Run the checks yourself if unsure:
  ```
  cd frontend && npm run build && npm run lint && npm test
  ```
- Every task in `tasks.md` is done.

If something is unfinished, **say so and stop**. Do not sync a half-done change.

## 1. Merge the delta into the specs

For each entry in the proposal's 需求差分:

- **ADDED** → append to the area's spec under the right heading, with its `- 验证:` line.
- **MODIFIED** → rewrite that ID in place. The spec is **present tense** — it states what is true now, not what changed.
- **REMOVED** → move to the spec's `## 已废止` section with the date and a one-line reason. Do not delete silently; **do not reuse the number**.

Update the spec's `最后更新` date and its sync source link.

## 2. Archive

```
docs/changes/<slug>/  →  docs/changes/archive/YYYY-MM-DD-<slug>/
```

Set 状态 to ✅ 完成 in the proposal header and fix the relative link depth in both files (they gain one level).

## 3. Update the ledgers

- **[docs/feature-list.md](../../docs/feature-list.md)** — status marks, the `spec` column, and clear the `change` column.
- **[docs/open-questions.md](../../docs/open-questions.md)** — anything the 非目标 section deferred goes in; anything this change decided comes out (and goes to `decisions.md`). **If §1 now exceeds 5 rows, triage it.**
- **[docs/decisions.md](../../docs/decisions.md)** — append genuinely new judgements only, dated, in the right topic section. A reversal keeps both the old and new entries.
- **[PROGRESS.md](../../PROGRESS.md)** — a dated Completed entry (test counts, branch, verified results). Roll the 6th-oldest entry down to `docs/history.md` and leave a one-line digest row. Update Current Status / Blockers. Phase-level Plan boxes only.
- Any `docs/*.md` page the change made wrong — fix it in the same pass.

## 4. Report

Show the user: which spec IDs moved, where the change was archived, which ledgers changed. Then stop — **do not commit unless asked**.
