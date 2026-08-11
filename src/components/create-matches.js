import estilos from './create-matches.css?inline';
import { crearPartidoAsincronico } from '../js/pages/matches.js';

// El componente encapsula su HTML, CSS y eventos para poder reutilizarse con <create-matches>.
class CreateMatches extends HTMLElement {
  constructor() {
    super();

    // Shadow DOM evita que los estilos de la página modifiquen este componente.
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = /*html*/ `
      <style>${estilos}</style>
      <main>
        <div class="encabezado">
          <h1>Partidos</h1>
          <button id="boton-abrir-modal" type="button" aria-label="Agregar partido">+</button>
        </div>

        <section id="modal-partido" hidden aria-modal="true" role="dialog" aria-labelledby="titulo-modal">
          <form id="formulario-partido">
            <h2 id="titulo-modal">Registrar partido</h2>
            <button id="boton-cerrar-modal" type="button" aria-label="Cerrar modal">X</button>

            <label>Número de partido <input name="matchNumber" type="text" required /></label>
            <label>Id del grupo <input name="groupId" type="text" required /></label>
            <label>Id equipo local <input name="homeTeamId" type="text" required /></label>
            <label>Id equipo visitante <input name="awayTeamId" type="text" required /></label>
            <label>Fecha <input name="date" type="text" placeholder="2026-06-28" required /></label>
            <label>Hora ET <input name="kickoffTimeET" type="text" placeholder="19:00" required /></label>
            <label>Sede <input name="venue" type="text" required /></label>

            <button type="submit">Agregar</button>
          </form>
        </section>
      </main>
    `;

    this.configurarEventos();
  }

  configurarEventos() {
    const botonAbrirModal = this.shadowRoot.querySelector('#boton-abrir-modal');
    const botonCerrarModal = this.shadowRoot.querySelector('#boton-cerrar-modal');
    const modal = this.shadowRoot.querySelector('#modal-partido');
    const formulario = this.shadowRoot.querySelector('#formulario-partido');

    botonAbrirModal.addEventListener('click', () => {
      modal.hidden = false;
    });

    botonCerrarModal.onclick = () => {
      modal.hidden = true;
    };

    formulario.addEventListener('submit', async (evento) => {
      evento.preventDefault();

      const datosDelPartido = Object.fromEntries(new FormData(formulario).entries());
      datosDelPartido.matchNumber = Number(datosDelPartido.matchNumber);

      // Simula el tiempo que tomaría guardar la información en una base de datos.
      const guardarEnBaseDeDatos = (partido) => new Promise((resolver) => {
        setTimeout(() => resolver(partido), 1000);
      });

      const partidoCreado = await crearPartidoAsincronico(datosDelPartido, guardarEnBaseDeDatos);
      console.log('Partido creado desde Web Component:', partidoCreado);
      formulario.reset();
      modal.hidden = true;
    });
  }
}

// Registra el nombre que se podrá usar como una etiqueta HTML.
customElements.define('create-matches', CreateMatches);
