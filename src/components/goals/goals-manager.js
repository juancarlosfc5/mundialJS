// src/components/goals/goals-manager.js
import './goalsStyles.css';
import './goal-item.js';
import './scorers-table.js';
import { crearGol } from './createGoal.js';
import { editarGol } from './editGoal.js';
import { eliminarGol } from './deleteGoal.js';
import { getGoals } from '../../api/goalsApi.js';
import db from '../../data/db.json';

export class GoalsManager extends HTMLElement {
  constructor() {
    super();
    this.goles = [];
    this.equipos = [];
    this.partidos = [];
    this.jugadores = [];
    this.render();
    this.setupEvents();
  }

  connectedCallback() {
    console.log('goals-manager conectado');
    this.cargarDatos();
  }

  disconnectedCallback() {
    console.log('goals-manager desconectado');
  }

  q(selector) {
    return this.querySelector(selector);
  }

  render() {
    this.innerHTML = `
      <section class="goals-app">
        <header class="goals-header">
          <h2>Goles y Goleadores</h2>
        </header>

        <p id="goals-message" class="message"></p>

        <form id="goal-form" class="goals-form">
          <h3>Registrar gol</h3>
          <select id="goal-match-select">
            <option value="">— Selecciona un partido —</option>
          </select>
          <select id="goal-team-select">
            <option value="">— Selecciona equipo —</option>
          </select>
          <select id="goal-player-select">
            <option value="">— Selecciona jugador —</option>
          </select>
          <input id="goal-minute-input" type="number" min="1" max="130" placeholder="Minuto" />
          <select id="goal-type-select">
            <option value="Jugada">Jugada</option>
            <option value="Penal">Penal</option>
            <option value="Tiro libre">Tiro libre</option>
            <option value="Cabeza">Cabeza</option>
          </select>
          <div class="goals-form-actions">
            <button type="submit">Guardar gol</button>
            <button type="button" id="goal-cancel-btn">Cancelar</button>
          </div>
        </form>

        <section class="goals-timeline-section">
          <h3>Línea de tiempo de goles</h3>
          <div id="goals-empty-state" class="empty-state">
            <p>Aún no se han registrado goles en el torneo.</p>
          </div>
          <ol id="goals-timeline" class="timeline"></ol>
          <p id="goals-summary" class="summary"></p>
        </section>

        <section class="goals-scorers-section">
          <h3>Tabla de goleadores</h3>
          <input id="scorers-search" type="text" placeholder="Buscar jugador o equipo... (Enter busca, Escape limpia)" />
          <scorers-table id="scorers-table-component"></scorers-table>
        </section>
      </section>
    `;
  }

  showMessage(text, isError = false) {
    const msg = this.q('#goals-message');
    if (!msg) return;
    msg.textContent = text;
    msg.className = isError ? 'message message--error' : 'message message--success';
    setTimeout(() => { msg.textContent = ''; msg.className = 'message'; }, 3000);
  }

  async cargarDatos() {
    const goles = await getGoals() ?? [];
    this.goles   = goles;
    this.partidos  = db.matches;
    this.equipos   = db.teams;
    this.jugadores = db.players;

    this.fillMatchOptions();
    this.renderTimeline();
    this.renderScorers();
  }

  fillMatchOptions() {
    const matchSelect = this.q('#goal-match-select');
    if (!matchSelect) return;
    while (matchSelect.firstChild) matchSelect.removeChild(matchSelect.firstChild);
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = '— Selecciona un partido —';
    matchSelect.appendChild(ph);
    this.partidos.forEach(match => {
      const home = this.equipos.find(t => t.id === match.homeTeamId);
      const away = this.equipos.find(t => t.id === match.awayTeamId);
      const opt = document.createElement('option');
      opt.value = match.id;
      opt.textContent = `#${match.matchNumber} ${home?.code || match.homeTeamId} vs ${away?.code || match.awayTeamId}`;
      matchSelect.appendChild(opt);
    });
  }

