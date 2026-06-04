# ROADMAP — Titicaca CleanTech

Plan de producto por versiones.

## V0 (MVP)

- Registrar reportes de residuos (formulario con fotos opcional).
- Listado y visualización de reportes.
- Autenticación básica (email) con Supabase.
- Panel administrativo mínimo para gestionar reportes y recompensas.
- Despliegue en Vercel, integración con Supabase.

## V1

- Geolocalización avanzada y mapa interactivo de reportes.
- Sistema de recompensas y tracking de puntos por usuario.
- Filtros y búsqueda avanzada en el listado de reportes.
- Notificaciones en tiempo real (Supabase Realtime o WebSockets).

## V2

- Integración con partners locales y dashboards analíticos.
- Workflows de validación y moderación de reportes.
- Internacionalización (i18n) y accesibilidad mejorada.

## Funcionalidades futuras (backlog)

- Módulo de estadísticas y KPIs para municipios.
- Integración con sistemas de gestión de residuos.
- Apps móviles dedicadas o PWA avanzada.

## Guía: Coordinación con asistentes IA (ejemplo)

Este ejemplo muestra un flujo operativo recomendado para coordinar tareas entre un modelo de lenguaje (ChatGPT) que actúa como coordinador y el agente `GitHub Copilot` que aplica cambios en el repositorio.

- Objetivo: dividir tareas de desarrollo en acciones pequeñas, generar parches y entregar comandos verificables.
- Flujo resumido:
	1. ChatGPT define el objetivo, los entregables y los criterios de aceptación.
	2. El usuario pega la instrucción a `GitHub Copilot` (o la invoca por API).
	3. `GitHub Copilot` analiza el repo, propone cambios y aplica parches (unified diff).
	4. Se ejecutan comandos locales para verificar (lint, tests, build).
	5. ChatGPT revisa los diffs y solicita iteraciones si es necesario.

Recomendaciones prácticas:
- Mantener commits pequeños y descriptivos (ver reglas del repositorio).
- Exigir parches en formato unified diff y comandos explícitos para validar.
- No incluir secretos ni credenciales en ningún parche o comentario.

Este bloque es un ejemplo de cómo documentar el proceso en el roadmap y puede adaptarse según las necesidades del equipo.
