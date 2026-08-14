import { deleteMatch } from '../../api/matchesApi.js';

// DELETE elimina un partido utilizando el id que identifica el recurso en la API.
export async function eliminarPartido(id) {
  return await deleteMatch(id);
}
