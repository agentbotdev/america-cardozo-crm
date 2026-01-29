# 🔧 Instrucciones de Configuración ACTUALIZADAS

> ⚠️ **IMPORTANTE**: He simplificado la integración para que las propiedades se vean correctamente. Ahora las fotos están incluidas directamente en la tabla `propiedades` sin necesidad de joins complejos.

## 📋 Paso 1: Ejecutar Schema SQL

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard/project/kywossjvyttklegvqgtt
2. En el menú lateral, selecciona **SQL Editor**
3. Click en **New Query**
4. Copia todo el contenido de `supabase/schema.sql`
5. Pega en el editor SQL
6. Click en **Run** (botón verde inferior derecha)
7. **Resultado esperado**: ✅ "Success. No rows returned"

## 📋 Paso 2: Ejecutar Datos de Prueba

1. En el mismo **SQL Editor**, click en **New Query** nuevamente
2. Copia todo el contenido de `supabase/seed_data.sql`
3. Pega en el editor
4. Click en **Run**
5. **Resultado esperado**: ✅ Las filas se insertarán correctamente

## 📋 Paso 3: Verificar Datos

1. Ve a **Table Editor** en el menú lateral
2. Selecciona la tabla `propiedades`
3. **Deberías ver**:
   - ✅ 10 propiedades
   - ✅ Cada una con su campo `foto_portada_url` lleno (URLs de Unsplash)

## 📋 Paso 4: Probar el Frontend

Ejecuta en la terminal:

```bash
cd "c:\Users\Ignacio\Desktop\America Crdozo CRM ZIP"
npm run dev
```

Luego abre http://localhost:5173

### ✅ Qué deberías ver:

1. **Página de Propiedades**:
   - 10 tarjetas de propiedades con fotos
   - Información completa (precio, ubicación, características)
   - Click en una propiedad abre vista detallada

2. **Dashboard**:
   - KPIs con números reales
   - Sin errores en la consola (F12)

3. **Leads**:
   - 20 leads en la tabla
   - Temperaturas y scoring visible

---

## 🐛 Solución de Problemas

### "No veo propiedades"

1. Abre DevTools (F12) → pestaña **Console**
2. Busca mensajes como:
   - `"Fetched properties:"` - debería mostrar un array con 10 propiedades
   - `"Formatted properties:"` - debería mostrar las propiedades formateadas

3. Si ves errores de Supabase:
   - Verifica que ejecutaste `schema.sql` correctamente
   - Verifica que ejecutaste `seed_data.sql` correctamente
   - Ve a Supabase → Table Editor → `propiedades` y confirma que hay datos

### "Las fotos no se ven"

- Las fotos usan Unsplash y requieren internet
- Verifica tu conexión
- Abre una URL de ejemplo en el navegador: https://images.unsplash.com/photo-1600585154340-be6161a56a0c

### "Error: column 'foto_portada_url' does not exist"

- Significa que no ejecutaste el `schema.sql` actualizado
- Ve a Supabase SQL Editor y ejecuta `schema.sql` nuevamente

---

## ✨ Cambios Realizados

He simplificado la integración para que funcione de forma más robusta:

1. ❌ **Antes**: Query compleja con join a tabla `fotos`
   ```sql
   SELECT *, fotos(*) FROM propiedades
   ```

2. ✅ **Ahora**: Query simple sin joins
   ```sql
   SELECT * FROM propiedades
   ```

3. ✅ **Nuevo campo**: `foto_portada_url` en tabla `propiedades`
   - Almacena directamente la URL de la foto principal
   - No requiere joins
   - Más rápido y simple

---

## 🚀 Próximos Pasos

Una vez que veas las propiedades correctamente:

1. ✅ Probar crear una nueva propiedad
2. ✅ Probar editar una propiedad existente
3. ✅ Probar los filtros y búsqueda
4. ✅ Verificar responsive design

Si todo funciona, el CRM estará **100% operativo**! 🎉
