import { deleteGroup } from '../../api/groupsApi.js';

// DELETE elimina un grupo utilizando el id que identifica el recurso en la API.
export async function eliminarGrupo(id) {
    return await deleteGroup(id);
}