// src/services/players.js
import { db } from "../database.js";

// ─── CONSTANTES DE VALIDACIÓN ─────────────────────────────
const POSICIONES_VALIDAS = ["Portero", "Defensa", "Mediocampista", "Delantero"];
const DORSAL_MIN = 1;
const DORSAL_MAX = 99;
const EDAD_MIN = 16;
const EDAD_MAX = 45;

// ===========================================================
// INTEGRANTE 1 — JOSÉ (Creación y Lectura base)
// ===========================================================

/**
 * Retorna una copia de todos los jugadores.
 */
export const listPlayers = () => {
  return new Promise((resolve) => {
    // Mapeamos para retornar copias exactas y no las referencias originales
    resolve(db.players.map(p => ({ ...p })));
  });
};

/**
 * Busca un jugador por su ID.
 */
export const getPlayerById = (playerId) => {
  return new Promise((resolve, reject) => {
    const player = db.players.find(p => p.id === playerId);
    
    if (!player) {
        return reject(new Error(`Jugador con id ${playerId} no existe`));
    }
    
    // Retornamos una copia del jugador encontrado
    resolve({ ...player });
  });
};

/**
 * Crea un jugador nuevo con todas las validaciones.
 */
export const createPlayer = (playerData) => {
  return new Promise((resolve, reject) => {
    const { name, teamId, dorsal, position, age } = playerData;

    // 1. Validar que el equipo exista en db.teams
    const teamExists = db.teams.some(t => t.id === teamId);
    if (!teamExists) {
      return reject(new Error(`El equipo con id ${teamId} no existe`));
    }

    // 2. Validar edad usando las constantes de Manuel
    if (typeof age !== 'number' || age < EDAD_MIN || age > EDAD_MAX) {
      return reject(new Error(`La edad debe estar entre ${EDAD_MIN} y ${EDAD_MAX}`));
    }

    // 3. Validar posición usando el arreglo de Manuel
    if (!POSICIONES_VALIDAS.includes(position)) {
      return reject(new Error(`La posición debe ser una de: ${POSICIONES_VALIDAS.join(", ")}`));
    }

    // 4. Validar dorsal (rango) usando las constantes
    if (typeof dorsal !== 'number' || dorsal < DORSAL_MIN || dorsal > DORSAL_MAX) {
      return reject(new Error(`El dorsal debe estar entre ${DORSAL_MIN} y ${DORSAL_MAX}`));
    }

    // 5. Validar que el dorsal no esté repetido en el mismo equipo
    const dorsalDuplicado = db.players.some(
      p => p.teamId === teamId && p.dorsal === dorsal
    );
    if (dorsalDuplicado) {
      return reject(new Error(`Ya existe un jugador con dorsal ${dorsal} en el equipo ${teamId}`));
    }

    // 6. Si pasa todas las validaciones, construimos el nuevo jugador
    const newPlayer = {
      id: `player-${Date.now()}`, // ID único
      name,
      teamId,
      dorsal,
      position,
      age
    };

    // Insertar en la base de datos
    db.players.push(newPlayer);

    // Retornar la copia del objeto recién creado
    resolve({ ...newPlayer });
  });
};

// ===========================================================
// INTEGRANTE 2 — MANUEL (Filtrados, Actualización y Borrado)
// ===========================================================

/**
 * Retorna los jugadores que pertenecen a un equipo específico.
 * Valida que el equipo exista antes de filtrar.
 */
export const getPlayersByTeam = (teamId) => {
  return new Promise((resolve, reject) => {
    // Validar que el equipo exista
    const teamExists = db.teams.some(t => t.id === teamId);
    if (!teamExists) {
      return reject(new Error(`El equipo con id ${teamId} no existe`));
    }

    // Filtrar jugadores de ese equipo y retornar copias
    const players = db.players
      .filter(p => p.teamId === teamId)
      .map(p => ({ ...p }));

    resolve(players);
  });
};

/**
 * Actualiza los datos de un jugador existente.
 * Si se cambian dorsal, posición o edad, aplica las mismas validaciones que createPlayer.
 * El id del jugador no puede ser modificado.
 */
