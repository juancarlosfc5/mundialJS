// src/components/goals/createGoal.js
import { postGoal } from '../../api/goalsApi.js';

export async function crearGol(datos) {
  const camposObligatorios = ['matchId', 'teamId', 'playerId', 'minute', 'type'];
  for (const campo of camposObligatorios) {
    if (datos[campo] === undefined || datos[campo] === '') {
      throw new Error(`El campo "${campo}" es obligatorio para registrar un gol.`);
    }
  }

  if (datos.minute < 1 || datos.minute > 130) {
    throw new Error('El minuto debe estar entre 1 y 130.');
  }

  const gol = {
    matchId: datos.matchId,
    teamId: datos.teamId,
    playerId: datos.playerId,
    minute: Number(datos.minute),
    type: datos.type,
  };

  return await postGoal(gol);
}