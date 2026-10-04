# Intel Sustainability Summit — Event Check-In

Coursework build. A check-in app for Intel's Sustainability Summit: greets each
attendee, counts total and per-team turnout, and tracks progress toward a
50-person goal. Plain JavaScript, no libraries.

**Live:** https://tommyclaffey.github.io/intel-summit-check-in/

## How it meets the brief

| Requirement | Where in `script.js` |
|---|---|
| Personalized greeting | `showMessage()` — name + full team label on every check-in |
| Total attendance count | `state.count++` → `render()` writes it to `#attendeeCount` |
| Team tracking | `state.teams[team]++` — the dropdown value (`water` / `zero` / `power`) is the key, and also the ID prefix of each count (`waterCount`…) |
| Progress bar | `(count / GOAL) * 100`, capped at 100%, set as the bar's width |
| **LevelUp — Celebration** | At 50 check-ins: banner names the winning team (ties handled), winner card highlighted |
| **LevelUp — Save Your Progress** | Whole state saved to `localStorage` as one JSON object; reloaded on page load |
| **LevelUp — Attendee List** | Names + teams under the team counters, newest first, colour-coded by team |

## Decisions worth explaining

- **One state object, one `render()`.** Every check-in changes the data, saves it,
  then redraws the page from it. Page load uses the same `render()` — so a refresh
  shows exactly what was saved.
- **Names are inserted with `textContent`, never `innerHTML`.** Typing
  `<b>Ana</b>` shows the literal text instead of injecting HTML.
- **Ties are handled.** If two teams share the top count at the goal, both are named
  and both cards are highlighted.
- **Reset button** clears the saved data — for testing, or for the next event.
