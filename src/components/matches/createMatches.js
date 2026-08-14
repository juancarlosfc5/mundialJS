import { postMatch } from '../../api/matchesApi.js';

// Valida y construye el objeto antes de enviarlo con el método POST.
export async function crearPartido(datos) {
  const camposObligatorios = ['matchNumber', 'groupId', 'homeTeamId', 'awayTeamId', 'date', 'kickoffTimeET', 'venue'];

  for (const campo of camposObligatorios) {
    if (datos[campo] === undefined || datos[campo] === '') {
      throw new Error(`El campo "${campo}" es obligatorio para crear un partido.`);
    }
  }

  if (datos.homeTeamId === datos.awayTeamId) {
    throw new Error('El equipo local y el visitante deben ser diferentes.');
  }

  const partido = {
    id: `match-${String(datos.matchNumber).padStart(2, '0')}`,
    matchNumber: Number(datos.matchNumber),
    groupId: datos.groupId,
    homeTeamId: datos.homeTeamId,
    awayTeamId: datos.awayTeamId,
    date: datos.date,
    kickoffTimeET: datos.kickoffTimeET,
    venue: datos.venue,
    status: datos.status || 'scheduled',
  };

  return await postMatch(partido);
}
