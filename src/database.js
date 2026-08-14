// src/database.js
import data from "./data/db.json" with { type: "json" };

export const db = {
  groups: [...(data.groups || []).map(g => ({ ...g }))],
  teams: [...(data.teams || []).map(t => ({ ...t }))],
  players: [...(data.players || []).map(p => ({ ...p }))],
  matches: [...(data.matches || []).map(m => ({ ...m }))],
  goals: [...(data.goals || []).map(g => ({ ...g }))]
};

export const database = db;