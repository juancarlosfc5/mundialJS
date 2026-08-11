# Funciones para crear partidos

El archivo `src/js/pages/matches.js` contiene tres maneras equivalentes de construir un objeto compatible con cada elemento del arreglo `matches` de `db.json`:

- `crearPartido(datos)`: declaración tradicional con `function`.
- `crearPartidoFlecha(datos)`: función flecha.
- `crearPartidoAsincronico(datos, guardarPartido)`: función asíncrona, útil cuando el guardado se haga mediante una API.

Todas validan los campos necesarios, generan el `id` con el formato `match-XX` y asignan `status: "scheduled"` cuando no se indica otro estado. No modifican `db.json`; devuelven el objeto que se guardaría allí. La versión asíncrona recibe opcionalmente una función `guardarPartido` para representar ese guardado.

## Ejecutar las pruebas de ejemplo

Desde la raíz del proyecto ejecuta:

```powershell
node .\src\js\pages\matches.js
```

La consola mostrará tres partidos de prueba, uno por cada estilo de función. Usan identificadores que ya están presentes en `db.json` (`group-a`, `team-mex` y `team-kor`) y los números 73, 74 y 75, que no chocan con los 72 partidos actuales.

Después verifica que el proyecto se empaqueta correctamente:

```powershell
npm run build
```

## Importación en la aplicación

La lógica de la página de partidos está separada en `src/js/pages/matches.js`, mientras que los eventos del modal y el formulario están en `src/js/services/matchesService.js`.
