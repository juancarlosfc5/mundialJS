// Grupo 3 - Componente Web nativo para la tarjeta de un jugador
// Desarrollado por: Manuel

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      box-sizing: border-box;
    }

    *, *::before, *::after {
      box-sizing: inherit;
    }

    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dorsal {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 16px;
      color: #ffffff;
      background: #334155;
    }

    .status-badge {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-active {
      background: #dcfce7;
      color: #15803d;
    }

    .status-inactive {
      background: #fee2e2;
      color: #b91c1c;
    }

    .player-name {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .player-team {
      font-size: 14px;
      color: #64748b;
      margin: 0;
      font-weight: 500;
    }

    .position-badge {
      display: inline-block;
      align-self: flex-start;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
    }

    /* Variaciones de estilo según la posición */
    .pos-portero {
      border-left: 4px solid #f59e0b;
    }
    .pos-portero .position-badge {
      background: #fef3c7;
      color: #b45309;
    }
    .pos-portero .dorsal {
      background: #f59e0b;
    }

    .pos-defensa {
      border-left: 4px solid #3b82f6;
    }
    .pos-defensa .position-badge {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .pos-defensa .dorsal {
      background: #3b82f6;
    }

    .pos-mediocampista {
      border-left: 4px solid #10b981;
    }
    .pos-mediocampista .position-badge {
      background: #d1fae5;
      color: #047857;
    }
    .pos-mediocampista .dorsal {
      background: #10b981;
    }

    .pos-delantero {
      border-left: 4px solid #ef4444;
    }
    .pos-delantero .position-badge {
      background: #fee2e2;
      color: #b91c1c;
    }
    .pos-delantero .dorsal {
      background: #ef4444;
    }

    /* Estado inactivo */
    .card.inactive {
      opacity: 0.65;
      background: #f8fafc;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
      padding-top: 10px;
      border-top: 1px solid #f1f5f9;
    }

    button {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.15s ease;
    }

    .btn-edit {
      background: #e0e7ff;
      color: #3730a3;
    }
    .btn-edit:hover {
      background: #c7d2fe;
    }

    .btn-delete {
      background: #fee2e2;
      color: #991b1b;
    }
    .btn-delete:hover {
      background: #fecaca;
    }

    .btn-toggle {
      background: #f1f5f9;
      color: #475569;
    }
    .btn-toggle:hover {
      background: #e2e8f0;
    }
  </style>

  <div class="card">
    <div class="card-header">
      <span class="dorsal">#--</span>
      <span class="status-badge status-active">Activo</span>
    </div>
    <div class="card-body">
      <h3 class="player-name">Nombre del Jugador</h3>
      <p class="player-team">Equipo</p>
      <span class="position-badge">Posición</span>
    </div>
    <div class="card-actions">
      <button type="button" class="btn-toggle" title="Cambiar estado">Alternar</button>
      <button type="button" class="btn-edit" title="Editar jugador">Editar</button>
      <button type="button" class="btn-delete" title="Eliminar jugador">Eliminar</button>
    </div>
  </div>
`;

export class PlayerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Referencias a los elementos del Shadow DOM
    this._card = this.shadowRoot.querySelector('.card');
    this._dorsal = this.shadowRoot.querySelector('.dorsal');
    this._statusBadge = this.shadowRoot.querySelector('.status-badge');
    this._playerName = this.shadowRoot.querySelector('.player-name');
    this._playerTeam = this.shadowRoot.querySelector('.player-team');
    this._positionBadge = this.shadowRoot.querySelector('.position-badge');
    this._btnToggle = this.shadowRoot.querySelector('.btn-toggle');
    this._btnEdit = this.shadowRoot.querySelector('.btn-edit');
    this._btnDelete = this.shadowRoot.querySelector('.btn-delete');

    // Handlers enlazados para listeners de ciclo de vida
    this._onToggle = this._onToggle.bind(this);
    this._onEdit = this._onEdit.bind(this);
    this._onDelete = this._onDelete.bind(this);
  }

  static get observedAttributes() {
    return ['name', 'number', 'position', 'team', 'active', 'player-id'];
  }

  connectedCallback() {
    this._btnToggle.addEventListener('click', this._onToggle);
    this._btnEdit.addEventListener('click', this._onEdit);
    this._btnDelete.addEventListener('click', this._onDelete);
  }

  disconnectedCallback() {
    this._btnToggle.removeEventListener('click', this._onToggle);
    this._btnEdit.removeEventListener('click', this._onEdit);
    this._btnDelete.removeEventListener('click', this._onDelete);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'name':
        this._playerName.textContent = newValue || 'Sin nombre';
        break;

      case 'number':
        this._dorsal.textContent = newValue ? `#${newValue}` : '#--';
        break;

      case 'team':
        this._playerTeam.textContent = newValue || 'Sin equipo';
        break;

      case 'position':
        this._updatePosition(newValue);
        break;

      case 'active':
        this._updateActiveState(newValue);
        break;
    }
  }

  _updatePosition(position) {
    const pos = position || 'Delantero';
    this._positionBadge.textContent = pos;

    // Limpiar clases de posición anteriores
    this._card.classList.remove(
      'pos-portero',
      'pos-defensa',
      'pos-mediocampista',
      'pos-delantero'
    );

    // Asignar clase de posición correspondiente
    const cleanPos = pos.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    this._card.classList.add(`pos-${cleanPos}`);
  }

  _updateActiveState(activeAttr) {
    const isActive = activeAttr !== 'false' && activeAttr !== false && activeAttr !== null;

    if (isActive) {
      this._card.classList.remove('inactive');
      this._statusBadge.textContent = 'Activo';
      this._statusBadge.classList.remove('status-inactive');
      this._statusBadge.classList.add('status-active');
    } else {
      this._card.classList.add('inactive');
      this._statusBadge.textContent = 'Inactivo';
      this._statusBadge.classList.remove('status-active');
      this._statusBadge.classList.add('status-inactive');
    }
  }

  _onToggle() {
    const currentActive = this.getAttribute('active') !== 'false';
    const nextState = !currentActive;

    this.dispatchEvent(
      new CustomEvent('toggle-active', {
        detail: {
          playerId: this.getAttribute('player-id'),
          active: nextState,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onEdit() {
    this.dispatchEvent(
      new CustomEvent('edit-player', {
        detail: {
          playerId: this.getAttribute('player-id'),
          name: this.getAttribute('name'),
          number: Number(this.getAttribute('number')),
          position: this.getAttribute('position'),
          team: this.getAttribute('team'),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onDelete() {
    this.dispatchEvent(
      new CustomEvent('delete-player', {
        detail: {
          playerId: this.getAttribute('player-id'),
        },
        bubbles: true,
        composed: true,
      })
    );
  }
}

// Registro del Custom Element
if (!customElements.get('player-card')) {
  customElements.define('player-card', PlayerCard);
}
