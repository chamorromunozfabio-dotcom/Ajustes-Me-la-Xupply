# Cambios realizados

## Credenciales de acceso (BD existente `xupply-db-pruebas`)

Contraseña para **todos** los usuarios: `demo1234` (restablecida el 2026-11-27; se incrementó `token_version` para invalidar sesiones anteriores).

| Usuario | Contraseña | Rol | Estado del login |
| --- | --- | --- | --- |
| `admin` | `demo1234` | admin | HTTP 200 |
| `gerente` | `demo1234` | gerente | HTTP 200 |
| `empleado` | `demo1234` | empleado | HTTP 200 |
| `proveedor` | `demo1234` | proveedor_admin | HTTP 200 |
| `domiciliario` | `demo1234` | domiciliario | HTTP 200 |
| `verificador` | `demo1234` | verificador | HTTP 200 |
| `pendiente` | `demo1234` | gerente (restaurante 6) | HTTP 403 `VERIFICATION_PENDING`: cuenta en revisión, requiere aprobación de un verificador |
| `tecnico` | `demo1234` | tecnico | HTTP 200 |

> Nota: `pendiente` tiene la contraseña correcta pero el login sigue bloqueado a propósito por su estado de verificación; no es un fallo de credenciales.

---

> Registro acumulado de la sesión. Fecha: 2026-11-27.
> Estado: cambios listos para subir a GitHub. Build del frontend verificado: `✓ built in 11.76s`.
> API funcionando en `http://localhost:4000` (`/api/health` → `HTTP 200`, `db: connected`, `tables_ready: true`).

---

## Módulo: `modules/public/landing/hooks.ts` (interacciones)

- **Guards de CMS**: `words`, `statuses`, `roles.data`, `simulator.types` y `productsByType` se validan con `Array.isArray` antes de usarse, para que una forma inesperada publicada no rompa un `.map()`.
- **Typewriter**: `words` se añadió a las dependencias del efecto; responde a cambios del CMS sin esperar a terminar la palabra actual. Sin palabras, el texto queda vacío.
- **Barra de progreso**: se mide con `document.documentElement.scrollHeight` dentro de `requestAnimationFrame` y se observa el `body` con `ResizeObserver` (detecta imágenes/contenido async del CMS). Se limpian listener y observer al desmontar.
- **Partículas**: el bucle `requestAnimationFrame` se marca como pendiente al inicio de cada frame para no duplicarse al volver de una pestaña oculta; se cancela al ocultar y al desmontar. Cantidad limitada a 120 y `prefers-reduced-motion` desactiva el efecto.
- **Autoplay / stepper**: reemplazado el temporizador de reactivación automática (9 s) por el toggle `handleToggleAuto` (Pausar/Reanudar). Manual step y "Simular entrega" dejan el autoplay pausado hasta que el usuario lo reanude.
- **Timers**: `successTimerRef` y `orderTimerRef` centralizados con `clearTimer()` y limpieza al desmontar.
- **Simulador**: cantidades iniciales desde `defaultQty`; `selectedType` y `activeRole` se corrigen automáticamente si el CMS cambia las claves; `availableTypeKeysKey` evita efectos por referencias nuevas.

## Módulo: `modules/public/landing/components/`

- **`LandingHero.tsx`**
  - Camión/marcador: se detiene en el destino al llegar a "Entregado" (`translate(370 50)`) y no activa `animateMotion`/SMIL con `prefers-reduced-motion`.
  - Telemetría: muestra el campo `time` del estado cuando existe.
  - Mapa: colores fijos sustituidos por `var(--line)`, `var(--text-dim)`, `var(--on-brand)`.
  - Control permanente `⏸ Pausar` / `▶ Reanudar` con `aria-pressed`, junto al botón de simular entrega.
- **`LandingNav.tsx`**
  - Menú móvil hamburguesa: botón `.nav-toggle` con `aria-expanded`/`aria-controls`, icono que se transforma en X, panel desplegable vertical y cierre al pulsar cualquier enlace.
  - Enlace `#comparativa` con `aria-label`/`title` que aclara su destino (usa `content.comparison.title`).
