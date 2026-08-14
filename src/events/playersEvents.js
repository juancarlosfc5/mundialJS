import { createPlayer, deletePlayer, listPlayers, getPlayersByTeam } from '../services/playersService.js';
import {
  createPlayerRow,
  clearTableContainer,
  createSummaryRow,
  insertSummaryRow,
  inspectDOM,
  renderPlayerRows,
} from '../views/playersView.js';

// Grupo 3 - Manejadores de Eventos del Módulo de Jugadores

// ==========================================
// Funciones asignadas a Jose (Filtros y Consultas)
// ==========================================

/**
 * Manejador del evento change para el filtrado dinámico de jugadores por equipo.
 * Consume listPlayers() o getPlayersByTeam() según la selección y re-renderiza la tabla.
 * @param {Event} event - Evento change del selector de equipos.
 * @param {HTMLTableSectionElement} tbodyElement - Cuerpo de la tabla a actualizar.
 * @param {Map<string, string>} teamsMap - Mapa de ID de equipo a Nombre de equipo.
 */
export const handleTeamFilterChange = async (event, tbodyElement, teamsMap = new Map()) => {
  const teamId = event.target.value;

  try {
    // Obtener jugadores según el filtro seleccionado
    let players = [];
    if (teamId === 'all' || !teamId) {
      players = await listPlayers();
    } else {
      players = await getPlayersByTeam(teamId);
    }

    // Limpiar el contenedor usando replaceChildren() (función del Reto 2)
    clearTableContainer(tbodyElement);

    // Re-renderizar las filas con la función de Manuel
    renderPlayerRows(tbodyElement, players, teamsMap);

    // Crear e insertar la fila de resumen actualizada
    const summaryRow = createSummaryRow(players.length);
    insertSummaryRow(tbodyElement, summaryRow);

    // Ejecutar la inspección del DOM en consola
    inspectDOM(tbodyElement);
  } catch (error) {
    console.error('Error al filtrar jugadores:', error.message);
  }
};

/**
 * Manejador unificado para mouseover y mouseout con delegación de eventos.
 * Aplica o remueve un resaltado visual en las filas de jugadores.
 * @param {MouseEvent} event - Evento de mouse sobre el contenedor de la tabla.
 */
export const handlePlayerRowHover = (event) => {
  const row = event.target.closest('tr.player-row');
  if (!row) return;

  if (event.type === 'mouseover') {
    row.classList.add('row-hover');
    row.style.backgroundColor = '#f0f7ff';
    row.style.cursor = 'pointer';
    row.style.transition = 'background-color 0.15s ease';
  } else if (event.type === 'mouseout') {
    row.classList.remove('row-hover');
    row.style.backgroundColor = '';
    row.style.cursor = '';
  }
};

/**
 * Inicializador de eventos de consulta y visualización.
 * Vincula los listeners de filtrado por equipo y resaltado de filas con addEventListener.
 * @param {HTMLSelectElement} filterSelect - Selector de filtro de equipos.
 * @param {HTMLTableSectionElement} tbodyElement - Cuerpo de la tabla.
 * @param {HTMLElement} tableContainerElement - Contenedor de la tabla para delegación de eventos.
 * @param {Map<string, string>} teamsMap - Mapa de ID de equipo a Nombre de equipo.
 */
export const setupPlayerFilterEvents = (filterSelect, tbodyElement, tableContainerElement, teamsMap = new Map()) => {
  // Evento change para filtrar por equipo
  if (filterSelect) {
    filterSelect.addEventListener('change', (event) =>
      handleTeamFilterChange(event, tbodyElement, teamsMap)
    );
  }

  // Eventos mouseover y mouseout para resaltado interactivo con delegación
  if (tableContainerElement) {
    tableContainerElement.addEventListener('mouseover', handlePlayerRowHover);
    tableContainerElement.addEventListener('mouseout', handlePlayerRowHover);
  }
};


// ==========================================
// Funciones asignadas a Manuel (Mutaciones CRUD)
// ==========================================

