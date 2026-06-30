
// =====================================================================
// NARRATIVE PORTRAIT SPOTLIGHT: CONFIGURACIÓN DE SETTINGS (PARTE 1)
// =====================================================================

const MODULE_NAME = "narrative-portrait-spotlight";

Hooks.once('init', () => {
    console.log("🛡️ NARRATIVE SPOTLIGHT | Inicializando settings del módulo...");

    // 1. Tamaño del retrato de los Jugadores
    game.settings.register(MODULE_NAME, "playerSize", {
        name: "Player Portrait Size",
        hint: "Configure the maximum size for player character portraits as a percentage of screen size.",
        scope: "world",
        config: true,
        type: Number,
        default: 0.4, 
        range: {
            min: 0.05,
            max: 1,
            step: 0.01
        }
    });

    // 2. Tamaño del retrato de los NPCs (Tus personajes de Anima)
    game.settings.register(MODULE_NAME, "npcSize", {
        name: "NPC Portrait Size",
        hint: "Configure the maximum size for NPC portraits as a percentage of screen size.",
        scope: "world",
        config: true,
        type: Number,
        default: 0.4, 
        range: {
            min: 0.05,
            max: 1,
            step: 0.01
        }
    });
    
    // 3. Opacidad del fondo de escena
    game.settings.register(MODULE_NAME, "backgroundOpacity", {
        name: "Background Opacity",
        hint: "Set the opacity of the background image.",
        scope: "world",
        config: true,
        type: Number,
        default: 0.5, 
        range: {
            min: 0,
            max: 1,
            step: 0.05
        }
    });

    // 4. Altura máxima en porcentaje de pantalla
    game.settings.register(MODULE_NAME, "maxHeightPercent", {
        name: "Max Height Percentage",
        hint: "Maximum portrait height as a percentage of screen height (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0.7,
        range: {
            min: 0.1,
            max: 1,
            step: 0.05
        }
    });

    // 5. Anchura máxima en porcentaje de pantalla
    game.settings.register(MODULE_NAME, "maxWidthPercent", {
        name: "Max Width Percentage",
        hint: "Maximum portrait width as a percentage of screen width (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0.5,
        range: {
            min: 0.1,
            max: 1,
            step: 0.05
        }
    });

        // 6. Tiempo de desvanecimiento de las animaciones (Fade)
    game.settings.register(MODULE_NAME, "fadeTime", {
        name: "Fade Time",
        hint: "Duration of fade-in and fade-out animations in milliseconds.",
        scope: "world",
        config: true,
        type: Number,
        default: 500,
        range: {
            min: 100,
            max: 2000,
            step: 100
        }
    });

    // 7. Multiplicador de posición X base para Personajes Jugadores (PCs)
    game.settings.register(MODULE_NAME, "pcPosition", {
        name: "PC Base Position",
        hint: "Base X-position multiplier for player character (PC) portraits (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0.3,
        range: {
            min: 0,
            max: 1,
            step: 0.05
        }
    });

    // 8. Multiplicador de posición X base para No Jugadores (NPCs)
    game.settings.register(MODULE_NAME, "npcPosition", {
        name: "NPC Base Position",
        hint: "Base X-position multiplier for non-player character (NPC) portraits (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0.6,
        range: {
            min: 0,
            max: 1,
            step: 0.05
        }
    });

    // 9. Multiplicador de posición Y base para todos los retratos
    game.settings.register(MODULE_NAME, "verticalPosition", {
        name: "Vertical Position",
        hint: "Base Y-position multiplier for all portraits (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0.5,
        range: {
            min: 0,
            max: 1,
            step: 0.05
        }
    });

    // 10. Distancia de separación horizontal para amontonar varios retratos a la vez
    game.settings.register(MODULE_NAME, "offsetStep", {
        name: "Offset Step",
        hint: "Offset multiplier for arranging multiple portraits horizontally.",
        scope: "world",
        config: true,
        type: Number,
        default: 0.15,
        range: {
            min: 0.05,
            max: 0.25,
            step: 0.01
        }
    });

    // 11. Punto de anclaje X de PixiJS para posicionar el retrato
    game.settings.register(MODULE_NAME, "anchorPointX", {
        name: "Anchor Point X",
        hint: "Anchor point X for portrait positioning (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0,
        range: {
            min: 0,
            max: 1,
            step: 0.1
        }
    });

    // 12. Punto de anclaje Y de PixiJS para posicionar el retrato
    game.settings.register(MODULE_NAME, "anchorPointY", {
        name: "Anchor Point Y",
        hint: "Anchor point Y for portrait positioning (0 to 1).",
        scope: "world",
        config: true,
        type: Number,
        default: 0.2,
        range: {
            min: 0,
            max: 1,
            step: 0.1
        }
    });

     // 13. Renderizado por encima de la interfaz (UI)
    game.settings.register(MODULE_NAME, "screenSpaceAboveUI", {
        name: "Portrait Above UI",
        hint: "Determine whether portraits appear above the UI.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });

    // 14. Prefijo técnico para nombrar los efectos visuales
    game.settings.register(MODULE_NAME, "effectNamePrefix", {
        name: "Effect Name Prefix",
        hint: "Prefix for naming portrait effects.",
        scope: "world",
        config: true,
        type: String,
        default: "portrait"
    });

    // 15. Nivel de verbosidad del Log de la consola
    game.settings.register(MODULE_NAME, "logLevel", {
        name: "Log Level",
        hint: "Control the verbosity of logging.",
        scope: "client",
        config: true,
        type: String,
        choices: {
            "debug": "Debug",
            "info": "Info",
            "warn": "Warn",
            "error": "Error"
        },
        default: "debug"
    });

    // --- SECCIÓN: MENSAJES PERSONALIZADOS ---
    game.settings.register(MODULE_NAME, "noTokenSelectedMessage", {
        name: "No Token Selected Message",
        hint: "Message displayed when no token is selected.",
        scope: "client",
        config: true,
        type: String,
        default: "Please select at least one token!"
    });

    game.settings.register(MODULE_NAME, "noPortraitFoundMessage", {
        name: "No Portrait Found Message",
        hint: "Message displayed when no portrait image is found for a token.",
        scope: "client",
        config: true,
        type: String,
        default: "No portrait image found for {tokenName}"
    });

    game.settings.register(MODULE_NAME, "hidingPortraitMessage", {
        name: "Hiding Portrait Message",
        hint: "Message displayed when hiding a portrait.",
        scope: "client",
        config: true,
        type: String,
        default: "Hiding portrait for {tokenName}"
    });

    game.settings.register(MODULE_NAME, "displayingPortraitMessage", {
        name: "Displaying Portrait Message",
        hint: "Message displayed when displaying a portrait.",
        scope: "client",
        config: true,
        type: String,
        default: "Portrait displayed for {tokenName}"
    });

    console.log("🛡️ NARRATIVE SPOTLIGHT | Configuración de los 19 settings completada con éxito.");
}); // <--- CIERRE FORMAL SEGURO DEL HOOK 'init'

// 🛡️ PROTECCIÓN CRÍTICA V14: Registramos el helper 'eq' SOLO si Foundry no lo ha inicializado ya.
// Esto evita que el motor de plantillas colapse por duplicación de variables globales.
if (!Handlebars.helpers.eq) {
    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });
}

