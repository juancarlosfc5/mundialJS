// src/services/tournament.js
import { db } from "../database.js";

// ─── HELPERS ──────────────────────────────────────────────
function getMatch(matchId) {
  const match = db.matches.find(m => m.id === matchId);
  if (!match) throw new Error(`Partido ${matchId} no existe`);
  return match;
}

// Getter público de solo lectura, reutiliza el helper existente para que
// los módulos de presentación (DOM) puedan relacionar cada gol con su partido
// sin acceder directamente a la base de datos.
export function getMatchById(matchId) {
  return getMatch(matchId);
}

function getPlayer(playerId) {
  const player = db.players.find(p => p.id === playerId);
  if (!player) throw new Error(`Jugador ${playerId} no existe`);
  return player;
}

// ─── CREATE ───────────────────────────────────────────────
export function createGoal(goalData) {
  const { playerId, matchId, minute } = goalData;

  const match = getMatch(matchId);

  if (match.status === "finished")
    throw new Error(`El partido ${matchId} ya finalizó`);

  if (minute < 1 || minute > 130)
    throw new Error(`El minuto ${minute} no es válido (1-130)`);

  const player = getPlayer(playerId);

  const teamIds = [match.teamA.id, match.teamB.id];
  if (!teamIds.includes(player.teamId))
    throw new Error(`${player.name} no juega en este partido`);

  if (match.status === "scheduled") match.status = "in_progress";

  const id = db.goals.length > 0
    ? Math.max(...db.goals.map(g => g.id)) + 1
    : 1;

  const goal = {
    id,
    playerId: player.id,
    playerName: player.name,
    teamId: player.teamId,
    matchId,
    minute
  };

  db.goals.push(goal);
  return goal;
}

// ─── READ ─────────────────────────────────────────────────
export function listGoals() {
  return db.goals;
}

export function getGoalById(goalId) {
  const goal = db.goals.find(g => g.id === goalId);
  if (!goal) throw new Error(`Gol ${goalId} no existe`);
  return goal;
}

// ─── UPDATE ───────────────────────────────────────────────
export function updateGoal(goalId, changes) {
  const index = db.goals.findIndex(g => g.id === goalId);
  if (index === -1) throw new Error(`Gol ${goalId} no existe`);

  if (changes.minute !== undefined) {
    if (changes.minute < 1 || changes.minute > 130)
      throw new Error(`El minuto ${changes.minute} no es válido (1-130)`);
  }

  db.goals[index] = { ...db.goals[index], ...changes };
  return db.goals[index];
}

// ─── DELETE ───────────────────────────────────────────────
export function deleteGoal(goalId) {
  const index = db.goals.findIndex(g => g.id === goalId);
  if (index === -1) throw new Error(`Gol ${goalId} no existe`);

  const deleted = db.goals.splice(index, 1);
  return deleted[0];
}

// ─── TOP SCORERS ──────────────────────────────────────────
export function calculateTopScorers() {
  const tabla = {};

  db.goals.forEach(g => {
    if (!tabla[g.playerId]) {
      const player = db.players.find(p => p.id === g.playerId);
      tabla[g.playerId] = {
        playerId: g.playerId,
        playerName: g.playerName || player?.name || String(g.playerId),
        goals: 0,
        matches: new Set()
      };
    }
    tabla[g.playerId].goals++;
    tabla[g.playerId].matches.add(g.matchId);
  });

  return Object.values(tabla)
    .map(p => ({ ...p, matches: p.matches.size }))
    .sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      if (a.matches !== b.matches) return a.matches - b.matches;
      return (a.playerName || "").localeCompare(b.playerName || "");
    });
}