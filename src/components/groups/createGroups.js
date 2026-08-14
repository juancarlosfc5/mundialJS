import { postGroup } from '../../api/groupsApi.js';

// Valida y construye el objeto antes de enviarlo con el método POST.
export async function crearGrupo(datos) {
    const camposObligatorios = ['code', 'name'];

    for (const campo of camposObligatorios) {
        if (datos[campo] === undefined || datos[campo] === '') {
            throw new Error(`El campo "${campo}" es obligatorio para crear un grupo.`);
        }
    }

    const grupo = {
        id: `group-${datos.code.toLowerCase()}`,
        code: datos.code,
        name: datos.name,
    };

    return await postGroup(grupo);
}