  fillTeamOptions(homeTeamId, awayTeamId) {
    const teamSelect = this.q('#goal-team-select');
    if (!teamSelect) return;
    while (teamSelect.firstChild) teamSelect.removeChild(teamSelect.firstChild);
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = '— Selecciona equipo —';
    teamSelect.appendChild(ph);
    [homeTeamId, awayTeamId].forEach(teamId => {
      const team = this.equipos.find(t => t.id === teamId);
      if (!team) return;
      const opt = document.createElement('option');
      opt.value = team.id;
      opt.textContent = `${team.code} — ${team.name}`;
      teamSelect.appendChild(opt);
    });
  }

  fillPlayerOptions(teamId) {
    const playerSelect = this.q('#goal-player-select');
    if (!playerSelect) return;
    while (playerSelect.firstChild) playerSelect.removeChild(playerSelect.firstChild);
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = '— Selecciona jugador —';
    playerSelect.appendChild(ph);
    this.jugadores.filter(p => p.teamId === teamId && p.active).forEach(player => {
      const opt = document.createElement('option');
      opt.value = player.id;
      opt.textContent = `#${player.number} ${player.name}`;
      playerSelect.appendChild(opt);
    });
  }

  clearForm() {
    const form = this.q('#goal-form');
    if (!form) return;
    form.reset();
    form.removeAttribute('data-editing-id');
    this.fillMatchOptions();
  }

  loadGoalIntoForm(goal) {
    const form = this.q('#goal-form');
    if (!form || !goal) return;
    const matchSelect = this.q('#goal-match-select');
    if (matchSelect) matchSelect.value = goal.matchId;
    const match = this.partidos.find(m => m.id === goal.matchId);
    if (match) this.fillTeamOptions(match.homeTeamId, match.awayTeamId);
    const teamSelect = this.q('#goal-team-select');
    if (teamSelect) teamSelect.value = goal.teamId;
    this.fillPlayerOptions(goal.teamId);
    const playerSelect = this.q('#goal-player-select');
    if (playerSelect) playerSelect.value = goal.playerId;
    const minuteInput = this.q('#goal-minute-input');
    if (minuteInput) minuteInput.value = goal.minute;
    const typeSelect = this.q('#goal-type-select');
    if (typeSelect) typeSelect.value = goal.type || 'Jugada';
    form.setAttribute('data-editing-id', goal.id);
  }

