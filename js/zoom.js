/* ============================================================
   Sastrería A&S - Zoom de interfaz (accesibilidad)
   Aplica un nivel de zoom a TODA la página usando la propiedad
   CSS "zoom" (soportada por Chrome, Edge, Safari y Firefox 126+)
   y lo guarda en localStorage para que se mantenga al navegar
   entre las distintas pantallas del sistema.
   ============================================================ */
(function () {
    "use strict";

    const KEY     = "as_zoom_valor";
    const DEFAULT = 100;
    const MIN     = 50;
    const MAX     = 200;

    function limitar(valor) {
        return Math.min(MAX, Math.max(MIN, valor));
    }

    function obtener() {
        const guardado = localStorage.getItem(KEY);
        const valor = guardado ? parseInt(guardado, 10) : DEFAULT;
        return isNaN(valor) ? DEFAULT : limitar(valor);
    }

    function aplicarEnPantalla(valor) {
        document.documentElement.style.zoom = valor / 100;
    }

    // Aplica el zoom solo en la pantalla actual, sin guardarlo
    // (para vista previa mientras el usuario mueve el control).
    function previsualizar(valor) {
        const v = limitar(valor);
        aplicarEnPantalla(v);
        return v;
    }

    // Guarda el nivel de zoom para que se use en todas las páginas.
    function guardar(valor) {
        const v = limitar(valor);
        localStorage.setItem(KEY, String(v));
        aplicarEnPantalla(v);
        return v;
    }

    function restablecer() {
        return guardar(DEFAULT);
    }

    window.ASZoom = {
        obtener,
        previsualizar,
        guardar,
        restablecer,
        MIN,
        MAX,
        DEFAULT
    };

    // <html> siempre existe aunque el <body> no se haya parseado
    // todavía, así que aplicamos el zoom guardado de inmediato
    // para evitar parpadeos.
    aplicarEnPantalla(obtener());
})();
