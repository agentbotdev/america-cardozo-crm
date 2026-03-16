---
description: Implementar sistema de autenticación completo con roles en el CRM
---

# Implementar Autenticación con Roles

**Skills requeridas:** `nextjs-supabase-auth`, `react-patterns`, `api-security-best-practices`, `supabase-automation`

**Prerrequisito:** Completar `implementar-seguridad-critica.md` primero.

## Paso 1 — Crear tabla profiles en Supabase
Ejecutar en SQL Editor:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin','vendedor','readonly')) DEFAULT 'vendedor',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear profile automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name) VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

## Paso 2 — Crear authService.ts
Crear `services/authService.ts` con las funciones:
- `signIn(email, password)`
- `signOut()`
- `getUser()`
- `getUserProfile()`
- `updateProfile(data)`

## Paso 3 — Crear AuthContext.tsx
Crear `context/AuthContext.tsx`:
- Provider que wrappea toda la app
- Estado: `{ user, profile, loading, isAdmin, isVendedor }`
- Listener de `supabase.auth.onAuthStateChange`

## Paso 4 — Crear Login.tsx
Crear `pages/Login.tsx` con:
- Diseño premium, glassmorphism, Framer Motion
- Form: email + password
- Link "olvidé mi contraseña"
- Branding de America Cardozo

## Paso 5 — Crear PrivateRoute.tsx
Crear `components/PrivateRoute.tsx`:
```tsx
// Si no hay sesión → redirige a /login
// Si hay sesión → muestra el children
```

## Paso 6 — Actualizar App.tsx
Envolver todas las rutas en `<PrivateRoute>`.
Agregar ruta `/login` fuera del guard.
Agregar `<AuthProvider>` en el nivel superior.

## Paso 7 — Arreglar botón Logout en AppLayout.tsx
El botón de cerrar sesión debe llamar a `authService.signOut()` en lugar de navegar a `/logout`.

## Verificación
- [ ] Login funciona con credenciales reales de Supabase
- [ ] Sin sesión, redirige a /login
- [ ] Admin ve opciones de admin
- [ ] Vendedor solo ve sus datos
- [ ] Logout limpia la sesión
- [ ] Actualizar semáforo en `AGENTS.md`: Auth ✅
