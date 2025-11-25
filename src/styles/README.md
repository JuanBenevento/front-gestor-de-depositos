# 🎨 Estructura de Estilos - Gestor de Depósitos# Global styling guide



Arquitectura CSS modular organizada por componentes para facilitar el mantenimiento y escalabilidad.Este directorio concentra los estilos compartidos del gestor. El enfoque es **mobile-first**, por lo que las reglas base están optimizadas para pantallas pequeñas y los `@media (min-width: …)` escalan hasta desktop.



## 📁 Estructura de Archivos- `variables.css`: tokens de color, tipografía, sombras y componentes de texto (`h2`, `p`, `span`, `.loading`, `.error`). Importalo siempre antes del resto para garantizar que los tokens estén disponibles.

- `buttons.css`: estilos para botones primarios/secundarios, variantes (`success`, `danger`, `outline`, `ghost`) y grupos de botones.

```- `form.css`: layout de formularios, listas y contenedores (`.form-container`, `.list-container`), inputs, autocompletados y tarjetas informativas.

src/- `table.css`: tablas responsivas con scroll horizontal en tablet/mobile mediante `.table-wrapper` y `min-width` dinámico.

├── styles.css                    # Archivo principal que importa todos los módulos- `navbar.css`: estructuras del dashboard (`.sidebar`, `.nav-links`, `.dropdown`, `.main-content`).

└── styles/

    ├── variables.css            # Variables CSS (colores, sombras, radios, etc.)Para utilizar los estilos basta con importar `src/styles.css`, que a su vez importa cada módulo. Los CSS específicos de features se dejaron vacíos y sin referencias; podés eliminarlos del repositorio si lo deseás.
    ├── layout.css               # Contenedores y estructura general
    ├── navbar.css               # Sidebar/Navbar y navegación
    ├── buttons.css              # Todos los estilos de botones
    ├── form.css                 # Formularios, inputs, selects
    ├── table.css                # Tablas y wrappers responsivos
    └── utilities.css            # Clases auxiliares (loading, badges, cards)
```

## 📋 Descripción de Módulos

### 1. `variables.css` - Variables CSS Globales
Define todas las variables reutilizables del proyecto:
- **Colores**: Fondo, bordes, textos, estados (success, danger, warning)
- **Espaciado**: Variables de spacing (xs, sm, md, lg, xl)
- **Sombras**: Diferentes niveles de elevación
- **Border radius**: Tamaños de radio de bordes
- **Transiciones**: Duraciones estándar
- **Tipografía base**: Reset y estilos de headers

**Variables principales:**
```css
--color-bg-body
--color-primary
--color-success, --color-danger, --color-warning
--radius-sm, --radius-md, --radius-lg
--shadow-base, --shadow-md, --shadow-lg
--spacing-xs, --spacing-sm, --spacing-md, --spacing-lg
```

### 2. `layout.css` - Estructura y Contenedores
Estilos para la estructura principal de las páginas:
- `.user-management-container` - Contenedor principal para listas
- `.form-container` - Contenedor para formularios
- `.login-container` - Contenedor para login
- `.search-row` y `.search-group` - Buscadores y filtros
- Helpers: `.grid-2`, `.grid-3`, `.flex`, `.flex-between`
- Media queries responsive

### 3. `navbar.css` - Navegación
Sidebar/Navbar con soporte móvil:
- `.dashboard-container` - Contenedor principal del dashboard
- `.sidebar` - Menú lateral con transformación móvil
- `.burger-btn` - Botón hamburguesa animado (transforma a X)
- `.nav-links`, `.nav-btn` - Enlaces de navegación
- `.logout-btn` - Botón de cerrar sesión
- Overlay y menú mobile-first

### 4. `buttons.css` - Botones
Todos los estilos de botones del sistema:
- `.btn` - Botón base
- `.new-btn` - Botón "Nuevo" (verde)
- `.edit-btn` - Botón editar (azul)
- `.delete-btn` - Botón eliminar (rojo)
- `.secondary-btn` - Botón secundario/cancelar
- `.small-btn` - Variante pequeña
- `.btn-save`, `.btn-cancel` - Botones de formulario
- `.btn-add-mini`, `.btn-icon-add` - Botones inline
- Estados: hover, disabled, active

