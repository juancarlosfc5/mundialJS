import { patchMatch, putMatch } from '../../api/matchesApi.js';

// PATCH modifica solamente los campos que cambian en el partido.
export async function editarPartidoParcial(datos, id) {
  return await patchMatch(datos, id);
}

// PUT reemplaza todos los datos de un partido existente.
export async function editarPartidoCompleto(datos, id) {
  return await putMatch(datos, id);
}
