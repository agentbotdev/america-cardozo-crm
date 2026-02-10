# 🚀 Guía de Deployment en Vercel

## Pasos para Desplegar tu CRM en Producción

### ✅ Paso 1: Acceder a Vercel

1. Ve a: https://vercel.com
2. Haz clic en **"Sign Up"** o **"Login"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel para acceder a tus repositorios

### ✅ Paso 2: Crear Nuevo Proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."**
2. Selecciona **"Project"**
3. En la lista de repositorios, busca: **`agentbotdev/america-cardozo-crm`**
4. Haz clic en **"Import"**

### ✅ Paso 3: Configurar el Proyecto

#### Framework Preset
- Vercel detectará automáticamente que es un proyecto **Vite**
- No necesitas cambiar nada aquí

#### Build & Output Settings
- **Build Command**: `npm run build` (ya configurado)
- **Output Directory**: `dist` (ya configurado)
- **Install Command**: `npm install` (automático)

### ✅ Paso 4: Agregar Variables de Entorno (MUY IMPORTANTE)

En la sección **"Environment Variables"**, agrega las siguientes variables:

1. **VITE_SUPABASE_URL**
   - Value: `tu_url_de_supabase` (ejemplo: https://xxxxxxxxxxx.supabase.co)

2. **VITE_SUPABASE_ANON_KEY**
   - Value: `tu_anon_key_de_supabase`

3. **VITE_TOKKO_API_KEY**
   - Value: `tu_api_key_de_tokko`

4. **VITE_PROJECT_REF** (opcional)
   - Value: `tu_project_ref_de_supabase`

5. **VITE_GOOGLE_CLIENT_ID** (opcional - para calendario)
   - Value: `tu_google_client_id`

> 💡 **Importante**: Puedes copiar los valores desde tu archivo `.env` local

### ✅ Paso 5: Desplegar

1. Haz clic en el botón **"Deploy"** 
2. Espera 1-2 minutos mientras Vercel construye tu aplicación
3. ✨ ¡Listo! Tu aplicación estará en línea

### 🌐 Tu Aplicación Estará Disponible En:

```
https://america-cardozo-crm.vercel.app
```

O un dominio personalizado que puedes configurar después.

---

## 🔄 Deployments Automáticos

Cada vez que hagas `git push` a la rama `main`, Vercel automáticamente:
1. Detectará los cambios
2. Construirá una nueva versión
3. La desplegará en producción

¡No necesitas hacer nada más!

---

## 📝 Notas Adicionales

### Configurar Dominio Personalizado (Opcional)

1. En el dashboard de tu proyecto en Vercel
2. Ve a **"Settings"** → **"Domains"**
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar los DNS

### Ver Logs de Deployment

1. Ve a tu proyecto en Vercel
2. Haz clic en **"Deployments"**
3. Selecciona cualquier deployment para ver los logs

### Solución de Problemas

Si el deployment falla:
1. Revisa que todas las variables de entorno estén correctas
2. Verifica los logs de build en Vercel
3. Asegúrate de que el build funciona localmente con `npm run build`

---

## 🆘 ¿Necesitas Ayuda?

- **Repositorio GitHub**: https://github.com/agentbotdev/america-cardozo-crm
- **Documentación Vercel**: https://vercel.com/docs
- **Contacto**: Crea un issue en el repositorio

---

**¡Felicidades! Tu CRM estará en producción en minutos.** 🎉
