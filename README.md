# Intel Sustainability Summit — Event Check-In

Coursework build. A check-in app for Intel's Sustainability Summit: it greets
each attendee, counts total and per-team turnout, and tracks progress toward a
50-person goal. Plain JavaScript, no libraries.

**Live:** https://tommyclaffey.github.io/intel-summit-check-in/

## How it meets the brief

| Requirement | How (`script.js`) |
|---|---|
| Personalized greeting | Name, full team name and place in line: *"Welcome, Ana, from Team Net Zero! You're attendee #12."* |
| Total attendance count | `state.count++`, then `render()` writes it to `#attendeeCount` |
| Team tracking | `state.teams[team]++`. The dropdown value (`water` / `zero` / `power`) is the key **and** the ID prefix of each count (`#waterCount`), so there's no if/else per team |
| Progress bar | `(count / GOAL) * 100`, capped at 100%. Turns green at the goal |
| **LevelUp — Celebration** | Check-in #50 shows a banner naming the winning team. The winner's card is highlighted. Ties name every tied team |
| **LevelUp — Save Your Progress** | The whole state is saved to `localStorage` as one JSON object after every check-in, and reloaded on page load |
| **LevelUp — Attendee List** | Names and teams below the team counters, newest first, colour-coded by team, with a running count |

## Decisions worth explaining

- **Change the data → save it → redraw from it.** Every check-in follows those
  three steps. Page load calls the same `render()`, so a refresh shows exactly
  what was saved, with no separate "restore" code.
- **The goal lives in one place.** `GOAL = 50` in `script.js` also fills in the
  "/50" on the page. Change one number and everything follows.
- **Names use `textContent`, never `innerHTML`.** Typing `<b>Ana</b>` shows the
  literal text instead of injecting HTML.
- **Built for the person at the check-in table.** The form clears and the cursor
  returns to the name field after each check-in. Blank and space-only names are
  rejected, and extra spaces are cleaned up.
- **Accessible.** The greeting is announced to screen readers (`aria-live`), the
  progress bar reports its value (`role="progressbar"`), and animations switch
  off for people who've set their device to reduce motion.
- **Bad saved data can't break the page.** If what's in `localStorage` can't be
  read, the app starts fresh instead of crashing.

## Testing the celebration quickly

Paste this in the browser console, then check in one more person:

```js
localStorage.setItem("intelSummitCheckIn", JSON.stringify({ count: 49, teams: { water: 20, zero: 15, power: 14 }, attendees: [] }));
location.reload();
```

Click **Reset Check-Ins** at the bottom to clear everything.
