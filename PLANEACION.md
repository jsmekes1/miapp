# Documento de Planeación — MLB Center

## 1. Definición del problema y alcance

La verdad es que cuando quiero ver cómo va la temporada de MLB termino brincando entre tres o cuatro páginas: una para el marcador en vivo, otra para ver las posiciones, y a veces hasta apps de apuestas que están más pensadas para venderte un pick que para darte info clara. No hay algo simple, gratis y directo donde solo veas los partidos del día, la tabla y algo de contexto de los equipos sin que te estén empujando a apostar.

Este proyecto es para ese aficionado casual (o no tan casual) que solo quiere abrir algo rápido, ver qué partidos hay hoy, cómo va su equipo en la tabla, y de paso comparar un poco a los dos equipos que van a jugar, sin necesidad de crear cuenta ni pagar nada.

**Qué sí incluye la app:**
- Partidos por fecha (marcador en vivo, programado o ya terminado) con datos reales.
- Tabla de posiciones de la Americana y la Nacional, por división.
- Equipos con su roster completo (puedes abrir cualquier equipo y ver la plantilla).
- Una sección de "Análisis" que compara a los dos equipos de un partido con datos objetivos: récord, racha, cómo juegan de local/visita, últimos 10 juegos, diferencial de carreras y quién probablemente va a pitchear.

**Qué decidí dejar fuera (a propósito):**
- Nada de recomendaciones de apuesta, picks o "parlays" dentro de la app. Esto lo pensé bastante: meter ese tipo de contenido en una app de uso general se siente como estar empujando a la gente a apostar combinado, y no quería que la herramienta funcionara así.
- Cuentas de usuario o login, no hacía falta para lo que quería lograr.
- Estadísticas de temporadas pasadas, solo la actual.
- Video o audio en vivo, eso ya es otro nivel de proyecto.

## 2. Descomposición en etapas

**Etapa 0 — Dejar todo listo (checkpoint: repo en GitHub conectado a Vercel)**
Crear el repositorio y conectarlo a Vercel para que cada vez que suba algo a main se despliegue solo.

**Etapa 1 — Partidos (checkpoint: la pestaña de Partidos ya jala datos reales)**
Armar el HTML/CSS base con las pestañas de navegación, conectar la API de MLB Stats para traer el calendario por fecha, y que se vea el marcador con su estado (en vivo, programado, final). Los juegos en vivo se refrescan solos cada 30 segundos.

**Etapa 2 — Posiciones y Equipos (checkpoint: ambas pestañas muestran info real)**
Aquí ya reuso la misma conexión a la API de la etapa anterior, solo que ahora pido el endpoint de standings para la tabla, y el de equipos/roster para poder abrir la plantilla de cada uno en un modal.

**Etapa 3 — Análisis (checkpoint: comparación de equipos sin ninguna recomendación)**
Esta depende de que ya funcionen las etapas 1 y 2, porque reutiliza esos mismos datos (calendario y standings) para armar la comparación. Aquí fue donde más cuidé que no se colara ningún texto tipo "apuesta a X equipo", solo datos duros.

**Etapa 4 — Que se vea bien y quede desplegado (checkpoint: app pública y accesible)**
Ajustar colores y estilo (usé la paleta típica de MLB: azul marino, rojo, dorado), revisar que no se rompa en pantallas chicas, y confirmar que cada commit a main sí dispara un deploy nuevo en Vercel.

**Etapa 5 — Documentación (checkpoint: README y este documento listos)**
Escribir el README con el stack, los prompts que usé con la IA, y una autoevaluación honesta. Y por último, juntar los links para entregar.

## 3. Lógica algorítmica (pseudocódigo)

