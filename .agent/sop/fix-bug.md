# SOP — Arreglar un Bug

**Usar cuando:** Hay un comportamiento incorrecto, error en console, dato mal renderizado, o bug reportado.

---

## Proceso

### 1. Clasificar el bug
| Tipo | Cómo identificarlo | Archivo a leer |
|---|---|---|
| Visual / UX | Algo se ve mal, layout roto, prop mismatch | `agents/frontend/AGENTS.md` |
| Lógica / datos | Dato incorrecto, cálculo mal, query falla | `agents/backend/AGENTS.md` |
| Integración | Google Calendar falla, Tokko no sincroniza | `agents/integraciones/AGENTS.md` |
| N8N / IA | Workflow no dispara, agente responde mal | `agents/ia/AGENTS.md` |

### 2. Confirmar el bug
Antes de tocar código, responder:
- ¿En qué módulo ocurre? (ver semáforo en `.agent/AGENTS.md`)
- ¿Está en la lista de BUG-XXX conocidos? → si sí, no re-analizar
- ¿Afecta datos reales de producción? → si sí, hacer backup primero

### 3. Localizar la causa raíz
- Abrir el archivo exacto usando la pista del bug
- No adivinar — leer el código hasta encontrar la causa real
- En bugs de Supabase: testear la query en el panel SQL de Supabase primero

### 4. Fix mínimo
- Escribir el cambio más pequeño posible que resuelve el problema
- No aprovechar para refactorizar al mismo tiempo (eso es tarea separada)
- Mantener el estilo del código existente

### 5. Verificar
- Testear el fix en el escenario del bug
- Verificar que no rompió nada adyacente (especialmente en componentes compartidos)
- Si el bug era de tipos TypeScript: confirmar que `npm run build` no tira errores

### 6. Cerrar
- Tachar el bug en `.agent/AGENTS.md` como resuelto
- Si generó deuda técnica nueva, agregarla al semáforo

---

## Bugs frecuentes en este CRM

| Síntoma | Causa típica | Fix |
|---|---|---|
| Imagen no carga | `imagen_principal` en lugar de `foto_portada` | Renombrar la prop |
| Búsqueda no encuentra nada | Está usando MOCK_LEADS, no Supabase | Conectar query real |
| Google Calendar no conecta | Client Secret en frontend | Mover a Edge Function |
| Lead no aparece en CRM | Sin RLS → Row no devuelto por política | Revisar policy |
| Componente no re-renderiza | Mutación directa de array en store | Usar spread `[...arr]` |
