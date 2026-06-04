<!-- docs/SETUP.md - Guía de instalación y ejecución local para Titicaca CleanTech -->
# SETUP — Titicaca CleanTech

Guía rápida para poner en marcha el proyecto Titicaca CleanTech en un entorno local.

## Resumen

Proyecto frontend construido con React 19 + TypeScript y Vite 8, con Tailwind CSS 4, React Router 7 y Supabase como backend/BD. Despliegue previsto en Vercel.

---

## Requisitos previos

- Sistema operativo: Ubuntu (guía escrita pensando en Ubuntu 26.04).
- Node.js: versión LTS recomendada (>= 20). Se recomienda usar `nvm` para gestionar versiones.
- npm (incluido con Node) o `pnpm` (opcional).
- Git (>=2.30).
- Cuenta en Supabase (para variables de entorno) y cuenta en Vercel (despliegue).

Instalación rápida de herramientas (Ubuntu):

```bash
# Instalar nvm (si no lo tienes)
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.6/install.sh | bash
source ~/.nvm/nvm.sh

# Instalar Node LTS y usarla
nvm install --lts
nvm use --lts

# Verificar
node -v
npm -v
git --version
```

---

## Clonado del repositorio

Clona el repositorio y sitúate en el directorio del proyecto:

```bash
git clone <REPO_URL>
cd titicaca-cleantech
```

Reemplaza `<REPO_URL>` por la URL del repositorio en GitHub (SSH o HTTPS según prefieras).

---

## Instalación de dependencias

Usando `npm`:

```bash
npm install
```

Si prefieres `pnpm`:

```bash
pnpm install
```

Notas:

- Para entornos CI reproducibles, usar `npm ci` cuando tengas `package-lock.json`.
- Si añades nuevas dependencias, recuerda ejecutar la instalación y actualizar el `package-lock.json`.

---

## Variables de entorno

El proyecto usa variables de entorno para conectar con Supabase y otros servicios. Crea un fichero `.env.local` en la raíz (no subirlo a Git):

```env
# Ejemplo mínimo
VITE_SUPABASE_URL=https://xyzabc.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key

# Otras variables (según implementaciones futuras)
# VITE_API_URL=...
# VITE_FEATURE_FLAG_X=true
```

Asegúrate de añadir `.env.local` a `.gitignore` (ya debería estar en la plantilla) y de configurar las mismas variables en Vercel cuando despliegues.

---

## Ejecución local

Desarrollo con Hot Reload (Vite):

```bash
npm run dev
# o pnpm run dev
```

Compilar para producción:

```bash
npm run build
```

Probar build localmente (preview):

```bash
npm run preview
```

Verifica en el navegador `http://localhost:5173` (o el puerto que indique Vite).

---

## Comandos Git más usados

- Clonar: `git clone <REPO_URL>`
- Crear rama de feature: `git checkout -b feature/nombre-descriptivo`
- Añadir cambios: `git add -A`
- Commit: `git commit -m "Describir cambio en infinitivo"`
- Push rama: `git push --set-upstream origin feature/nombre-descriptivo`
- Actualizar rama local con main: `git fetch origin && git rebase origin/main` (o `git merge origin/main` según flujo)
- Abrir PR desde GitHub y asignar revisores.

Convención de commits del proyecto: verbo en infinitivo + descripción breve (en español), p.ej. `Agregar formulario de reporte`.

---

## Estructura del proyecto

Estructura principal (resumen):

```
src/
  assets/      # imágenes y recursos estáticos
  components/  # componentes UI reutilizables
  pages/       # vistas/containers por ruta
  router/      # configuración de rutas (React Router)
  services/    # lógica de acceso a APIs / supabase
  lib/         # utilidades y helpers
  hooks/       # custom hooks
  types/       # definiciones TypeScript
  App.tsx
  main.tsx
docs/          # documentación (CHANGELOG, ROADMAP, SETUP...)
public/        # assets públicos servidos por Vite
```

Revisa `README.md` y `docs/` para detalles adicionales de la arquitectura.

---

## Buenas prácticas para colaboradores

- Seguir TypeScript estricto: evitar `any` salvo justificación técnica explícita.
- Mantener componentes pequeños y reutilizables; extraer lógica a `services` o `hooks`.
- Un PR = una idea / responsabilidad. Mantener commits pequeños y con mensajes en español en infinitivo.
- Ejecutar linters y la build antes de abrir un PR:

```bash
npm run lint
npm run build
```

- Documentar cambios relevantes en `docs/CHANGELOG.md` y decisiones arquitectónicas en `docs/DECISIONES.md`.
- Configurar variables de entorno en Vercel y proteger claves sensibles (usar `VITE_` prefix para variables expuestas al cliente).
- Revisar y actualizar `docs/` cuando agregues características o cambies flujos importantes.

---

## Despliegue (breve)

- Plataforma: Vercel. Conecta tu repositorio GitHub a Vercel y configura las variables de entorno en el panel de Vercel.
- Comando de build: `npm run build`.
- Directorio de salida: `dist/` (valor por defecto de Vite).

---

Si necesitas, puedo generar también los archivos iniciales para `docs/CHANGELOG.md`, `docs/ARQUITECTURA.md`, `docs/DECISIONES.md` y `docs/ROADMAP.md` con plantillas básicas.