/**
 * Manejador del evento submit para el formulario de registro de jugadores.
 * @param {SubmitEvent} event - Evento de envío del formulario.
 * @param {HTMLFormElement} formElement - Elemento del formulario.
 * @param {HTMLTableSectionElement} tbodyElement - Elemento <tbody> donde se inserta la nueva fila.
 * @param {Map<string, string>} [teamsMap=new Map()] - Mapa de ID a Nombre de equipo.
 */
export const handleCreatePlayerSubmit = async (event, formElement, tbodyElement, teamsMap = new Map()) => {
  event.preventDefault();

  const formData = new FormData(formElement);
  const teamId = formData.get('teamId')?.toString().trim();
  const name = formData.get('name')?.toString().trim();
  const number = Number(formData.get('number'));
  const position = formData.get('position')?.toString().trim();
  const age = Number(formData.get('age'));

  try {
    // 1. Ejecutar la mutación lógica mediante el servicio
    const newPlayer = await createPlayer({
      teamId,
      name,
      number,
      position,
      age,
      active: true,
    });

    // 2. Resolver el nombre del equipo para la vista
    const teamName = teamsMap.get ? teamsMap.get(teamId) : (teamsMap[teamId] || teamId);

    // 3. Crear e insertar la nueva fila en el DOM
    const currentIndex = tbodyElement.querySelectorAll('tr.player-row').length;
    const newRow = createPlayerRow(newPlayer, teamName, currentIndex);
    tbodyElement.appendChild(newRow);

    // 4. Animar la fila recién creada
    newRow.animate(
      [
        { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
        { opacity: 1, transform: 'scale(1) translateY(0)' },
      ],
      {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards',
      }
    );

    // 5. Resetear el formulario tras la creación exitosa
    formElement.reset();
  } catch (error) {
    console.error('Error al registrar jugador:', error.message);
    alert(`Error: ${error.message}`);
  }
};

/**
 * Manejador de delegación de eventos click para la eliminación de jugadores.
 * @param {MouseEvent} event - Evento de click en el contenedor de la tabla.
 */
export const handleDeletePlayerClick = async (event) => {
  // Delegación de eventos usando closest para detectar el botón de eliminar
  const deleteBtn = event.target.closest('.btn-delete-player');
  if (!deleteBtn) return;

  const row = deleteBtn.closest('tr');
  if (!row) return;

  const playerId = row.getAttribute('data-player-id') || deleteBtn.getAttribute('data-player-id');
  if (!playerId) return;

  const confirmed = window.confirm('¿Está seguro de que desea eliminar este jugador?');
  if (!confirmed) return;

  try {
    // 1. Ejecutar eliminación lógica mediante el servicio
    await deletePlayer(playerId);

    // 2. Animar la salida y remover el nodo del DOM
    const animation = row.animate(
      [
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: 'translateX(-20px)' },
      ],
      {
        duration: 250,
        easing: 'ease-in',
        fill: 'forwards',
      }
    );

    animation.onfinish = () => {
      row.remove();
    };
  } catch (error) {
    console.error('Error al eliminar jugador:', error.message);
    alert(`No fue posible eliminar el jugador: ${error.message}`);
  }
};

/**
 * Registra los listeners de eventos para las mutaciones de jugadores.
 * @param {HTMLFormElement} formElement - Formulario de creación de jugador.
 * @param {HTMLElement} tableContainerElement - Contenedor de la tabla con delegación de eventos.
 * @param {HTMLTableSectionElement} tbodyElement - Cuerpo de la tabla.
 * @param {Map<string, string>} [teamsMap=new Map()] - Mapa de ID a Nombre de equipo.
 */
export const setupPlayerMutationEvents = (
  formElement,
  tableContainerElement,
  tbodyElement,
  teamsMap = new Map()
) => {
  if (formElement) {
    formElement.addEventListener('submit', (event) =>
      handleCreatePlayerSubmit(event, formElement, tbodyElement, teamsMap)
    );
  }

  if (tableContainerElement) {
    tableContainerElement.addEventListener('click', (event) =>
      handleDeletePlayerClick(event)
    );
  }
};
