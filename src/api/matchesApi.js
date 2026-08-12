// Cambia VITE_APP_ENV entre "dev" y "prod" en .env para seleccionar la API.
const URL_API = import.meta.env.VITE_APP_ENV === 'dev'
  ? import.meta.env.VITE_PROD_API_URL
  : import.meta.env.VITE_DEV_API_URL;

const myHeaders = new Headers({
  'Content-Type': 'application/json',
});

// GET: obtiene todos los partidos.
const getMatches = async () => {
  try {
    const respuesta = await fetch(`${URL_API}/matches`);

    if (respuesta.status === 200) {
      console.log('HTTP 200: los partidos fueron consultados correctamente.');
      return await respuesta.json();
    } else if (respuesta.status === 401) {
      console.log('HTTP 401: no está autorizado para consultar la API.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: la URL o el recurso matches no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: ocurrió un error al consultar los partidos.`);
    }
  } catch (error) {
    console.error('Error en la solicitud GET:', error.message);
  }
};

// POST: crea un nuevo partido.
const postMatch = async (datos) => {
  try {
    const respuesta = await fetch(`${URL_API}/matches`, {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(datos),
    });

    if (respuesta.status === 201 || respuesta.status === 200) {
      console.log(`HTTP ${respuesta.status}: partido creado correctamente.`);
      return await respuesta.json();
    } else if (respuesta.status === 400) {
      console.log('HTTP 400: los datos del partido no son válidos.');
    } else if (respuesta.status === 401) {
      console.log('HTTP 401: no está autorizado para crear el partido.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: la URL o el recurso matches no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible crear el partido.`);
    }
  } catch (error) {
    console.error('Error en la solicitud POST:', error.message);
  }
};

// PATCH: actualiza únicamente los campos recibidos de un partido.
const patchMatch = async (datos, id) => {
  try {
    const respuesta = await fetch(`${URL_API}/matches/${id}`, {
      method: 'PATCH',
      headers: myHeaders,
      body: JSON.stringify(datos),
    });

    if (respuesta.status === 200) {
      console.log('HTTP 200: partido actualizado parcialmente.');
      return await respuesta.json();
    } else if (respuesta.status === 400) {
      console.log('HTTP 400: los datos enviados para actualizar no son válidos.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: el partido que intenta actualizar no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible actualizar parcialmente el partido.`);
    }
  } catch (error) {
    console.error('Error en la solicitud PATCH:', error.message);
  }
};

// PUT: reemplaza todos los datos de un partido.
const putMatch = async (datos, id) => {
  try {
    const respuesta = await fetch(`${URL_API}/matches/${id}`, {
      method: 'PUT',
      headers: myHeaders,
      body: JSON.stringify(datos),
    });

    if (respuesta.status === 200) {
      console.log('HTTP 200: partido actualizado completamente.');
      return await respuesta.json();
    } else if (respuesta.status === 400) {
      console.log('HTTP 400: los datos enviados para reemplazar no son válidos.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: el partido que intenta reemplazar no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible reemplazar el partido.`);
    }
  } catch (error) {
    console.error('Error en la solicitud PUT:', error.message);
  }
};

// DELETE: elimina un partido por su id.
const deleteMatch = async (id) => {
  try {
    const respuesta = await fetch(`${URL_API}/matches/${id}`, {
      method: 'DELETE',
      headers: myHeaders,
    });

    if (respuesta.status === 200 || respuesta.status === 204) {
      console.log(`HTTP ${respuesta.status}: partido eliminado correctamente.`);
      return respuesta;
    } else if (respuesta.status === 401) {
      console.log('HTTP 401: no está autorizado para eliminar el partido.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: el partido que intenta eliminar no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible eliminar el partido.`);
    }
  } catch (error) {
    console.error('Error en la solicitud DELETE:', error.message);
  }
};

export {
  getMatches,
  postMatch,
  patchMatch,
  putMatch,
  deleteMatch,
};
