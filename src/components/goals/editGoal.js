// src/components/goals/editGoal.js
import { patchGoal } from '../../api/goalsApi.js';

export async function editarGol(datos, id) {
  if (!id) throw new Error('Se requiere el ID del gol para actualizarlo.');

  if (datos.minute !== undefined) {
    if (datos.minute < 1 || datos.minute > 130) {
      throw new Error('El minuto debe estar entre 1 y 130.');
    }
    datos.minute = Number(datos.minute);
  }

  return await patchGoal(datos, id);
}