# Arquitectura del prototipo unificado

**Regla de implementación:** no escribir una vista distinta por categoría; toda categoría se renderiza mediante los mismos componentes de UnifiedDashboard.

Entradas: `public/data.csv` y `public/mega_metricas.csv`.

`metrics.ts` convierte ambos formatos a `Observation {year,month,network,category,entity,metric,value,province,universe}`; las 8.503 filas se conservan salvo registros inválidos. `catalog.ts` mapea todas las categorías a cuatro universos y suministra imágenes opcionales. `UnifiedDashboard.tsx` controla exactamente un estado de universo, pestaña, categoría, provincia, red, período y selección de cuentas.

Las cuatro vistas consumen `Identity[]` y `Observation[]`:
- `Rankings`: cinco tarjetas mensuales, sin imputación de faltantes.
- `Reading`: detalle de cuentas con indicadores comparables; no fabrica análisis ni alertas que no estén en los datos.
- `Evolution`: Recharts `LineChart`, series individualizadas y agregaciones por temporalidad.
- `Comparison`: cinco columnas con red/métrica independientes.

**Limitaciones declaradas:** la interfaz reproduce la arquitectura común y parte de la estética, no todas las funciones del Dashboard legacy; deberá pasar pruebas visuales y paridad funcional antes de reemplazar la aplicación principal.
