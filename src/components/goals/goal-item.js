// src/components/goals/goal-item.js

export class GoalItem extends HTMLElement {
  static get observedAttributes() {
    return ['minute', 'player', 'team', 'type'];
  }

  constructor() {
    super();
    this._model = null;
  }

  set model(data) {
    this._model = data;
    this.render();
  }

  get model() {
    return this._model;
  }

  connectedCallback() {
    console.log('goal-item conectado');
    this.render();
  }

  disconnectedCallback() {
    console.log('goal-item desconectado');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this.render();
  }

  render() {
    if (!this._model) return;
    const { goal, player, team, match } = this._model;
    const homeName = match?.homeTeamName || match?.homeTeamId || '';
    const awayName = match?.awayTeamName || match?.awayTeamId || '';
    this.innerHTML = `
      <article class="goal-item" data-goal-id="${goal.id}">
        <span class="goal-minute">${goal.minute}'</span>
        <div class="goal-info">
          <strong class="goal-player">${player?.name || goal.playerId}</strong>
          <span class="goal-team">${team?.name || goal.teamId}</span>
          <span class="goal-match">${homeName} vs ${awayName}</span>
          <span class="goal-type">${goal.type || 'Jugada'}</span>
        </div>
        <div class="goal-actions">
          <button type="button" data-action="edit" data-goal-id="${goal.id}" title="Editar">✏️</button>
          <button type="button" data-action="delete" data-goal-id="${goal.id}" title="Eliminar">🗑️</button>
        </div>
      </article>
    `;
  }
}

customElements.define('goal-item', GoalItem);