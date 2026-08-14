// src/components/goals/deleteGoal.js
import { deleteGoal } from '../../api/goalsApi.js';

export async function eliminarGol(id) {
  if (!id) throw new Error('Se requiere el ID del gol para eliminarlo.');
  return await deleteGoal(id);
}