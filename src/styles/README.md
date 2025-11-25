# Global styling guide

Este directorio concentra los estilos compartidos del gestor. El enfoque es **mobile-first**, por lo que las reglas base están optimizadas para pantallas pequeñas y los `@media (min-width: …)` escalan hasta desktop.

- `variables.css`: tokens de color, tipografía, sombras y componentes de texto (`h2`, `p`, `span`, `.loading`, `.error`). Importalo siempre antes del resto para garantizar que los tokens estén disponibles.
- `buttons.css`: estilos para botones primarios/secundarios, variantes (`success`, `danger`, `outline`, `ghost`) y grupos de botones.
- `form.css`: layout de formularios, listas y contenedores (`.form-container`, `.list-container`), inputs, autocompletados y tarjetas informativas.
- `table.css`: tablas responsivas con scroll horizontal en tablet/mobile mediante `.table-wrapper` y `min-width` dinámico.
- `navbar.css`: estructuras del dashboard (`.sidebar`, `.nav-links`, `.dropdown`, `.main-content`).

Para utilizar los estilos basta con importar `src/styles.css`, que a su vez importa cada módulo. Los CSS específicos de features se dejaron vacíos y sin referencias; podés eliminarlos del repositorio si lo deseás.