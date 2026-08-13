// Cambia VITE_APP_ENV entre "dev" y "prod" en .env para seleccionar la API.
const URL_API = import.meta.env.VITE_APP_ENV === 'prod'
  ? import.meta.env.VITE_PROD_API_URL
  : import.meta.env.VITE_DEV_API_URL;

const myHeaders = new Headers({
  'Content-Type': 'application/json',
});

// POST: registra un nuevo equipo en /teams.
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
      console.log('HTTP 404: la URL o el recurso teams no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible crear el equipo.`);
    }
  } catch (error) {
    console.error('Error en la solicitud POST de equipo:', error.message);
  }
};

export {
  postTeam,
};
