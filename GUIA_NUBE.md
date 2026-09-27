# KORA en la nube (Supabase) — guía en 10 minutos

Sin esto, las consultas viven solo en el navegador donde se escriben (modo
local). Con esto, llegan a una base compartida y las ves desde cualquier
dispositivo en `/admin`, al instante.

## 1. Crea el proyecto (gratis)

1. Entra a https://supabase.com y crea una cuenta.
2. **New project** → nombre `kora` → genera una contraseña de base de datos
   (guárdala) → región cercana (ej. `South America (São Paulo)`) → **Create**.
3. Espera ~2 minutos a que esté listo.

## 2. Crea las tablas (una vez)

1. Menú izquierdo → **SQL Editor** → **New query**.
2. Abre el archivo `supabase.sql` de este proyecto, cópialo todo, pégalo y
   pulsa **Run**. Debe decir *Success*.
3. **Si ya lo habías ejecutado antes, vuelve a ejecutarlo**: trae la
   corrección de permisos (funciones `es_admin_activa` / `es_superactiva`).
   Es seguro repetirlo.
3. Esto crea las tablas `consultas` y `admins`, los permisos (cualquiera
   puede escribir, solo el equipo puede leer) y el tiempo real.

## 3. Crea tu cuenta de superadministradora

1. Menú → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Correo: el tuyo. Clave: una segura. Activa **Auto Confirm user** → **Create**.
3. Copia el **UID** del usuario creado (columna UID).
4. Menú → **Table Editor** → tabla `admins` → **Insert row**:
   - `id`: pega el UID
   - `nombre`: `Juan David Gelviz`
   - `rol`: `super`
   - `activa`: `true`
   → **Save**.
5. Repite 3–4 por cada administradora (con `rol` = `admin`).

## 4. Conecta el sitio

1. Menú → **Project Settings** (engranaje) → **API**.
2. Copia `Project URL` y la clave `anon` `public`.
3. En este proyecto, copia `.env.example` como `.env` y pega los dos valores:
   ```
   PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-publica
   ```
4. Reinicia el dev (`Ctrl + C` y `pnpm dev`).

## 5. Verifica

1. Abre el sitio y envía una consulta de prueba desde el formulario.
2. Abre `/admin` en **otro dispositivo o navegador**, entra con tu correo y
   clave: la consulta debe aparecer sola, sin recargar (tiempo real).
3. Borra la prueba desde el panel.

## Notas

- Gestionar el equipo (crear/desactivar) y tu clave se hace igual que antes
  desde `/admin`; crear **nuevas cuentas** se hace en el paso 3
  (Authentication → Add user + fila en `admins`), y cambiarles la clave
  también desde Authentication (tres puntos → Reset password / Update user).
- Si quitas las dos líneas del `.env`, el sitio vuelve solo al modo local.
- El `.env` nunca se sube a git (ya está ignorado).
