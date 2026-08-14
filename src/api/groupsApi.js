// Cambia VITE_APP_ENV entre "dev" y "prod" en .env para seleccionar la API.
const URL_API = import.meta.env.VITE_APP_ENV === 'prod'
    ? import.meta.env.VITE_PROD_API_URL
    : import.meta.env.VITE_DEV_API_URL;

const myHeaders = new Headers({
    'Content-Type': 'application/json',
});

// GET: obtiene todos los grupos.
const getGroups = async () => {
    try {
        const respuesta = await fetch(`${URL_API}/groups`);

        if (respuesta.status === 200) {
            console.log('HTTP 200: los grupos fueron consultados correctamente.');
            return await respuesta.json();
        } else if (respuesta.status === 401) {
            console.log('HTTP 401: no está autorizado para consultar la API.');
        } else if (respuesta.status === 404) {
            console.log('HTTP 404: la URL o el recurso Group no existe.');
        } else {
            console.log(`HTTP ${respuesta.status}: ocurrió un error al consultar los grupos.`);
        }
    } catch (error) {
        console.error('Error en la solicitud GET:', error.message);
    }
};

// POST: crea un nuevo grupo.
const postGroup = async (datos) => {
    try {
        const respuesta = await fetch(`${URL_API}/groups`, {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(datos),
        });

        if (respuesta.status === 201 || respuesta.status === 200) {
            console.log(`HTTP ${respuesta.status}: grupo creado correctamente.`);
            return await respuesta.json();
        } else if (respuesta.status === 400) {
            console.log('HTTP 400: los datos del grupo no son válidos.');
        } else if (respuesta.status === 401) {
            console.log('HTTP 401: no está autorizado para crear el grupo.');
        } else if (respuesta.status === 404) {
            console.log('HTTP 404: la URL o el recurso Group no existe.');
        } else {
            console.log(`HTTP ${respuesta.status}: no fue posible crear el grupo.`);
        }
    } catch (error) {
        console.error('Error en la solicitud POST:', error.message);
    }
};

// PATCH: actualiza únicamente los campos recibidos de un grupo.
const patchGroup = async (datos, id) => {
    try {
        const respuesta = await fetch(`${URL_API}/groups/${id}`, {
            method: 'PATCH',
            headers: myHeaders,
            body: JSON.stringify(datos),
        });

        if (respuesta.status === 200) {
            console.log('HTTP 200: grupo actualizado parcialmente.');
            return await respuesta.json();
        } else if (respuesta.status === 400) {
            console.log('HTTP 400: los datos enviados para actualizar no son válidos.');
        } else if (respuesta.status === 404) {
            console.log('HTTP 404: el grupo que intenta actualizar no existe.');
        } else {
            console.log(`HTTP ${respuesta.status}: no fue posible actualizar parcialmente el grupo.`);
        }
    } catch (error) {
        console.error('Error en la solicitud PATCH:', error.message);
    }
};

// PUT: reemplaza todos los datos de un grupo.
const putGroup = async (datos, id) => {
    try {
        const respuesta = await fetch(`${URL_API}/groups/${id}`, {
            method: 'PUT',
            headers: myHeaders,
            body: JSON.stringify(datos),
        });

        if (respuesta.status === 200) {
            console.log('HTTP 200: grupo actualizado completamente.');
            return await respuesta.json();
        } else if (respuesta.status === 400) {
            console.log('HTTP 400: los datos enviados para reemplazar no son válidos.');
        } else if (respuesta.status === 404) {
            console.log('HTTP 404: el grupo que intenta reemplazar no existe.');
        } else {
            console.log(`HTTP ${respuesta.status}: no fue posible reemplazar el grupo.`);
        }
    } catch (error) {
        console.error('Error en la solicitud PUT:', error.message);
    }
};

// DELETE: elimina un grupo por su id.
const deleteGroup = async (id) => {
    try {
        const respuesta = await fetch(`${URL_API}/groups/${id}`, {
            method: 'DELETE',
            headers: myHeaders,
        });

        if (respuesta.status === 200 || respuesta.status === 204) {
            console.log(`HTTP ${respuesta.status}: grupo eliminado correctamente.`);
            return respuesta;
        } else if (respuesta.status === 401) {
            console.log('HTTP 401: no está autorizado para eliminar el grupo.');
        } else if (respuesta.status === 404) {
            console.log('HTTP 404: el grupo que intenta eliminar no existe.');
        } else {
            console.log(`HTTP ${respuesta.status}: no fue posible eliminar el grupo.`);
        }
    } catch (error) {
        console.error('Error en la solicitud DELETE:', error.message);
    }
};

export {
    getGroups,
    postGroup,
    patchGroup,
    putGroup,
    deleteGroup,
};