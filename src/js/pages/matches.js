/** Crea objetos con la estructura del arreglo `matches` de db.json. */
function validarDatosDelPartido(datos) {
  const camposObligatorios = [
    "matchNumber",
    "groupId",
    "homeTeamId",
    "awayTeamId",
    "date",
    "kickoffTimeET",
    "venue",
  ];

  for (const campo of camposObligatorios) {
    if (datos[campo] === undefined || datos[campo] === "") {
      throw new Error(
        `El campo "${campo}" es obligatorio para crear un partido.`,
      );
    }
  }

  if (datos.homeTeamId === datos.awayTeamId) {
    throw new Error("El equipo local y el visitante deben ser diferentes.");
  }
}

function construirPartido(datos) {
  validarDatosDelPartido(datos);

  return {
    id: `match-${String(datos.matchNumber).padStart(2, "0")}`,
    matchNumber: datos.matchNumber,
    groupId: datos.groupId,
    homeTeamId: datos.homeTeamId,
    awayTeamId: datos.awayTeamId,
    date: datos.date,
    kickoffTimeET: datos.kickoffTimeET,
    venue: datos.venue,
    status: datos.status ?? "scheduled",
  };
}

//Declaración de funciones

// Función declarada con function
export function crearPartido(datos) {
  return construirPartido(datos);
}

// Función flecha
export const crearPartidoFlecha = (datos) => construirPartido(datos);

// Función asincrónica
export async function crearPartidoAsincronico(datos, guardarPartido) {
  const partido = construirPartido(datos);
  return guardarPartido
    ? await Promise.resolve(guardarPartido(partido))
    : partido;
}

// Datos de prueba que se ejecutan únicamente con Node, no al importar este módulo en el navegador.
const seEjecutaConNode =
  typeof process !== "undefined" && Boolean(process.versions?.node);

if (seEjecutaConNode) {
  const partidoDePrueba = {
    matchNumber: 73,
    groupId: "group-a",
    homeTeamId: "team-mex",
    awayTeamId: "team-kor",
    date: "2026-06-28",
    kickoffTimeET: "19:00",
    venue: "Ciudad de México",
  };

  console.log(
    "1. Función declarada con function:",
    crearPartido(partidoDePrueba), // Instancia de la función declarada con function
  );
  console.log(
    "2. Función flecha:",
    crearPartidoFlecha({ ...partidoDePrueba, matchNumber: 74 }), // Instancia de la función flecha
  );
  console.log(
    "3. Función asincrónica:",
    await crearPartidoAsincronico(
      { ...partidoDePrueba, matchNumber: 75 },
      async (partido) => partido,
    ), // Instancia de la función asincrónica
  );
}
