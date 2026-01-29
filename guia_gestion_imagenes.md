# 🖼️ Guía Profesional: Gestión de Imágenes y Galerías

Esta guía explica la forma correcta de gestionar la multimedia en tu CRM para asegurar una carga ultra rápida y una experiencia de usuario premium, soportando galerías de más de 30 fotos por propiedad.

---

## 1. Conceptos Clave: Portada vs. Galería

Para que tu CRM se sienta profesional, manejamos dos niveles de visualización:

1.  **Foto de Portada (`es_portada = true`)**:
    - Es la cara de la propiedad en el listado.
    - **Regla**: Solo puede existir UNA por propiedad.
    - **Recomendación**: Debe ser la foto más atractiva (ej. fachada o living principal).
2.  **Galería de Fotos**:
    - Aparece cuando el cliente hace click en la propiedad.
    - Soporta 30, 50 o más fotos.
    - Se controla mediante el campo `orden` (0, 1, 2, 3...) para decidir qué fotos aparecen primero.

---

## 2. Recomendaciones de Performance (Velocidad)

Si subes fotos pesadas (ej. 10MB cada una), la app se volverá lenta. Sigue estas recomendaciones:

### ✅ Uso de Thumbnails (Miniaturas)
En la tabla `fotos` verás una columna llamada `thumbnail`. 
- **Qué es**: Una versión pequeña y liviana de la foto (aprox. 400x300px).
- **Por qué**: La lista de propiedades de la app usa el `thumbnail` de la portada. Esto permite que las 88 propiedades carguen en milisegundos en lugar de segundos.

### ✅ Formato Ideal
- Usa **WebP** o **JPG progresivo**.
- Resolución máxima para galería: **1920x1080px**.
- Tamaño ideal por foto: **Menos de 500KB**.

---

## 3. Estructura de la Base de Datos (`fotos`)

Para cargar fotos manualmente o vía script, esta es la estructura que debes seguir:

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `propiedad_id` | bigint | El ID de la propiedad a la que pertenece (debe existir). |
| `url` | text | URL de la imagen en alta resolución (Supabase Storage). |
| `thumbnail` | text | URL de la imagen en baja resolución (para los listados). |
| `es_portada` | boolean | `true` si es la foto principal, `false` para el resto. |
| `orden` | integer | Posición en la galería (ej: 0 es la primera foto). |

---

## 4. ¿Cómo cargar fotos correctamente?

### Opción A: Supabase Storage (Recomendado)
Es lo más profesional y rápido.
1. Sube las fotos al bucket `property-photos`.
2. Organízalas por carpetas por el ID de la propiedad (ej: `7653864/foto1.jpg`).
3. Obtén la **URL Pública** y guárdala en la tabla `fotos`.

### Opción B: URLs Externas
Si ya tienes las fotos en Google Drive, Dropbox o un hosting propio:
- Simplemente inserta el link directo en la columna `url`.
- *Nota: Asegúrate de que el link termine en .jpg, .png o .webp.*

---

## 5. Script de Carga Masiva (Ejemplo SQL)

Si tienes muchas fotos para una propiedad, puedes usar este comando en el **SQL Editor**:

```sql
-- Insertar una galería de 3 fotos para la propiedad 7653864
INSERT INTO public.fotos (propiedad_id, url, thumbnail, es_portada, orden)
VALUES 
  (7653864, 'https://.../foto_hd_1.jpg', 'https://.../thumb_1.jpg', true, 0),
  (7653864, 'https://.../foto_hd_2.jpg', 'https://.../thumb_2.jpg', false, 1),
  (7653864, 'https://.../foto_hd_3.jpg', 'https://.../thumb_3.jpg', false, 2);
```

---

## 💡 Pro-Tip: El Índice de Integridad
He configurado una **restricción de seguridad** en tu base de datos. Si intentas marcar dos fotos como "portada" (`es_portada = true`) para la misma propiedad, Supabase te dará un error. Esto garantiza que tu frontend nunca se rompa mostrando dos portadas a la vez.

---

> [!NOTE]
> Para galerías muy grandes (+50 fotos), la app implementa automáticamente "Lazy Loading", lo que significa que solo descarga las fotos a medida que el usuario las va viendo.
