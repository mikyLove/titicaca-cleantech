# DECISIONES ARQUITECTÓNICAS — Titicaca CleanTech

Registro de decisiones importantes y su razonamiento.

## D-001: Elegir React

- Razonamiento: amplia adopción, ecosistema maduro, compatibilidad con TypeScript y rendimiento con Vite. Permite construir una SPA accesible y mantenible.

## D-002: Elegir Supabase

- Razonamiento: BaaS que combina Postgres, Auth y Storage; acelera el desarrollo eliminando la necesidad de un backend completo en V0. Ofrece Realtime y un panel de gestión práctico.

## D-003: Elegir Vercel

- Razonamiento: integración nativa con GitHub, despliegues automáticos y optimización para aplicaciones frontend (Vite). Fácil de configurar y con buen rendimiento global.

## Cambios arquitectónicos futuros (posibles)

- Migrar lógica compleja a funciones server-side o microservicios (p.ej. Node/Edge Functions).
- Externalizar trabajos en segundo plano (queues, workers) si se introducen procesos pesados.
- Introducir una capa de API backend si los requisitos de seguridad o procesamiento lo demandan.

<!-- Añadir nuevas decisiones con ID y fecha -->
## D-004: Flujo coordinado ChatGPT + GitHub Copilot (2026-06-04)

- Contexto: Para acelerar tareas repetibles y parches rápidos, se define un flujo donde un LLM actúa como coordinador y un agente (Copilot) aplica cambios en el repositorio.
- Decisión: Adoptar el patrón coordinador/ejecutor para tareas de bajo riesgo (documentación, plantillas, refactors pequeños). Exigir siempre:
	- Parches en formato unified diff.
	- Comandos claros para validar localmente.
	- Excluir secretos de los cambios.

Razonamiento: mejora la trazabilidad, facilita revisiones pequeñas y preserva la seguridad operativa.

## D-005: Autenticación con Supabase Auth (2026-06-04)

- Contexto: Se requiere autenticación básica para asociar reportes a usuarios y proteger rutas. Supabase Auth ya está disponible como parte de la SDK `@supabase/supabase-js`.
- Decisión: Implementar Auth directamente con Supabase Auth (email + password) sin librerías adicionales. Arquitectura:
  - `authService.ts`: capa de acceso a Supabase Auth (login, register, logout, getSession).
  - `useAuth.ts`: contexto React con `AuthProvider` que expone `user`, `loading`, `login`, `register`, `logout`. Se suscribe a `onAuthStateChange` para persistencia de sesión automática.
  - `AuthGuard.tsx`: componente que protege rutas redirigiendo a `/login` si no hay sesión.
  - `LoginPage` y `RegisterPage`: páginas públicas con formularios mínimos.
  - Integración con `reportService.ts`: `createReport` obtiene `user_id` desde `supabase.auth.getSession()`.
- Razonamiento: Sin dependencias extras, tipado nativo TypeScript, sesión persistente vía `onAuthStateChange`, preparado para migrar a RLS por usuario cuando se active.
