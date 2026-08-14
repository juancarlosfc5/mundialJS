// src/components/goals/scorers-table.js

export class ScorersTable extends HTMLElement {
  constructor() {
    super();
    this._rows = [];
  }

  set rows(data) {
    this._rows = data;
    this.render();
  }

  get rows() {
    return this._rows;
  }

  connectedCallback() {
    console.log('scorers-table conectado');
    this.render();
  }

  disconnectedCallback() {
    console.log('scorers-table desconectado');
  }

  render() {
    if (!this._rows.length) {
      this.innerHTML = '<p class="empty-state">No hay goleadores aún.</p>';
      return;
    }
    this.innerHTML = `
      <table class="scorers-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Jugador</th>
            <th>Equipo</th>
            <th>Goles</th>
            <th>Partidos</th>
          </tr>
        </thead>
        <tbody>
          ${this._rows.map((scorer, index) => `
            <tr
              data-player-id="${scorer.playerId}"
              data-rank="${index + 1}"
              ${index === 0 ? 'class="top-scorer"' : ''}
              ${index === this._rows.length - 1 ? 'data-last-row="true"' : ''}
            >
              <td>${index + 1}</td>
              <td>${scorer.playerName}</td>
              <td>${scorer.teamName || '–'}</td>
              <td>${scorer.goals}</td>
              <td>${scorer.matches}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

customElements.define('scorers-table', ScorersTable);