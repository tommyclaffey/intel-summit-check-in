// Intel Sustainability Summit — Check-In
// Greets each attendee, counts total and per-team turnout, fills the progress
// bar, celebrates the winning team at the goal, and saves everything to
// localStorage so a refresh never loses the count.

// ---------- Settings ----------
const GOAL = 50;
const STORAGE_KEY = "intelSummitCheckIn";

// Dropdown value → full team name. The values match the HTML <select>
// and the ID prefix of each team's count (water → #waterCount).
const TEAMS = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

// ---------- Page elements ----------
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const attendeeGoal = document.getElementById("attendeeGoal");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");
const listCount = document.getElementById("listCount");
const emptyListMessage = document.getElementById("emptyListMessage");
const resetBtn = document.getElementById("resetBtn");

// ---------- State ----------
// One object holds everything, so saving and loading is a single step.
function freshState() {
  return {
    count: 0,
    teams: { water: 0, zero: 0, power: 0 },
    attendees: [], // newest first: [{ name, team }]
  };
}

let state = loadState();

// ---------- LevelUp: Save Your Progress ----------
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return freshState();

    // Merge onto a fresh state so a missing field can never break the page
    const fresh = freshState();
    return {
      count: saved.count ?? fresh.count,
      teams: { ...fresh.teams, ...saved.teams },
      attendees: Array.isArray(saved.attendees) ? saved.attendees : [],
    };
  } catch {
    return freshState(); // corrupted data → start clean instead of crashing
  }
}

// ---------- Check-in ----------
form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading

  // Trim the ends and collapse double spaces: "  Ana   Ruiz " → "Ana Ruiz"
  const name = nameInput.value.trim().replace(/\s+/g, " ");
  const team = teamSelect.value;

  if (name === "" || !TEAMS[team]) {
    showMessage("Please enter a name and choose a team.", "error-message");
    nameInput.focus();
    return;
  }

  // 1. Update the data
  state.count++;
  state.teams[team]++;
  state.attendees.unshift({ name, team });

  // 2. Save it
  saveState();

  // 3. Redraw the page from it
  render();

  // Celebrate on the check-in that hits the goal; greet everyone else
  if (state.count === GOAL) {
    showCelebration();
  } else {
    showMessage(
      `🎉 Welcome, ${name}, from ${TEAMS[team]}! You're attendee #${state.count}.`,
      "success-message"
    );
  }

  form.reset();
  nameInput.focus(); // ready for the next person — no mouse needed
});

// ---------- Draw the page from the state ----------
function render() {
  // Total count
  attendeeCount.textContent = state.count;

  // Progress bar — capped at 100% so it never overflows past the goal
  const percent = Math.min((state.count / GOAL) * 100, 100);
  progressBar.style.width = `${percent}%`;
  progressBar.classList.toggle("complete", state.count >= GOAL);
  progressContainer.setAttribute("aria-valuenow", state.count);

  // Team counts
  for (const team in TEAMS) {
    document.getElementById(`${team}Count`).textContent = state.teams[team];
  }

  // Once the goal is reached, keep the leading team highlighted
  highlightWinners(state.count >= GOAL ? getWinners() : []);

  renderAttendeeList();
}

// ---------- LevelUp: Attendee List ----------
function renderAttendeeList() {
  attendeeList.innerHTML = "";
  listCount.textContent = state.attendees.length;
  emptyListMessage.hidden = state.attendees.length > 0;

  state.attendees.forEach(({ name, team }) => {
    const item = document.createElement("li");
    item.className = `attendee-item ${team}`;

    // textContent, not innerHTML, so a typed name can never inject HTML
    const nameEl = document.createElement("span");
    nameEl.className = "attendee-name";
    nameEl.textContent = name;

    const teamEl = document.createElement("span");
    teamEl.className = "attendee-team";
    teamEl.textContent = TEAMS[team];

    item.append(nameEl, teamEl);
    attendeeList.appendChild(item);
  });
}

// ---------- LevelUp: Celebration ----------
// Returns every team tied for the highest count (usually just one)
function getWinners() {
  const highest = Math.max(...Object.values(state.teams));
  return Object.keys(TEAMS).filter((team) => state.teams[team] === highest);
}

function showCelebration() {
  const winners = getWinners();
  const topCount = state.teams[winners[0]];
  const names = new Intl.ListFormat("en", { type: "conjunction" }).format(
    winners.map((team) => TEAMS[team])
  ); // "A", "A and B", "A, B, and C"

  const result =
    winners.length === 1
      ? `${names} wins with ${topCount} check-ins!`
      : `It's a tie — ${names} each have ${topCount} check-ins!`;

  showMessage(`🏆 Goal reached: ${state.count} attendees! ${result}`, "celebration-message");
}

function highlightWinners(winners) {
  document.querySelectorAll(".team-card").forEach((card) => {
    card.classList.toggle("winner", winners.some((team) => card.classList.contains(team)));
  });
}

// ---------- Messages ----------
function showMessage(text, type) {
  greeting.textContent = text;
  greeting.className = type;
  greeting.style.display = "block";
}

// ---------- Reset (for testing, or for the next event) ----------
resetBtn.addEventListener("click", () => {
  if (!confirm("Clear all check-ins? This can't be undone.")) return;

  localStorage.removeItem(STORAGE_KEY);
  state = freshState();
  greeting.style.display = "none";
  render();
  nameInput.focus();
});

// ---------- On page load ----------
attendeeGoal.textContent = GOAL; // the goal lives in one place: the GOAL constant
progressContainer.setAttribute("aria-valuemax", GOAL);
render();
if (state.count >= GOAL) showCelebration(); // keep the win visible after a refresh
