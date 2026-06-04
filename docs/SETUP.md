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

## Configuración de Supabase

Antes de usar el formulario de reportes, configura estos recursos en el Dashboard de Supabase:

### 1. Tabla `reports`

Ejecutar en SQL Editor:

```sql
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text not null,
  location      text,
  image_url     text,
  user_id       uuid references auth.users(id) on delete set null,
  status        text not null default 'pending'
                check (status in ('pending','in_review','resolved','rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_created_at_idx on public.reports(created_at desc);
```

### 2. Bucket `report-images`

- Crear bucket público `report-images` en Storage.
- Las imágenes se almacenan en `{userId}/{reportId}/{timestamp}.{ext}`.

### 3. Políticas RLS para `reports`

```sql
alter table public.reports enable row level security;

create policy "Usuarios insertan sus reportes"
  on public.reports for insert
  with check (auth.role() = 'authenticated' and user_id = auth.uid());

create policy "Usuarios ven sus reportes"
  on public.reports for select
  using (auth.uid() = user_id);

create policy "Usuarios actualizan sus reportes"
  on public.reports for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 4. Políticas RLS para Storage `report-images`

```sql
create policy "Usuarios suben imágenes a su carpeta"
  on storage.objects for insert
  with check (
    bucket_id = 'report-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Usuarios ven sus imágenes"
  on storage.objects for select
  using (
    bucket_id = 'report-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

> **Importante**: Si las políticas RLS de Storage no bastan, ejecuta estos GRANT para que los usuarios autenticados puedan acceder al schema `storage`:
> ```sql
> grant usage on schema storage to authenticated;
> grant select, insert, update on table storage.objects to authenticated;
> ```
```

### 5. Habilitar Auth

Supabase Auth viene activo por defecto. Para registro con email:
- Ir a Authentication → Providers → Email → habilitar.
- Opcional: deshabilitar "Confirm email" para desarrollo.

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
