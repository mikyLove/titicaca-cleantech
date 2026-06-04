# Instrucciones de Desarrollo - Titicaca CleanTech

## Contexto

Titicaca CleanTech es una plataforma tecnológica para el reporte, monitoreo y gestión de residuos sólidos en la región del Lago Titicaca.

## Objetivo de la V0

* Registrar reportes de residuos.
* Mostrar reportes registrados.
* Gestionar recompensas e incentivos.
* Contar con un panel administrativo básico.
* Preparar una arquitectura escalable para futuras versiones.

---

## Stack Tecnológico

### Frontend

* React 19
* TypeScript
* Vite 8
* Tailwind CSS 4
* React Router 7
* Lucide React

### Backend

* Supabase
* PostgreSQL

### Infraestructura

* GitHub
* Vercel

---

## Principios de Desarrollo

1. Priorizar código limpio y mantenible.
2. Aplicar separación de responsabilidades.
3. Evitar lógica de negocio dentro de componentes visuales.
4. Utilizar TypeScript estricto.
5. Crear componentes reutilizables.
6. Seguir principios SOLID cuando sea posible.
7. Mantener una arquitectura escalable.
8. No agregar dependencias innecesarias.
9. Mantener consistencia visual mediante Tailwind CSS.
10. Favorecer simplicidad antes que complejidad.

---

## Estructura del Proyecto

src/
├── assets/
├── components/
├── pages/
├── services/
├── lib/
├── router/
├── hooks/
├── types/
└── App.tsx

---

## Convenciones de Nombres

### Componentes

PascalCase

Ejemplos:

* HomePage.tsx
* ReportCard.tsx
* RewardCard.tsx

### Hooks

* useReports.ts
* useRewards.ts

### Servicios

* reportService.ts
* rewardService.ts

### Tipos

* report.types.ts
* reward.types.ts

---

## Restricciones

* No usar any salvo justificación técnica explícita.
* No duplicar código.
* No crear archivos innecesarios.
* Mantener componentes pequeños y reutilizables.
* Toda funcionalidad nueva debe ser modular.
* Evitar código muerto.
* Evitar comentarios innecesarios.

---

## Documentación

Cada cambio importante debe:

1. Actualizar docs/CHANGELOG.md.
2. Actualizar documentación relacionada.
3. Registrar decisiones arquitectónicas relevantes en docs/DECISIONES.md.
4. Mantener coherencia con docs/ROADMAP.md.

---

## Convención de Commits

Todos los commits deben estar en español.

Formato:

Verbo en infinitivo + descripción breve.

Ejemplos:

* Crear estructura base del proyecto
* Configurar Tailwind CSS
* Agregar páginas principales
* Configurar rutas de navegación
* Integrar Supabase
* Crear formulario de reporte
* Agregar panel administrativo
* Corregir validación de formulario
* Optimizar consulta de reportes
* Actualizar documentación técnica

Reglas:

* Máximo 70 caracteres.
* Un solo objetivo por commit.
* Evitar mensajes genéricos.
* Mantener historial claro y descriptivo.

---

## Antes de Implementar Código

Analizar primero la solución.
Proponer la estructura más simple y escalable.
Reutilizar componentes existentes cuando sea posible.
Mantener consistencia con la arquitectura del proyecto.
