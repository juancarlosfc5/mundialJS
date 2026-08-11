import { crearPartidoAsincronico } from '../pages/matches.js';

const botonAbrirModal = document.querySelector('#boton-abrir-modal');
const botonCerrarModal = document.querySelector('#boton-cerrar-modal');
const modal = document.querySelector('#modal-partido');
const formulario = document.querySelector('#formulario-partido');

// Muestra el modal al pulsar el botón +.
botonAbrirModal.addEventListener('click', () => {
  modal.hidden = false;
});

// El evento onclick de la X vuelve a ocultar el modal.
botonCerrarModal.onclick = () => {
  modal.hidden = true;
};

// El submit simula, con setTimeout, el guardado asíncrono del partido.
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const datosDelPartido = Object.fromEntries(new FormData(formulario).entries());
  datosDelPartido.matchNumber = Number(datosDelPartido.matchNumber);

  const guardarEnBaseDeDatos = (partido) => new Promise((resolver) => {
    setTimeout(() => resolver(partido), 2000);
  });

  const partidoCreado = await crearPartidoAsincronico(datosDelPartido, guardarEnBaseDeDatos);
  console.log('Partido creado:', partidoCreado);
  formulario.reset();
  modal.hidden = true;
});