```
ESTADO_GLOBAL:
  fechaSeleccionada = hoy
  listaPartidos = []
  standings = {}
  equipos = []
  tabActiva = "partidos"

AL_CARGAR_PAGINA():
  activar_tab("partidos")
  cargarPartidos(fechaSeleccionada)

FUNCION cargarPartidos(fecha):
  respuesta = GET statsapi.mlb.com/schedule?date=fecha
  listaPartidos = respuesta.dates[0].games
  renderizarPartidos(listaPartidos)
  SI existe algún juego "en vivo":
    programar_actualizacion(30 segundos, cargarPartidos, fecha)

FUNCION cambiarFecha(nuevaFecha):
  fechaSeleccionada = nuevaFecha
  cargarPartidos(fechaSeleccionada)

FUNCION cargarPosiciones():
  respuesta = GET statsapi.mlb.com/standings?leagueId=103,104
  standings = agrupar_por_division(respuesta)
  renderizarTablaPosiciones(standings)

FUNCION cargarEquipos():
  equipos = GET statsapi.mlb.com/teams
  renderizarListaEquipos(equipos)

FUNCION mostrarRoster(equipoId):
  roster = GET statsapi.mlb.com/teams/equipoId/roster
  abrirModal(roster)

FUNCION cargarAnalisis(fechaSeleccionada):
  juegos = listaPartidos  // los mismos que ya cargué antes
  PARA cada juego EN juegos:
    statsLocal = obtenerStatsEquipo(juego.equipoLocal, standings)
    statsVisita = obtenerStatsEquipo(juego.equipoVisita, standings)
    tarjeta = construirTarjetaComparativa(statsLocal, statsVisita, juego.pitcherProbable)
    // ojo: la tarjeta solo trae datos, nunca un "te recomiendo esto"
  renderizarAnalisis(tarjetas)

FUNCION cambiarTab(nombreTab):
  tabActiva = nombreTab
  SI nombreTab == "analisis": cargarAnalisis(fechaSeleccionada)
  SI nombreTab == "posiciones": cargarPosiciones()
  SI nombreTab == "equipos": cargarEquipos()
```

**Cómo fluye todo, en resumen:** abres la app, te cae directo en Partidos, de ahí puedes cambiar de fecha o brincar a otra pestaña, y cada pestaña jala sus propios datos de la API para pintarlos en tarjetas o tablas. Si hay un juego en vivo, se sigue actualizando solo cada 30 segundos sin que tengas que recargar nada.

## 4. Selección y justificación de herramientas

| Herramienta | Para qué la usé | Por qué la elegí |
|---|---|---|
| HTML5 / CSS3 / JS puro | Todo el frontend | No necesitaba un framework para esto, así que preferí mantenerlo ligero y sin dependencias extra que solo complicarían las cosas. |
| MLB Stats API | De aquí sale toda la info | Es la API oficial, es gratis, no pide llave de acceso, y ya trae CORS habilitado, así que fue fácil conectarla directo desde el navegador. |
| GitHub | Guardar el código y llevar el historial | Es donde normalmente se trabaja en la industria y me sirve para que se vea todo el proceso de commits, no solo el resultado final. |
| Vercel | Publicar la app | Se conecta directo con GitHub, entonces cada vez que subo algo a main se despliega solo, sin tener que tocar ningún servidor. |
| Claude (IA) | Me ayudó a programar y a redactar | Lo usé como copiloto para escribir y depurar el código, y también para ayudarme a poner en orden esta documentación. |

## 5. Criterios de éxito

- Que la pestaña de Partidos muestre bien los juegos de una fecha, con marcador y estado correctos, y que se pueda verificar contra la fuente oficial.
- Que los juegos en vivo se actualicen solos sin que tenga que recargar la página.
- Que Posiciones refleje el orden real de las divisiones en el momento que se consulte.
- Que en Equipos pueda abrir cualquier equipo y ver su roster completo sin bugs.
- Que Análisis muestre, para cada partido, una comparación completa de datos (récord, racha, splits, últimos 10, diferencial de carreras, pitcher probable) y que en ningún lado se cuele una recomendación de apuesta.
- Que el repo sea público y se note el proceso con varios commits, no uno solo gigante.
- Que la app esté viva en Vercel y accesible para cualquiera.
- Que el README explique el stack, los prompts que usé y traiga una autoevaluación real, no de relleno.
