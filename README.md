# Prosumia — un único Dashboard para todos los universos

Este proyecto **nuevo y separado** usa un solo componente `UnifiedDashboard.tsx` y cuatro vistas reutilizables. No reemplaza ni modifica el sitio estable existente. Conserva la base histórica e imágenes originales y suma el megaarchivo de 8.503 filas.

## Estructura

```
src/
  components/
    UnifiedDashboard.tsx       # UNA navegación, UN selector y CUATRO vistas compartidas
    unified.css                # Estilos de este proyecto
  lib/
    catalog.ts                 # Universos, categorías, imágenes opcionales y padrón
    metrics.ts                 # Lectura de ambos CSV, cálculos, nulos, temporalidad
    governors.ts               # Catálogo histórico de cuentas y fotografías original
  index.css
  main.tsx
public/
  data.csv                     # Base de Gobernadores, sin cambios
  mega_metricas.csv           # Seis categorías nuevas
  [imágenes originales]
docs/                          # Contrato técnico original
AGENTS.md
vite.config.ts
package.json
```

## Ejecutar

```bash
npm install
npm run dev
```

Compilar: `npx vite build`. Abrir la dirección local que muestre Vite. **No subir este proyecto sobre `main` sin pruebas de aceptación visual.**

## Solo incorporar fotografías/logos

1. Copiar imágenes a `public/imagenes/` (crear carpeta si no existe).
2. Abrir `src/lib/catalog.ts`.
3. Agregar por ejemplo `'Intendente|Armando Molina': 'imagenes/armando-molina.png'` al objeto `ENTITY_IMAGES`.
4. No cambiar selector, ranking ni gráficos. Para un perfil sin imagen se muestran iniciales.

## Reglas de datos

- Universo Gobernadores: `Gobernador` y `Gobierno`.
- Universo Dirigentes: `Intendente`, `Ministro provincial`, `Figuras nacionales`.
- Universo Medios: `Detractor` (clasificación provisional, editable en catálogo).
- Universo Organismos: `Municipio`, `Ministerio provincial`.
- `TT` y `TK` NO se fusionan sin confirmación. `X` tampoco se fusiona con `TW` sin validación.
- `Crecimiento seguidores` y `Crecimiento de seguidores` se reconocen como un mismo indicador.
- Falta de datos se muestra `s/d`. No se imputa cero.
- `Fans`: último valor del intervalo; flujos: suma del intervalo.
- La interfaz aplica las mismas cuatro vistas a todos los universos; las métricas incompatibles con el padrón no se calculan.

## Alcance y límites de esta primera versión

El objetivo es probar el **sistema común** y que se pueda navegar con datos reales. **No es aún una copia visual perfecta del Dashboard original**, cuyo Evolutivo tenía selectores y avatares finales adicionales; éstos se mantienen documentados como requisitos posteriores. En particular, faltan exportación, selección simultánea de varias redes en Evolutivo y el modo Clásico/Personalizado del original. No confundir prototipo unificado con versión aprobada.
