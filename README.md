# Zurifit

App web personal para registrar el progreso de la **rutina de gimnasio de 4 días para
principiante**: series, repeticiones, peso levantado y cardio, con récords, gráficas y logros.

Todo el contenido de la rutina (los cuatro días, los rangos de repeticiones, los descansos,
los minutos de cardio por semana y las fichas de cada ejercicio) sale del PDF
*«Rutina de gimnasio · 4 días · guía sencilla para empezar desde cero»*.

## Cómo funciona

- **Sin servidor y sin cuentas.** Es una web estática. Los datos se guardan en el
  `localStorage` del navegador del móvil, así que no salen del dispositivo.
- **Instalable (PWA).** Se puede añadir a la pantalla de inicio y funciona sin conexión
  gracias al *service worker*.
- **Copia de seguridad.** Desde *Perfil → Copia de seguridad* se descarga un JSON con todo
  el progreso y se puede restaurar en otro móvil.

## Qué incluye

| Zona | Qué hace |
|---|---|
| **Hoy** | Saludo con su nombre, semana del programa, día sugerido, nota del día, progreso semanal (entrenos y minutos de cardio), racha, nivel y «recuerdos» del tipo *hace 21 días hacías prensa con 30 kg, hoy vas por 45*. |
| **Entrenamiento** | Registro serie a serie con teclado numérico, peso propuesto a partir de la última vez, aviso de cuándo toca subir peso (regla del PDF: si completas el tope del rango en todas las series, sube), cronómetro de descanso con los segundos de cada ejercicio, repeticiones en reserva opcionales, notas por ejercicio, cambio por el ejercicio alternativo, ficha de técnica y bloque de cardio con el objetivo de la semana. |
| **Récords** | Detección automática de marcas personales (peso, repeticiones, segundos) con celebración: confeti, vibración y aviso. |
| **Progreso** | Gráficas de peso movido, cardio y entrenos por semana; evolución por ejercicio (peso máximo, volumen y fuerza estimada con la fórmula de Epley); tabla de récords e historial completo. |
| **Rutina** | Los 4 días tal cual vienen en el PDF, la biblioteca con las 22 fichas de técnica (21 ejercicios + cardio) y la guía (cómo progresar, cardio, checklist, material). |
| **Logros** | 29 logros en cuatro categorías, niveles y puntos. |
| **Perfil** | Nombre, fecha de inicio, semana del programa, sonido/vibración/cronómetro automático, copia de seguridad. |

Las semanas 1 y 2 se tratan como adaptación: 2 series por ejercicio y menos minutos de
cardio, exactamente como indica el PDF.

## Estructura

```
index.html              carcasa de la app
manifest.webmanifest    metadatos de la PWA
sw.js                   service worker (funciona sin conexión)
css/styles.css          sistema visual
js/main.js              router y navegación
js/store.js             estado y persistencia en localStorage
js/stats.js             récords, progresión, rachas, recuerdos y nivel
js/data/                rutina, ejercicios, mensajes y logros
js/lib/                 utilidades: gráficas SVG, cronómetro, confeti
js/views/               pantallas
```

## Desarrollo

No hay build ni dependencias. Para probarla en local hace falta servirla por HTTP
(los módulos ES y el service worker no funcionan abriendo el archivo directamente):

```bash
python3 -m http.server 8000
# y abrir http://localhost:8000
```

Al cambiar cualquier archivo, sube el número de versión de `CACHE` en `sw.js` para que
los móviles que ya la tengan instalada descarguen la versión nueva.

## Publicación

Se publica directamente desde la rama `main` con GitHub Pages:

*Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch:
`main` / `(root)` → Save*

Queda en <https://carlosgutierrezmartin.github.io/Zurifit/> y se actualiza solo con cada
push a `main`. El archivo `.nojekyll` desactiva el procesado de Jekyll, que no hace falta
en un sitio estático como este.
