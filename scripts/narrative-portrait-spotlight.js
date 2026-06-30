// scripts/portrait-spotlight.js

// =====================================================================
// NARRATIVE PORTRAIT SPOTLIGHT: LÓGICA PRINCIPAL (PARTE 1)
// =====================================================================

Hooks.once('ready', () => {
    class PortraitSpotlight {
        constructor() {
            // Extraemos el nivel de log configurado en los settings mundiales
            this.logLevel = game.settings.get("narrative-portrait-spotlight", "logLevel") || "debug";
        }

        /**
         * Registra mensajes en la consola del navegador según el nivel de depuración.
         */
        log(message, data = '', level = 'debug') {
            const levels = ['debug', 'info', 'warn', 'error'];
            const currentLevelIndex = levels.indexOf(this.logLevel);
            const messageLevelIndex = levels.indexOf(level);

            if (messageLevelIndex >= currentLevelIndex) {
                const formattedMessage = `Narrative Portrait Spotlight | ${message}`;
                switch (level) {
                    case 'debug':
                        console.debug(formattedMessage, data);
                        break;
                    case 'info':
                        console.info(formattedMessage, data);
                        break;
                    case 'warn':
                        console.warn(formattedMessage, data);
                        break;
                    case 'error':
                        console.error(formattedMessage, data);
                        break;
                    default:
                        console.log(formattedMessage, data);
                }
            }
        }

        /**
         * Realiza una precarga asíncrona de la imagen para calcular su escala física en pantalla.
         */
        preloadImage(url) {
            return new Promise((resolve, reject) => {
                if (!url) {
                    reject(new Error('No URL provided for image preloading.'));
                    return;
                }

                const img = new Image();
                img.onload = () => resolve({ width: img.width, height: img.height });
                img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
                img.src = url;
            });
        }

        /**
         * Calcula las coordenadas X/Y de la pantalla basándose en los porcentajes de los settings.
         */
        getPortraitPosition(isPC, screenWidth, screenHeight, count) {
            const pcPosition = game.settings.get("narrative-portrait-spotlight", "pcPosition");
            const npcPosition = game.settings.get("narrative-portrait-spotlight", "npcPosition");
            const verticalPosition = game.settings.get("narrative-portrait-spotlight", "verticalPosition");
            const offsetStep = game.settings.get("narrative-portrait-spotlight", "offsetStep");

            const baseX = screenWidth * (isPC ? pcPosition : npcPosition);
            const baseY = screenHeight * verticalPosition;
            const offset = count * (isPC ? -offsetStep : offsetStep) * screenWidth;
            return { x: baseX + offset, y: baseY };
        }

        /**
         * CORRECCIÓN ANIMA V14: Extrae la ilustración artística real del Actor.
         * Invertimos las prioridades para ignorar la textura circular del token del mapa
         * y capturar el Portrait a cuerpo completo de la ficha del personaje.
         */
        getPortraitUrl(token) {
            if (!token) return null;
            
            // Evaluamos el documento del token de forma retrocompatible para V13 y V14
            const tokenDoc = token.document || token;
            const actor = token.actor || tokenDoc.actor;

            // 🛡️ REGLA DE ORO: Prioridad absoluta al Portrait original de la ficha del Actor
            return actor?.img || 
                   tokenDoc.texture?.src || 
                   actor?.prototypeToken?.texture?.src || 
                   null;
        }

        /**
         * Muestra u oculta de forma cinemática el retrato flotante de un token en pantalla.
         */
        async displayPortrait(token, show = true) {
            const portraitUrl = this.getPortraitUrl(token);
            if (!portraitUrl) {
                const warnMsg = (game.settings.get("narrative-portrait-spotlight", "noPortraitFoundMessage") || "No portrait image found for {tokenName}")
                    .replace("{tokenName}", token.name || token.document?.name || "Unknown");
                this.log(warnMsg, '', 'warn');
                return;
            }

            // CORRECCIÓN ANIMA V14: Evaluación estable de la propiedad del propietario en la API moderna
            const tokenDoc = token.document || token;
            const actor = token.actor || tokenDoc.actor;
            const isPC = actor ? actor.hasPlayerOwner : false;

            const effectNamePrefix = game.settings.get("narrative-portrait-spotlight", "effectNamePrefix") || "portrait";
            const effectName = `${effectNamePrefix}-${isPC ? 'pc' : 'npc'}-${token.id}`;

            // --- SECCIÓN: OCULTAR EL RETRATO (show = false) ---
            if (!show) {
                if (typeof Sequencer !== "undefined" && Sequencer.EffectManager) {
                    // Ponemos fin al persistente con el fadeOut reglamentario configurado
                    await Sequencer.EffectManager.endEffects({ name: effectName });
                } else {
                    this.log("Sequencer or EffectManager is not available.", '', 'error');
                }
                const hideMsg = (game.settings.get("narrative-portrait-spotlight", "hidingPortraitMessage") || "Hiding portrait for {tokenName}")
                    .replace("{tokenName}", token.name || tokenDoc.name || "");
                this.log(hideMsg, '', 'info');
                return;
            }

            // --- SECCIÓN: MOSTRAR EL RETRATO (show = true) ---
            try {
                // Precarga asíncrona universal del Portrait a cuerpo completo de Anima
                const { width, height } = await this.preloadImage(portraitUrl);
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;

                // CORRECCIÓN MÁSTER DE SETTINGS: Extraemos las variables legítimas y corregimos las redundancias
                const maxHeightPercent = game.settings.get("narrative-portrait-spotlight", "maxHeightPercent") || 0.7;
                const maxWidthPercent = game.settings.get("narrative-portrait-spotlight", "maxWidthPercent") || 0.5;
                const fadeTime = game.settings.get("narrative-portrait-spotlight", "fadeTime") || 500;

                // Ajustamos el escalado estricto basándonos en la configuración real del menú
                const scale = Math.min(
                    (screenHeight * maxHeightPercent) / height,
                    (screenWidth * maxWidthPercent) / width
                );

                // CORRECCIÓN CRÍTICA DE SEQUENCER V13/V14: Contamos los efectos en pantalla de forma segura
                let existingCount = 0;
                if (typeof Sequencer !== "undefined" && Sequencer.EffectManager?.getEffects) {
                    // Buscamos todos los efectos activos cuyo nombre empiece por el prefijo configurado
                    const searchPattern = `${effectNamePrefix}-${isPC ? 'pc' : 'npc'}-`;
                    existingCount = Sequencer.EffectManager.getEffects().filter(effect => {
                        const name = effect.data?.name || effect.name || "";
                        return name.startsWith(searchPattern);
                    }).length;
                } else {
                    this.log("Sequencer or EffectManager is not available.", '', 'error');
                }

                // Calculamos las coordenadas exactas de desplazamiento para amontonar retratos
                const position = this.getPortraitPosition(isPC, screenWidth, screenHeight, existingCount);

                const anchorPoint = {
                    x: game.settings.get("narrative-portrait-spotlight", "anchorPointX") ?? 0,
                    y: game.settings.get("narrative-portrait-spotlight", "anchorPointY") ?? 0.2
                };
                const screenSpaceAboveUI = game.settings.get("narrative-portrait-spotlight", "screenSpaceAboveUI") ?? false;

                // DISPARO CINEMÁTICO DE LA SECUENCIA DE PIXIJS
                await new Sequence()
                    .effect()
                        .name(effectName)
                        .file(portraitUrl)
                        .screenSpace()
                        .screenSpacePosition(position)
                        .screenSpaceScale({ x: scale, y: scale })
                        .screenSpaceAnchor(anchorPoint)
                        .screenSpaceAboveUI(screenSpaceAboveUI)
                        .fadeIn(fadeTime)
                        .fadeOut(fadeTime)
                        .zIndex(10) // Subimos la profundidad para que flote limpio sobre el lienzo táctico
                        .persist()
                        .forUsers(game.users.filter(u => u.active).map(u => u.id)) // Solo usuarios activos en directo
                    .play();

                const showMsg = (game.settings.get("narrative-portrait-spotlight", "displayingPortraitMessage") || "Portrait displayed for {tokenName}")
                    .replace("{tokenName}", token.name || tokenDoc.name || "");
                this.log(showMsg, { position, scale }, 'info');

            } catch (error) {
                this.log(`Failed to display portrait: ${error.message}`, '', 'error');
                ui.notifications.error(`Failed to display portrait: ${error.message}`);
            }
        }
        /**
         * Alterna de forma masiva el Portrait de todos los tokens que el DJ tenga seleccionados en el mapa.
         */
        async togglePortraitsForSelectedTokens() {
            // CORRECCIÓN V14: Acceso unificado a la nueva estructura de capas de tokens controlados
            const selectedTokens = canvas.tokens?.layer?.controlled || canvas.tokens?.controlled || [];
            if (!selectedTokens || !selectedTokens.length) {
                const noTokenMsg = game.settings.get("narrative-portrait-spotlight", "noTokenSelectedMessage") || "Please select at least one token!";
                ui.notifications.warn(noTokenMsg);
                return;
            }

            const effectNamePrefix = game.settings.get("narrative-portrait-spotlight", "effectNamePrefix") || "portrait";

            for (const token of selectedTokens) {
                // Evaluación retrocompatible y segura del propietario de la ficha en la V14
                const tokenDoc = token.document || token;
                const actor = token.actor || tokenDoc.actor;
                const isPC = actor ? actor.hasPlayerOwner : false;
                
                const effectName = `${effectNamePrefix}-${isPC ? 'pc' : 'npc'}-${token.id}`;
                let isShowing = false;

                // Consulta segura a la API de Sequencer V13/V14
                if (typeof Sequencer !== "undefined" && Sequencer.EffectManager?.getEffects) {
                    isShowing = Sequencer.EffectManager.getEffects({ name: effectName }).length > 0;
                } else {
                    this.log("Sequencer or EffectManager is not available.", '', 'error');
                }

                // Invocamos el método de renderizado cinemático alternando el estado lógico
                await this.displayPortrait(token, !isShowing);
            }
        }

        /**
         * Despliega una imagen de fondo sólida que devora el 100% de la pantalla sin rendijas ni deformaciones.
         */
        async addBackground(imageUrl = null) {
            let defaultUrl = "";
            try {
                defaultUrl = game.settings.get("narrative-portrait-spotlight", "defaultBackgroundUrl") || "";
            } catch (e) {
                this.log("defaultBackgroundUrl no está registrado en settings.js, operando con parámetro directo.", '', 'debug');
            }

            const backgroundUrl = imageUrl || defaultUrl;
            if (!backgroundUrl) {
                this.log("No background URL provided or set in settings.", '', 'warn');
                return;
            }

            const fadeTime = game.settings.get("narrative-portrait-spotlight", "fadeTime") || 500;
            const zIndex = -10;
            const effectName = "background-image";

            if (typeof Sequencer === "undefined" || !Sequencer.EffectManager?.getEffects) {
                this.log("Sequencer or EffectManager is not available.", '', 'error');
                return;
            }

            const isActive = Sequencer.EffectManager.getEffects({ name: effectName }).length > 0;
            if (isActive) {
                this.log("Background image is already active.", '', 'info');
                return;
            }

            try {
                // 1. Obtenemos las dimensiones reales del archivo de imagen de Anima
                const { width: imgWidth, height: imgHeight } = await this.preloadImage(backgroundUrl);

                // 2. Obtenemos las dimensiones de la ventana del navegador del monitor del DJ
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;

                // 3. CÁLCULO DE ESCALA MATEMÁTICA "COVER" MANUAL:
                // Calculamos los factores de multiplicación necesarios para cada eje
                const scaleX = screenWidth / imgWidth;
                const scaleY = screenHeight / imgHeight;

                // REGLA DE ORO DE PROPORCIÓN: Al elegir el valor máximo (Math.max), forzamos a que 
                // el eje más corto (el ancho en las imágenes verticales) se estire hasta cubrir la pantalla.
                // Le añadimos un colchón del 1.02 (2% extra) para sepultar cualquier rendija fantasma.
                const factorEscala = Math.max(scaleX, scaleY) * 1.02;

                // Calculamos los píxeles finales proporcionales que exige Sequencer
                const finalWidth = imgWidth * factorEscala;
                const finalHeight = imgHeight * factorEscala;

                // DISPARO 100% LIMPIO, COMPATIBLE Y LIBRE DE MÉTODOS FANTASMA EN SEQUENCER V14
                await new Sequence()
                    .effect()
                        .name(effectName)
                        .file(backgroundUrl)
                        .screenSpace() // Capa flotante fija del monitor
                        // Usamos la regla del 50% de la Fase 1 que clavó el centro perfecto
                        .screenSpacePosition({ x: 50, y: 50 }, true) 
                        // Fijamos el eje en la mitad exacta de la propia ilustración
                        .screenSpaceAnchor({ x: 0.5, y: 0.5 })
                        // INYECTAMOS LAS DIMENSIONES PROPORCIONALES FINALMENTE CALCULADAS:
                        // Esto estira el dibujo de forma nativa en PixiJS sin deformar ni aplastar el arte.
                        .size({ width: finalWidth, height: finalHeight })
                        .screenSpaceAboveUI(false) // Se dibuja por debajo de la barra de herramientas y menús
                        .fadeIn(fadeTime)
                        .fadeOut(fadeTime)
                        .zIndex(zIndex)
                        .persist()
                        .opacity(1.0) // 100% Sólido y opaco, eliminando el mapa azul de abajo
                        .forUsers(game.users.filter(u => u.active).map(u => u.id))
                    .play();

                this.log("Background image added successfully with calculated manual cover size.", '', 'info');
            } catch (error) {
                this.log(`Failed to add background image: ${error.message}`, '', 'error');
                ui.notifications.error(`Failed to add background image: ${error.message}`);
            }
        }


        /**
         * Desvanece y elimina de forma limpia el fondo cinematográfico de las pantallas.
         */
        async removeBackground() {
            const effectName = "background-image";

            if (typeof Sequencer === "undefined" || !Sequencer.EffectManager?.getEffects) {
                this.log("Sequencer or EffectManager is not available.", '', 'error');
                return;
            }

            // Comprobamos si el fondo está verdaderamente en activo en la sesión
            const isActive = Sequencer.EffectManager.getEffects({ name: effectName }).length > 0;
            if (!isActive) {
                this.log("Background image is not active.", '', 'info');
                return;
            }

            try {
                // Finalizamos el efecto respetando el fadeOut asignado en su creación
                await Sequencer.EffectManager.endEffects({ name: effectName });
                this.log("Background image removed successfully.", '', 'info');
            } catch (error) {
                this.log(`Failed to remove background image: ${error.message}`, '', 'error');
                ui.notifications.error(`Failed to remove background image: ${error.message}`);
            }
        }

        /**
         * Realiza una transición difuminada, fluida y elegante entre dos fondos de escenario.
         */
        async transitionBackground(newImageUrl) {
            if (!newImageUrl) {
                this.log("No new background URL provided for transition.", '', 'warn');
                return;
            }

            try {
                this.log("Fading out current background...", '', 'info');
                
                // 1. Iniciamos el desvanecimiento del fondo actual
                await Sequencer.EffectManager.endEffects({ name: "background-image" });

                // 🛡️ CORRECCIÓN CRÍTICA DE SINCRONIZACIÓN V14:
                // Forzamos una micro-pausa asíncrona de 300ms en el hilo de ejecución del script.
                // Esto le da tiempo físico a Sequencer para purgar el ID del canvas del fondo viejo
                // evitando que 'addBackground' detecte un falso positivo de duplicado y aborte.
                await new Promise(resolve => setTimeout(resolve, 300));

                // 2. Desplegamos el nuevo escenario de forma limpia y progresiva
                await this.addBackground(newImageUrl);
                this.log("Transitioned to new background successfully.", '', 'info');
            } catch (error) {
                this.log(`Failed to transition background: ${error.message}`, '', 'error');
                ui.notifications.error(`Failed to transition background: ${error.message}`);
            }
        }
    } // Cierre formal de la clase PortraitSpotlight

    // ANCLAJE MAESTRO GLOBAL DE API:
    // Instanciamos el software en el objeto global 'game' de la partida de Foundry.
    // Esto te permite invocar el teatro manual desde cualquier macro de tu barra de herramientas.
    game.narrativePortraitSpotlight = new PortraitSpotlight();


    
    console.log("🛡️ NARRATIVE SPOTLIGHT | Instancia global registrada e inicializada en la V14.");
});


