// Grupo 3 - Vista de Jugadores (Manipulación del DOM)

// ==========================================
// Funciones asignadas a Jose
// ==========================================
// Jose implementará:
// - Limpieza de contenedor con replaceChildren()
// - Creación e inserción de la fila resumen con insertBefore()
// - Comparación en consola de children.length vs childNodes.length
// - Navegación con parentElement y parentNode

/**
 * Limpia el contenido de un contenedor (ej. <tbody>) de forma segura
 * utilizando replaceChildren() sin argumentos para vaciarlo.
 * @param {HTMLElement} container - Elemento contenedor a limpiar.
 */
export const clearTableContainer = (container) => {
  if (container) {
    container.replaceChildren();
  }
};

/**
 * Crea una fila de resumen con el total de jugadores.
 * Se construye completamente con createElement y textContent (sin innerHTML).
 * @param {number} totalPlayers - Número total de jugadores a mostrar.
 * @returns {HTMLTableRowElement} Fila resumen construida.
 */
export const createSummaryRow = (totalPlayers) => {
  const row = document.createElement('tr');
  row.classList.add('summary-row');

  const td = document.createElement('td');
  td.setAttribute('colspan', '6');
  td.style.textAlign = 'center';
  td.style.fontWeight = 'bold';
  td.style.padding = '12px';
  td.style.backgroundColor = '#e8f0fe';
  td.style.color = '#0062a9';
  td.style.fontSize = '0.95rem';
  td.textContent = `Total de Jugadores registrados: ${totalPlayers}`;

  row.appendChild(td);
  return row;
};

/**
 * Inserta la fila resumen antes de la primera fila de jugadores
 * utilizando insertBefore() como método obligatorio del reto.
 * @param {HTMLTableSectionElement} tbody - Cuerpo de la tabla.
 * @param {HTMLTableRowElement} summaryRow - Fila resumen a insertar.
 */
export const insertSummaryRow = (tbody, summaryRow) => {
  if (tbody && summaryRow) {
    tbody.insertBefore(summaryRow, tbody.firstElementChild);
  }
};

/**
 * Inspecciona el DOM del tbody y muestra en consola la diferencia entre
 * children (HTMLCollection de elementos) y childNodes (NodeList con nodos de texto).
 * Además navega usando parentElement y parentNode para demostrar su uso.
 * @param {HTMLTableSectionElement} tbody - Cuerpo de la tabla a inspeccionar.
 */
export const inspectDOM = (tbody) => {
  if (!tbody) return;

  console.log('╔════════════════════════════════════════╗');
  console.log('║   INSPECCIÓN DEL DOM (Jose - Reto 2)   ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`  children.length (solo elementos HTML): ${tbody.children.length}`);
  console.log(`  childNodes.length (todos los nodos):    ${tbody.childNodes.length}`);
  console.log(`  Diferencia (nodos texto/comentarios):   ${tbody.childNodes.length - tbody.children.length}`);

  // Navegación con parentElement y parentNode
  const firstChild = tbody.firstElementChild;
  if (firstChild) {
    console.log(`  parentElement del primer hijo:`, firstChild.parentElement?.tagName);
    console.log(`  parentNode del primer hijo:`, firstChild.parentNode?.tagName);
    console.log(`  ¿parentElement === parentNode?`, firstChild.parentElement === firstChild.parentNode);
  }
  console.log('─────────────────────────────────────────');
};


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
