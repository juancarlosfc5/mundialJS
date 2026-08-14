// src/views/players.js
// ===========================================================
// INTEGRANTE 2 — MANUEL (Generación individual de filas)
// ===========================================================

export const createPlayerRow = (player, index) => {
  // 1. Crear fila principal
  const tr = document.createElement('tr');
  
  // Asignar atributo de numeración (Requerimiento 4)
  tr.setAttribute('data-row-index', index);
  tr.classList.add('player-row');

  // 2. Crear celdas de forma segura sin innerHTML (Requerimiento 1)
  const tdName = document.createElement('td'); // Agregado el Nombre
  tdName.textContent = player.name;

  const tdTeam = document.createElement('td');
  tdTeam.textContent = player.teamId; 

  const tdDorsal = document.createElement('td');
  tdDorsal.textContent = player.dorsal;
  tdDorsal.classList.add('dorsal-number');

  const tdPosition = document.createElement('td');
  tdPosition.textContent = player.position;
  tdPosition.classList.add('position-badge');

  const tdAge = document.createElement('td');
  tdAge.textContent = player.age;

  // Celda para acciones
  const tdActions = document.createElement('td');

  const btnEdit = document.createElement('button');
  btnEdit.textContent = 'Editar';
  btnEdit.setAttribute('data-action', 'edit');
  btnEdit.setAttribute('data-id', player.id);

  const btnToggle = document.createElement('button');
  btnToggle.textContent = player.active ? 'Desactivar' : 'Activar';
  btnToggle.setAttribute('data-action', 'toggle');
  btnToggle.setAttribute('data-id', player.id);

  const btnDelete = document.createElement('button');
  btnDelete.textContent = 'Eliminar';
  btnDelete.setAttribute('data-action', 'delete');
  btnDelete.setAttribute('data-id', player.id);

  tdActions.appendChild(btnEdit);
  tdActions.appendChild(btnToggle);
  tdActions.appendChild(btnDelete);

  // 3. Aplicar clase según la posición (Requerimiento 2)
  const posClass = `pos-${player.position.toLowerCase().replace(/\s+/g, '-')}`;
  tr.classList.add(posClass);

  // Marcar filas inactivas
  if (player.active === false) {
    tr.classList.add('player-inactive');
  }

  // 4. Adjuntar celdas a la fila
  tr.appendChild(tdName);
  tr.appendChild(tdTeam);
  tr.appendChild(tdDorsal);
  tr.appendChild(tdPosition);
  tr.appendChild(tdAge);
  tr.appendChild(tdActions);

  return tr;
};

// ===========================================================
// INTEGRANTE 1 — JOSÉ (Renderizado, Animación y Exploración)
// ===========================================================

export const renderPlayersView = (playersArray) => {
  // 1. Obtener el contenedor principal
  const tbody = document.getElementById('players-table-body');

  if (!tbody) {
    console.error("No se encontró el contenedor 'players-table-body' en el HTML.");
    return;
  }

  // 2. Limpiar el contenedor de forma segura (sin innerHTML)
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  // Arreglo temporal para guardar las filas y luego animarlas
  const playerRows = [];

  // 3. Iterar sobre los jugadores y armar la tabla
  playersArray.forEach((player, index) => {
    const tr = createPlayerRow(player, index);
    tbody.appendChild(tr);
    playerRows.push(tr);
  });

  // 4. Crear la Fila Resumen e insertarla ANTES del primer jugador (Requerimiento)
  const summaryTr = document.createElement('tr');
  summaryTr.classList.add('summary-row'); 
  
  const summaryTd = document.createElement('td');
  summaryTd.colSpan = 6; // Coincide con las 6 columnas (nombre, equipo, dorsal, posición, edad, acciones)
  summaryTd.textContent = `Total de jugadores registrados: ${playersArray.length}`;
  summaryTd.style.fontWeight = 'bold';
  summaryTd.style.textAlign = 'center'; 
  
  summaryTr.appendChild(summaryTd);
  tbody.insertBefore(summaryTr, tbody.firstChild);

  // 5. Animación de las filas de jugadores
  playerRows.forEach((row, index) => {
    row.animate([
      { opacity: 0, transform: 'translateX(-20px)' }, 
      { opacity: 1, transform: 'translateX(0)' }      
    ], {
      duration: 400, 
      delay: index * 50, 
      fill: 'forwards',
      easing: 'ease-out'
    });
  });

  // 6. Exploración del DOM (Requerimiento de consola)
  const parent = tbody.parentElement; 
  console.log('--- Exploración del DOM (Módulo Jugadores) ---');
  console.log(`Contenedor Padre:`, parent.tagName); 
  console.log(`Nodos Elemento (children.length): ${tbody.children.length} (Solo etiquetas HTML como <tr>)`);
  console.log(`Nodos Totales (childNodes.length): ${tbody.childNodes.length} (Incluye saltos de línea y textos vacíos)`);
};