export const updatePlayer = (playerId, changes) => {
  return new Promise((resolve, reject) => {
    // Buscar el jugador
    const index = db.players.findIndex(p => p.id === playerId);
    if (index === -1) {
      return reject(new Error(`Jugador con id ${playerId} no existe`));
    }

    const player = db.players[index];

    // No permitir cambiar el id
    if (changes.id !== undefined && changes.id !== player.id) {
      return reject(new Error("No se puede modificar el id del jugador"));
    }

    // Determinar los valores finales (lo que viene en changes o lo que ya tenía)
    const newTeamId = changes.teamId !== undefined ? changes.teamId : player.teamId;
    const newDorsal = changes.dorsal !== undefined ? changes.dorsal : player.dorsal;
    const newPosition = changes.position !== undefined ? changes.position : player.position;
    const newAge = changes.age !== undefined ? changes.age : player.age;

    // Validar teamId si se está cambiando
    if (changes.teamId !== undefined) {
      const teamExists = db.teams.some(t => t.id === newTeamId);
      if (!teamExists) {
        return reject(new Error(`El equipo con id ${newTeamId} no existe`));
      }
    }

    // Validar edad
    if (changes.age !== undefined) {
      if (newAge < EDAD_MIN || newAge > EDAD_MAX) {
        return reject(new Error(`La edad debe estar entre ${EDAD_MIN} y ${EDAD_MAX}`));
      }
    }

    // Validar posición
    if (changes.position !== undefined) {
      if (!POSICIONES_VALIDAS.includes(newPosition)) {
        return reject(new Error(`La posición debe ser una de: ${POSICIONES_VALIDAS.join(", ")}`));
      }
    }

    // Validar dorsal
    if (changes.dorsal !== undefined) {
      if (newDorsal < DORSAL_MIN || newDorsal > DORSAL_MAX) {
        return reject(new Error(`El dorsal debe estar entre ${DORSAL_MIN} y ${DORSAL_MAX}`));
      }

      // Verificar que no exista otro jugador en el mismo equipo con ese dorsal
      const dorsalDuplicado = db.players.some(
        p => p.teamId === newTeamId && p.dorsal === newDorsal && p.id !== playerId
      );
      if (dorsalDuplicado) {
        return reject(new Error(`Ya existe un jugador con dorsal ${newDorsal} en el equipo ${newTeamId}`));
      }
    }

    // Si también se cambia el equipo, verificar el dorsal en el nuevo equipo
    if (changes.teamId !== undefined && changes.dorsal === undefined) {
      const dorsalEnNuevoEquipo = db.players.some(
        p => p.teamId === newTeamId && p.dorsal === player.dorsal && p.id !== playerId
      );
      if (dorsalEnNuevoEquipo) {
        return reject(new Error(`Ya existe un jugador con dorsal ${player.dorsal} en el equipo ${newTeamId}`));
      }
    }

    // Aplicar los cambios (sin tocar el id)
    const { id, ...allowedChanges } = changes;
    db.players[index] = { ...player, ...allowedChanges };

    // Retornar copia del jugador actualizado
    resolve({ ...db.players[index] });
  });
};

/**
 * Elimina un jugador. No permite eliminarlo si tiene goles registrados.
 */
export const deletePlayer = (playerId) => {
  return new Promise((resolve, reject) => {
    // Buscar el jugador
    const index = db.players.findIndex(p => p.id === playerId);
    if (index === -1) {
      return reject(new Error(`Jugador con id ${playerId} no existe`));
    }

    // Validar que no tenga goles registrados
    const tieneGoles = db.goals.some(g => g.playerId === playerId);
    if (tieneGoles) {
      return reject(
        new Error(`No se puede eliminar al jugador ${playerId} porque tiene goles registrados`)
      );
    }

    // Eliminar el jugador del arreglo
    const [deleted] = db.players.splice(index, 1);

    // Retornar copia del jugador eliminado
    resolve({ ...deleted });
  });
};
