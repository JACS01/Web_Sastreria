/* ============================================================
   Sastrería A&S - Filtro de color (accesibilidad)
   Aplica un filtro visual a TODA la página y lo mantiene
   activo al navegar entre las distintas pantallas del sistema,
   guardando la preferencia en localStorage.
   ============================================================ */
(function () {
    "use strict";

    const KEY_ACTIVO = "as_filtro_activo";
    const KEY_TIPO   = "as_filtro_tipo";
    const SVG_ID     = "as-filtros-svg";

    // Matrices de color estándar (Machado, Oliveira & Fairchild)
    // usadas para adaptar la paleta según el tipo de daltonismo.
    const FILTROS = {
        deuteranopia: "url(#as-filtro-deuteranopia)",
        protanopia:   "url(#as-filtro-protanopia)",
        tritanopia:   "url(#as-filtro-tritanopia)",
        grises:       "grayscale(100%)"
    };

    function inyectarSVG() {
        if (document.getElementById(SVG_ID)) return;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("id", SVG_ID);
        svg.setAttribute("aria-hidden", "true");
        svg.style.position = "absolute";
        svg.style.width = "0";
        svg.style.height = "0";
        svg.style.overflow = "hidden";

        svg.innerHTML =
            '<defs>' +
                '<filter id="as-filtro-deuteranopia">' +
                    '<feColorMatrix type="matrix" values="' +
                        '0.625 0.375 0     0 0 ' +
                        '0.7   0.3   0     0 0 ' +
                        '0     0.3   0.7   0 0 ' +
                        '0     0     0     1 0"/>' +
                '</filter>' +
                '<filter id="as-filtro-protanopia">' +
                    '<feColorMatrix type="matrix" values="' +
                        '0.567 0.433 0     0 0 ' +
                        '0.558 0.442 0     0 0 ' +
                        '0     0.242 0.758 0 0 ' +
                        '0     0     0     1 0"/>' +
                '</filter>' +
                '<filter id="as-filtro-tritanopia">' +
                    '<feColorMatrix type="matrix" values="' +
                        '0.95  0.05  0     0 0 ' +
                        '0     0.433 0.567 0 0 ' +
                        '0     0.475 0.525 0 0 ' +
                        '0     0     0     1 0"/>' +
                '</filter>' +
            '</defs>';

        (document.body || document.documentElement).appendChild(svg);
    }

    function aplicarEnPantalla(activo, tipo) {
        inyectarSVG();
        if (activo && FILTROS[tipo]) {
            document.documentElement.style.filter = FILTROS[tipo];
        } else {
            document.documentElement.style.filter = "";
        }
    }

    function aplicarFiltroGuardado() {
        const estado = obtenerEstado();
        aplicarEnPantalla(estado.activo, estado.tipo);
    }

    function aplicarEstiloInmediato() {
        // <html> siempre existe aunque el <body> no se haya parseado
        // todavía, así evitamos el "parpadeo" de colores sin filtrar.
        const estado = obtenerEstado();
        if (estado.activo && FILTROS[estado.tipo]) {
            document.documentElement.style.filter = FILTROS[estado.tipo];
        }
    }

    function activarFiltro(tipo) {
        if (!FILTROS[tipo]) return;
        localStorage.setItem(KEY_ACTIVO, "true");
        localStorage.setItem(KEY_TIPO, tipo);
        aplicarEnPantalla(true, tipo);
    }

    function desactivarFiltro() {
        localStorage.setItem(KEY_ACTIVO, "false");
        aplicarEnPantalla(false, null);
    }

    function obtenerEstado() {
        return {
            activo: localStorage.getItem(KEY_ACTIVO) === "true",
            tipo:   localStorage.getItem(KEY_TIPO) || "deuteranopia"
        };
    }

    // API pública usada por Filtro.html (y cualquier otra página)
    window.ASFiltroColor = {
        activar: activarFiltro,
        desactivar: desactivarFiltro,
        estado: obtenerEstado,
        tipos: Object.keys(FILTROS)
    };

    // 1) Aplica el filtro de inmediato (sin esperar al <body>) para
    //    que no haya parpadeo de colores sin filtrar.
    aplicarEstiloInmediato();

    // 2) Cuando el <body> ya existe, inyecta el SVG con las matrices
    //    de color y confirma el filtro (por si el script se cargó
    //    antes de tener document.documentElement disponible).
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", aplicarFiltroGuardado);
    } else {
        aplicarFiltroGuardado();
    }
})();
