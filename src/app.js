// src/app.js
import {
  createGoal,
  listGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  calculateTopScorers
} from "./services/tournament.js";

console.log("=== PRUEBA 1: Registrar goles válidos ===");
const gol1 = createGoal({ playerId: 101, matchId: 1001, minute: 23 });
console.log("Gol registrado:", gol1);

const gol2 = createGoal({ playerId: 103, matchId: 1001, minute: 45 });
console.log("Gol registrado:", gol2);

const gol3 = createGoal({ playerId: 105, matchId: 1002, minute: 67 });
console.log("Gol registrado:", gol3);

console.log("\n=== PRUEBA 2: Jugador de otro equipo ===");
try {
  createGoal({ playerId: 105, matchId: 1001, minute: 10 });
} catch (e) {
  console.error("Error esperado:", e.message);
}

console.log("\n=== PRUEBA 3: Partido finalizado ===");
try {
  createGoal({ playerId: 101, matchId: 1003, minute: 55 });
} catch (e) {
  console.error("Error esperado:", e.message);
}

console.log("\n=== PRUEBA 4: Minuto inválido ===");
try {
  createGoal({ playerId: 102, matchId: 1001, minute: 200 });
} catch (e) {
  console.error("Error esperado:", e.message);
}

console.log("\n=== PRUEBA 5: Listar todos los goles ===");
console.log(listGoals());

console.log("\n=== PRUEBA 5b: Gol por ID ===");
console.log(getGoalById(1));

console.log("\n=== PRUEBA 6: Tabla de goleadores ===");
console.table(calculateTopScorers());

console.log("\n=== PRUEBA 7: Actualizar gol ===");
console.log(updateGoal(1, { minute: 88 }));

console.log("\n=== PRUEBA 8: Eliminar gol ===");
console.log(deleteGoal(2));

console.log("\n=== GOLES FINALES ===");
console.log(listGoals());






// Importamos tu servicio lógico y tu vista  

// ===========================================================
// PRUEBAS PAREJA 3 — JOSE (Seleccion y limpieza, ensamblaje, fila de resumen, exploracion del DOM)
// ===========================================================

import { listPlayers } from './services/players.js';
import { renderPlayersView } from './views/players.js';
import { setupPlayerEvents } from './events/playersEvents.js';
import './components/players/playerCard.js';

// Función principal de inicialización
const initApp = async () => {
  try {
    // 1. Obtenemos los datos lógicos (Promesa)
    const players = await listPlayers();
    
    // 2. Ejecutamos tu función para pintar el DOM
    renderPlayersView(players);
    
    // 3. Configurar eventos de Manuel (Reto 3)
    setupPlayerEvents(renderPlayersView);

  } catch (error) {
    console.error("Error inicializando la app:", error);
  }
};

// Iniciar la aplicación
initApp();

// ===========================================================
// RETO 5 — NICOLAS Y FABIAN (Timeline de goles y goleadores)
// ===========================================================
import { domClass } from "./views/goals.js";

console.log("\n========================================");
console.log("=== RETO 5: Render de goles y goleadores ===");
console.log("========================================");

domClass.renderApplication().then((resumen) => {
  console.log("Interfaz de goles renderizada:", resumen);
});

// ===========================================================
// PRUEBAS PAREJA 3 — MANUEL (Filtrados, Actualización, Borrado)
// ===========================================================
import {
  getPlayersByTeam,
  updatePlayer,
  deletePlayer
} from "./services/players.js";

console.log("\n========================================");
console.log("=== PRUEBAS PAREJA 3 — MANUEL ===");
console.log("========================================");

// --- PRUEBA M1: Filtrar jugadores por equipo (Argentina, id=1) ---
console.log("\n=== PRUEBA M1: Filtrar jugadores del equipo Argentina (id=1) ===");
getPlayersByTeam(1)
  .then(players => {
    console.log("✅ Jugadores de Argentina:", players);
  })
  .catch(err => console.error("❌ Error:", err.message));

// --- PRUEBA M2: Filtrar jugadores de un equipo inexistente ---
console.log("\n=== PRUEBA M2: Equipo inexistente (id=999) ===");
getPlayersByTeam(999)
  .then(players => console.log("❌ Debería haber fallado:", players))
  .catch(err => console.error("✅ Error esperado:", err.message));

// --- PRUEBA M3: Actualizar la posición de un jugador ---
console.log("\n=== PRUEBA M3: Cambiar posición de Messi (101) a Mediocampista ===");
updatePlayer(101, { position: "Mediocampista" })
  .then(player => console.log("✅ Jugador actualizado:", player))
  .catch(err => console.error("❌ Error:", err.message));

// --- PRUEBA M4: Intentar actualizar con posición inválida ---
console.log("\n=== PRUEBA M4: Posición inválida 'Arquero' ===");
updatePlayer(102, { position: "Arquero" })
  .then(player => console.log("❌ Debería haber fallado:", player))
  .catch(err => console.error("✅ Error esperado:", err.message));

// --- PRUEBA M5: Intentar poner un dorsal que ya existe en el equipo ---
console.log("\n=== PRUEBA M5: Dorsal duplicado (poner dorsal 9 a Messi, que ya lo tiene Álvarez) ===");
updatePlayer(101, { dorsal: 9 })
  .then(player => console.log("❌ Debería haber fallado:", player))
  .catch(err => console.error("✅ Error esperado:", err.message));

// --- PRUEBA M6: Intentar borrar jugador con goles (Luis Díaz / Messi tienen goles por las pruebas de arriba) ---
console.log("\n=== PRUEBA M6: Borrar jugador con goles registrados (Messi, id=101) ===");
deletePlayer(101)
  .then(player => console.log("❌ Debería haber fallado:", player))
  .catch(err => console.error("✅ Error esperado:", err.message));

// --- PRUEBA M7: Borrar jugador SIN goles (Havertz, id=108) ---
console.log("\n=== PRUEBA M7: Borrar jugador sin goles (Havertz, id=108) ===");
deletePlayer(108)
  .then(player => {
    console.log("✅ Jugador eliminado:", player);
    // Verificar que ya no existe
    getPlayersByTeam(4)
      .then(players => console.log("   Jugadores restantes en Alemania:", players));
  })
  .catch(err => console.error("❌ Error:", err.message));

// --- PRUEBA M8: Intentar actualizar edad fuera de rango ---
console.log("\n=== PRUEBA M8: Edad inválida (edad=50) ===");
updatePlayer(102, { age: 50 })
  .then(player => console.log("❌ Debería haber fallado:", player))
  .catch(err => console.error("✅ Error esperado:", err.message));


// =========================
// EQUIPOS - PRUEBAS PAREJA 2
// =========================

import {
    listTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam
} from "./services/teams.js";

try {

    await createTeam({
        id: "team-100",
        name: "Colombia",
        code: "COL",
        groupId: "group-a",
        coach: "Néstor Lorenzo"
    });

    console.log(await listTeams());

    console.log(await getTeamById("team-100"));

    await updateTeam("team-100", {
        coach: "Pep Guardiola",
        name: "Colombia FC"
    });

    console.log(await getTeamById("team-100"));

    await deleteTeam("team-100");

} catch (error) {

    console.error(error.message);

}

import { renderTeamsView } from "./views/teams.js";

renderTeamsView()
    .then(result => {
        console.log("Equipos renderizados:", result);
    })
    .catch(error => {
        console.error("Error:", error.message);
    });