### 5. `form.css` - Formularios
Inputs, selects, form groups y validación:
- `.form-group` - Grupo de campo de formulario
- `.form-row-2` - Fila con 2 columnas
- `input`, `select`, `textarea` - Estilos base
- `.input-group` - Input con botón adjunto
- `.autocomplete-list`, `.custom-dropdown` - Dropdowns custom
- `.error-message` - Mensajes de validación
- Cards de información (`.proveedor-card-selected`)
- `.detalles-container` - Sección de detalles en forms

### 6. `table.css` - Tablas
Tablas responsivas con scroll horizontal:
- `.table-wrapper` - Contenedor con overflow-x auto
- `.user-table`, `.data-table` - Tablas principales
- Zebra striping (filas alternadas)
- Hover states
- `.table-header`, `.detalle-row` - Grid para detalles
- Scrollbar personalizado
- Responsive (min-width en móvil)

### 7. `utilities.css` - Utilidades
Clases auxiliares y helpers:
- `.loading` - Estado de carga animado
- `.error` - Mensajes de error
- `.badge`, `.badge-small` - Etiquetas y badges
- `.alert-*` - Alertas (success, danger, warning, info)
- `.spinner` - Loader animado
- `.card` - Cards genéricos
- `.divider` - Separadores horizontales/verticales
- `.hidden`, `.sr-only` - Visibility helpers

## 🎨 Paleta de Colores (Dark Theme)

```css
/* Fondos */
--color-bg-body: #02050d          (Negro profundo)
--color-surface: #0b1628          (Azul oscuro)

/* Primarios */
--color-primary: #0d6efd          (Azul)
--color-success: #117a39          (Verde)
--color-danger: #b82230           (Rojo)

/* Textos */
--color-text-primary: #dce8f9     (Blanco azulado)
--color-text-secondary: #b8c6dd   (Gris claro)
```

## 📱 Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

## 🚀 Uso

### Importar en componentes
Los estilos ya están importados globalmente en `src/styles.css`. No necesitas importarlos en componentes individuales.

### Crear un formulario
```html
<div class="form-container">
  <h2>Título del Formulario</h2>
  
  <form>
    <div class="form-group">
      <label>Campo</label>
      <input type="text" />
    </div>
    
    <div class="button-group">
      <button class="btn btn-save">Guardar</button>
      <button class="btn btn-cancel">Cancelar</button>
    </div>
  </form>
</div>
```

### Crear una tabla responsiva
```html
<div class="user-management-container">
  <h2>Lista de Items</h2>
  
  <button class="btn new-btn">+ Nuevo</button>
  
  <div class="table-wrapper">
    <table class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Item</td>
          <td class="actions">
            <button class="btn edit-btn">Editar</button>
            <button class="btn delete-btn">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

## ✅ Ventajas de esta Arquitectura

1. **Modularidad**: Cada archivo tiene una responsabilidad única
2. **Mantenibilidad**: Fácil encontrar y editar estilos específicos
3. **Reutilización**: Variables CSS evitan duplicación
4. **Performance**: Los imports se optimizan en build
5. **Escalabilidad**: Agregar nuevos módulos es simple
6. **Consistencia**: Todos usan las mismas variables

## 🔧 Agregar Nuevos Estilos

1. **Variable repetitiva**: Agrégala en `variables.css`
2. **Botón nuevo**: Agrégalo en `buttons.css`
3. **Input especial**: Agrégalo en `form.css`
4. **Utilidad general**: Agrégala en `utilities.css`

## 📝 Convenciones

- Usa variables CSS en lugar de valores hardcodeados
- Prefiere clases reutilizables sobre estilos inline
- Sigue el patrón BEM cuando sea apropiado
- Agrupa media queries al final de cada módulo
- Documenta con comentarios secciones complejas
