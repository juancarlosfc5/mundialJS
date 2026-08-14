// src/database.js
import data from "./data/db.json";

export const db = {
  goals: [...data.goals],
  matches: [...data.matches],
  teams: [...data.teams],
  players: data.players.map(p => ({ ...p }))
};