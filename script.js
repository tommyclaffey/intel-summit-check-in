// Intel Sustainability Summit — Check-In
// Greets each attendee, counts total + per-team turnout, fills the progress bar,
// celebrates the winning team at the goal, and saves everything to localStorage.

// ---------- Settings ----------
const GOAL = 50;
const STORAGE_KEY = "intelSummitCheckIn";

// Dropdown value → full team name (the value is what the HTML <select> sends)
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
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");
const emptyListMessage = document.getElementById("emptyListMessage");
const resetBtn = document.getElementById("resetBtn");

// ---------- State ----------
// One object holds everything, so saving and loading is a single step.
let state = loadState();

function freshState() {
  return {
    count: 0,
    teams: { water: 0, zero: 0, power: 0 },
    attendees: [], // [{ name, team }]
  };
}

// ---------- LevelUp: Save Your Progress ----------
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return freshState();

  try {
    const parsed = JSON.parse(saved);
    // Merge with a fresh state so a missing field can never break the page
    return {
      ...freshState(),
      ...parsed,
      teams: { ...freshState().teams, ...parsed.teams },
    };
  } catch {
    return freshState();
  }
}

// ---------- Check-in ----------
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const name = nameInput.value.trim();
  const team = teamSelect.value;

  if (name === "" || !TEAMS[team]) {
    showMessage("Please enter a name and choose a team.", "error-message");
    return;
  }

  // Update the data
  state.count++;
  state.teams[team]++;
  state.attendees.unshift({ name: name, team: team }); // newest first

  saveState();
  render();

  // Greet the attendee — or celebrate if this check-in hit the goal
  if (state.count === GOAL) {
    showCelebration();
  } else {
    showMessage(`🎉 Welcome, ${name}, from ${TEAMS[team]}!`, "success-message");
  }

  form.reset();
  nameInput.focus();
});

// ---------- Draw the page from the state ----------
function render() {
  // Total count
  attendeeCountEl.textContent = state.count;

  // Progress bar — capped at 100% so it never overflows past the goal
  const percent = Math.min((state.count / GOAL) * 100, 100);
  progressBar.style.width = percent + "%";

  // Team counts
  for (const team in TEAMS) {
    document.getElementById(team + "Count").textContent = state.teams[team];
  }

  // Keep the leading team highlighted once the goal is reached
  highlightWinners(state.count >= GOAL ? getWinners() : []);

  renderAttendeeList();
}

// ---------- LevelUp: Attendee List ----------
function renderAttendeeList() {
  attendeeList.innerHTML = "";
  emptyListMessage.style.display = state.attendees.length ? "none" : "block";

  state.attendees.forEach(function (attendee) {
    const item = document.createElement("li");
    item.className = "attendee-item " + attendee.team;

    // textContent (not innerHTML) so a typed name can never inject HTML
    const nameEl = document.createElement("span");
    nameEl.className = "attendee-name";
    nameEl.textContent = attendee.name;

    const teamEl = document.createElement("span");
    teamEl.className = "attendee-team";
    teamEl.textContent = TEAMS[attendee.team];

    item.append(nameEl, teamEl);
    attendeeList.appendChild(item);
  });
}

// ---------- LevelUp: Celebration ----------
function getWinners() {
  const highest = Math.max(...Object.values(state.teams));
  return Object.keys(TEAMS).filter((team) => state.teams[team] === highest);
}

function showCelebration() {
  const winners = getWinners();
  const names = winners.map((team) => TEAMS[team]);

  const text =
    winners.length === 1
      ? `🏆 Goal reached — ${GOAL} attendees! ${names[0]} wins with ${state.teams[winners[0]]} check-ins!`
      : `🏆 Goal reached — ${GOAL} attendees! It's a tie between ${names.join(" and ")}!`;

  showMessage(text, "celebration-message");
}

function highlightWinners(winners) {
  document.querySelectorAll(".team-card").forEach(function (card) {
    card.classList.remove("winner");
  });
  winners.forEach(function (team) {
    document.querySelector(".team-card." + team).classList.add("winner");
  });
}

// ---------- Messages ----------
function showMessage(text, className) {
  greeting.textContent = text;
  greeting.className = className;
  greeting.style.display = "block";
}

// ---------- Reset (for testing / a new event) ----------
resetBtn.addEventListener("click", function () {
  if (!confirm("Clear all check-ins? This can't be undone.")) return;

  localStorage.removeItem(STORAGE_KEY);
  state = freshState();
  greeting.style.display = "none";
  render();
});

// ---------- On page load ----------
render();
if (state.count >= GOAL) showCelebration(); // keep the win visible after a refresh
