import './matchesStyles.css';
import { getGroups, getMatches, getTeams, patchMatch } from '../../api/matchesApi.js';
import { crearPartido } from './createMatches.js';
import { editarPartidoCompleto } from './editMatches.js';
import { eliminarPartido } from './deleteMatches.js';

export class MatchesComponent extends HTMLElement {
  constructor() {
    super();
    this.partidos = [];
    this.equipos = [];
    this.grupos = [];
    this.paginaActual = 1;
    this.resultadosPorPagina = 8;
    this.partidoParaEliminar = null;
    this.render();
    this.configurarEventos();
  }

  render() {
    this.innerHTML = /* html */ `
      <section class="matches-app">
        <nav class="matches-navbar" aria-label="Navegación principal">
          <a class="matches-logo" href="#inicio">FIFA</a>
          <a href="#grupos">Grupos</a><a href="#equipos">Equipos</a><a href="#jugadores">Jugadores</a>
          <a id="enlace-partidos" href="#partidos">Partidos</a><a href="#goles">Goles</a>
        </nav>
        <main id="partidos" hidden>
          <header class="matches-header">
            <div><p class="matches-eyebrow">COPA MUNDIAL 2026</p><h1>Partidos</h1></div>
            <div class="matches-toolbar"><input id="buscar-partidos" type="search" placeholder="Buscar partido" aria-label="Buscar partido" /><button id="boton-abrir-crear" class="matches-icon-button matches-button-primary" type="button" aria-label="Crear partido" title="Crear partido">+</button></div>
          </header>
          <p id="mensaje-confirmacion" hidden role="status" aria-live="polite"></p>
          <section id="lista-partidos" class="matches-grid" aria-live="polite"></section>
          <nav id="paginacion" class="matches-pagination" aria-label="Paginación de partidos"></nav>
        </main>
        <section id="modal-partido" class="matches-modal" hidden aria-modal="true" role="dialog" aria-labelledby="titulo-modal">
          <form id="formulario-partido" class="matches-form">
            <div class="matches-modal-header"><h2 id="titulo-modal">Registrar partido</h2><button id="boton-cerrar-modal" class="matches-close" type="button" aria-label="Cerrar">×</button></div>
            <input id="id-api" name="id" type="hidden" />
            <label>Número de partido <input name="matchNumber" type="number" min="1" required /></label><label>Id del grupo <input name="groupId" type="text" required /></label><label>Id equipo local <input name="homeTeamId" type="text" required /></label><label>Id equipo visitante <input name="awayTeamId" type="text" required /></label><label>Fecha <input name="date" type="date" required /></label><label>Hora ET <input name="kickoffTimeET" type="time" required /></label><label>Sede <input name="venue" type="text" required /></label>
            <button id="boton-guardar" class="matches-save-button" type="submit">Agregar</button>
          </form>
        </section>
        <section id="modal-eliminar" class="matches-modal" hidden aria-modal="true" role="dialog" aria-labelledby="titulo-eliminar"><div class="matches-confirmation"><h2 id="titulo-eliminar">¿Eliminar partido?</h2><p>Esta acción no se podrá deshacer.</p><div><button id="boton-cancelar-eliminar" class="matches-icon-button" type="button" aria-label="Cancelar" title="Cancelar">×</button><button id="boton-confirmar-eliminar" class="matches-icon-button matches-button-danger" type="button" aria-label="Confirmar eliminación" title="Confirmar eliminación">✓</button></div></div></section>
      </section>`;
  }