- **`LandingSimulator.tsx`**
  - Muestra el `supplier` de cada producto.
  - Botones `+/-` con `aria-label` por producto; cantidad con `aria-live="polite"`.
  - `aria-pressed` en los botones de tipo; guard de `Array.isArray` en `simulator.types`.
  - Confirmación de pedido usa `var(--emerald)` / `var(--on-accent)` en vez de hex fijo.
- **`LandingRoles.tsx`**
  - Semántica `role="tablist"`, `role="tab"`/`role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby` y `hidden`.
  - Navegación por teclado: flechas izquierda/derecha, Home y End, con movimiento de foco.
  - Mockup de "acción" convertido en `<span>` no accionable (`.mockup-action`).
- **`LandingUpdates.tsx`**
  - Enlaces saneados con `safeLinkValue`: se descartan `javascript:`, `data:`, `//host`, etc.; `rel="noopener noreferrer"`.
  - Imágenes validadas con `isExternalHttpUrl` y ocultadas si fallan (sin icono roto).
  - Guard de arrays en `banners.items`/`news.items`.
  - Encabezado de noticias propio cuando no hay banners; `aria-label` en `#noticias`.
- **`LandingFooter.tsx`**
  - Reordenado: menú primero, luego copyright, créditos y contacto.
  - `<nav aria-label="Enlaces del pie de página">` con anclas `#features`, `#simulador`, `#roles`, `#como`, `#comparativa`.
  - **Eliminados** los enlaces redundantes de login/registro (ya están en la barra superior).
  - Copyright corto: solo la parte antes del `•`.
  - Créditos "Creado por ..." como insignia con icono de personas (nombres desde el CMS).
  - Tres iconos circulares con `aria-label`/`title`: GitHub Juan (`https://github.com/JuanBerro-back`), GitHub Fabio (`https://github.com/chamorromunozfabio-dotcom`) y correo del CMS (`mailto:`).
  - Quitados texto corrido de contacto, dirección e información ADSO/SENA.
- **`LandingCta.tsx`**: descarga del APK usa `getApkDownloadUrl()` (cache-buster) en lugar de `/Xupply.apk`.

## Módulo: `modules/public/landing/pages/`

- **`Landing.tsx`**
  - Barra de progreso montada con `createPortal` en `document.body` (fuera de `.landing-page`) y `ref` en el relleno `<i>`, con variables de color del CMS.
  - `<main className="wrap">` → `<div className="wrap">` para evitar `<main>` anidado dentro del `<main>` del shell.
  - Estructura general envuelta en fragment para el portal.
- **`Landing.css`**
  - `overflow-x: hidden` → `overflow-x: clip` para no romper el `position: sticky` del nav.
  - Barra `#pg`: pista visible de 4px, z-index 1000, relleno con gradiente del tema.
  - Variables nuevas: `--on-brand`, `--on-accent`, `--panel`, `--panel-soft`, `--panel-solid`, `--bg-card`, `--bg-card-hover`; `--text-dim` subido a `#94a3b8` (WCAG AA).
  - Botones/pastillas usan `--on-brand`/`--on-accent` para contraste automático; fondos fijos sustituidos por variables de panel.
  - `scroll-margin-top: 84px` en `section[id]` para que los anchors no queden tapados por el nav.
  - Marquee: `translateX(calc(-50% - 9px))` para eliminar el salto por ciclo.
  - Novedades/noticias: espaciado reducido a 48px/20px/0.
  - `.role-panel[hidden] { display: none !important; }` y estilos de `.mockup-action-box` / `.mockup-action`.
  - Footer: layout vertical centrado, menú en chips redondeados, copyright/cred/iconos con hover y `:focus-visible`.
  - ≤960px: menú hamburguesa desplegable (en vez de fila scrolleable); ≤640px botones de acceso más compactos.
  - `@media (prefers-reduced-motion: reduce)` global de la landing (aurora, marquee, transiciones).

## Módulo: `shared/lib/`

