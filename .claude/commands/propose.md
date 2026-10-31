---
description: 按 A/B/C 判定变更规模，A 类则起草变更提案并请求批准
---

Read [docs/sdd-workflow.md](../../docs/sdd-workflow.md) first if you have not already in this session.

The user's intent: **$ARGUMENTS**

## Step 1 — Classify

Ask: *does this change make a written requirement false, or require a new one?*

- **A** — adds / changes / removes a requirement → continue to Step 2
- **B** — the requirement is right, the implementation doesn't meet it (a bug) → skip the proposal; write only `docs/changes/<slug>/tasks.md` with a `对象需求:` line naming the requirement IDs, then implement
- **C** — doesn't touch any requirement (typo, comment, formatting, behavior-preserving refactor, dependency bump, log/error wording, pure visual tweak, test hardening) → just do it, one line in `PROGRESS.md`

**State your classification and why, in one sentence, before doing anything else.** If it is B or C, say so and stop asking for approval — proceed.

## Step 2 — Locate the affected spec (A only)

Check `docs/specs/` for the relevant area.

- **Spec exists** → read it, note which IDs the change touches.
- **No spec for this area** → spec-on-touch: read the code and the relevant `docs/*.md`, write **one page describing the area as it is today** to `docs/specs/<area>.md` using an unused ID prefix (register it in `docs/specs/README.md` and `docs/sdd-workflow.md §5`), and **ask the user to confirm it reflects reality** before writing the delta. Do not back-fill specs for areas this change does not touch.

## Step 3 — Draft the proposal (A only)

Write `docs/changes/<slug>/proposal.md`. `<slug>` is short, kebab-case, English or romaji.

Use [docs/sdd-workflow.md §3](../../docs/sdd-workflow.md) as the format. Sections:

1. **Header table** — 状态 / 对象 spec / 分支 / 批准
2. **为什么（起因）** — the concrete trigger. A real bug, a real request, a real gap.
3. **意图** — one paragraph. **This is the user's to own** — if their intent was one line, draft it and mark it for their confirmation.
4. **需求差分** — `### ADDED Requirements` / `### MODIFIED Requirements` / `### REMOVED Requirements`. Each entry: ID, a **present-tense verifiable statement**, and a `- 验证:` line naming the test or the real-integration check. New IDs continue the area's numbering; **never reuse a retired number**.
5. **非目标** — what this change explicitly does NOT do. Push anything deferred here into `docs/open-questions.md`.
6. **验收标准** — checkboxes. Always include `npm run build` / `npm run lint` / `npm test`, plus the real-integration checks specific to this change.
7. **影响范围** — files and rough size.

Everything is written in **Chinese**, matching `docs/`.

## Step 4 — Stop

**Present the proposal and ask for accept / reject / revise. Do not write code until the user approves.**

Once approved, write `tasks.md` alongside it, then implement. If implementation reveals the requirements are wrong, **stop and revise the proposal** — never edit `tasks.md` to paper over the gap.
