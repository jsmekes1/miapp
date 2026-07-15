# MLB Center

Aplicación web para consultar partidos, posiciones, equipos y análisis estadístico de las Grandes Ligas de Béisbol (MLB) en tiempo real.

**App desplegada:** https://miapp-rose.vercel.app
**Documento de planeación:** [PLANEACION.md](./PLANEACION.md)

## Descripción

MLB Center permite:
- Ver los partidos de cualquier fecha, con marcador en vivo y actualización automática cada 30 segundos.
- Consultar la tabla de posiciones de la Liga Americana y Nacional por división.
- Explorar los equipos y ver el roster (plantilla de jugadores) de cada uno.
- Revisar un "Análisis" estadístico neutral por partido (récord, racha, splits de casa/visitante, últimos 10 juegos, diferencial de carreras y pitchers probables), **sin recomendaciones de apuesta**. Esta decisión de diseño fue intencional: se evitó incluir picks o "parlays" dentro de la app para no promover apuestas combinadas a los usuarios.

## Stack técnico

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend | HTML5, CSS3, JavaScript (vanilla) | Suficiente para la complejidad del proyecto, sin dependencias ni build steps. |
| Datos | [MLB Stats API](https://statsapi.mlb.com) | API oficial, gratuita, sin API key, con soporte CORS. |
| Control de versiones | GitHub | Historial de commits como evidencia del proceso iterativo. |
| Despliegue | Vercel | Despliegue continuo automático en cada push a `main`. |
| Copiloto de desarrollo | Claude (Anthropic) | Generación y depuración de código, y redacción de documentación. |

## Prompts principales utilizados con la IA

A continuación, un resumen (no literal, con fines de documentación) de las instrucciones clave usadas durante el desarrollo:

1. Solicitud inicial para construir la app de MLB completa, conectada a Vercel, integrando una API de datos deportivos.
2. Solicitud de una función de análisis de un partido individual con formato específico (recomendación, nivel de confianza, razón y aviso de responsabilidad).
3. Solicitud de un generador de "parlays" (apuestas combinadas) — **esta funcionalidad fue rechazada intencionalmente** por el riesgo de fomentar apuestas de alto riesgo dentro de una app de uso general; en su lugar se propusieron dos alternativas: análisis individual (no combinado) en el chat, y una pestaña de comparación estadística neutral dentro de la app, sin recomendaciones.
4. Solicitud de construir e integrar la pestaña "Análisis" dentro de la aplicación, usando datos reales de la API y sin incluir ningún texto de recomendación de apuesta.
5. Solicitud de generar la documentación final del proyecto (este README y el documento de planeación).

## Autoevaluación

**Lo que funcionó bien:** la integración con la MLB Stats API fue directa gracias a su soporte de CORS y ausencia de autenticación, lo que permitió iterar rápido sobre las cuatro secciones de la app. El flujo de despliegue continuo con Vercel eliminó por completo la necesidad de configurar un servidor manualmente.

**Limitaciones y decisiones conscientes:** se decidió no incluir ninguna recomendación de apuestas dentro de la interfaz pública de la app, priorizando el uso responsable de datos deportivos por encima de una función "atractiva" pero potencialmente dañina. La app tampoco incluye autenticación de usuarios ni historial de temporadas anteriores, por quedar fuera del alcance definido en la etapa de planeación.

**Qué mejoraría con más tiempo:** agregar estadísticas individuales de bateo y pitcheo por jugador, filtros de búsqueda por equipo o división, y pruebas automatizadas básicas para los módulos de consumo de la API.

## Enlaces del proyecto

- Repositorio de GitHub: https://github.com/jsmekes1/miapp
- Aplicación desplegada: https://miapp-rose.vercel.app
- Este archivo: README.md (raíz del repositorio)
