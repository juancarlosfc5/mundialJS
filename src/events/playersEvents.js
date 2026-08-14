// src/events/players.events.js
import { listPlayers, updatePlayer, deletePlayer } from "../services/players.js";
import { renderPlayersView } from "../views/players.js";
import { db } from "../database.js";

// ─── ESTADO INTERNO DE LOS FILTROS ────────────────────────
let currentTeamFilter = "";
let currentPositionFilter = "";
let currentSearchTerm = "";

/**
 * Filtra la lista de jugadores aplicando equipo, posición y búsqueda de forma combinada.
 * Recibe el arreglo completo y retorna un subconjunto.
 */
const applyFilters = (players) => {
  let filtered = [...players];

  if (currentTeamFilter) {
    filtered = filtered.filter(p => p.teamId === currentTeamFilter);
  }

  if (currentPositionFilter) {
    filtered = filtered.filter(p => p.position === currentPositionFilter);
  }

  if (currentSearchTerm) {
    const term = currentSearchTerm.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(term) ||
      String(p.number).includes(term)
    );
  }

  return filtered;
};

/**
 * Recarga los jugadores desde el servicio, aplica los filtros vigentes
 * y vuelve a pintar la tabla.
 */
const refreshFilteredView = async () => {
  const allPlayers = await listPlayers();
  const filtered = applyFilters(allPlayers);
  renderPlayersView(filtered);
};

/**
 * Puebla dinámicamente el select de equipos con los datos de la BD.
 */
const populateTeamFilter = () => {
  const teamSelect = document.getElementById("player-team-filter");
  if (!teamSelect) return;

  // Conservar solo la primera opción ("Todos los equipos")
  while (teamSelect.options.length > 1) {
    teamSelect.remove(1);
  }

  db.teams.forEach(team => {
    const option = document.createElement("option");
    option.value = team.id;
    option.textContent = team.name;
    teamSelect.appendChild(option);
  });
};

// ─── CONFIGURACIÓN DE EVENTOS (MANUEL) ───────────────────

/**
 * Configura los eventos del módulo de Jugadores asignados a Manuel:
 * - change (filtros combinados)
 * - keydown (buscador)
 * - click (delegación en la tabla para editar, activar/desactivar y eliminar)
 */
export const setupPlayerEvents = (renderCallback) => {
  // === Filtros (change) ===
  const teamFilterSelect = document.getElementById("player-team-filter");
  const positionFilterSelect = document.getElementById("player-position-filter");
  const searchInput = document.getElementById("player-search");

  // Poblar el select de equipos al iniciar
  populateTeamFilter();

  if (teamFilterSelect) {
    teamFilterSelect.addEventListener("change", async (event) => {
      currentTeamFilter = event.target.value;
      await refreshFilteredView();
    });
  }

  if (positionFilterSelect) {
    positionFilterSelect.addEventListener("change", async (event) => {
      currentPositionFilter = event.target.value;
      await refreshFilteredView();
    });
  }

  // === Buscador (keydown) ===
  if (searchInput) {
    searchInput.addEventListener("keydown", async (event) => {
      if (event.key === "Enter") {
        currentSearchTerm = searchInput.value.trim();
        await refreshFilteredView();
      } else if (event.key === "Escape") {
        currentSearchTerm = "";
        searchInput.value = "";
        await refreshFilteredView();
      }
    });
  }

  // === Interactividad de la Tabla (click por delegación) ===
  const tableBody = document.getElementById("players-table-body");

  if (tableBody) {
    tableBody.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;

      const action = button.getAttribute("data-action");
      const playerId = button.getAttribute("data-id");

      try {
        if (action === "edit") {
          console.log(`Editar jugador: ${playerId}`);
          // La carga del formulario la implementará José en su parte
        }

        if (action === "toggle") {
          // Buscar el estado actual del jugador en la BD
          const player = db.players.find(p => p.id === playerId);
          if (player) {
            await updatePlayer(playerId, { active: !player.active });
            await refreshFilteredView();
          }
        }

        if (action === "delete") {
          const confirmed = confirm("¿Estás seguro de que deseas eliminar este jugador?");
          if (confirmed) {
            await deletePlayer(playerId);
            await refreshFilteredView();
          }
        }
      } catch (error) {
        console.error(`Error en acción "${action}":`, error.message);
        alert(error.message);
      }
    });
  }
};
