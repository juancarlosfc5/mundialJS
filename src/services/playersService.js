import { database } from '../database.js';

// Grupo 3 - Módulo de Jugadores
// Posiciones reglamentarias permitidas para el torneo
const POSICIONES_PERMITIDAS = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];

// ==========================================
// Funciones asignadas a Jose (Lecturas / Consultas)
// ==========================================

/**
 * Retorna una promesa con la lista completa de todos los jugadores.
 * Se devuelve una copia independiente de cada objeto para garantizar inmutabilidad.
 * @returns {Promise<Array<Object>>} Lista de copias de jugadores.
 */
export const listPlayers = async () => {
  return database.players.map((p) => ({ ...p }));
};

/**
 * Busca un jugador por su ID único.
 * @param {string} playerId - Identificador del jugador.
 * @returns {Promise<Object>} Copia del jugador encontrado.
 * @throws {Error} Si el playerId no es válido o no existe.
 */
export const getPlayerById = async (playerId) => {
  if (!playerId || typeof playerId !== 'string') {
    throw new Error('El ID del jugador es obligatorio.');
  }

  const player = database.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error('Jugador no encontrado.');
  }

  return { ...player };
};

/**
 * Valida la existencia de un equipo y retorna todos los jugadores asociados.
 * @param {string} teamId - Identificador del equipo.
 * @returns {Promise<Array<Object>>} Lista de copias de jugadores del equipo.
 * @throws {Error} Si el equipo no existe en la base de datos.
 */
export const getPlayersByTeam = async (teamId) => {
  if (!teamId || typeof teamId !== 'string') {
    throw new Error('El ID del equipo es obligatorio.');
  }

  const teamExists = database.teams.some((team) => team.id === teamId);
  if (!teamExists) {
    throw new Error('El equipo especificado no existe.');
  }

  const players = database.players.filter((p) => p.teamId === teamId);
  return players.map((p) => ({ ...p }));
};


// ==========================================
// Funciones asignadas a Manuel (Mutaciones / CRUD)
// ==========================================

/**
 * Crea un nuevo jugador validando las reglas de negocio del torneo.
 * @param {Object} playerData - Datos del jugador a registrar.
 * @returns {Promise<Object>} Promesa que resuelve con una copia del jugador creado.
 */
export const createPlayer = async (playerData) => {
  if (!playerData || typeof playerData !== 'object') {
    throw new Error('Los datos del jugador son obligatorios.');
  }

  const { teamId, name, number, position, age, active = true } = playerData;

  // 1. Validar que el equipo exista
  if (!teamId || typeof teamId !== 'string') {
    throw new Error('El teamId es obligatorio.');
  }
  const teamExists = database.teams.some((team) => team.id === teamId);
  if (!teamExists) {
    throw new Error('El equipo especificado no existe.');
  }

  // 2. Validar nombre
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new Error('El nombre del jugador es obligatorio.');
  }

  // 3. Validar rango del dorsal (1 a 99)
  if (typeof number !== 'number' || !Number.isInteger(number) || number < 1 || number > 99) {
    throw new Error('El dorsal debe estar entre 1 y 99.');
  }

  // 4. Validar que no se repita el dorsal en el mismo equipo
  const dorsalExistente = database.players.some(
    (p) => p.teamId === teamId && p.number === number
  );
  if (dorsalExistente) {
    throw new Error('No pueden existir dos jugadores con el mismo dorsal dentro del mismo equipo.');
  }

  // 5. Validar posición reglamentaria
  if (!POSICIONES_PERMITIDAS.includes(position)) {
    throw new Error('La posición debe ser Portero, Defensa, Mediocampista o Delantero.');
  }

  // 6. Validar rango de edad (16 a 45)
  if (typeof age !== 'number' || !Number.isInteger(age) || age < 16 || age > 45) {
    throw new Error('La edad debe estar entre 16 y 45.');
  }

  // Generar ID único si no se suministra uno
  let finalId = playerData.id;
  if (!finalId) {
    const codeSuffix = teamId.replace(/^team-/, '');
    const numPadded = String(number).padStart(2, '0');
    finalId = `player-${codeSuffix}-${numPadded}`;

    if (database.players.some((p) => p.id === finalId)) {
      finalId = `${finalId}-${Date.now()}`;
    }
  } else {
    if (database.players.some((p) => p.id === finalId)) {
      throw new Error(`El id '${finalId}' ya está registrado.`);
    }
  }

  const newPlayer = {
    id: finalId,
    teamId,
    name: name.trim(),
    number,
    position,
    age,
    active: Boolean(active),
  };

  database.players.push(newPlayer);

  // Retornar copia para proteger los datos en memoria
  return { ...newPlayer };
};

