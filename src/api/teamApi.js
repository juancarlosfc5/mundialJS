// Cambia VITE_APP_ENV entre "dev" y "prod" en .env para seleccionar la API.
const URL_API = import.meta.env.VITE_APP_ENV === 'prod'
  ? import.meta.env.VITE_PROD_API_URL
  : import.meta.env.VITE_DEV_API_URL;

const myHeaders = new Headers({
  'Content-Type': 'application/json',
});

// GET: obtiene todos los equipos.
const getTeams = async () => {
  try {
    const respuesta = await fetch(`${URL_API}/teams`);

    if (respuesta.status === 200) {
      console.log('HTTP 200: los equipos fueron consultados correctamente.');
      return await respuesta.json();
    } else if (respuesta.status === 401) {
      console.log('HTTP 401: no está autorizado para consultar la API.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: la URL o el recurso Team no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: ocurrió un error al consultar los equipos.`);
    }
  } catch (error) {
    console.error('Error en la solicitud GET:', error.message);
  }
};

// POST: crea un nuevo equipo.
const postTeam = async (datos) => {
  try {
    const respuesta = await fetch(`${URL_API}/teams`, {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(datos),
    });

    if (respuesta.status === 201 || respuesta.status === 200) {
      console.log(`HTTP ${respuesta.status}: equipo creado correctamente.`);
      return await respuesta.json();
    } else if (respuesta.status === 400) {
      console.log('HTTP 400: los datos del equipo no son válidos.');
    } else if (respuesta.status === 401) {
      console.log('HTTP 401: no está autorizado para crear el equipo.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: la URL o el recurso Team no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible crear el equipo.`);
    }
  } catch (error) {
    console.error('Error en la solicitud POST:', error.message);
  }
};

// PATCH: actualiza únicamente los campos recibidos de un equipo.
const patchTeam = async (datos, id) => {
  try {
    const respuesta = await fetch(`${URL_API}/teams/${id}`, {
      method: 'PATCH',
      headers: myHeaders,
      body: JSON.stringify(datos),
    });

    if (respuesta.status === 200) {
      console.log('HTTP 200: equipo actualizado parcialmente.');
      return await respuesta.json();
    } else if (respuesta.status === 400) {
      console.log('HTTP 400: los datos enviados para actualizar no son válidos.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: el equipo que intenta actualizar no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible actualizar parcialmente el equipo.`);
    }
  } catch (error) {
    console.error('Error en la solicitud PATCH:', error.message);
  }
};

// PUT: reemplaza todos los datos de un equipo.
const putTeam = async (datos, id) => {
  try {
    const respuesta = await fetch(`${URL_API}/teams/${id}`, {
      method: 'PUT',
      headers: myHeaders,
      body: JSON.stringify(datos),
    });

    if (respuesta.status === 200) {
      console.log('HTTP 200: equipo actualizado completamente.');
      return await respuesta.json();
    } else if (respuesta.status === 400) {
      console.log('HTTP 400: los datos enviados para reemplazar no son válidos.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: el equipo que intenta reemplazar no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible reemplazar el equipo.`);
    }
  } catch (error) {
    console.error('Error en la solicitud PUT:', error.message);
  }
};

// DELETE: elimina un equipo por su id.
const deleteTeam = async (id) => {
  try {
    const respuesta = await fetch(`${URL_API}/teams/${id}`, {
      method: 'DELETE',
      headers: myHeaders,
    });

    if (respuesta.status === 200 || respuesta.status === 204) {
      console.log(`HTTP ${respuesta.status}: equipo eliminado correctamente.`);
      return respuesta;
    } else if (respuesta.status === 401) {
      console.log('HTTP 401: no está autorizado para eliminar el equipo.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: el equipo que intenta eliminar no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible eliminar el equipo.`);
    }
  } catch (error) {
    console.error('Error en la solicitud DELETE:', error.message);
  }
};

export {
  getTeams,
  postMatch,
  patchMatch,
  putMatch,
  deleteMatch,
};