- **`landingAppearance.ts`**
  - `safeHexColor()` aplicado a todos los colores publicados antes de inyectarlos en CSS.
  - Helpers nuevos: `shiftHexColor()` (`--emerald-light`/`--emerald-dark`, `--bg-card*`) y `contrastText()` (`--on-brand`/`--on-accent` con luminancia).
  - `auroraColors` validado como array; overlay de fondo saneado; gradientes construidos con colores normalizados.
- **`landingContent.ts`**: `deepMerge` ignora valores publicados con forma distinta al default (array vs objeto, cambio de tipo primitivo) para evitar pantallas rotas.
- **`safeValues.ts`**: `isSafeLink` rechaza caracteres de control, `//host`, `\` y `/\`, además de `javascript:`/`data:`.

## Módulo: `modules/admin/components/`

- **`ContentField.tsx`**: el campo `link_url` descarta al salir (`onBlur`) el valor si no pasa `isSafeLink`, evitando publicar enlaces inseguros.

## Entorno / backend (no versionado)

- `app/backend/.env` configurado para usar la BD existente `xupply-db-pruebas` en `127.0.0.1:55432` (usuario/contraseña y `JWT_SECRET` solo en el archivo gitignored).
- Servidor de API lanzado como proceso independiente en `http://localhost:4000`; seed de usuarios demo ya aplicado y contraseñas restablecidas a `demo1234` (ver tabla al inicio).
- Aviso no bloqueante al arrancar: no se pudo crear `uq_review_supplier_user` por reseñas duplicadas existentes.

---

## Módulo: Shell / Ajustes / Admin (2026-11-27)

- **`shared/ui/Navbar.tsx`**: se eliminó el botón hamburguesa, el estado `drawerOpen`, el listener `xupply_open_drawer` y el render de `HamburgerDrawer`. Se quitaron del header los controles de idioma y modo claro/oscuro; ahora viven en Ajustes. Para roles no-backoffice se agregó un botón/enlace **Ajustes** hacia `/ajustes`; el backoffice usa el rail lateral. El botón de cierre de sesión rápido del header se conserva (controlado por `shell.visibility.showLogout`).
- **`shared/ui/AjustesPage.tsx`** *(nuevo)*: página de Ajustes que concentra el contenido del antiguo drawer: perfil, preferencias de alertas (sonido/stock bajo con `localStorage`), términos y condiciones, y controles de tema/idioma respetando `shell.visibility.showTheme/showLanguage`. Para roles no-backoffice muestra accesos a módulos (catálogo, pedidos, inventario, logística, radar, equipo, proveedores, facturación, contabilidad, planes, IA) según permisos/rol.
- **`shared/ui/BottomNav.tsx`**: el botón “Menú” que disparaba el drawer fue reemplazado por un enlace a `/ajustes`.
- **`modules/operations/dashboard/pages/Dashboard.tsx`**: el CTA “Menú lateral / full drawer” ahora enlaza a `/ajustes`; se removió el disparo de `xupply_open_drawer` y la importación/uso innecesario de `useNavigate`.
- **`modules/identity/profile/routes.tsx`**: se registró la ruta protegida `/ajustes` (`RequireAuth`) con carga lazy de `AjustesPage`.
- **`modules/admin/routes.tsx`**: se agregó la ruta `/admin/ajustes` dentro del layout admin, accesible para usuarios con acceso al backoffice.
- **`modules/admin/components/AdminLayout.tsx`**: se añadió el ítem **Ajustes** al rail lateral (`/admin/ajustes`, icono `IconSettings`) para todos los roles con acceso al backoffice.
- **`shared/ui/HamburgerDrawer.tsx`**: quedó sin referencias de uso; se conserva el archivo (no eliminado) por no ser una eliminación solicitada explícitamente.

---

## Verificación

- `npm run build --prefix app/frontend` → compilación correcta (`✓ built in 11.76s`).
- Health check de la API → `HTTP 200 {"status":"ok","service":"xupply-api","db":"connected","tables_ready":true}`.
- `HamburgerDrawer.tsx` sin imports/usos externos; referencias solo internas al componente.