/**
 * Actualiza los datos de un jugador existente garantizando la inmutabilidad del ID.
 * @param {string} playerId - ID del jugador a modificar.
 * @param {Object} changes - Campos a actualizar.
 * @returns {Promise<Object>} Promesa que resuelve con una copia del jugador actualizado.
 */
export const updatePlayer = async (playerId, changes) => {
  if (!playerId || typeof playerId !== 'string') {
    throw new Error('El ID del jugador es obligatorio.');
  }

  if (!changes || typeof changes !== 'object') {
    throw new Error('Los cambios deben ser un objeto.');
  }

  // 1. Validar existencia del jugador
  const playerIndex = database.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    throw new Error('El jugador no existe.');
  }

  const currentPlayer = database.players[playerIndex];

  // Validar equipo destino si se cambia
  const targetTeamId = changes.teamId !== undefined ? changes.teamId : currentPlayer.teamId;
  if (changes.teamId !== undefined) {
    const teamExists = database.teams.some((team) => team.id === targetTeamId);
    if (!teamExists) {
      throw new Error('El equipo especificado no existe.');
    }
  }

  // Validar dorsal si se cambia
  const targetNumber = changes.number !== undefined ? changes.number : currentPlayer.number;
  if (changes.number !== undefined) {
    if (
      typeof targetNumber !== 'number' ||
      !Number.isInteger(targetNumber) ||
      targetNumber < 1 ||
      targetNumber > 99
    ) {
      throw new Error('El dorsal debe estar entre 1 y 99.');
    }
  }

  // Validar unicidad del dorsal en el equipo destino (excluyendo al propio jugador)
  if (changes.teamId !== undefined || changes.number !== undefined) {
    const dorsalDuplicado = database.players.some(
      (p) => p.teamId === targetTeamId && p.number === targetNumber && p.id !== playerId
    );
    if (dorsalDuplicado) {
      throw new Error('No pueden existir dos jugadores con el mismo dorsal dentro del mismo equipo.');
    }
  }

  // Validar posición si se cambia
  if (changes.position !== undefined && !POSICIONES_PERMITIDAS.includes(changes.position)) {
    throw new Error('La posición debe ser Portero, Defensa, Mediocampista o Delantero.');
  }

  // Validar edad si se cambia
  if (changes.age !== undefined) {
    if (
      typeof changes.age !== 'number' ||
      !Number.isInteger(changes.age) ||
      changes.age < 16 ||
      changes.age > 45
    ) {
      throw new Error('La edad debe estar entre 16 y 45.');
    }
  }

  // Validar nombre si se cambia
  if (changes.name !== undefined) {
    if (typeof changes.name !== 'string' || !changes.name.trim()) {
      throw new Error('El nombre del jugador no puede estar vacío.');
    }
  }

  // Fusionar cambios manteniendo el ID original inmutable
  const updatedPlayer = {
    ...currentPlayer,
    ...changes,
    id: currentPlayer.id,
    name: changes.name !== undefined ? changes.name.trim() : currentPlayer.name,
  };

  database.players[playerIndex] = updatedPlayer;

  return { ...updatedPlayer };
};

/**
 * Elimina un jugador de la base de datos en memoria si no tiene goles registrados.
 * @param {string} playerId - ID del jugador a eliminar.
 * @returns {Promise<Object>} Promesa que resuelve con una copia del jugador eliminado.
 */
export const deletePlayer = async (playerId) => {
  if (!playerId || typeof playerId !== 'string') {
    throw new Error('El ID del jugador es obligatorio.');
  }

  // 1. Validar existencia del jugador
  const playerIndex = database.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    throw new Error('El jugador no existe.');
  }

  // 2. Validar que no tenga goles registrados en el torneo
  const tieneGoles = database.goals.some((goal) => goal.playerId === playerId);
  if (tieneGoles) {
    throw new Error('No puede eliminarse un jugador que tenga goles registrados.');
  }

  // 3. Eliminar de la base de datos en memoria
  const [deletedPlayer] = database.players.splice(playerIndex, 1);

  return { ...deletedPlayer };
};
