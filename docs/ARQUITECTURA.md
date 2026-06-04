# ARQUITECTURA — Titicaca CleanTech

Resumen de la arquitectura del sistema y responsabilidades de cada capa.

## Visión general

Titicaca CleanTech es una plataforma para el reporte, monitoreo y gestión de residuos sólidos. La arquitectura prioriza rapidez de desarrollo, coste bajo y escalabilidad.

### Componentes principales

- Frontend: SPA en React 19 + TypeScript, construido con Vite 8 y estilizado con Tailwind CSS 4. Maneja la UI, validación básica y navegación con React Router 7.
- Backend/BaaS: Supabase (Auth, Postgres, Storage, Realtime). Minimiza la necesidad de un backend propio inicialmente.
- Base de datos: PostgreSQL gestionada por Supabase. Esquemas para reportes, usuarios, recompensas y roles.
- Despliegue: Vercel para el frontend (CI/CD desde GitHub). Variables seguras configuradas en el panel de Vercel.

## Frontend

- Estructura: `src/components`, `src/pages`, `src/services`, `src/hooks`.
- Comunicación con Supabase desde `src/services/supabaseService.ts` usando la SDK oficial.
- Rutas principales: página de inicio, formulario de reporte, listado de reportes, panel administrativo.

## Backend / Integraciones

- Autenticación: Supabase Auth (correo, OAuth providers opcional).
- Funciones/Edge: si se requiere lógica server-side, implementar funciones serverless o un pequeño backend en Vercel/Edge.

## Base de datos

- Tablas principales: `users`, `reports`, `rewards`, `events`, `audit_logs`.
- Indices y relaciones: claves foráneas entre `reports.user_id` y `users.id`.
- Recomendación: migraciones gestionadas (p.ej. pg-migrate o Supabase Migrations) para producción.

## Despliegue

- Flujo: push a `main` -> Vercel ejecuta `npm run build` -> despliegue automático.
- Variables de entorno: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, y claves privadas en panel de Supabase/Vercel.

## Consideraciones de seguridad

- Nunca exponer claves privadas en el cliente.
- Revisar reglas de Row Level Security (RLS) en Supabase para proteger datos.

## Escalabilidad y extensibilidad

- Empezar con Supabase y, si la lógica crece, mover a funciones server-side o microservicios.
- Introducir caché y paginación en endpoints de listados si el volumen aumenta.
