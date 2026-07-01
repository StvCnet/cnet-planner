# Despliegue en Vercel + Login con Entra ID

Repositorio: https://github.com/StvCnet/cnet-planner

---

## Paso 1 — Importar el repositorio en Vercel

1. Ve a https://vercel.com y entra con tu cuenta (o crea una)
2. Click en **Add New → Project**
3. Conecta tu cuenta de GitHub si no lo has hecho
4. Busca y selecciona el repositorio **StvCnet/cnet-planner**
5. En la pantalla de configuración:
   - **Framework Preset**: Next.js (lo detecta automáticamente)
   - **Root Directory**: dejar vacío (`.`)
   - **Build Command**: dejar el default (`npm run build`)
   - **Output Directory**: dejar el default (`.next`)

**No hagas Deploy todavía** — primero configura las variables de entorno.

---

## Paso 2 — Configurar variables de entorno en Vercel

En la misma pantalla de configuración, despliega la sección **Environment Variables**
y agrega las siguientes (una por una):

| Variable                | Valor                                        | Entorno         |
|-------------------------|----------------------------------------------|-----------------|
| `NEXTAUTH_URL`          | `https://cnet-planner.vercel.app`            | Production      |
| `NEXTAUTH_SECRET`       | `<cadena-aleatoria-segura-de-32-chars>`      | All             |
| `AZURE_AD_CLIENT_ID`    | `<tu-client-id-de-entra>`                    | All             |
| `AZURE_AD_CLIENT_SECRET`| `<tu-client-secret-de-entra>`                | All             |
| `AZURE_AD_TENANT_ID`    | `<tu-tenant-id-de-entra>`                    | All             |

> **Nota sobre NEXTAUTH_URL:** Vercel asigna automáticamente la URL
> `https://<nombre-repo>.vercel.app`. Si conectas un dominio propio,
> actualiza este valor a `https://tu-dominio.com` después.

---

## Paso 3 — Primer deploy

Haz click en **Deploy**. Vercel construirá la imagen y desplegará en ~2 minutos.

Al terminar verás una URL del tipo:
```
https://cnet-planner.vercel.app
```

Guarda esa URL — la necesitas en el siguiente paso.

---

## Paso 4 — Agregar Redirect URI en Entra ID

> Este paso es el que permite que el login de Microsoft funcione en producción.

1. Ve a https://portal.azure.com
2. Entra ID → App registrations → tu app → **Authentication**
3. En **Web → Redirect URIs**, haz click en **Add URI** y agrega:

```
https://cnet-planner.vercel.app/api/auth/callback/azure-ad
```

Si tienes dominio propio, agrega también:
```
https://tu-dominio.com/api/auth/callback/azure-ad
```

4. Haz click en **Save**

> El URI de localhost para desarrollo sigue ahí — no lo elimines:
> `http://localhost:3000/api/auth/callback/azure-ad`

---

## Paso 5 — Verificar el login

1. Abre `https://cnet-planner.vercel.app` en el navegador
2. Debe redirigirte automáticamente a la pantalla de login de Microsoft
3. Inicia sesión con tu cuenta de Compunet (`@compunet.com`)
4. Al autenticarse, debe redirigirte al Kanban con tu nombre en el header

Si ves error `AADSTS50011` (redirect_uri mismatch) → revisa el Paso 4.

---

## Paso 6 — Permiso admin consent para el directorio (si es necesario)

Para que la pestaña **Directorio Entra ID** muestre todos los usuarios,
el permiso `User.ReadBasic.All` requiere aprobación de un administrador del tenant.

1. Ve a: Entra ID → App registrations → tu app → **API permissions**
2. Verifica que estén los permisos:
   - `User.Read` (Delegated)
   - `User.ReadBasic.All` (Delegated)
3. Si aparece el botón **Grant admin consent for Compunet** → haz click

---

## Paso 7 — Conectar dominio propio (opcional)

En el dashboard de Vercel → tu proyecto → **Settings → Domains**:

1. Click en **Add Domain**
2. Escribe tu dominio: `tu-dominio.com`
3. Vercel te mostrará un registro DNS para agregar en tu proveedor:

| Tipo    | Host | Valor                          |
|---------|------|--------------------------------|
| `CNAME` | `@`  | `cname.vercel-dns.com`         |

4. Una vez propagado el DNS, Vercel activa el certificado SSL automáticamente

5. Después actualiza `NEXTAUTH_URL` en Vercel:
   - Proyecto → **Settings → Environment Variables**
   - Edita `NEXTAUTH_URL` → `https://tu-dominio.com`
   - Haz Redeploy para que tome efecto

---

## Flujo de deploys futuros

Cada `git push origin main` dispara un deploy automático en Vercel sin
ninguna configuración adicional:

```
git add .
git commit -m "descripción"
git push origin main
        ↓
Vercel detecta el push (~1-2 min)
        ↓
Nueva versión en producción automáticamente
```

---

## Desarrollo local

```bash
npm run dev
```

El archivo `.env.local` en la raíz tiene las variables para localhost.
Nunca se sube al repositorio (está en `.gitignore`).

---

## Solución de problemas

**Error `AADSTS50011` al hacer login**
→ El Redirect URI en Entra ID no coincide. Verifica el Paso 4.

**El directorio aparece vacío**
→ Falta admin consent para `User.ReadBasic.All`. Verifica el Paso 6.

**Error `NEXTAUTH_SECRET` en producción**
→ Asegúrate de que la variable esté configurada en Vercel (Paso 2).

**Login redirige a `/auth/signin` en loop**
→ `NEXTAUTH_URL` no coincide con la URL real del deploy. Actualiza en Vercel → Settings → Environment Variables.
