/* ============================================================
   Sastrería A&S - Modo Oscuro
   Añade un botón con ícono animado (sol / luna) al encabezado
   de cada pantalla para alternar entre tema claro y oscuro.
   La preferencia se guarda en localStorage y se aplica de
   inmediato en cada pantalla (sin parpadeos), igual que el
   zoom y el filtro de color.
   ============================================================ */
(function () {
    "use strict";

    const KEY = "as_modo_oscuro";
    const CLASE = "dark-mode";

    function estaActivo() {
        return localStorage.getItem(KEY) === "true";
    }

    function aplicar(activo) {
        document.documentElement.classList.toggle(CLASE, activo);
        document.documentElement.style.colorScheme = activo ? "dark" : "light";
    }

    // Aplica el tema guardado de inmediato (antes de pintar el <body>)
    // para evitar el parpadeo de colores claros al cargar la página.
    aplicar(estaActivo());

    function guardar(activo) {
        localStorage.setItem(KEY, activo ? "true" : "false");
        aplicar(activo);
        actualizarBoton();
        document.dispatchEvent(new CustomEvent("as-modo-oscuro-cambio", { detail: { activo } }));
    }

    function alternar() {
        guardar(!estaActivo());
    }

    /* ===== Hoja de estilos del modo oscuro =====
       Se aplica a las clases comunes que se repiten en todas las
       pantallas del sistema (sidebar, topbar, tarjetas, tablas,
       formularios, etc.) para que el modo oscuro funcione en
       cualquier vista sin necesidad de tocar cada hoja de estilos. */
    function inyectarEstilos() {
        if (document.getElementById("as-modo-oscuro-estilos")) return;
        const style = document.createElement("style");
        style.id = "as-modo-oscuro-estilos";
        style.textContent = `
html.${CLASE} {
    color-scheme: dark;
    /* Sobrescribimos las variables de color que usan todas las
       pantallas (incluidos los estilos "inline" con var(--navy)
       o var(--brand-blue)) para que ningún texto quede oscuro
       sobre el fondo oscuro. */
    --navy: #e9edf5;
    --brand-blue: #e9edf5;
    --sidebar-bg: #141d33;
    --sidebar-active: #1f2c4a;
    --soft-blue: #141d33;
    --topbar-border: #3a4a6b;
}

html.${CLASE} body {
    background: #0e1626 !important;
    color: #e9edf5 !important;
}

/* Sidebar / navegación lateral */
html.${CLASE} #sidebar,
html.${CLASE} .left-side {
    background: #141d33 !important;
}
html.${CLASE} .sidebar-nav li a,
html.${CLASE} .submenu-toggle,
html.${CLASE} .brand-title,
html.${CLASE} .brand-sub {
    color: #e9edf5 !important;
}
html.${CLASE} .sidebar-nav li a i,
html.${CLASE} .submenu-toggle i.main-icon,
html.${CLASE} .submenu-toggle .chevron {
    color: #e9edf5 !important;
}
html.${CLASE} .sidebar-nav li a:hover,
html.${CLASE} .sidebar-nav li.active a,
html.${CLASE} .submenu-toggle:hover {
    background-color: #1f2c4a !important;
}
html.${CLASE} .sidebar-bottom {
    border-top-color: rgba(255,255,255,0.12) !important;
}

/* Barra superior */
html.${CLASE} .topbar,
html.${CLASE} nav.topbar {
    background: #0e1626 !important;
    border-bottom-color: #3a4a6b !important;
}
html.${CLASE} .topbar-left i,
html.${CLASE} .topbar-username,
html.${CLASE} .nav-link {
    color: #e9edf5 !important;
}

/* Títulos y textos */
html.${CLASE} .page-title,
html.${CLASE} .page-sub,
html.${CLASE} .welcome-title,
html.${CLASE} .welcome-sub,
html.${CLASE} .section-title,
html.${CLASE} .section-subtitle,
html.${CLASE} .field-label,
html.${CLASE} .client-name,
html.${CLASE} .client-info-row,
html.${CLASE} .hero-title,
html.${CLASE} h1, html.${CLASE} h2, html.${CLASE} h3 {
    color: #e9edf5 !important;
}
html.${CLASE} .text-muted { color: #aab4c8 !important; }

/* Contenido principal */
html.${CLASE} .content-area,
html.${CLASE} .form-container {
    background: #0e1626 !important;
}

/* Tarjetas */
html.${CLASE} .kpi-card,
html.${CLASE} .client-card,
html.${CLASE} .clients-grid {
    background: #161f38 !important;
    border-color: #33405e !important;
}
html.${CLASE} .kpi-label,
html.${CLASE} .kpi-number,
html.${CLASE} .client-link,
html.${CLASE} .kpi-card-header i,
html.${CLASE} .client-info-row i {
    color: #e9edf5 !important;
}

/* Formularios */
html.${CLASE} .form-input,
html.${CLASE} .form-control,
html.${CLASE} textarea.form-input,
html.${CLASE} select.form-input {
    background: #161f38 !important;
    color: #e9edf5 !important;
    border-color: #33405e !important;
}
html.${CLASE} .form-input::placeholder,
html.${CLASE} .form-control::placeholder {
    color: #8b95ac !important;
}
html.${CLASE} .input-group-text {
    background: #161f38 !important;
    color: #e9edf5 !important;
}
html.${CLASE} .select-wrap::after { color: #e9edf5 !important; }

/* Tablas */
html.${CLASE} .table-entregas th,
html.${CLASE} .table-entregas td,
html.${CLASE} .table-pedidos th,
html.${CLASE} .table-pedidos td {
    background: #0e1626 !important;
    color: #e9edf5 !important;
    border-color: #33405e !important;
}

/* Búsqueda / paginación */
html.${CLASE} .search-wrap {
    background: #161f38 !important;
    border-color: #33405e !important;
}
html.${CLASE} .search-wrap input { color: #e9edf5 !important; }
html.${CLASE} .page-btn {
    background: #161f38 !important;
    color: #e9edf5 !important;
    border-color: #33405e !important;
}
html.${CLASE} .page-btn.active {
    background: var(--gold, #b8962e) !important;
    color: #0e1626 !important;
    border-color: var(--gold, #b8962e) !important;
}

/* Botones */
html.${CLASE} .btn-cancelar {
    background: #161f38 !important;
    color: #e9edf5 !important;
}
html.${CLASE} .features,
html.${CLASE} .hero-sub {
    background: #141d33 !important;
    color: #e9edf5 !important;
}

/* Textos con color oscuro escrito "a mano" (estilos inline) que
   antes quedaban invisibles sobre el fondo oscuro */
html.${CLASE} [style*="color:#555"],
html.${CLASE} [style*="color: #555"],
html.${CLASE} [style*="color:#888"],
html.${CLASE} [style*="color: #888"] {
    color: #c7cede !important;
}
html.${CLASE} [style*="accent-color:#555"],
html.${CLASE} [style*="accent-color: #555"] {
    accent-color: var(--gold, #b8962e) !important;
}
html.${CLASE} [style*="background-color:#f8f8f8"],
html.${CLASE} [style*="background-color: #f8f8f8"] {
    background-color: #1b2540 !important;
    color: #e9edf5 !important;
}
/* Campo de teléfono en Registrar Pedido: caja blanca inline
   que no seguía el resto del formulario */
html.${CLASE} [style*="background:#fff;"],
html.${CLASE} [style*="background: #fff;"] {
    background: #161f38 !important;
    border-color: #33405e !important;
}

/* ===== Calendario de entregas ===== */
html.${CLASE} .cal-nav-btn,
html.${CLASE} .cal-today-btn,
html.${CLASE} .cal-table th,
html.${CLASE} .cal-table td {
    background: #161f38 !important;
    color: #e9edf5 !important;
    border-color: #33405e !important;
}
html.${CLASE} .cal-table td.empty { background: #0e1626 !important; }
html.${CLASE} .cal-nav-btn:hover,
html.${CLASE} .cal-today-btn:hover { background: #1f2c4a !important; }
html.${CLASE} .cal-month-label,
html.${CLASE} .entregas-title { color: #e9edf5 !important; }
html.${CLASE} .entregas-section { border-color: #33405e !important; }

/* ===== Accesibilidad: filas del narrador y selector de voz ===== */
html.${CLASE} .fila-narrador:hover { background-color: #26314f !important; }
html.${CLASE} select,
html.${CLASE} select option,
html.${CLASE} #selVozNarrador,
html.${CLASE} #selVozNarrador option {
    background-color: #161f38 !important;
    color: #e9edf5 !important;
}

/* ===== Zoom ===== */
html.${CLASE} .zoom-value,
html.${CLASE} .info-panel,
html.${CLASE} .info-panel h3 { color: #e9edf5 !important; }
html.${CLASE} .info-panel { border-color: #33405e !important; }
html.${CLASE} .btn-restablecer {
    background: #161f38 !important;
    color: #e9edf5 !important;
    border-color: #5c6c8f !important;
}
html.${CLASE} .btn-restablecer:hover { background: #1f2c4a !important; }
html.${CLASE} .zoom-track { background: #33405e !important; }
html.${CLASE} .zoom-thumb { background: #e9edf5 !important; }

/* ===== Filtro de color ===== */
html.${CLASE} .color-preview-legend {
    background: #161f38 !important;
    color: #e9edf5 !important;
}
html.${CLASE} .filter-option { color: #e9edf5 !important; }
html.${CLASE} .vertical-divider { border-left-color: #33405e !important; }
html.${CLASE} .filter-dot { background: #1b2540 !important; border-color: #5c6c8f !important; }
html.${CLASE} .filter-option.active .filter-dot { background: #c7cede !important; border-color: #c7cede !important; }

/* Imágenes: se atenúan un poco para no encandilar */
html.${CLASE} img { filter: brightness(0.92); }
html.${CLASE} img.as-logo-dorado { filter: none; }

/* Botón de modo oscuro */
.as-modo-toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    padding: 0;
    overflow: hidden;
}
.as-modo-toggle:focus-visible {
    outline: 2px solid var(--gold, #b8962e);
    outline-offset: 2px;
}
.as-modo-toggle i {
    position: absolute;
    font-size: 1.55rem;
    transition: transform 0.45s cubic-bezier(.68,-0.25,.27,1.25), opacity 0.35s ease;
}
.as-modo-toggle .as-icon-sol {
    color: #b8962e;
    opacity: 1;
    transform: rotate(0deg) scale(1);
}
.as-modo-toggle .as-icon-luna {
    color: #9fb3d9;
    opacity: 0;
    transform: rotate(90deg) scale(0.4);
}
html.${CLASE} .as-modo-toggle .as-icon-sol {
    opacity: 0;
    transform: rotate(-90deg) scale(0.4);
}
html.${CLASE} .as-modo-toggle .as-icon-luna {
    opacity: 1;
    transform: rotate(0deg) scale(1);
}
.as-modo-toggle:hover i { filter: drop-shadow(0 0 6px rgba(184,150,46,0.55)); }

/* Ubicación flotante para pantallas sin barra superior
   (inicio de sesión, registro, landing) */
.as-modo-toggle.as-flotante {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 2000;
    width: 42px;
    height: 42px;
    background: #fff;
    box-shadow: 0 4px 14px rgba(0,0,0,0.2);
}
html.${CLASE} .as-modo-toggle.as-flotante { background: #161f38; }

/* Flecha de "volver" en la vista de Login */
.as-back-link { }
html.${CLASE} .as-back-link {
    background: #161f38 !important;
    color: #e9edf5 !important;
}
`;
        document.head.appendChild(style);
    }

    function crearBotonHTML() {
        return (
            '<i class="bi bi-sun-fill as-icon-sol"></i>' +
            '<i class="bi bi-moon-stars-fill as-icon-luna"></i>'
        );
    }

    function actualizarBoton() {
        const boton = document.getElementById("as-modo-oscuro-toggle");
        if (!boton) return;
        const activo = estaActivo();
        boton.setAttribute("aria-pressed", activo ? "true" : "false");
        boton.title = activo ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
        boton.setAttribute("aria-label", boton.title);
    }

    function crearBoton(flotante) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.id = "as-modo-oscuro-toggle";
        boton.className = "as-modo-toggle" + (flotante ? " as-flotante" : "");
        boton.innerHTML = crearBotonHTML();
        boton.addEventListener("click", alternar);
        return boton;
    }

    // Inserta el botón en el lugar más adecuado según la pantalla:
    // 1) junto a los íconos de la barra superior del panel (topbar-left)
    // 2) junto al botón de "Iniciar Sesión" en la landing (navbar)
    // 3) flotante en la esquina superior derecha (login / registro)
    function insertarBoton() {
        if (document.getElementById("as-modo-oscuro-toggle")) return;

        const topbarLeft = document.querySelector(".topbar-left");
        if (topbarLeft) {
            topbarLeft.appendChild(crearBoton(false));
            actualizarBoton();
            return;
        }

        const navExtra = document.querySelector("#navbarContenido .text-lg-end");
        if (navExtra) {
            const boton = crearBoton(false);
            boton.style.marginRight = "12px";
            boton.style.verticalAlign = "middle";
            navExtra.insertAdjacentElement("afterbegin", boton);
            actualizarBoton();
            return;
        }

        document.body.appendChild(crearBoton(true));
        actualizarBoton();
    }

    /* ===== Logo dorado en modo oscuro =====
       Todas las vistas que usan el logo "LogoA&S" cambian
       automáticamente al logo dorado "LogoA&S dorado" cuando se
       activa el modo oscuro, y vuelven al logo normal en modo claro. */
    function nombreLogoOscuro(src) {
        return src.replace(/(LogoA&S)(\.[a-zA-Z0-9]+)(\?.*)?$/i, "$1 dorado$2$3");
    }

    function actualizarLogos() {
        const activo = estaActivo();
        document.querySelectorAll('img[src*="LogoA&S"]').forEach((img) => {
            if (!img.dataset.asLogoClaro) {
                const actual = img.getAttribute("src");
                if (/dorado/i.test(actual)) return; // ya es el logo dorado, no tocar
                img.dataset.asLogoClaro = actual;
                img.dataset.asLogoOscuro = nombreLogoOscuro(actual);
            }
            img.src = activo ? img.dataset.asLogoOscuro : img.dataset.asLogoClaro;
            img.classList.toggle("as-logo-dorado", activo);
        });
    }

    document.addEventListener("as-modo-oscuro-cambio", actualizarLogos);

    window.ASModoOscuro = {
        estaActivo,
        activar: () => guardar(true),
        desactivar: () => guardar(false),
        alternar
    };

    inyectarEstilos();

    function init() {
        inyectarEstilos();
        insertarBoton();
        actualizarLogos();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
