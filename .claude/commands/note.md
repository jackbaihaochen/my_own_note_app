---
description: 思いついたことを取りこぼさず記録する（まず §0 へ落とし、その後で行き先を提案）
---

Capture what the user just thought of: **$ARGUMENTS**

The point of this command is that **capture must never fail and never block**. Triage is secondary and can wait. Do the two steps in order — never skip step 1 to "do it properly" in step 2.

## Step 1 — Land it, unconditionally

Append one line to `## 0. 未整理` in [docs/open-questions.md](../../docs/open-questions.md), verbatim, with today's date:

```
- [YYYY-MM-DD] <the user's words, unchanged>
```

Keep their wording. Do not rewrite it into spec language, do not "clarify" it, do not split it. If the placeholder `- [ ]` is the only item there, replace it. **This step always succeeds** — if you cannot classify it in step 2, it stays here and nothing is lost.

If `$ARGUMENTS` is empty, ask what to record and stop.

## Step 2 — Propose a destination (one line, non-blocking)

Read what's already in `docs/open-questions.md` and `docs/feature-list.md`, then say **in one sentence** where you think it belongs. Do not move it yet unless the routing is unambiguous.

| The note is… | Destination | Test |
|---|---|---|
| A question — "should we do X?", "how should X work?" — **not yet answered** | `open-questions` **§1** if it is blocking work right now, else **§2** | **It contains a question** |
| Waiting on the customer / 業務 side before it can be decided | Same as above; set 決められるのは to `人（業務）` and note 🗣 客先確認待ち | A question **whose decider is not the user** |
| A feature that is **agreed** but simply not built yet | **`docs/feature-list.md`** as a ⬜ row in the right section | **No question** — only scheduling |
| Something already shipped as a knowing compromise | `open-questions` **§3** as a new `T-xxx` | It describes **current behaviour**, with a repayment point |
| A bug — the requirement is right, the code isn't | Not here. Say so: this is a **B-class** change → `docs/changes/<slug>/tasks.md` | The written requirement is already correct |

Assign the next free `Q-xxx` / `T-xxx` (**never reuse a retired number**) when you do move it.

## Guardrails

- **§1 holds at most 5 rows.** If moving something there would make it 6, say so and ask which one gets decided or demoted to §2 — do not silently exceed the cap.
- **Never put the same item in two places.** A note that lands in `feature-list` comes out of §0.
- **Don't invent detail.** If the note is one vague sentence, it stays one vague sentence. Asking three clarifying questions defeats the purpose of a capture command — at most, ask the single question that decides §1 vs §2 (*is this blocking you right now?*), and only if it is genuinely unclear.
- Leaving it in §0 is a perfectly good outcome. `/status` surfaces §0, so it will come back around.

Report in one or two lines: what was recorded, and where you suggest it goes. Then stop.
