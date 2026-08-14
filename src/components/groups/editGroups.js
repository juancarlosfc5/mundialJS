import { patchGroup, putGroup } from '../../api/groupsApi.js';

// PATCH modifica solamente los campos que cambian en el grupo.
export async function editarGrupoParcial(datos, id) {
    return await patchGroup(datos, id);
}

// PUT reemplaza todos los datos de un grupo existente.
export async function editarGrupoCompleto(datos, id) {
    return await putGroup(datos, id);
}