  renderTimeline() {
    const timeline = this.q('#goals-timeline');
    const summaryEl = this.q('#goals-summary');
    if (!timeline) return;

    while (timeline.firstChild) timeline.removeChild(timeline.firstChild);
    if (summaryEl) summaryEl.textContent = '';

    const sorted = [...this.goles].sort((a, b) => a.minute - b.minute);
    let emptyState = this.q('#goals-empty-state');

    if (sorted.length === 0) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.id = 'goals-empty-state';
        emptyState.className = 'empty-state';
        emptyState.innerHTML = '<p>Aún no se han registrado goles en el torneo.</p>';
        timeline.before(emptyState);
      }
      return;
    }

    if (emptyState) emptyState.remove();

    sorted.forEach(goal => {
      const match   = this.partidos.find(m => m.id === goal.matchId);
      const player  = this.jugadores.find(p => p.id === goal.playerId);
      const team    = this.equipos.find(t => t.id === goal.teamId);
      const homeTeam = this.equipos.find(t => t.id === match?.homeTeamId);
      const awayTeam = this.equipos.find(t => t.id === match?.awayTeamId);

      const item = document.createElement('goal-item');
      item.model = {
        goal,
        player,
        team,
        match: match ? {
          ...match,
          homeTeamName: homeTeam?.name,
          awayTeamName: awayTeam?.name,
        } : null,
      };
      timeline.appendChild(item);
    });

    if (summaryEl) {
      summaryEl.insertAdjacentText('beforeend', `Total de goles registrados: ${sorted.length}.`);
    }

    console.log('Primer gol:', timeline.firstElementChild);
    console.log('Último gol:', timeline.lastElementChild);
  }

  renderScorers() {
    const scorersComponent = this.q('#scorers-table-component');
    if (!scorersComponent) return;

    const tabla = {};
    this.goles.forEach(g => {
      if (!tabla[g.playerId]) {
        const player = this.jugadores.find(p => p.id === g.playerId);
        const team   = this.equipos.find(t => t.id === g.teamId);
        tabla[g.playerId] = {
          playerId:   g.playerId,
          playerName: player?.name || g.playerId,
          teamName:   team?.name || g.teamId,
          goals:      0,
          matchSet:   new Set(),
        };
      }
      tabla[g.playerId].goals++;
      tabla[g.playerId].matchSet.add(g.matchId);
    });

    const scorers = Object.values(tabla)
      .map(s => ({ ...s, matches: s.matchSet.size }))
      .sort((a, b) => {
        if (b.goals !== a.goals) return b.goals - a.goals;
        if (a.matches !== b.matches) return a.matches - b.matches;
        return a.playerName.localeCompare(b.playerName);
      });

    scorersComponent.rows = scorers;
  }

  setupEvents() {
    this.addEventListener('change', (event) => {
      if (event.target.id === 'goal-match-select') {
        const match = this.partidos.find(m => m.id === event.target.value);
        if (!match) return;
        this.fillTeamOptions(match.homeTeamId, match.awayTeamId);
        this.fillPlayerOptions('');
      }
      if (event.target.id === 'goal-team-select') {
        if (event.target.value) this.fillPlayerOptions(event.target.value);
      }
    });

    this.addEventListener('submit', async (event) => {
      event.preventDefault();
      const matchId   = this.q('#goal-match-select')?.value;
      const teamId    = this.q('#goal-team-select')?.value;
      const playerId  = this.q('#goal-player-select')?.value;
      const minute    = Number(this.q('#goal-minute-input')?.value);
      const type      = this.q('#goal-type-select')?.value || 'Jugada';
      const form      = this.q('#goal-form');
      const editingId = form?.getAttribute('data-editing-id');

      try {
        if (editingId) {
          await editarGol({ minute, type }, editingId);
          this.showMessage('✅ Gol actualizado correctamente.');
        } else {
          await crearGol({ matchId, teamId, playerId, minute, type });
          this.showMessage('✅ Gol registrado correctamente.');
        }
        this.clearForm();
        await this.cargarDatos();
      } catch (error) {
        this.showMessage(`❌ ${error.message}`, true);
      }
    });

    this.addEventListener('click', async (event) => {
      const btn = event.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      const goalId = btn.getAttribute('data-goal-id');

      if (action === 'edit') {
        const goal = this.goles.find(g => g.id === goalId);
        this.loadGoalIntoForm(goal);
        this.q('#goal-form')?.scrollIntoView({ behavior: 'smooth' });
      }

      if (action === 'delete') {
        try {
          await eliminarGol(goalId);
          this.showMessage('🗑️ Gol eliminado.');
          await this.cargarDatos();
        } catch (error) {
          this.showMessage(`❌ ${error.message}`, true);
        }
      }

      if (btn.id === 'goal-cancel-btn') {
        this.clearForm();
      }
    });

    this.addEventListener('keydown', (event) => {
      if (event.target.id !== 'scorers-search') return;
      if (event.key === 'Enter') {
        event.preventDefault();
        const query = event.target.value.trim().toLowerCase();
        this.querySelectorAll('#scorers-table-component tr').forEach(row => {
          const name = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
          const team = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
          row.style.display = name.includes(query) || team.includes(query) ? '' : 'none';
        });
      }
      if (event.key === 'Escape') {
        event.target.value = '';
        this.querySelectorAll('#scorers-table-component tr').forEach(row => {
          row.style.display = '';
        });
      }
    });

    this.addEventListener('mouseover', (event) => {
      const item = event.target.closest('goal-item');
      if (!item) return;
      item.querySelector('.goal-item')?.classList.add('goal-item--highlighted');
    });

    this.addEventListener('mouseout', (event) => {
      const item = event.target.closest('goal-item');
      if (!item) return;
      item.querySelector('.goal-item')?.classList.remove('goal-item--highlighted');
    });
  }
}

customElements.define('goals-manager', GoalsManager);