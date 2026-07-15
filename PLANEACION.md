# Documento de Planeación — MLB Center

## 1. Definición del problema y alcance

**Problema real:** Los aficionados al béisbol de las Grandes Ligas (MLB) que quieren seguir la temporada actual deben revisar múltiples sitios (ESPN, MLB.com, apps de apuestas) para ver marcadores en vivo, posiciones de división y estadísticas de equipos. No existe un lugar único, simple y gratuito que combine partidos del día, tabla de posiciones y comparación estadística de equipos sin exponer al usuario a contenido de apuestas o publicidad invasiva.

**Usuarios afectados:** Aficionados casuales y avanzados de MLB que quieren revisar rápidamente resultados, calendario y contexto estadístico de los equipos que enfrentan, sin crear una cuenta ni pagar.

**Alcance — Qué incluye la app:**
- Consulta de partidos por fecha (marcador en vivo, programado o finalizado) usando datos oficiales en tiempo real.
- Tabla de posiciones de la Liga Americana y Nacional por división.
- Listado de equipos con acceso a su roster (plantilla de jugadores).
- Sección de "Análisis" con comparación estadística neutral entre los dos equipos de un partido (récord, racha, desempeño en casa/visitante, últimos 10 juegos, diferencial de carreras, pitchers probables).

**Qué queda fuera del proyecto (explícitamente):**
- Cualquier recomendación de apuesta, pick, "parlay" o pronóstico embebido en la interfaz de la app. Se decidió excluir esto de forma consciente por el riesgo de normalizar apuestas combinadas dentro de un producto de uso general.
- Registro de usuarios, autenticación o perfiles personalizados.
- Estadísticas históricas de temporadas pasadas (solo temporada en curso).
- Transmisión de video o audio en vivo.

## 2. Descomposición en etapas

**Etapa 0 — Preparación (checkpoint: repo creado y conectado a Vercel)**
- Crear repositorio en GitHub.
- Conectar el repositorio a un proyecto de Vercel para despliegue continuo en cada commit a la rama main.

**Etapa 1 — Estructura base y datos de partidos (checkpoint: pestaña "Partidos" funcional)**
- Maquetar HTML/CSS base con navegación por pestañas.
- Integrar la API pública de MLB Stats (statsapi.mlb.com) para obtener el calendario de partidos por fecha.
- Mostrar marcador, estado del partido (en vivo/programado/final) y actualización automática cada 30 segundos para juegos en vivo.
- Dependencia: ninguna etapa previa de datos, es la base de la app.

**Etapa 2 — Posiciones y equipos (checkpoint: pestañas "Posiciones" y "Equipos" muestran datos reales)**
- Consumir el endpoint de standings para mostrar tabla por división y liga.
- Consumir el endpoint de equipos y roster para mostrar plantillas en un modal.
- Dependencia: reutiliza el mismo módulo de conexión a la API construido en la Etapa 1.

**Etapa 3 — Análisis estadístico neutral (checkpoint: pestaña "Análisis" muestra comparación de dos equipos sin recomendaciones)**
- Diseñar la lógica de comparación (récord, racha, splits casa/visitante, últimos 10, diferencial de carreras, pitcher probable).
- Vincular esta pestaña a la fecha/partido seleccionado en "Partidos".
- Validación explícita de que NO se incluye ningún texto de recomendación o apuesta, solo datos objetivos.
- Dependencia: requiere que la Etapa 1 (calendario) y Etapa 2 (standings) ya estén funcionando, porque reutiliza esos datos.

**Etapa 4 — Pulido visual y despliegue final (checkpoint: app desplegada y accesible públicamente)**
- Aplicar tema visual consistente (paleta MLB: azul marino, rojo, dorado).
- Verificar responsividad básica.
- Confirmar que cada commit a main dispara un nuevo despliegue "Ready" en Vercel.

**Etapa 5 — Documentación (checkpoint: repositorio con README.md y este documento de planeación)**
- Redactar README.md con stack, prompts usados y autoevaluación.
- Publicar enlaces finales: repositorio, app desplegada, README.

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
  juegos = listaPartidos  // reutiliza los partidos ya cargados
  PARA cada juego EN juegos:
    statsLocal = obtenerStatsEquipo(juego.equipoLocal, standings)
    statsVisita = obtenerStatsEquipo(juego.equipoVisita, standings)
    tarjeta = construirTarjetaComparativa(statsLocal, statsVisita, juego.pitcherProbable)
    // La tarjeta SOLO contiene datos objetivos, nunca una recomendación
  renderizarAnalisis(tarjetas)

FUNCION cambiarTab(nombreTab):
  tabActiva = nombreTab
  SI nombreTab == "analisis": cargarAnalisis(fechaSeleccionada)
  SI nombreTab == "posiciones": cargarPosiciones()
  SI nombreTab == "equipos": cargarEquipos()
```

**Diagrama de flujo (resumen textual):**
Usuario abre la app → se carga la pestaña "Partidos" por defecto → usuario puede cambiar de fecha o de pestaña → cada pestaña dispara su propia función de carga de datos desde la API → los datos se transforman y se pintan en tarjetas/tablas → si hay un juego en vivo, se repite la consulta cada 30 segundos.

## 4. Selección y justificación de herramientas

| Herramienta | Rol en el proyecto | Justificación |
|---|---|---|
| HTML5 / CSS3 / JavaScript vanilla | Frontend completo | Proyecto de complejidad media que no requiere un framework; reduce dependencias, tiempo de configuración y peso de la app. |
| MLB Stats API (statsapi.mlb.com) | Fuente de datos | API pública, gratuita, sin necesidad de llave de acceso (API key), con soporte CORS y datos oficiales en tiempo real de calendario, posiciones y rosters. |
| GitHub | Control de versiones y repositorio | Estándar de la industria, permite documentar el historial de commits como evidencia del proceso de desarrollo, además de alojar el README. |
| Vercel | Despliegue continuo | Se integra directamente con GitHub: cada commit a la rama main dispara un nuevo despliegue automático, sin configuración de servidor. |
| Asistente de IA (Claude) | Copiloto de desarrollo | Se usó como apoyo para generar y depurar código HTML/CSS/JS, así como para redactar la documentación, siguiendo un flujo de prompts iterativo documentado en el README. |

## 5. Criterios de éxito

- La pestaña "Partidos" muestra correctamente los juegos de una fecha dada, incluyendo marcador y estado, con datos reales verificables contra la fuente oficial.
- Los juegos marcados "en vivo" actualizan su marcador automáticamente sin recargar la página.
- La pestaña "Posiciones" refleja el orden real de las divisiones de la Liga Americana y Nacional al momento de la consulta.
- La pestaña "Equipos" permite ver el roster completo de cualquier equipo mediante un modal funcional.
- La pestaña "Análisis" muestra, para cada partido del día seleccionado, una comparación estadística completa (récord, racha, splits, últimos 10, diferencial de carreras, pitcher probable) sin incluir ningún texto de recomendación de apuesta.
- El repositorio de GitHub es público y refleja un historial de commits incremental (no un solo commit monolítico).
- La aplicación está desplegada en un dominio de Vercel accesible públicamente y en estado "Ready".
- El archivo README.md documenta el stack, los prompts principales usados con la IA y una autoevaluación honesta.
