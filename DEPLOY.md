# Guía de despliegue — Compunet Kanban en Azure Container Apps

Repositorio: https://github.com/StvCnet/cnet-planner

---

## Requisitos previos

- Acceso a Azure Portal con permisos de Contributor en la suscripción
- Azure CLI instalado, o usar Azure Cloud Shell (recomendado)
- Acceso de administrador a la App Registration en Entra ID
- Dominio propio con acceso al panel DNS

---

## Paso 1 — Definir variables de entorno en la terminal

Abre **Azure Cloud Shell** en https://shell.azure.com y ejecuta esto primero.
Edita los valores entre `< >` antes de correr los comandos.

```bash
RESOURCE_GROUP="rg-compunet-kanban"
LOCATION="eastus2"
ACR_NAME="acrcompunetkanban"
APP_NAME="compunet-kanban"
ENV_NAME="cae-compunet"
DOMAIN="<tu-dominio.com>"
```

---

## Paso 2 — Crear el grupo de recursos

```bash
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION
```

---

## Paso 3 — Crear Azure Container Registry (ACR)

El ACR almacena las imágenes Docker de la app.

```bash
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true
```

Obtén las credenciales del registry (las necesitarás en el Paso 7):

```bash
az acr credential show --name $ACR_NAME
```

Anota el `username` y uno de los `passwords`.

---

## Paso 4 — Crear el entorno de Container Apps

```bash
az containerapp env create \
  --name $ENV_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

---

## Paso 5 — Crear la Container App

Reemplaza los valores de los secrets con los reales antes de ejecutar.

```bash
az containerapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --target-port 3000 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 3 \
  --cpu 0.5 \
  --memory 1.0Gi \
  --secrets \
      nextauth-secret="<NEXTAUTH_SECRET>" \
      azure-ad-secret="<AZURE_AD_CLIENT_SECRET>" \
  --env-vars \
      NEXTAUTH_URL="https://$DOMAIN" \
      NEXTAUTH_SECRET=secretref:nextauth-secret \
      AZURE_AD_CLIENT_ID="<AZURE_AD_CLIENT_ID>" \
      AZURE_AD_CLIENT_SECRET=secretref:azure-ad-secret \
      AZURE_AD_TENANT_ID="<AZURE_AD_TENANT_ID>" \
      NODE_ENV="production"
```

> **Nota:** La imagen inicial es un placeholder. El primer deploy real
> lo hace GitHub Actions automáticamente en el Paso 8.

---

## Paso 6 — Crear el Service Principal para GitHub Actions

Este comando genera las credenciales que GitHub usará para desplegar en Azure.

```bash
az ad sp create-for-rbac \
  --name "sp-compunet-kanban-deploy" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP \
  --sdk-auth
```

Copia **todo el JSON** que devuelve. Lo necesitas en el siguiente paso.

---

## Paso 7 — Configurar secrets en GitHub

Ve a: https://github.com/StvCnet/cnet-planner/settings/secrets/actions

Crea los siguientes secrets (botón "New repository secret"):

| Nombre del secret       | Valor                                              |
|-------------------------|----------------------------------------------------|
| `AZURE_CREDENTIALS`     | El JSON completo del comando del Paso 6            |
| `AZURE_RESOURCE_GROUP`  | `rg-compunet-kanban`                               |
| `REGISTRY_LOGIN_SERVER` | `acrcompunetkanban.azurecr.io`                     |
| `REGISTRY_USERNAME`     | El `username` del Paso 3                           |
| `REGISTRY_PASSWORD`     | El `password` del Paso 3                           |

---

## Paso 8 — Disparar el primer deploy

Con los secrets configurados, haz cualquier push a `main` para iniciar el pipeline:

```bash
git commit --allow-empty -m "chore: trigger initial deploy"
git push origin main
```

O ve a: https://github.com/StvCnet/cnet-planner/actions
y ejecuta el workflow manualmente con "Run workflow".

El pipeline tarda aproximadamente **3-5 minutos** en completarse.

---

## Paso 9 — Conectar el dominio propio

Una vez que el primer deploy sea exitoso, ejecuta:

```bash
az containerapp hostname add \
  --hostname $DOMAIN \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP
```

Azure mostrará un valor de verificación DNS. Ve al panel de tu proveedor de dominio
y crea estos dos registros:

| Tipo    | Host | Valor                                                        |
|---------|------|--------------------------------------------------------------|
| `CNAME` | `@`  | `<url-generada>.azurecontainerapps.io`                       |
| `TXT`   | `@`  | El valor de verificación que mostró el comando anterior      |

Después activa el certificado SSL (gratuito, renovación automática):

```bash
az containerapp hostname bind \
  --hostname $DOMAIN \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --validation-method CNAME
```

---

## Paso 10 — Actualizar Redirect URI en Entra ID

Ve a: https://portal.azure.com → Entra ID → App registrations → tu app → Authentication

Agrega el siguiente Redirect URI (sin eliminar el de localhost):

```
https://<tu-dominio.com>/api/auth/callback/azure-ad
```

Guarda los cambios.

---

## Flujo de deploys futuros

Una vez configurado todo, cada cambio en el código se despliega automáticamente:

```
git add .
git commit -m "descripción del cambio"
git push origin main
        ↓
GitHub Actions (~3-5 min)
        ↓
Nueva versión en producción
```

---

## Variables de entorno de referencia (no subir al repo)

Guardar en `.env.local` para desarrollo local únicamente:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<cadena-aleatoria-32-chars>
AZURE_AD_CLIENT_ID=<client-id-de-entra>
AZURE_AD_CLIENT_SECRET=<client-secret-de-entra>
AZURE_AD_TENANT_ID=<tenant-id-de-entra>
```

---

## Solución de problemas comunes

**El login de Microsoft redirige a error `redirect_uri_mismatch`**
→ Verifica que el Redirect URI en Entra ID coincida exactamente con la URL de producción (Paso 10).

**GitHub Actions falla en el paso de login a ACR**
→ Verifica que `REGISTRY_USERNAME` y `REGISTRY_PASSWORD` estén correctos (Paso 7).

**La app arranca pero el directorio de usuarios aparece vacío**
→ El permiso `User.ReadBasic.All` requiere admin consent. Ve a:
Entra ID → App registrations → tu app → API permissions → Grant admin consent.

**Cold start lento (2-3 segundos) en la primera visita**
→ Es normal con `min-replicas 0`. Para eliminarlo, cambia a `min-replicas 1`
(agrega ~$5/mes al costo):
```bash
az containerapp update --name $APP_NAME --resource-group $RESOURCE_GROUP --min-replicas 1
```
