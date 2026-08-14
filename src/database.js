import initialData from './data/db.json';

// Estado en memoria de la base de datos para el torneo
export const database = {
  groups: [...initialData.groups.map(g => ({ ...g }))],
  teams: [...initialData.teams.map(t => ({ ...t }))],
  players: [...initialData.players.map(p => ({ ...p }))],
  matches: [...initialData.matches.map(m => ({ ...m }))],
  goals: [...initialData.goals.map(g => ({ ...g }))]
};