  configurarEventos() {
    const q = (selector) => this.querySelector(selector);
    q('#enlace-partidos').addEventListener('click', async (evento) => { evento.preventDefault(); q('#partidos').hidden = false; q('#enlace-partidos').classList.add('activo'); await this.cargarPartidos(); });
    q('#boton-abrir-crear').addEventListener('click', () => this.abrirModalCrear());
    q('#boton-cerrar-modal').onclick = () => { q('#modal-partido').hidden = true; };
    q('#buscar-partidos').addEventListener('input', () => { this.paginaActual = 1; this.renderizarPartidos(); });
    q('#paginacion').addEventListener('click', (evento) => {
      const boton = evento.target.closest('button[data-pagina]');
      if (!boton || boton.disabled) return;
      this.paginaActual = Number(boton.dataset.pagina);
      this.renderizarPartidos();
    });
    q('#boton-cancelar-eliminar').onclick = () => { q('#modal-eliminar').hidden = true; };
    q('#boton-confirmar-eliminar').onclick = async () => this.confirmarEliminacion();
    q('#formulario-partido').addEventListener('submit', async (evento) => {
      evento.preventDefault();
      const datos = Object.fromEntries(new FormData(evento.currentTarget).entries());
      datos.matchNumber = Number(datos.matchNumber);
      const id = datos.id;
      delete datos.id;
      try {
        // Al crear, el estado inicial siempre es "scheduled" (Programado).
        const partidoActual = this.partidos.find((partido) => partido.id === id);
        const resultado = id
          ? await editarPartidoCompleto({ ...datos, id, status: partidoActual.status }, id)
          : await crearPartido({ ...datos, status: 'scheduled' });
        if (!resultado) throw new Error('La API no confirmó la operación. Revise la consola.');
        this.mostrarMensaje(id ? 'Partido actualizado correctamente.' : 'Partido creado correctamente.');
        q('#modal-partido').hidden = true;
        await this.cargarPartidos();
      } catch (error) { this.mostrarMensaje(`No fue posible guardar el partido: ${error.message}`, true); }
    });
    q('#lista-partidos').addEventListener('click', async (evento) => {
      const boton = evento.target.closest('button[data-accion]');
      if (!boton) return;
      const partido = this.partidos.find((item) => item.id === boton.dataset.id);
      if (!partido) return;
      if (boton.dataset.accion === 'editar') this.abrirModalEditar(partido);
      if (boton.dataset.accion === 'eliminar') { this.partidoParaEliminar = partido; q('#modal-eliminar').hidden = false; }
      if (boton.dataset.accion === 'cronometro') await this.cambiarEstado(partido);
    });
  }

  async cargarPartidos() {
    this.querySelector('#lista-partidos').innerHTML = '<p class="matches-loading">Cargando partidos…</p>';
    const [partidos, equipos, grupos] = await Promise.all([getMatches(), getTeams(), getGroups()]);
    this.partidos = partidos ?? []; this.equipos = equipos ?? []; this.grupos = grupos ?? [];
    this.renderizarPartidos();
  }

  obtenerPartidosFiltrados() { const texto = this.querySelector('#buscar-partidos').value.toLowerCase().trim(); return this.partidos.filter((partido) => this.textoDelPartido(partido).includes(texto)); }
  textoDelPartido(partido) { return `${partido.id} ${this.nombreEquipo(partido.homeTeamId)} ${this.nombreEquipo(partido.awayTeamId)} ${this.nombreGrupo(partido.groupId)} ${partido.date} ${partido.venue}`.toLowerCase(); }
  nombreEquipo(id) { return this.equipos.find((equipo) => equipo.id === id)?.name ?? id; }
  nombreGrupo(id) { return this.grupos.find((grupo) => grupo.id === id)?.name ?? id; }
  estadoEnEspanol(estado) { return ({ scheduled: 'Programado', 'in progress': 'En curso', finished: 'Finalizado' })[estado] ?? estado; }

