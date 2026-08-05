# DN Training – Enciclopedia & Rutinas (PWA)

## ⚠️ Antes de subir a GitHub (causa más común de que Pages no muestre la app)
El `index.html` tiene que quedar en la **raíz del repositorio**, no dentro de una subcarpeta `dnt_app/`.

Al descomprimir este zip vas a tener una carpeta `dnt_app/`. Andá **adentro** de esa carpeta antes de inicializar git:

```bash
cd dnt_app        # importante: entrar a la carpeta primero
git init
git add .
git commit -m "DN Training - Enciclopedia y Rutinas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

Si ya tenías un repo creado y el `index.html` quedó adentro de `dnt_app/dnt_app/` o similar, lo más rápido es borrar el repo en GitHub, crear uno nuevo vacío, y repetir los pasos de arriba desde cero.

**Cómo confirmar que quedó bien:** en la página del repo en GitHub, el archivo `index.html` tiene que aparecer directo en la lista principal de archivos (no adentro de ninguna carpeta).

## Activar GitHub Pages
Repo → **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` → carpeta `/ (root)` → **Save**.
Tarda 1-2 minutos en publicarse la primera vez. Queda en `https://TU_USUARIO.github.io/TU_REPO/`.

## Si el navegador solo ofrece "Crear acceso directo" y no "Instalar app"
Eso significa que Chrome todavía no confirmó que la app cumple los requisitos de instalación (no es que esté mal armada, es que necesita "asentarse"). Pasos para forzarlo:
1. Entrá al sitio, esperá ~10 segundos (necesita tiempo para registrar el service worker) y **recargá la página una vez**.
2. Si seguís viendo solo "Crear acceso directo": Chrome (⋮) → **Configuración → Configuración del sitio** → buscá el sitio → **Borrar y restablecer** → volvé a entrar.
3. Para confirmar exactamente qué falta (lo más confiable): abrí el sitio en **Chrome de escritorio** → F12 → pestaña **Application** → **Manifest**. Ahí Chrome lista en rojo cualquier requisito que no se esté cumpliendo.

Ya corregí dos causas típicas de este problema en esta versión: el service worker podía quedar "colgado" si una sola imagen fallaba al cachear (ahora tolera fallos individuales), y le agregué el campo `id` al manifest que algunas versiones de Chrome piden para habilitar la instalación.

## Qué incluye esta carpeta
- `index.html` — la app completa (1128 ejercicios embebidos, buscador, filtros, creador de rutinas), sin dependencias externas
- `manifest.json` — hace que el navegador la reconozca como app instalable
- `service-worker.js` — motor de caché offline
- `icons/` — íconos en todos los tamaños, con versión "maskable" (con margen de seguridad) para que Android no recorte el logo al aplicar máscaras circulares

## 1. Probarla (IMPORTANTE)
El modo offline **no funciona abriendo el `index.html` con doble clic** (`file://`), porque los Service Workers requieren `http://` o `https://`. Para probarla localmente:

```bash
cd dnt_app
python3 -m http.server 8080
```
Después abrí `http://localhost:8080` en Chrome (celular o PC, misma red Wi-Fi cambiando localhost por tu IP local).

## 2. Cómo queda "offline"
1. Abrís la app con internet.
2. Tocás **"⬇ Usar sin internet"** (arriba de la enciclopedia). Descarga y guarda en caché las ~1128 imágenes de ejercicios.
3. De ahí en adelante, el Service Worker sirve todo desde el teléfono: app + imágenes, sin conexión.
4. Los videos de YouTube sí necesitan internet la primera vez que se reproducen (son streaming, no se pueden guardar offline por ser contenido de terceros).

## 3. Sobre los ejercicios sin imagen
No pude verificar cuáles de los ~1128 links de imagen están rotos desde mi entorno (no tengo salida de red a ese dominio). En vez de eso, la app lo resuelve sola: si una imagen no carga, ese ejercicio se oculta automáticamente de la enciclopedia en tiempo real. Es más confiable que una limpieza manual porque se ajusta solo si algún link se cae en el futuro.

## 4. Instalarla como "app" (sin tienda de aplicaciones)
Con la app abierta en Chrome/Android:
- Menú (⋮) → **"Instalar app"** o **"Añadir a pantalla de inicio"**
Queda con ícono propio, pantalla completa, sin barra de navegador — se siente nativa.

En iPhone (Safari): botón compartir → **"Añadir a pantalla de inicio"**.

## 5. Convertirla en app nativa real (APK / Play Store)
Para publicarla en Google Play como app instalable desde la tienda, no hace falta reescribir nada — se empaqueta la PWA:

**Opción fácil — PWABuilder (recomendado):**
1. Subí esta carpeta a un hosting con HTTPS (GitHub Pages, Netlify, Vercel — cualquiera gratis sirve).
2. Andá a https://www.pwabuilder.com y pegá la URL.
3. Generá el paquete Android (.aab) listo para subir a Play Console.

**Opción alternativa — Bubblewrap (línea de comandos, más control):**
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://tu-dominio.com/manifest.json
bubblewrap build
```
Esto genera un `.apk`/`.aab` firmado usando Trusted Web Activity (la forma oficial de Google de empaquetar PWAs).

Cualquiera de las dos opciones requiere que la app esté publicada en un dominio con HTTPS primero (no funciona desde localhost).
