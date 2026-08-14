// Grupo 3 - Vista de Jugadores (Manipulación del DOM)

// ==========================================
// Funciones asignadas a Jose
// ==========================================
// Jose implementará:
// - Limpieza de contenedor con replaceChildren()
// - Creación e inserción de la fila resumen con insertBefore()
// - Comparación en consola de children.length vs childNodes.length
// - Navegación con parentElement y parentNode


// ==========================================
// Funciones asignadas a Manuel
// ==========================================

/**
 * Crea un elemento <tr> seguro con los datos de un jugador.
 * @param {Object} player - Datos del jugador.
 * @param {string} teamName - Nombre del equipo asociado.
 * @param {number} index - Índice de la fila.
 * @returns {HTMLTableRowElement} Fila de la tabla construida.
 */
export const createPlayerRow = (player, teamName, index) => {
  const row = document.createElement('tr');
  row.classList.add('player-row');

  // Asignar clase dinámica según la posición del jugador
  const positionClass = `pos-${player.position.toLowerCase()}`;
  row.classList.add(positionClass);

  // Atributos data-* obligatorios para identificar y numerar la fila
  row.setAttribute('data-index', String(index + 1));
  row.setAttribute('data-player-id', player.id);
  row.setAttribute('data-team-id', player.teamId);

  // Creación segura de celdas sin usar innerHTML
  const indexTd = document.createElement('td');
  indexTd.textContent = String(index + 1);
  indexTd.classList.add('col-index');

  const numberTd = document.createElement('td');
  numberTd.textContent = `#${player.number}`;
  numberTd.classList.add('col-number');

  const nameTd = document.createElement('td');
  nameTd.textContent = player.name;
  nameTd.classList.add('col-name');

  const teamTd = document.createElement('td');
  teamTd.textContent = teamName || player.teamId;
  teamTd.classList.add('col-team');

  const positionTd = document.createElement('td');
  positionTd.textContent = player.position;
  positionTd.classList.add('col-position');

  const ageTd = document.createElement('td');
  ageTd.textContent = `${player.age} años`;
  ageTd.classList.add('col-age');

  // Ensamblar las celdas en la fila
  row.appendChild(indexTd);
  row.appendChild(numberTd);
  row.appendChild(nameTd);
  row.appendChild(teamTd);
  row.appendChild(positionTd);
  row.appendChild(ageTd);

  return row;
};

/**
 * Construye e inserta las filas de jugadores en el cuerpo de la tabla.
 * @param {HTMLElement} tbodyElement - Elemento <tbody> contenedor.
 * @param {Array<Object>} players - Lista de jugadores.
 * @param {Map<string, string>} teamsMap - Mapa de ID de equipo a Nombre de equipo.
 */
export const renderPlayerRows = (tbodyElement, players = [], teamsMap = new Map()) => {
  players.forEach((player, index) => {
    const teamName = teamsMap.get ? teamsMap.get(player.teamId) : (teamsMap[player.teamId] || player.teamId);
    const row = createPlayerRow(player, teamName, index);
    tbodyElement.appendChild(row);
  });
};

/**
 * Anima de forma escalonada únicamente las filas correspondientes a jugadores.
 * Utiliza getElementsByClassName y getElementsByTagName para seleccionar los elementos requeridos.
 * @param {HTMLElement} tableOrContainer - Contenedor o tabla donde se encuentran las filas.
 */
export const animatePlayerRows = (tableOrContainer) => {
  // Selección de filas mediante getElementsByClassName
  const playerRows = tableOrContainer.getElementsByClassName('player-row');

  // Selección complementaria mediante getElementsByTagName para validar todas las filas de la tabla
  const allRows = tableOrContainer.getElementsByTagName('tr');

  // Convertimos a array para aplicar animate() exclusivamente a las filas de jugadores
  Array.from(playerRows).forEach((row, index) => {
    row.animate(
      [
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      {
        duration: 350,
        delay: index * 40,
        easing: 'ease-out',
        fill: 'forwards',
      }
    );
  });

  return {
    totalRows: allRows.length,
    playerRowsCount: playerRows.length,
  };
};