  renderizarPartidos() {
    const filtrados = this.obtenerPartidosFiltrados(); const total = Math.max(1, Math.ceil(filtrados.length / this.resultadosPorPagina)); if (this.paginaActual > total) this.paginaActual = total;
    const inicio = (this.paginaActual - 1) * this.resultadosPorPagina; const pagina = filtrados.slice(inicio, inicio + this.resultadosPorPagina); const lista = this.querySelector('#lista-partidos');
    lista.innerHTML = pagina.length ? pagina.map((partido) => /* html */ `<article class="match-card"><p class="match-card-number">${partido.id}</p><h2>${this.nombreEquipo(partido.homeTeamId)} <span>vs</span> ${this.nombreEquipo(partido.awayTeamId)}</h2><p>${partido.date} · ${partido.kickoffTimeET} ET</p><p>${partido.venue} · ${this.nombreGrupo(partido.groupId)}</p><footer><span class="match-status status-${partido.status.replace(' ', '-')}">${this.estadoEnEspanol(partido.status)}</span><div><button class="matches-icon-button" type="button" data-accion="cronometro" data-id="${partido.id}" aria-label="Iniciar o finalizar partido" title="Iniciar o finalizar partido">◷</button><button class="matches-icon-button" type="button" data-accion="editar" data-id="${partido.id}" aria-label="Editar partido" title="Editar partido">✎</button><button class="matches-icon-button matches-button-danger" type="button" data-accion="eliminar" data-id="${partido.id}" aria-label="Eliminar partido" title="Eliminar partido">🗑</button></div></footer></article>`).join('') : '<p class="matches-loading">No se encontraron partidos.</p>';
    // Solo se muestran cinco páginas: la ventana se desplaza con la página activa.
    const primeraPaginaVisible = Math.max(1, Math.min(this.paginaActual - 2, total - 4));
    const ultimaPaginaVisible = Math.min(total, primeraPaginaVisible + 4);
    const paginasVisibles = Array.from(
      { length: ultimaPaginaVisible - primeraPaginaVisible + 1 },
      (_, indice) => primeraPaginaVisible + indice,
    );

    this.querySelector('#paginacion').innerHTML = `
      <button class="pagination-arrow" data-pagina="${this.paginaActual - 1}" type="button" aria-label="Página anterior" ${this.paginaActual === 1 ? 'disabled' : ''}>‹</button>
      ${paginasVisibles.map((pagina) => `<button class="${pagina === this.paginaActual ? 'activo' : ''}" data-pagina="${pagina}" type="button" aria-label="Página ${pagina}">${pagina}</button>`).join('')}
      <button class="pagination-arrow" data-pagina="${this.paginaActual + 1}" type="button" aria-label="Página siguiente" ${this.paginaActual === total ? 'disabled' : ''}>›</button>
    `;
  }

  abrirModalCrear() { const form = this.querySelector('#formulario-partido'); form.reset(); form.querySelector('#id-api').value = ''; form.elements.matchNumber.readOnly = false; this.querySelector('#titulo-modal').textContent = 'Registrar partido'; this.querySelector('#boton-guardar').textContent = 'Agregar'; this.querySelector('#modal-partido').hidden = false; }
  abrirModalEditar(partido) { const form = this.querySelector('#formulario-partido'); Object.entries(partido).forEach(([campo, valor]) => { const entrada = form.elements.namedItem(campo); if (entrada) entrada.value = valor; }); form.querySelector('#id-api').value = partido.id; form.elements.matchNumber.readOnly = true; this.querySelector('#titulo-modal').textContent = 'Editar partido'; this.querySelector('#boton-guardar').textContent = 'Actualizar'; this.querySelector('#modal-partido').hidden = false; }
  async cambiarEstado(partido) { const estado = partido.status === 'scheduled' ? 'in progress' : partido.status === 'in progress' ? 'finished' : 'scheduled'; const resultado = await patchMatch({ status: estado }, partido.id); if (resultado) { this.mostrarMensaje(`Partido ${this.estadoEnEspanol(estado).toLowerCase()}.`); await this.cargarPartidos(); } }
  async confirmarEliminacion() { if (!this.partidoParaEliminar) return; const resultado = await eliminarPartido(this.partidoParaEliminar.id); if (resultado) { this.querySelector('#modal-eliminar').hidden = true; this.mostrarMensaje('Partido eliminado correctamente.'); await this.cargarPartidos(); } }
  mostrarMensaje(texto, esError = false) { const mensaje = this.querySelector('#mensaje-confirmacion'); mensaje.textContent = texto; mensaje.classList.toggle('matches-error', esError); mensaje.hidden = false; }
}

customElements.define('matches-component', MatchesComponent);
