// Cambia VITE_APP_ENV entre "dev" y "prod" en .env para seleccionar la API.
const URL_API = import.meta.env.VITE_APP_ENV === 'prod'
    ? import.meta.env.VITE_PROD_API_URL
    : import.meta.env.VITE_DEV_API_URL;

const myHeaders = new Headers({
    'Content-Type': 'application/json',
});

// GET: obtiene todos los partidos.
const getPlayers = async () => {
    try {
        const respuesta = await fetch(`${URL_API}/players`);

        if (respuesta.status === 200) {
            console.log('HTTP 200: los jugadores fueron consultados correctamente.');
            return await respuesta.json();
        } else if (respuesta.status === 401) {
            console.log('HTTP 401: no está autorizado para consultar la API.');
        } else if (respuesta.status === 404) {
            console.log('HTTP 404: la URL o el recurso players no existe.');
        } else {
            console.log(`HTTP ${respuesta.status}: ocurrió un error al consultar los jugadores.`);
        }
    } catch (error) {
        console.error('Error en la solicitud GET:', error.message);
    }
};

// POST: crea un nuevo jugador.
const postPlayer = async (datos) => {
    try {
        const respuesta = await fetch(`${URL_API}/players`, {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(datos),
        });

        if (respuesta.status === 201 || respuesta.status === 200) {
            console.log(`HTTP ${respuesta.status}: jugador creado correctamente.`);
            return await respuesta.json();
        } else if (respuesta.status === 400) {
            console.log('HTTP 400: los datos del jugador no son válidos.');
        } else if (respuesta.status === 401) {
            console.log('HTTP 401: no está autorizado para crear el jugador.');
        } else if (respuesta.status === 404) {
            console.log('HTTP 404: la URL o el recurso players no existe.');
        } else {
            console.log(`HTTP ${respuesta.status}: no fue posible crear el jugador.`);
        }
    } catch (error) {
        console.error('Error en la solicitud POST:', error.message);
    }
};

// PATCH: actualiza únicamente los campos recibidos de un jugador.
const patchPlayer = async (datos, id) => {
    try {
        const respuesta = await fetch(`${URL_API}/players/${id}`, {
            method: 'PATCH',
            headers: myHeaders,
            body: JSON.stringify(datos),
        });

        if (respuesta.status === 200) {
            console.log('HTTP 200: jugador actualizado parcialmente.');
            return await respuesta.json();
        } else if (respuesta.status === 400) {
            console.log('HTTP 400: los datos enviados para actualizar no son válidos.');
        } else if (respuesta.status === 404) {
            console.log('HTTP 404: el jugador que intenta actualizar no existe.');
        } else {
            console.log(`HTTP ${respuesta.status}: no fue posible actualizar parcialmente el jugador.`);
        }
    } catch (error) {
        console.error('Error en la solicitud PATCH:', error.message);
    }
};

// PUT: reemplaza todos los datos de un jugador.
const putPlayer = async (datos, id) => {
    try {
        const respuesta = await fetch(`${URL_API}/players/${id}`, {
            method: 'PUT',
            headers: myHeaders,
            body: JSON.stringify(datos),
        });

        if (respuesta.status === 200) {
            console.log('HTTP 200: jugador actualizado completamente.');
            return await respuesta.json();
        } else if (respuesta.status === 400) {
            console.log('HTTP 400: los datos enviados para reemplazar no son válidos.');
        } else if (respuesta.status === 404) {
            console.log('HTTP 404: el jugador que intenta reemplazar no existe.');
        } else {
            console.log(`HTTP ${respuesta.status}: no fue posible reemplazar el jugador.`);
        }
    } catch (error) {
        console.error('Error en la solicitud PUT:', error.message);
    }
};

// DELETE: elimina un jugador por su id.
const deletePlayer = async (id) => {
    try {
        const respuesta = await fetch(`${URL_API}/players/${id}`, {
            method: 'DELETE',
            headers: myHeaders,
        });

        if (respuesta.status === 200 || respuesta.status === 204) {
            console.log(`HTTP ${respuesta.status}: jugador eliminado correctamente.`);
            return respuesta;
        } else if (respuesta.status === 401) {
            console.log('HTTP 401: no está autorizado para eliminar el jugador.');
        } else if (respuesta.status === 404) {
            console.log('HTTP 404: el jugador que intenta eliminar no existe.');
        } else {
            console.log(`HTTP ${respuesta.status}: no fue posible eliminar el jugador.`);
        }
    } catch (error) {
        console.error('Error en la solicitud DELETE:', error.message);
    }
};

export {
    getPlayers,
    postPlayer,
    patchPlayer,
    putPlayer,
    deletePlayer,
};