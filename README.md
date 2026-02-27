# TygerDragon — Gym Access Manager

Sistema de gestión de membresías con verificación por QR para gimnasios. El admin gestiona miembros desde un panel web; en la entrada del gym se escanea el QR del miembro y la pantalla muestra verde o rojo instantáneamente.

## Stack

- **Next.js 15** (App Router, Turbopack)
- **Supabase** — PostgreSQL + Auth + Storage
- **Tailwind CSS v4**
- **Vercel** — hosting

---

## Funcionalidades

### Panel admin
- Login con email y contraseña (Supabase Auth)
- Dashboard con lista de miembros, búsqueda por nombre y filtro por estado
- Alerta automática de miembros que vencen en los próximos 7 días
- CRUD completo de miembros: nombre, teléfono, email, foto, membresía, fechas, notas
- Cálculo automático de fecha de vencimiento al asignar tipo de membresía
- Activar / desactivar miembros
- Ver QR de cada miembro para imprimir o compartir por WhatsApp
- Gestión de tipos de membresía con beneficios configurables

### Tipos de membresía
- El admin crea los tipos que quiera (nombre, duración en días, precio informativo)
- Beneficios seleccionables desde catálogo hardcodeado (`src/lib/benefit-catalog.ts`)
- Beneficios actuales: Nutrición, Entrenamiento, Pesas, Cardio, Rutina, Terapia Física

### Verificación QR
- URL pública: `/check/[member-id]`
- No requiere login
- Pantalla grande verde ✓ **ACCESO PERMITIDO** o roja ✗ **ACCESO DENEGADO**
- Muestra nombre, foto y fecha de vencimiento
- El ID del miembro es UUID — imposible adivinar por fuerza bruta

---

## Estructura del proyecto

```
src/
├── app/
│   ├── login/                  # Login admin
│   ├── dashboard/              # Lista de miembros
│   ├── members/
│   │   ├── new/                # Crear miembro
│   │   └── [id]/
│   │       ├── page.tsx        # Detalle + QR
│   │       └── edit/           # Editar miembro
│   ├── membership-types/       # CRUD tipos de membresía
│   │   ├── new/
│   │   └── [id]/edit/
│   └── check/[id]/             # Página pública del QR (sin auth)
├── components/
│   ├── MemberForm.tsx          # Formulario crear/editar miembro (con foto upload)
│   ├── MembershipTypeForm.tsx  # Formulario crear/editar tipo de membresía
│   ├── MemberSearch.tsx        # Búsqueda y filtro (client component)
│   ├── QRDisplay.tsx           # Genera QR, botones WhatsApp e imprimir
│   ├── LogoutButton.tsx
│   ├── DeactivateButton.tsx    # Activar/desactivar miembro
│   ├── ToggleActiveButton.tsx  # Activar/desactivar genérico (cualquier tabla)
│   └── DeleteMembershipTypeButton.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client (@supabase/ssr)
│   │   └── server.ts           # Server client (@supabase/ssr)
│   ├── types.ts                # MembershipType, Member, MemberAccess
│   └── benefit-catalog.ts      # Catálogo hardcodeado de beneficios
└── middleware.ts               # Protege todo excepto /login y /check/*
```

---

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Crea `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Base de datos — correr en Supabase > SQL Editor

El archivo `supabase-schema.sql` en la raíz contiene el schema completo. Córrelo una sola vez en un proyecto nuevo.

> Si ya corriste el schema antes de agregar la columna `benefits`, ejecuta adicionalmente:
> ```sql
> alter table membership_types add column if not exists benefits text[] default '{}';
> ```

### 4. Storage — crear bucket en Supabase > Storage

- Nombre: `member-photos`
- Visibilidad: **Public**

Luego correr en SQL Editor:

```sql
create policy "Admins pueden subir fotos"
on storage.objects for insert to authenticated
with check (bucket_id = 'member-photos');

create policy "Fotos publicas"
on storage.objects for select to public
using (bucket_id = 'member-photos');

create policy "Admins pueden eliminar fotos"
on storage.objects for delete to authenticated
using (bucket_id = 'member-photos');
```

### 5. Crear usuario admin

Supabase > Authentication > Users > **Add user**. No hay registro público — solo los usuarios creados manualmente aquí pueden entrar al panel.

### 6. Levantar la app

```bash
npm run dev
```

---

## Despliegue en Vercel

1. Push del repo a GitHub
2. Importar en [vercel.com](https://vercel.com)
3. Agregar variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` → dominio final (ej. `https://tygerdragon.vercel.app`)
4. Deploy

---

## Cómo funciona la verificación QR

1. Cada miembro tiene un `id` UUID generado por PostgreSQL
2. El QR contiene la URL `{APP_URL}/check/{member-id}`
3. `middleware.ts` permite acceso público a cualquier ruta `/check/*`
4. La página `/check/[id]` es un Server Component — query a Supabase en servidor, renderiza HTML directo sin JS extra → carga rápida
5. Lógica de acceso: `status === 'active' AND end_date >= hoy`

---

## Modificar el catálogo de beneficios

Edita `src/lib/benefit-catalog.ts`. Cada entrada tiene:
- `id` — string único, es lo que se guarda en la DB
- `label` — texto que se muestra en la UI
- `category` — agrupa en el formulario

No requiere cambios en la base de datos.

---

## Comandos

```bash
npm run dev      # Dev server con Turbopack
npm run build    # Build de producción
npm run lint     # ESLint
```
