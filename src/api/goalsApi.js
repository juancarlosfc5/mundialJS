const URL_API = import.meta.env.VITE_APP_ENV === 'prod'
  ? import.meta.env.VITE_PROD_API_URL
  : import.meta.env.VITE_DEV_API_URL;

const myHeaders = new Headers({
  'Content-Type': 'application/json',
});

const getGoals = async () => {
  try {
    const respuesta = await fetch(`${URL_API}/goals`);
    if (respuesta.status === 200) {
      console.log('HTTP 200: los goles fueron consultados correctamente.');
      return await respuesta.json();
    } else if (respuesta.status === 401) {
      console.log('HTTP 401: no está autorizado para consultar la API.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: la URL o el recurso goals no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: ocurrió un error al consultar los goles.`);
    }
  } catch (error) {
    console.error('Error en la solicitud GET:', error.message);
  }
};

const postGoal = async (datos) => {
  try {
    const respuesta = await fetch(`${URL_API}/goals`, {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(datos),
    });
    if (respuesta.status === 201 || respuesta.status === 200) {
      console.log(`HTTP ${respuesta.status}: gol creado correctamente.`);
      return await respuesta.json();
    } else if (respuesta.status === 400) {
      console.log('HTTP 400: los datos del gol no son válidos.');
    } else if (respuesta.status === 401) {
      console.log('HTTP 401: no está autorizado para crear el gol.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: la URL o el recurso goals no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible crear el gol.`);
    }
  } catch (error) {
    console.error('Error en la solicitud POST:', error.message);
  }
};

const patchGoal = async (datos, id) => {
  try {
    const respuesta = await fetch(`${URL_API}/goals/${id}`, {
      method: 'PATCH',
      headers: myHeaders,
      body: JSON.stringify(datos),
    });
    if (respuesta.status === 200) {
      console.log('HTTP 200: gol actualizado parcialmente.');
      return await respuesta.json();
    } else if (respuesta.status === 400) {
      console.log('HTTP 400: los datos enviados para actualizar no son válidos.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: el gol que intenta actualizar no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible actualizar parcialmente el gol.`);
    }
  } catch (error) {
    console.error('Error en la solicitud PATCH:', error.message);
  }
};

const putGoal = async (datos, id) => {
  try {
    const respuesta = await fetch(`${URL_API}/goals/${id}`, {
      method: 'PUT',
      headers: myHeaders,
      body: JSON.stringify(datos),
    });
    if (respuesta.status === 200) {
      console.log('HTTP 200: gol actualizado completamente.');
      return await respuesta.json();
    } else if (respuesta.status === 400) {
      console.log('HTTP 400: los datos enviados para reemplazar no son válidos.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: el gol que intenta reemplazar no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible reemplazar el gol.`);
    }
  } catch (error) {
    console.error('Error en la solicitud PUT:', error.message);
  }
};

const deleteGoal = async (id) => {
  try {
    const respuesta = await fetch(`${URL_API}/goals/${id}`, {
      method: 'DELETE',
      headers: myHeaders,
    });
    if (respuesta.status === 200 || respuesta.status === 204) {
      console.log(`HTTP ${respuesta.status}: gol eliminado correctamente.`);
      return respuesta;
    } else if (respuesta.status === 401) {
      console.log('HTTP 401: no está autorizado para eliminar el gol.');
    } else if (respuesta.status === 404) {
      console.log('HTTP 404: el gol que intenta eliminar no existe.');
    } else {
      console.log(`HTTP ${respuesta.status}: no fue posible eliminar el gol.`);
    }
  } catch (error) {
    console.error('Error en la solicitud DELETE:', error.message);
  }
};

export {
  getGoals,
  postGoal,
  patchGoal,
  putGoal,
  deleteGoal,
};