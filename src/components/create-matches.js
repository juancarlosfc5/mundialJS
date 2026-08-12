// Importación normal: Vite carga create-matches.css como una hoja de estilos real.
import './create-matches.css';
import { postMatch } from '../api/matchesApi.js';

// Web Component que reúne el navbar, el formulario y el modal de partidos.
export class CreateMatches extends HTMLElement {
  constructor() {
    super();
    this.render();
    this.configurarEventos();
  }

  // Renderiza el HTML del componente con la misma sintaxis de `this.innerHTML`.
  render() {
    this.innerHTML = /* html */ `
      <section class="componente-partidos">
        <nav class="navbar" aria-label="Navegación principal">
          <a href="#grupos">Grupos</a>
          <a href="#equipos">Equipos</a>
          <a href="#jugadores">Jugadores</a>
          <a id="enlace-partidos" href="#partidos">Partidos</a>
          <a href="#goles">Goles</a>
        </nav>

        <!-- La sección inicia oculta y se muestra al pulsar Partidos. -->
        <main id="partidos" hidden>
          <div class="encabezado">
            <h1>Partidos</h1>
            <button id="boton-abrir-modal" type="button" aria-label="Agregar partido">+</button>
          </div>

          <p id="mensaje-confirmacion" hidden role="status" aria-live="polite"></p>

          <section id="modal-partido" hidden aria-modal="true" role="dialog" aria-labelledby="titulo-modal">
            <form id="formulario-partido">
              <h2 id="titulo-modal">Registrar partido</h2>
              <button id="boton-cerrar-modal" type="button" aria-label="Cerrar modal">×</button>

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
      </section>
    `;
  }

  // Conserva el comportamiento del modal usando elementos que pertenecen al componente.
  configurarEventos() {
    const enlacePartidos = this.querySelector('#enlace-partidos');
    const seccionPartidos = this.querySelector('#partidos');
    const botonAbrirModal = this.querySelector('#boton-abrir-modal');
    const botonCerrarModal = this.querySelector('#boton-cerrar-modal');
    const modal = this.querySelector('#modal-partido');
    const formulario = this.querySelector('#formulario-partido');
    const mensajeConfirmacion = this.querySelector('#mensaje-confirmacion');

    // Solo al hacer clic en Partidos se muestran el título y el botón +.
    enlacePartidos.addEventListener('click', (evento) => {
      evento.preventDefault();
      seccionPartidos.hidden = false;
      enlacePartidos.classList.add('activo');
      window.location.hash = 'partidos';
    });

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

      try {
        const partidoCreado = await this.crearPartidoAsincronico(datosDelPartido);

        if (!partidoCreado) {
          throw new Error('La API no confirmó la creación. Revise la consola.');
        }

        console.log('Partido creado desde Web Component:', partidoCreado);
        formulario.reset();
        modal.hidden = true;
        mensajeConfirmacion.textContent = 'El partido se creó correctamente.';
        mensajeConfirmacion.hidden = false;
      } catch (error) {
        // La API ya informa el código HTTP; este mensaje llega también a la pantalla.
        mensajeConfirmacion.textContent = `No fue posible crear el partido: ${error.message}`;
        mensajeConfirmacion.hidden = false;
      }
    });
  }

  validarDatosDelPartido(datos) {
    const camposObligatorios = ['matchNumber', 'groupId', 'homeTeamId', 'awayTeamId', 'date', 'kickoffTimeET', 'venue'];

    for (const campo of camposObligatorios) {
      if (datos[campo] === undefined || datos[campo] === '') {
        throw new Error(`El campo "${campo}" es obligatorio para crear un partido.`);
      }
    }

    if (datos.homeTeamId === datos.awayTeamId) {
      throw new Error('El equipo local y el visitante deben ser diferentes.');
    }
  }

  construirPartido(datos) {
    this.validarDatosDelPartido(datos);

    return {
      id: `match-${String(datos.matchNumber).padStart(2, '0')}`,
      matchNumber: datos.matchNumber,
      groupId: datos.groupId,
      homeTeamId: datos.homeTeamId,
      awayTeamId: datos.awayTeamId,
      date: datos.date,
      kickoffTimeET: datos.kickoffTimeET,
      venue: datos.venue,
      status: 'scheduled',
    };
  }

  // Envía el partido a JSON Server (dev) o MockAPI (prod), según .env.
  async crearPartidoAsincronico(datos) {
    const partido = this.construirPartido(datos);
    return await postMatch(partido);
  }
}

customElements.define('create-matches', CreateMatches);
