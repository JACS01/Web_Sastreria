/* ============================================================
   Sastrería A&S - Accesibilidad: Narrador (lector de pantalla)
   Usa la Web Speech API (SpeechSynthesis) del navegador para
   leer en voz alta los elementos que reciben el foco, y expone
   una API global para configurarlo desde Accesibilidad.html.
   El estado se guarda en localStorage para que se mantenga
   activo al navegar entre las distintas pantallas del sistema.
   ============================================================ */
(function () {
    "use strict";

    const KEY_ACTIVO        = "as_narrador_activo";
    const KEY_AUTOINICIO    = "as_narrador_autoinicio";
    const KEY_MOSTRARINICIO = "as_narrador_mostrarinicio";
    const KEY_MINIMIZADO    = "as_narrador_minimizado";
    const KEY_VOZ           = "as_narrador_voz";
    const KEY_VELOCIDAD     = "as_narrador_velocidad"; // 0-100

    const soportaVoz = "speechSynthesis" in window;

    function leerBool(key, defecto) {
        const v = localStorage.getItem(key);
        return v === null ? defecto : v === "true";
    }
    function guardarBool(key, valor) {
        localStorage.setItem(key, valor ? "true" : "false");
    }

    function obtenerVelocidad() {
        const v = parseInt(localStorage.getItem(KEY_VELOCIDAD), 10);
        return isNaN(v) ? 50 : Math.min(100, Math.max(0, v));
    }

    // Convierte 0-100 (slider) al "rate" real de SpeechSynthesisUtterance (0.5 - 2.0)
    function velocidadARate(v) {
        return 0.5 + (v / 100) * 1.5;
    }

    function obtenerVozGuardada() {
        return localStorage.getItem(KEY_VOZ) || "";
    }

    function elegirVoz() {
        if (!soportaVoz) return null;
        const voces = window.speechSynthesis.getVoices();
        const guardada = obtenerVozGuardada();
        if (guardada) {
            const encontrada = voces.find(v => v.voiceURI === guardada);
            if (encontrada) return encontrada;
        }
        return voces.find(v => v.lang && v.lang.toLowerCase().startsWith("es")) || voces[0] || null;
    }

    function obtenerEstado() {
        return {
            activo: leerBool(KEY_ACTIVO, false),
            autoInicio: leerBool(KEY_AUTOINICIO, false),
            mostrarInicio: leerBool(KEY_MOSTRARINICIO, false),
            minimizado: leerBool(KEY_MINIMIZADO, false),
            voz: obtenerVozGuardada(),
            velocidad: obtenerVelocidad()
        };
    }

    function hablar(texto, forzar) {
        if (!soportaVoz || !texto) return;
        if (!forzar && !obtenerEstado().activo) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(texto);
        const voz = elegirVoz();
        if (voz) utter.voice = voz;
        utter.rate = velocidadARate(obtenerVelocidad());
        utter.lang = (voz && voz.lang) || "es-ES";
        window.speechSynthesis.speak(utter);
    }

    /* ===== Indicador flotante "Narrador activo" ===== */
    let indicador = null;

    function crearIndicador() {
        if (indicador) return indicador;
        indicador = document.createElement("div");
        indicador.id = "as-narrador-indicador";
        indicador.setAttribute("role", "button");
        indicador.setAttribute("tabindex", "0");
        indicador.title = "Narrador activo. Clic para desactivar.";
        Object.assign(indicador.style, {
            position: "fixed",
            bottom: "18px",
            right: "18px",
            zIndex: "2000",
            background: "#1a2744",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "999px",
            fontSize: "0.9rem",
            fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
        });
        indicador.innerHTML =
            '<i class="bi bi-mic-fill"></i>' +
            '<span id="as-narrador-indicador-texto">Narrador activo</span>';
        indicador.addEventListener("click", () => desactivarNarrador());
        indicador.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); desactivarNarrador(); }
        });
        (document.body || document.documentElement).appendChild(indicador);
        return indicador;
    }

    function actualizarIndicador() {
        const estado = obtenerEstado();
        if (!estado.activo) {
            if (indicador) { indicador.remove(); indicador = null; }
            return;
        }
        const el = crearIndicador();
        const texto = el.querySelector("#as-narrador-indicador-texto");
        texto.style.display = estado.minimizado ? "none" : "inline";
    }

    /* ===== Encender / apagar ===== */
    function activarNarrador(anunciar) {
        guardarBool(KEY_ACTIVO, true);
        activarLecturaPorFoco();
        actualizarIndicador();
        if (anunciar !== false) hablar("Narrador activado.", true);
    }

    function desactivarNarrador() {
        hablar("Narrador desactivado.", true);
        guardarBool(KEY_ACTIVO, false);
        actualizarIndicador();
    }

    function establecerAutoInicio(valor)    { guardarBool(KEY_AUTOINICIO, valor); }
    function establecerMostrarInicio(valor) { guardarBool(KEY_MOSTRARINICIO, valor); }
    function establecerMinimizado(valor)    { guardarBool(KEY_MINIMIZADO, valor); actualizarIndicador(); }
    function establecerVoz(voiceURI)        { localStorage.setItem(KEY_VOZ, voiceURI || ""); }
    function establecerVelocidad(v)         { localStorage.setItem(KEY_VELOCIDAD, String(Math.min(100, Math.max(0, v)))); }

    /* ===== Lectura automática de lo que recibe el foco ===== */
    function textoAccesible(el) {
        if (!el || el === document.body) return "";
        if (el.getAttribute && el.getAttribute("aria-label")) return el.getAttribute("aria-label");

        if (el.tagName === "INPUT") {
            const label = (el.id && document.querySelector('label[for="' + el.id + '"]')) || el.closest("label");
            const base = (label && label.textContent.trim()) || el.placeholder || el.name || "campo";
            if (el.type === "checkbox") return base + (el.checked ? ", activado" : ", desactivado");
            if (el.type === "range") return base + ", " + el.value;
            return base;
        }
        if (el.tagName === "SELECT") {
            const opt = el.options[el.selectedIndex];
            return "lista, " + (opt ? opt.text : "");
        }
        if (el.tagName === "A" || el.tagName === "BUTTON") {
            return el.textContent.trim() || el.getAttribute("title") || "botón";
        }
        if (el.getAttribute && el.getAttribute("role") === "button") {
            return el.textContent.trim();
        }
        return (el.textContent || "").trim().slice(0, 140);
    }

    let focoListenerActivo = false;
    function activarLecturaPorFoco() {
        if (focoListenerActivo) return;
        focoListenerActivo = true;
        document.addEventListener("focusin", (e) => {
            if (!obtenerEstado().activo) return;
            const texto = textoAccesible(e.target);
            if (texto) hablar(texto, true);
        });
    }

    /* ===== Atajo de teclado =====
       Tecla Windows + Ctrl + Enter (atajo real de Narrador de Windows).
       Como el navegador no siempre puede capturar la tecla Windows,
       se agrega Ctrl + Alt + N como alternativa confiable. */
    document.addEventListener("keydown", (e) => {
        const winCtrlEnter = e.metaKey && e.ctrlKey && e.key === "Enter";
        const ctrlAltN = e.ctrlKey && e.altKey && (e.key === "n" || e.key === "N");
        if (winCtrlEnter || ctrlAltN) {
            e.preventDefault();
            obtenerEstado().activo ? desactivarNarrador() : activarNarrador();
        }
    });

    /* ===== Auto-inicio tras "iniciar sesión" =====
       Si el usuario activó "Iniciar Narrador automáticamente después
       de iniciar sesión", se enciende solo al llegar a Home.html
       (la pantalla a la que redirige el login). Si además activó
       "Mostrar la página principal de narrador al iniciar", lo
       manda a Accesibilidad.html después de anunciarlo. */
    function revisarAutoInicio() {
        const estado = obtenerEstado();
        const enHome = /(^|\/)Home\.html$/i.test(window.location.pathname);
        if (enHome && estado.autoInicio && !estado.activo) {
            activarNarrador(true);
            if (estado.mostrarInicio) {
                setTimeout(() => { window.location.href = "Accesibilidad.html"; }, 900);
            }
        }
    }

    window.ASAccesibilidad = {
        obtenerEstado,
        activarNarrador,
        desactivarNarrador,
        establecerAutoInicio,
        establecerMostrarInicio,
        establecerMinimizado,
        establecerVoz,
        establecerVelocidad,
        velocidadARate,
        hablar,
        voces: () => (soportaVoz ? window.speechSynthesis.getVoices() : []),
        soportaVoz
    };

    function init() {
        actualizarIndicador();
        if (obtenerEstado().activo) activarLecturaPorFoco();
        revisarAutoInicio();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
