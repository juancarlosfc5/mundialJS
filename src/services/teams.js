import { db } from "../database.js";

// Expresión regular para validar el código del equipo
const TEAM_CODE_REGEX = /^[A-Z]{3}$/;

// =========================
// LISTAR EQUIPOS
// =========================
export const listTeams = async () => {
    return db.teams.map(team => ({ ...team }));
};

// =========================
// OBTENER EQUIPO POR ID
// =========================
export const getTeamById = async (teamId) => {

    const team = db.teams.find(
        team => team.id === teamId
    );

    if (!team) {
        throw new Error("El equipo no existe.");
    }

    return { ...team };

};

// =========================
// CREAR EQUIPO
// =========================
export const createTeam = async (teamData) => {

    const {
        id,
        name,
        code,
        groupId,
        coach
    } = teamData;

    // Validar campos obligatorios
    if (!id || !name || !code || !groupId || !coach) {
        throw new Error("Todos los campos son obligatorios.");
    }

    // Limpiar espacios
    const cleanName = name.trim();
    const cleanCode = code.trim();

    // Validar id único
    const idExists = db.teams.some(
        team => team.id === id
    );

    if (idExists) {
        throw new Error("El id ya existe.");
    }

    // Validar grupo
    const groupExists = db.groups.some(
        group => group.id === groupId
    );

    if (!groupExists) {
        throw new Error("El grupo no existe.");
    }

    // Validar código
    if (!TEAM_CODE_REGEX.test(cleanCode)) {
        throw new Error("El código debe tener exactamente tres letras mayúsculas.");
    }

    // Validar código repetido
    const codeExists = db.teams.some(
        team => team.code === cleanCode
    );

    if (codeExists) {
        throw new Error("El código ya existe.");
    }

    // Validar nombre repetido
    const nameExists = db.teams.some(
        team => team.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (nameExists) {
        throw new Error("El nombre ya existe.");
    }

    const newTeam = {
        id,
        name: cleanName,
        code: cleanCode,
        groupId,
        coach
    };

    db.teams.push(newTeam);

    return { ...newTeam };

};

// =========================
// ACTUALIZAR EQUIPO
// =========================
export const updateTeam = async (teamId, changes) => {

    const index = db.teams.findIndex(
        team => team.id === teamId
    );

    if (index === -1) {
        throw new Error("El equipo no existe.");
    }

    // No permitir modificar el id
    const { id, ...safeChanges } = changes;

    // Validar grupo
    if (safeChanges.groupId) {

        const groupExists = db.groups.some(
            group => group.id === safeChanges.groupId
        );

        if (!groupExists) {
            throw new Error("El grupo no existe.");
        }

    }

    // Validar código
    if (safeChanges.code) {

        safeChanges.code = safeChanges.code.trim();

        if (!TEAM_CODE_REGEX.test(safeChanges.code)) {
            throw new Error("El código debe tener exactamente tres letras mayúsculas.");
        }

        const codeExists = db.teams.some(
            team =>
                team.code === safeChanges.code &&
                team.id !== teamId
        );

        if (codeExists) {
            throw new Error("El código ya existe.");
        }

    }

    // Validar nombre
    if (safeChanges.name) {

        safeChanges.name = safeChanges.name.trim();

        const nameExists = db.teams.some(
            team =>
                team.name.toLowerCase() === safeChanges.name.toLowerCase() &&
                team.id !== teamId
        );

        if (nameExists) {
            throw new Error("El nombre ya existe.");
        }

    }

    db.teams[index] = {
        ...db.teams[index],
        ...safeChanges
    };

    return { ...db.teams[index] };

};

// =========================
// ELIMINAR EQUIPO
// =========================
export const deleteTeam = async (teamId) => {

    const index = db.teams.findIndex(
        team => team.id === teamId
    );

    if (index === -1) {
        throw new Error("El equipo no existe.");
    }

    // Verificar jugadores
    const hasPlayers = db.players.some(
        player => player.teamId === teamId
    );

    if (hasPlayers) {
        throw new Error("No se puede eliminar porque tiene jugadores asociados.");
    }

    // Verificar partidos
    const hasMatches = db.matches.some(
        match =>
            match.homeTeamId === teamId ||
            match.awayTeamId === teamId
    );

    if (hasMatches) {
        throw new Error("No se puede eliminar porque tiene partidos asociados.");
    }

    const deletedTeam = db.teams.splice(index, 1);

    return { ...deletedTeam[0] };

};