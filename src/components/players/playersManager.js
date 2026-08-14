// Grupo 3 - Componente Contenedor para Jugadores
// Desarrollado por: Jose

import { listPlayers, getPlayersByTeam, createPlayer, deletePlayer, updatePlayer } from '../../services/playersService.js';
import { database } from '../../database.js';
import './playerCard.js'; // Asegurar que el componente hijo esté registrado

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      font-family: Arial, Helvetica, sans-serif;
      color: #082b4c;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* ── Header ── */
    .manager-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: .85rem;
      border-bottom: 1px solid #c7d5e6;
    }

    .manager-eyebrow {
      margin-bottom: .45rem;
      color: #0062a9;
      font-size: .75rem;
      font-weight: 800;
      letter-spacing: .1rem;
    }

    .manager-title {
      font-size: clamp(2rem, 4vw, 3.1rem);
      line-height: 1;
    }

    /* ── Toolbar ── */
    .manager-toolbar {
      display: flex;
      align-items: center;
      gap: .65rem;
    }

    .manager-toolbar input[type="search"] {
      width: 15rem;
      padding: .65rem .8rem;
      border: 1px solid #afc1d2;
      border-radius: 2rem;
      color: #082b4c;
      font: inherit;
      background: #fff;
    }

    .manager-toolbar input[type="search"]:focus {
      outline: 2px solid #74b8e7;
      border-color: #0062a9;
    }

    .manager-toolbar select {
      padding: .6rem .8rem;
      border: 1px solid #afc1d2;
      border-radius: 2rem;
      color: #082b4c;
      font: inherit;
      font-size: .9rem;
      background: #fff;
      cursor: pointer;
    }

    .manager-toolbar select:focus {
      outline: 2px solid #74b8e7;
      border-color: #0062a9;
    }

    /* ── Botón Crear ── */
    .btn-create {
      display: inline-grid;
      width: 2.45rem;
      height: 2.45rem;
      place-items: center;
      padding: 0;
      border: 1px solid #0062a9;
      border-radius: 50%;
      color: #fff;
      font: inherit;
      font-size: 1.3rem;
      font-weight: 700;
      cursor: pointer;
      background: #0062a9;
      transition: background .2s ease;
    }

    .btn-create:hover {
      background: #004b81;
    }

    /* ── Contador ── */
    .players-count {
      margin-bottom: 1rem;
      color: #526b82;
      font-size: .9rem;
    }

    .players-count strong {
      color: #0062a9;
    }

    /* ── Grid de tarjetas ── */
    .players-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
    }

    .players-empty {
      grid-column: 1 / -1;
      padding: 2rem;
      color: #526b82;
      text-align: center;
    }

    /* ── Modal ── */
    .modal[hidden] {
      display: none;
    }

    .modal {
      position: fixed;
      z-index: 10;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 1rem;
      background: rgb(1 25 48 / 68%);
    }

    .modal-form {
      display: grid;
      width: min(100%, 36rem);
      max-height: calc(100vh - 2rem);
      gap: .85rem;
      overflow-y: auto;
      padding: 1.6rem;
      box-shadow: 0 20px 40px rgb(0 0 0 / 28%);
      background: #fff;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: .4rem;
    }

    .modal-header h2 {
      font-size: 1.45rem;
    }

    .modal-close {
      border: 0;
      color: #005a9c;
      font-size: 2rem;
      cursor: pointer;
      background: transparent;
    }

    .modal-form label {
      display: grid;
      gap: .35rem;
      color: #294d6d;
      font-size: .85rem;
      font-weight: 700;
    }

    .modal-form input,
    .modal-form select {
      width: 100%;
      padding: .7rem;
      border: 1px solid #afc1d2;
      color: #082b4c;
      font: inherit;
      background: #fff;
    }

    .modal-form input:focus,
    .modal-form select:focus {
      outline: 2px solid #74b8e7;
      border-color: #0062a9;
    }

    .btn-save {
      padding: .75rem;
      border: 0;
      color: #fff;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      background: #0062a9;
    }

    .btn-save:hover {
      background: #004b81;
    }

    /* ── Mensaje de feedback ── */
    .feedback[hidden] {
      display: none;
    }

    .feedback {
      margin: 0 0 1rem;
      padding: .85rem 1rem;
      border-left: .3rem solid #138a4a;
      color: #0c6031;
      background: #e8f8ee;
    }

    .feedback.error {
      border-left-color: #c72035;
      color: #991b2d;
      background: #fff0f2;
    }

    /* ── Responsive ── */
    @media (max-width: 1000px) {
      .players-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 720px) {
      .manager-header {
        align-items: start;
        flex-direction: column;
      }
      .manager-toolbar {
        flex-wrap: wrap;
        width: 100%;
      }
      .manager-toolbar input[type="search"] {
        flex: 1;
        width: auto;
      }
      .players-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>

  <div class="manager-container">
    <header class="manager-header">
      <div>
        <p class="manager-eyebrow">COPA MUNDIAL 2026</p>
        <h1 class="manager-title">Jugadores</h1>
      </div>
      <div class="manager-toolbar">
        <input type="search" id="search-input" placeholder="Buscar jugador" aria-label="Buscar jugador" />
        <select id="team-filter">
          <option value="all">Todos los Equipos</option>
        </select>
        <select id="position-filter">
          <option value="all">Todas las Posiciones</option>
          <option value="Portero">Portero</option>
          <option value="Defensa">Defensa</option>
          <option value="Mediocampista">Mediocampista</option>
          <option value="Delantero">Delantero</option>
        </select>
        <button class="btn-create" id="btn-open-create" type="button" aria-label="Crear jugador" title="Crear jugador">+</button>
      </div>
    </header>

    <p id="feedback" class="feedback" hidden role="status" aria-live="polite"></p>
    <p id="players-count" class="players-count"></p>

    <div class="players-grid" id="players-grid">
      <!-- Las tarjetas <player-card> se insertarán aquí -->
    </div>

    <!-- Modal de creación / edición -->
    <section class="modal" id="modal-player" hidden aria-modal="true" role="dialog" aria-labelledby="modal-title">
      <form class="modal-form" id="player-form">
        <div class="modal-header">
          <h2 id="modal-title">Registrar jugador</h2>
          <button class="modal-close" id="btn-close-modal" type="button" aria-label="Cerrar">×</button>
        </div>
        <input type="hidden" id="edit-player-id" />
        <label>Nombre
          <input name="name" type="text" required />
        </label>
        <label>Equipo
          <select name="teamId" id="form-team-select" required>
            <option value="">Seleccionar equipo</option>
          </select>
        </label>
        <label>Dorsal (1–99)
          <input name="number" type="number" min="1" max="99" required />
        </label>
        <label>Posición
          <select name="position" required>
            <option value="">Seleccionar posición</option>
            <option value="Portero">Portero</option>
            <option value="Defensa">Defensa</option>
            <option value="Mediocampista">Mediocampista</option>
            <option value="Delantero">Delantero</option>
          </select>
        </label>
        <label>Edad (16–45)
          <input name="age" type="number" min="16" max="45" required />
        </label>
        <button class="btn-save" id="btn-save" type="submit">Agregar</button>
      </form>
    </section>
  </div>
`;

export class PlayersManager extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Referencias a elementos del Shadow DOM
    this._searchInput = this.shadowRoot.getElementById('search-input');
    this._teamFilter = this.shadowRoot.getElementById('team-filter');
    this._positionFilter = this.shadowRoot.getElementById('position-filter');
    this._playersGrid = this.shadowRoot.getElementById('players-grid');
    this._playersCount = this.shadowRoot.getElementById('players-count');
    this._feedback = this.shadowRoot.getElementById('feedback');
    this._modal = this.shadowRoot.getElementById('modal-player');
    this._form = this.shadowRoot.getElementById('player-form');
    this._formTeamSelect = this.shadowRoot.getElementById('form-team-select');
    this._modalTitle = this.shadowRoot.getElementById('modal-title');
    this._btnSave = this.shadowRoot.getElementById('btn-save');
    this._editPlayerId = this.shadowRoot.getElementById('edit-player-id');

    this._players = [];

    // Bind methods
    this._handleFilterChange = this._handleFilterChange.bind(this);
    this._handleToggleActive = this._handleToggleActive.bind(this);
    this._handleDeletePlayer = this._handleDeletePlayer.bind(this);
    this._handleEditPlayer = this._handleEditPlayer.bind(this);
  }

  async connectedCallback() {
    this._populateTeams();
    await this.loadPlayers();

    // Eventos de filtro
    this._searchInput.addEventListener('input', this._handleFilterChange);
    this._teamFilter.addEventListener('change', this._handleFilterChange);
    this._positionFilter.addEventListener('change', this._handleFilterChange);

    // Eventos del modal
    this.shadowRoot.getElementById('btn-open-create').addEventListener('click', () => this._openCreateModal());
    this.shadowRoot.getElementById('btn-close-modal').addEventListener('click', () => { this._modal.hidden = true; });
    this._form.addEventListener('submit', (e) => this._handleFormSubmit(e));

    // Eventos personalizados de los hijos <player-card>
    this.addEventListener('toggle-active', this._handleToggleActive);
    this.addEventListener('delete-player', this._handleDeletePlayer);
    this.addEventListener('edit-player', this._handleEditPlayer);
  }

  disconnectedCallback() {
    this._searchInput.removeEventListener('input', this._handleFilterChange);
    this._teamFilter.removeEventListener('change', this._handleFilterChange);
    this._positionFilter.removeEventListener('change', this._handleFilterChange);
    this.removeEventListener('toggle-active', this._handleToggleActive);
    this.removeEventListener('delete-player', this._handleDeletePlayer);
    this.removeEventListener('edit-player', this._handleEditPlayer);
  }

  _populateTeams() {
    database.teams.forEach(team => {
      // Dropdown del filtro
      const opt1 = document.createElement('option');
      opt1.value = team.id;
      opt1.textContent = team.name;
      this._teamFilter.appendChild(opt1);

      // Dropdown del formulario
      const opt2 = document.createElement('option');
      opt2.value = team.id;
      opt2.textContent = team.name;
      this._formTeamSelect.appendChild(opt2);
    });
  }

  async loadPlayers() {
    try {
      this._players = await listPlayers();
      this.render();
    } catch (error) {
      console.error('Error cargando jugadores:', error);
    }
  }

  _handleFilterChange() {
    this.render();
  }

  _showFeedback(text, isError = false) {
    this._feedback.textContent = text;
    this._feedback.classList.toggle('error', isError);
    this._feedback.hidden = false;
    setTimeout(() => { this._feedback.hidden = true; }, 4000);
  }

  // ── Modal ──

  _openCreateModal() {
    this._form.reset();
    this._editPlayerId.value = '';
    this._modalTitle.textContent = 'Registrar jugador';
    this._btnSave.textContent = 'Agregar';
    this._modal.hidden = false;
  }

  _openEditModal(detail) {
    this._editPlayerId.value = detail.playerId;
    this._form.elements.name.value = detail.name || '';
    this._form.elements.number.value = detail.number || '';
    this._form.elements.position.value = detail.position || '';
    this._form.elements.age.value = '';

    // Buscar el teamId real del jugador para preseleccionarlo
    const player = this._players.find(p => p.id === detail.playerId);
    if (player) {
      this._form.elements.teamId.value = player.teamId;
      this._form.elements.age.value = player.age;
    }

    this._modalTitle.textContent = 'Editar jugador';
    this._btnSave.textContent = 'Actualizar';
    this._modal.hidden = false;
  }

  async _handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(this._form);
    const data = {
      teamId: formData.get('teamId'),
      name: formData.get('name'),
      number: Number(formData.get('number')),
      position: formData.get('position'),
      age: Number(formData.get('age')),
      active: true,
    };

    const editId = this._editPlayerId.value;

    try {
      if (editId) {
        await updatePlayer(editId, data);
        this._showFeedback('Jugador actualizado correctamente.');
      } else {
        await createPlayer(data);
        this._showFeedback('Jugador creado correctamente.');
      }
      this._modal.hidden = true;
      await this.loadPlayers();
    } catch (error) {
      this._showFeedback(`Error: ${error.message}`, true);
    }
  }

  // ── Eventos de hijos ──

  async _handleToggleActive(event) {
    const { playerId, active } = event.detail;
    try {
      await updatePlayer(playerId, { active });
      const idx = this._players.findIndex(p => p.id === playerId);
      if (idx !== -1) {
        this._players[idx].active = active;
        this.render();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  }

  async _handleDeletePlayer(event) {
    const { playerId } = event.detail;
    if (!confirm('¿Está seguro de que desea eliminar este jugador?')) return;
    try {
      await deletePlayer(playerId);
      this._showFeedback('Jugador eliminado correctamente.');
      await this.loadPlayers();
    } catch (error) {
      this._showFeedback(`No fue posible eliminar: ${error.message}`, true);
    }
  }

  _handleEditPlayer(event) {
    this._openEditModal(event.detail);
  }

  // ── Render ──

  render() {
    this._playersGrid.replaceChildren();

    const searchTerm = this._searchInput.value.toLowerCase();
    const teamId = this._teamFilter.value;
    const position = this._positionFilter.value;

    const filteredPlayers = this._players.filter(player => {
      const matchName = player.name.toLowerCase().includes(searchTerm);
      const matchTeam = teamId === 'all' || player.teamId === teamId;
      const matchPosition = position === 'all' || player.position === position;
      return matchName && matchTeam && matchPosition;
    });

    this._playersCount.textContent = '';
    const countText = document.createTextNode('Mostrando ');
    const strong = document.createElement('strong');
    strong.textContent = `${filteredPlayers.length}`;
    const rest = document.createTextNode(` de ${this._players.length} jugadores`);
    this._playersCount.appendChild(countText);
    this._playersCount.appendChild(strong);
    this._playersCount.appendChild(rest);

    if (filteredPlayers.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'players-empty';
      empty.textContent = 'No se encontraron jugadores.';
      this._playersGrid.appendChild(empty);
      return;
    }

    filteredPlayers.forEach(player => {
      const team = database.teams.find(t => t.id === player.teamId);
      const teamName = team ? team.name : player.teamId;

      const card = document.createElement('player-card');
      card.setAttribute('player-id', player.id);
      card.setAttribute('name', player.name);
      card.setAttribute('number', String(player.number));
      card.setAttribute('position', player.position);
      card.setAttribute('team', teamName);
      card.setAttribute('active', player.active !== false ? 'true' : 'false');

      this._playersGrid.appendChild(card);
    });
  }
}

// Registro del Custom Element
if (!customElements.get('players-manager')) {
  customElements.define('players-manager', PlayersManager);
}
