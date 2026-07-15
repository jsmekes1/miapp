# MLB Center

App para ver partidos, posiciones, equipos y análisis estadístico de la MLB en tiempo real. La hice porque me cansé de andar brincando entre varias páginas solo para ver cómo va la temporada.

**App:** https://miapp-rose.vercel.app
**Documento de planeación:** [PLANEACION.md](./PLANEACION.md)

## Qué hace

- Muestra los partidos de cualquier fecha, con marcador en vivo que se actualiza solo cada 30 segundos.
- Trae la tabla de posiciones de la Americana y la Nacional, por división.
- Deja explorar los equipos y ver el roster completo de cada uno.
- Tiene una pestaña de "Análisis" que compara a los dos equipos de un partido (récord, racha, cómo juegan de local/visita, últimos 10, diferencial de carreras, pitchers probables) **sin meter ninguna recomendación de apuesta**. Esto lo decidí a propósito: no quería que la app empujara a nadie a apostar combinado ni nada por el estilo.

## Con qué la hice

| Parte | Herramienta | Por qué |
|---|---|---|
| Frontend | HTML5, CSS3, JS puro | No hacía falta un framework para este tamaño de proyecto, así que lo dejé ligero. |
| Datos | [MLB Stats API](https://statsapi.mlb.com) | Es gratis, oficial, no pide llave de acceso y ya viene con CORS habilitado. |
| Repo | GitHub | Para llevar el historial de commits y que se note el proceso. |
| Deploy | Vercel | Conectado a GitHub, cada push a main se despliega solo. |
| Copiloto | Claude (IA) | Me ayudó a escribir y depurar código, y a ordenar esta documentación. |

## Prompts que usé con la IA (resumen)

1. Le pedí armar la app completa de MLB, ya conectada a Vercel, con alguna API de datos.
2. Le pedí una función de análisis de un partido con un formato específico (recomendación, confianza, razón, aviso).
3. Le pedí un generador de "parlays" combinando varios juegos — y aquí la IA me dijo que no quería construir esto porque podía fomentar apuestas de alto riesgo dentro de una app normal. En su lugar me propuso dos cosas: hacer el análisis por juego individual (sin combinar) en el chat, y meter una pestaña de comparación de stats dentro de la app, sin ninguna recomendación. Le dije que sí a las dos.
4. Le pedí construir esa pestaña de "Análisis" dentro de la app, con datos reales y sin ningún texto de apuesta.
5. Le pedí ayuda para armar esta documentación final (README y el documento de planeación).

## Autoevaluación

Lo que más me sirvió fue que la API de MLB Stats no pide autenticación y ya soporta CORS, así que pude conectar todo directo desde el navegador sin dolores de cabeza. Lo de Vercel conectado a GitHub también ayudó un montón porque no tuve que tocar ningún servidor, solo hacer push y ya.

Dejé fuera a propósito cualquier recomendación de apuestas dentro de la app — preferí que fuera solo información útil y no algo que empuje a la gente a apostar. Tampoco tiene login ni datos de temporadas pasadas, quedó fuera del alcance que me planteé desde el inicio.

Si tuviera más tiempo, le metería estadísticas de bateo y pitcheo por jugador, algunos filtros por equipo o división, y unas pruebas básicas para los módulos que jalan datos de la API.

## Links

- Repo: https://github.com/jsmekes1/miapp
- App: https://miapp-rose.vercel.app
- Este archivo: README.md (en la raíz del repo)
