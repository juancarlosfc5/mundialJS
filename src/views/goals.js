// src/views/goals.js
import {
  listGoals,
  calculateTopScorers,
  getMatchById,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalById,
} from "../services/tournament.js";
import { db } from "../database.js";

// ─── REFERENCIAS AL DOM ───────────────────────────────────
const timelineEl  = document.getElementById("goals-timeline");
const summaryEl   = document.getElementById("goals-summary");
const scorersBody = document.querySelector("#scorers-body");

// ─── GUARD DE EVENTOS ─────────────────────────────────────
let eventsWereConfigured = false;

// ─── HELPERS INTERNOS ─────────────────────────────────────

function clearChildren(container) {
  while (container.firstElementChild) {
    container.firstElementChild.remove();
  }
}

function createEmptyState() {
  const emptyState = document.createElement("div");
  emptyState.id = "goals-empty-state";
  emptyState.classList.add("empty-state");
  const message = document.createElement("p");
  message.textContent = "Aún no se han registrado goles en el torneo.";
  emptyState.appendChild(message);
  return emptyState;
}

function animateIn(node) {
  const animation = node.animate(
    [
      { opacity: 0, transform: "translateY(10px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 280, easing: "ease-out", fill: "both" }
  );
  return animation.finished;
}

function showMessage(text, isError = false) {
  const msg = document.querySelector("#goals-message");
  if (!msg) return;
  msg.textContent = text;
  msg.className = isError ? "message message--error" : "message message--success";
  setTimeout(() => { msg.textContent = ""; msg.className = "message"; }, 3000);
}

function getTeamName(teamId) {
  const team = db.teams.find(t => t.id === teamId);
  return team ? team.name : teamId;
}

function fillMatchOptions() {
  const matchSelect = document.querySelector("#goal-match-select");
  if (!matchSelect) return;

  while (matchSelect.firstChild) matchSelect.removeChild(matchSelect.firstChild);

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "— Selecciona un partido —";
  matchSelect.appendChild(placeholder);

  db.matches.forEach(match => {
    const home = db.teams.find(t => t.id === match.homeTeamId);
    const away = db.teams.find(t => t.id === match.awayTeamId);
    const opt = document.createElement("option");
    opt.value = match.id;
    opt.textContent = `#${match.matchNumber} ${home?.code} vs ${away?.code}`;
    matchSelect.appendChild(opt);
  });
}

function fillTeamOptions(homeTeamId, awayTeamId) {
  const teamSelect = document.querySelector("#goal-team-select");
  if (!teamSelect) return;
  while (teamSelect.firstChild) teamSelect.removeChild(teamSelect.firstChild);
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "— Selecciona equipo —";
  teamSelect.appendChild(placeholder);
  [homeTeamId, awayTeamId].forEach(teamId => {
    const team = db.teams.find(t => t.id === teamId);
    if (!team) return;
    const opt = document.createElement("option");
    opt.value = team.id;
    opt.textContent = `${team.code} — ${team.name}`;
    teamSelect.appendChild(opt);
  });
}

function fillPlayerOptions(teamId) {
  const playerSelect = document.querySelector("#goal-player-select");
  if (!playerSelect) return;
  while (playerSelect.firstChild) playerSelect.removeChild(playerSelect.firstChild);
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "— Selecciona jugador —";
  playerSelect.appendChild(placeholder);
  db.players.filter(p => p.teamId === teamId && p.active).forEach(player => {
    const opt = document.createElement("option");
    opt.value = player.id;
    opt.textContent = `#${player.number} ${player.name}`;
    playerSelect.appendChild(opt);
  });
}

function clearGoalForm() {
  const form = document.querySelector("#goal-form");
  if (!form) return;
  form.reset();
  form.removeAttribute("data-editing-id");
  fillMatchOptions();
  fillTeamOptions("", "");
  fillPlayerOptions("");
}

function loadGoalIntoForm(goalId) {
  const goal = getGoalById(goalId);
  const form = document.querySelector("#goal-form");
  if (!form || !goal) return;
  const matchSelect = document.querySelector("#goal-match-select");
  if (matchSelect) matchSelect.value = goal.matchId;
  const match = db.matches.find(m => m.id === goal.matchId);
  if (match) fillTeamOptions(match.homeTeamId, match.awayTeamId);
  const teamSelect = document.querySelector("#goal-team-select");
  if (teamSelect) teamSelect.value = goal.teamId;
  fillPlayerOptions(goal.teamId);
  const playerSelect = document.querySelector("#goal-player-select");
  if (playerSelect) playerSelect.value = goal.playerId;
  const minuteInput = document.querySelector("#goal-minute-input");
  if (minuteInput) minuteInput.value = goal.minute;
  const typeSelect = document.querySelector("#goal-type-select");
  if (typeSelect) typeSelect.value = goal.type || "Jugada";
  form.setAttribute("data-editing-id", goalId);
}

// ─── BUILD: ITEM DE GOL ───────────────────────────────────

function buildGoalItem(goal) {
  const item = document.createElement("li");
  item.classList.add("goal-item");
  item.setAttribute("data-goal-id", goal.id);

  const minute = document.createElement("span");
  minute.classList.add("goal-minute");
  minute.textContent = `${goal.minute}'`;

  const player = document.createElement("span");
  player.classList.add("goal-player");
  player.textContent = goal.playerName || goal.playerId;

  const detail = document.createElement("span");
  detail.classList.add("goal-detail");

  let match = null;
  try { match = getMatchById(goal.matchId); } catch { match = null; }

  if (match) {
    const homeTeam = db.teams.find(t => t.id === match.homeTeamId);
    const awayTeam = db.teams.find(t => t.id === match.awayTeamId);
    const scoringTeam = match.homeTeamId === goal.teamId ? homeTeam?.name : awayTeam?.name;
    detail.textContent = `${scoringTeam} · ${homeTeam?.name} vs ${awayTeam?.name}`;
  } else {
    detail.textContent = "Partido no disponible";
  }

  const actions = document.createElement("div");
  actions.classList.add("goal-item__actions");

  const btnEdit = document.createElement("button");
  btnEdit.setAttribute("data-action", "edit");
  btnEdit.setAttribute("data-goal-id", goal.id);
  btnEdit.textContent = "✏️";

  const btnDelete = document.createElement("button");
  btnDelete.setAttribute("data-action", "delete");
  btnDelete.setAttribute("data-goal-id", goal.id);
  btnDelete.textContent = "🗑️";

  actions.appendChild(btnEdit);
  actions.appendChild(btnDelete);

  item.append(minute, player);
  item.insertAdjacentElement("beforeend", detail);
  item.insertAdjacentElement("beforeend", actions);

  return item;
}

// ─── BUILD: FILA DE GOLEADOR ──────────────────────────────

function buildScorerRow(scorer, position) {
  const row = document.createElement("tr");
  row.setAttribute("data-player-id", scorer.playerId);

  const rank = document.createElement("td");
  rank.textContent = position + 1;

  const name = document.createElement("td");
  name.textContent = scorer.playerName;

  const team = document.createElement("td");
  const player = db.players.find(p => p.id === scorer.playerId);
  team.textContent = player ? getTeamName(player.teamId) : "–";

  const goals = document.createElement("td");
  goals.textContent = scorer.goals;

  const matches = document.createElement("td");
  matches.textContent = scorer.matches;

  row.append(rank, name, team, goals, matches);
  return row;
}

// ─── RENDER: TIMELINE ─────────────────────────────────────

async function renderGoalsTimeline() {
  const goals = listGoals();
  const sortedGoals = [...goals].sort((a, b) => a.minute - b.minute);

  clearChildren(timelineEl);
  if (summaryEl) summaryEl.textContent = "";

  let emptyState = document.querySelector("#goals-empty-state");

  if (sortedGoals.length === 0) {
    if (!emptyState) {
      emptyState = createEmptyState();
      timelineEl.insertAdjacentElement("beforebegin", emptyState);
    }
    return;
  }

  if (emptyState) emptyState.remove();

  const insertedItems = [];
  for (const goal of sortedGoals) {
    const item = buildGoalItem(goal);
    timelineEl.insertAdjacentElement("beforeend", item);
    insertedItems.push(item);
  }

  if (summaryEl) {
    summaryEl.insertAdjacentText(
      "beforeend",
      `Total de goles registrados: ${sortedGoals.length}.`
    );
  }

  console.log("Primer gol:", timelineEl.firstElementChild);
  console.log("Último gol:", timelineEl.lastElementChild);

  await Promise.all(insertedItems.map(animateIn));
}

// ─── RENDER: TABLA DE GOLEADORES ──────────────────────────

async function renderScorersTable() {
  const scorers = calculateTopScorers();
  clearChildren(scorersBody);
  if (scorers.length === 0) return;

  const insertedRows = [];
  scorers.forEach((scorer, index) => {
    const row = buildScorerRow(scorer, index);
    scorersBody.insertAdjacentElement("beforeend", row);
    insertedRows.push(row);
  });

  const firstRow = scorersBody.firstElementChild;
  if (firstRow) firstRow.classList.toggle("top-scorer");

  const lastRow = scorersBody.lastElementChild;
  if (lastRow) lastRow.setAttribute("data-last-row", "true");

  await Promise.all(insertedRows.map(animateIn));
}

// ─── EVENTOS (Reto 3) ─────────────────────────────────────

export function setupGoalEvents(refreshApplication) {
  if (eventsWereConfigured) return;
  eventsWereConfigured = true;

  // 1. change: partido → equipos
  const matchSelect = document.querySelector("#goal-match-select");
  if (matchSelect) {
    matchSelect.addEventListener("change", (event) => {
      const match = db.matches.find(m => m.id === event.target.value);
      if (!match) return;
      fillTeamOptions(match.homeTeamId, match.awayTeamId);
      fillPlayerOptions("");
    });
  }

  // 2. change: equipo → jugadores activos
  const teamSelect = document.querySelector("#goal-team-select");
  if (teamSelect) {
    teamSelect.addEventListener("change", (event) => {
      if (event.target.value) fillPlayerOptions(event.target.value);
    });
  }

  // 3. submit: crear o actualizar
  const form = document.querySelector("#goal-form");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const matchId  = document.querySelector("#goal-match-select")?.value;
      const teamId   = document.querySelector("#goal-team-select")?.value;
      const playerId = document.querySelector("#goal-player-select")?.value;
      const minute   = Number(document.querySelector("#goal-minute-input")?.value);
      const type     = document.querySelector("#goal-type-select")?.value || "Jugada";
      const editingId = form.getAttribute("data-editing-id");
      try {
        if (editingId) {
          updateGoal(editingId, { minute, type });
          showMessage("✅ Gol actualizado.");
        } else {
          createGoal({ playerId, matchId, minute, type });
          showMessage("✅ Gol registrado.");
        }
        clearGoalForm();
        await refreshApplication();
      } catch (error) {
        showMessage(`❌ ${error.message}`, true);
      }
    });
  }

  // 4. click delegado: editar y eliminar
  if (timelineEl) {
    timelineEl.addEventListener("click", async (event) => {
      const btn = event.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const goalId = btn.getAttribute("data-goal-id");
      if (action === "edit") {
        loadGoalIntoForm(goalId);
        form?.scrollIntoView({ behavior: "smooth" });
      } else if (action === "delete") {
        try {
          deleteGoal(goalId);
          showMessage("🗑️ Gol eliminado.");
          await refreshApplication();
        } catch (error) {
          showMessage(`❌ ${error.message}`, true);
        }
      }
    });
  }

  // 5. keydown: buscador de goleadores
  const searchInput = document.querySelector("#scorers-search");
  if (searchInput) {
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const query = searchInput.value.trim().toLowerCase();
        document.querySelectorAll("#scorers-body tr").forEach(row => {
          const name = row.querySelector("td:nth-child(2)")?.textContent.toLowerCase() || "";
          const team = row.querySelector("td:nth-child(3)")?.textContent.toLowerCase() || "";
          row.style.display = name.includes(query) || team.includes(query) ? "" : "none";
        });
      }
      if (event.key === "Escape") {
        searchInput.value = "";
        document.querySelectorAll("#scorers-body tr").forEach(row => {
          row.style.display = "";
        });
      }
    });
  }

  // 6. mouseover y mouseout: resaltar gol
  if (timelineEl) {
    timelineEl.addEventListener("mouseover", (event) => {
      const item = event.target.closest(".goal-item");
      if (!item || item === timelineEl._hovered) return;
      timelineEl._hovered = item;
      item.classList.add("goal-item--highlighted");
    });
    timelineEl.addEventListener("mouseout", (event) => {
      const item = event.target.closest(".goal-item");
      if (!item || item.contains(event.relatedTarget)) return;
      item.classList.remove("goal-item--highlighted");
      timelineEl._hovered = null;
    });
  }

  // 7. click: cancelar formulario
  const cancelBtn = document.querySelector("#goal-cancel-btn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      clearGoalForm();
      showMessage("Formulario limpiado.");
    });
  }
}

// ─── API PÚBLICA ──────────────────────────────────────────

export const domClass = {
  async renderApplication() {
    await renderGoalsTimeline();
    await renderScorersTable();
    fillMatchOptions();
    return {
      goals: listGoals().length,
      scorers: calculateTopScorers().length,
    };
  },
};