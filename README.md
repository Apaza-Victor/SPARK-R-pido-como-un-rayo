# SPARK — Rápido como un rayo

Web para aprender los atajos de teclado de tus herramientas de diseño, vídeo y código.
Elige una herramienta, pasa el ratón por un atajo y mira cómo se iluminan las teclas en un teclado mecánico interactivo.

**En producción**: https://apaza-victor.github.io/SPARK-R-pido-como-un-rayo/

## Características

- **Teclado interactivo**: teclado mecánico (pure CSS) que ilumina las teclas del atajo bajo el ratón, con sonido al pulsar (GL Tactile / Linear / Clicky), ciclo de colores RGB, brillo, modo juego y LEDs.
- **72 herramientas**: Figma, Photoshop, Illustrator, InDesign, Lightroom, Blender, Affinity, Framer, Webflow, Spline, After Effects, DaVinci, CapCut, Premiere, Cursor, VS Code, Lovable, Xcode, Claude, Copilot, Notion, Slack, Linear, Obsidian, BluffTitler, AutoCAD, GIMP, Inkscape, Docker, CMD, PowerShell, Windows, macOS, SketchUp, GitHub Desktop y muchas más.
- **Carrusel de logos**: tira de marcas con scroll infinito que enlaza directo a cada herramienta.
- **Búsqueda**: filtra herramientas y atajos al instante.
- **Bilingüe**: español e inglés.
- **macOS / Windows**: el teclado y los símbolos (Cmd / Ctrl) se adaptan a la plataforma.
- **LEDs**: indicadores de Bloq Mayús y Bloq Num en el propio teclado.
- **Easter egg**: pulsa F4.

## Estructura

```
index.html            Aplicación (sidebar + teclado + logos)
favicon.svg           Favicon de la marca
css/styles.css        Todos los estilos
js/app.js             Lógica de la app (UI, i18n, búsqueda, luz de teclas)
js/data.js            Carga de los datos de atajos
js/keys.js            Mapa de teclas (SPARK_KEYS)
js/logos.js           Logos SVG de las herramientas (SPARK_LOGOS)
js/twboard.js         Teclado mecánico (SPARK_BOARD)
js/bg.js              Fondo 3D (SPARK_BRANDS)
data/shrtcts-data.json  Base de datos de herramientas y atajos
pages/cambios.html    Historial de cambios
assets/img/           Recursos gráficos (logos SVG / webp)
snd/                  Sonidos locales (sin uso)
```

## Datos de atajos

Los atajos viven en `data/shrtcts-data.json`:

```json
{
  "cats": [
    {
      "name": "DESIGN",
      "tools": [
        { "id": "figma", "name": "Figma", "hotkey": "cmd+F" }
      ]
    }
  ],
  "affinity": [
    {
      "label": "Studio Switching",
      "items": [
        { "action": "cycle studios", "keys": ["cmd", "."] }
      ]
    }
  ]
}
```

Para añadir una herramienta nueva:
1. Añade su logo a `js/logos.js` (`window.SPARK_LOGOS`).
2. Añade su color y abreviatura en `js/app.js` (objeto `BRANDS`).
3. Añade sus atajos en `data/shrtcts-data.json`.
4. Inclúyela en la categoría correspondiente de `cats`.

## Puesta en marcha

No requiere compilación ni dependencias. Sírvelo con cualquier servidor estático:

```bash
# con Python
python -m http.server 8000

# con Node
npx serve .
```

Abre `http://localhost:8000`.

## Personalización

- **Idioma y plataforma** se guardan en `localStorage` como `spark-lang` y `spark-platform`.
- **Color de las teclas**: la variable `--key-text-highlight` (en `css/styles.css`) define el color de iluminación; cicla con las teclas M1–M3.
- **Colores de marca**: el azul se define en `:root` de `css/styles.css` (`--blue`, `--ink`).

## Derechos de autor

Copyright © 2026 Apaza-Victor. Todos los derechos reservados.

Los logos y marcas de las herramientas referenciadas son propiedad de sus respectivos titulares.