/**
 * 🖥️ FUNCIÓN DE APERTURA: EXTRAE LOS SETTINGS EN BASE AL ID DEL MUNDO ACTIVE
 * Recupera de forma limpia el estado de las variables para alimentar el menú visual.
 */
async function showPortraitSpotlightConfig() {
    
    const currentSettings = {
        maxHeightPercent: game.settings.get(MODULE_NAME, "maxHeightPercent"),
        maxWidthPercent: game.settings.get(MODULE_NAME, "maxWidthPercent"),
        fadeTime: game.settings.get(MODULE_NAME, "fadeTime"),
        pcPosition: game.settings.get(MODULE_NAME, "pcPosition"),
        npcPosition: game.settings.get(MODULE_NAME, "npcPosition"),
        verticalPosition: game.settings.get(MODULE_NAME, "verticalPosition"),
        offsetStep: game.settings.get(MODULE_NAME, "offsetStep"),
        anchorPointX: game.settings.get(MODULE_NAME, "anchorPointX"),
        anchorPointY: game.settings.get(MODULE_NAME, "anchorPointY"),
        screenSpaceAboveUI: game.settings.get(MODULE_NAME, "screenSpaceAboveUI"),
        effectNamePrefix: game.settings.get(MODULE_NAME, "effectNamePrefix"),
        logLevel: game.settings.get(MODULE_NAME, "logLevel"),
        noTokenSelectedMessage: game.settings.get(MODULE_NAME, "noTokenSelectedMessage"),
        noPortraitFoundMessage: game.settings.get(MODULE_NAME, "noPortraitFoundMessage"),
        hidingPortraitMessage: game.settings.get(MODULE_NAME, "hidingPortraitMessage"),
        displayingPortraitMessage: game.settings.get(MODULE_NAME, "displayingPortraitMessage")
    };

    console.log("🛡️ NARRATIVE SPOTLIGHT | Settings cargados para renderizado de la interfaz:", currentSettings);
    

        // --- CONTINUACIÓN ASÍNCRONA DE LA FUNCIÓN showPortraitSpotlightConfig ---
  
    // CORRECCIÓN DE RUTA: Unificamos el ID de tu módulo legítimo ("narrative-portrait-spotlight")
    const template = "modules/narrative-portrait-spotlight/templates/config.html";
    const htmlContent = await renderTemplate(template, currentSettings);

    // Creamos y desplegamos el diálogo nativo
    new Dialog({
        title: "Portrait Spotlight Configuration",
        content: htmlContent,
        buttons: {
            save: {
                icon: '<i class="fas fa-check"></i>',
                label: "Save",
                callback: (html) => {
                    // API MODERNA: El parámetro 'html' puede venir como JQuery o elemento nativo, lo unificamos
                    const root = html instanceof HTMLElement ? html : html[0];
                    const form = root.querySelector("form");
                    if (!form) return;
                    
                    const formData = new FormData(form);

                    // Iteramos a través de los datos del formulario y actualizamos los settings
                    for (let [key, value] of formData.entries()) {
                        // Gestión de Checkboxes reactivos
                        if (key === "screenSpaceAboveUI") {
                            const inputEl = form.querySelector(`input[name="${key}"]`);
                            value = inputEl ? inputEl.checked : false;
                        }
                        // Gestión de inputs numéricos flotantes
                        else if ([
                            "maxHeightPercent",
                            "maxWidthPercent",
                            "fadeTime",
                            "pcPosition",
                            "npcPosition",
                            "verticalPosition",
                            "offsetStep",
                            "anchorPointX",
                            "anchorPointY"
                        ].includes(key)) {
                            value = parseFloat(value);
                        }

                        // Guardamos el cambio real en la base de datos de la partida
                        game.settings.set(MODULE_NAME, key, value);
                    }

                    ui.notifications.info("🛡️ NARRATIVE SPOTLIGHT | Configuraciones guardadas con éxito.");
                }
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
            }
        },
        default: "save",
        close: () => {}
    }).render(true);
}

// =====================================================================
// INTERCEPTOR DE INTERFAZ UNIFICADO PARA V13 Y V14 (LIBRE DE JQUERY)
// =====================================================================

class SpotlightConfigShim extends FormApplication {
    constructor(...args) {
        super(...args);
        // Cerramos el frame del shim de inmediato y disparamos tu menú legítimo
        showPortraitSpotlightConfig();
    }
    // Añadimos la función mínima obligatoria que exige el Core para no dar warnings
    async _updateObject(event, formData) {}
    render() { return this; }
}



Hooks.once('ready', () => {

    // CORRECCIÓN: Cambiado 'type: Object' por 'SpotlightConfigShim' para cumplir con la V14
    game.settings.registerMenu(MODULE_NAME, "configMenu", {
        name: "Portrait Spotlight Configuration",
        label: "Configure Portrait Spotlight",
        hint: "Adjust settings for Portrait Spotlight.",
        type: SpotlightConfigShim, // <-- ¡CABLEADA LA CLASE REGLAMENTARIA AQUÍ!
        restricted: false,
        config: false
    });

});

