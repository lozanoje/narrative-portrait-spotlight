(async () => {
    const MODULE_ID = "narrative-portrait-spotlight";
    const ID_VENTANA = "consola-cinematica-control-stable";

    const placeables = canvas.tokens?.layer?.placeables || canvas.tokens?.placeables || [];
    const tokensUnicos = placeables.filter(t => t.actor).filter((t, i, arr) => arr.findIndex(x => x.name === t.name) === i);

    const pack = game.packs.get("narrative-portrait-spotlight.narrative-portrait-spotlight-macros");
    let macroToggle = game.macros.get("rSi53J7MzlVjVNrB") || (pack ? await pack.getDocument("rSi53J7MzlVjVNrB") : null);
    let macroClear = game.macros.get("2TPdeqd55WQyFFch") || (pack ? await pack.getDocument("2TPdeqd55WQyFFch") : null);

    if (!ui.activeSpotlights) ui.activeSpotlights = [];
    if (!ui.activeBackgroundSlot) ui.activeBackgroundSlot = null;

    const rutas = Array.from({length: 6}, (_, i) => game.user.getFlag(MODULE_ID, `bg-path-${i+1}`) || "");

    // 🌐 DICCIONARIO BILINGÜE: Detecta el idioma nativo de Foundry (es / en) al instante
    const esES = game.i18n.lang === "es";
    const txt = {
        titulo: "🎭 " + (esES ? "Consola Cinemática de Control" : "Cinematic Control Console"),
        fondos: "🏞️ " + (esES ? "Rejilla de Fondos (3x2)" : "Background Grid (3x2)"),
        asignar: esES ? "Asignación de Escenas:" : "Scene Assignment:",
        actores: "🎭 " + (esES ? "Rejilla de Actores Rápidos" : "Quick Actors Grid"),
        limpiar: "❌ " + (esES ? "Limpiar Pantalla Completa" : "Clear Full Screen")
    };

    // HTML ESTÁTICO: Inyectamos los 4 textos traducidos de forma limpia
    const htmlContent = `
    <div style="display: flex; gap: 15px; font-family: sans-serif; font-size: 11px; color: #ddd; background: #1a1a1a; padding: 10px; border-radius: 6px;">
        <div style="flex: 1; min-width: 310px; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; padding-bottom: 4px;">
                <h3 style="margin: 0; color: #f6e27f; font-size: 12px;">${txt.fondos}</h3>
                <button type="button" id="open-config" style="background: transparent; color: #f6e27f; border: none; cursor: pointer; font-size: 13px; padding: 0; margin: 0; box-shadow: none; width: auto; height: auto; display: inline-block; min-width: 0; line-height: 1;" title="Configuración"><i class="fas fa-cog"></i></button>
            </div>
            <div id="f-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;"></div>
            <div style="display: flex; flex-direction: column; gap: 5px; background: #222; padding: 8px; border-radius: 4px; border: 1px solid #333;" id="inputs-root"></div>
        </div>
        <div style="flex: 1; min-width: 270px; display: flex; flex-direction: column; gap: 10px; border-left: 1px solid #333; padding-left: 15px;">
            <h3 style="margin: 0; color: #f6e27f; border-bottom: 1px solid #444; padding-bottom: 4px; font-size: 12px;">${txt.actores}</h3>
            <input type="text" id="spotlight-search" placeholder="${game.i18n.lang === 'es' ? 'Buscar actor...' : 'Search actor...'}" style="width: 100%; background: #111; color: #fff; border: 1px solid #444; padding: 4px; font-size: 10px; border-radius: 3px; height: 22px; margin-bottom: 2px;">
            <div id="t-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; max-height: 220px; overflow-y: auto; padding-right: 4px;"></div>
            <button id="clear-all" style="margin-top: auto; width: 100%; background: #631414; color: white; border: 1px solid #000; cursor: pointer; padding: 8px; font-weight: bold; border-radius: 4px; font-size: 11px;">${txt.limpiar}</button>
        </div>
    </div>`;


    globalThis.pintarConsolaSpotlight = function(root) {
        const inpRoot = root.querySelector('#inputs-root');
        if (inpRoot && inpRoot.children.length === 0) {
            inpRoot.innerHTML = `<h4 style="margin: 0 0 4px 0; font-size: 10px; color: #aaa;">${txt.asignar}</h4>` + rutas.map((r, i) => `
                <div style="display: flex; gap: 4px; align-items: center;">
                    <span style="font-size: 10px; font-weight: bold; color: #f6e27f; width: 12px;">${i+1}:</span>
                    <input type="text" id="in-${i+1}" value="${r}" style="flex: 1; background: #111; color: #fff; border: 1px solid #444; padding: 4px; font-size: 10px; border-radius: 3px; height: 24px; line-height: 24px;" readonly>
                    <button type="button" class="pk-btn" data-idx="${i+1}" style="background: #444; color: #fff; border: none; padding: 0; width: 28px; height: 24px; cursor: pointer; border-radius: 3px; box-shadow: none; display: flex; align-items: center; justify-content: center;"><i class="fas fa-folder-open"></i></button>
                    <button type="button" class="cl-btn" data-idx="${i+1}" style="background: #551a1a; color: #ff9999; border: none; padding: 0; width: 28px; height: 24px; cursor: pointer; border-radius: 3px; box-shadow: none; display: flex; align-items: center; justify-content: center;"><i class="fas fa-times"></i></button>
                </div>`).join('');


            root.querySelectorAll('.pk-btn').forEach(b => btnEventListenerClickPicker(b, root));

            // AÑADIDO NUEVO: Oyente para las aspas rojas. Vacia el texto, la flag y apaga el fondo si estaba corriendo
            root.querySelectorAll('.cl-btn').forEach(b => b.addEventListener('click', async (e) => {
                e.preventDefault();
                const idx = parseInt(e.currentTarget.dataset.idx);
                const input = root.querySelector(`#in-${idx}`);
                if (input) {
                    input.value = "";
                    rutas[idx-1] = "";
                    if (ui.activeBackgroundSlot === idx) {
                        await game.narrativePortraitSpotlight.removeBackground();
                        ui.activeBackgroundSlot = null;
                        await new Promise(r => setTimeout(r, 200));
                    }
                    await game.user.setFlag(MODULE_ID, `bg-path-${idx}`, "");
                    globalThis.pintarConsolaSpotlight(root);
                }
            }));

            //oyente de la ventana de config
            root.querySelector('#open-config').addEventListener('click', (e) => {
                e.preventDefault();
                Hooks.once("renderSettingsConfig", (app, html) => {
                    const htmlElement = html instanceof HTMLElement ? html : (html && html[0] ? html[0] : null);
                    if (!htmlElement) return;
                    // Buscamos el botón oficial del menú de configuración del módulo en el DOM para pulsar sobre él
                    const menuBtn = htmlElement.querySelector(`[data-key="${MODULE_ID}.configMenu"]`) || htmlElement.querySelector(`button[name="${MODULE_ID}.configMenu"]`) || htmlElement.querySelector(".abf-spotlight-btn");
                    if (menuBtn) {
                        menuBtn.click();
                        app.close(); // Cerramos la ventana gris general de fondo para dejar solo la flotante avanzada libre
                    }
                });
                game.settings.sheet.render(true, { activeTab: MODULE_ID });
            });

        }
        root.querySelector('#f-grid').innerHTML = rutas.map((r, i) => {
            const enc = r && ui.activeBackgroundSlot === (i+1);
            return `<button class="f-btn" data-idx="${i+1}" data-path="${r}" style="background: ${r ? `url('${r}') center/cover` : '#111'}; width: 100%; height: 60px; border: 2px solid ${enc ? '#f6e27f' : '#222'}; border-radius: 4px; position: relative; cursor: pointer; padding: 0;">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); color: #fff; font-size: 9px; padding: 2px 0; text-align: center;">Slot ${i+1} ${enc ? '🟢' : '👤'}</div>
            </button>`;
        }).join('');

        root.querySelector('#t-grid').innerHTML = tokensUnicos.map(t => {
            const act = ui.activeSpotlights.includes(t.id);
            const col = (t.document?.actor?.hasPlayerOwner || t.document?.disposition === 1) ? "#1e3d59" : (t.document?.disposition === 0 ? "#7a621d" : "#4a1c1c");
            return `<button class="t-btn" data-id="${t.id}" style="background: ${col}; color: #fff; border: 1px solid rgba(0,0,0,0.4); padding: 5px; border-radius: 4px; text-align: left; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; cursor: pointer; font-size: 11px;">${act ? '🟢' : '👤'} ${t.name}</button>`;
        }).join('');

        const searchInput = root.querySelector('#spotlight-search');
        if (searchInput) {
            const filtrarTokens = () => {
                const query = searchInput.value.toLowerCase().trim();
                root.querySelectorAll('.t-btn').forEach(btn => {
                    const label = btn.innerText.toLowerCase();
                    btn.style.display = label.includes(query) ? "block" : "none";
                });
            };
            searchInput.addEventListener('input', filtrarTokens);
            filtrarTokens();
        }

        root.querySelectorAll('.f-btn').forEach(b => b.addEventListener('click', async (e) => {
            e.preventDefault();
            const idx = parseInt(e.currentTarget.dataset.idx);
            const path = e.currentTarget.dataset.path;
            if (!path) return;

            if (ui.activeBackgroundSlot === idx) {
                await game.narrativePortraitSpotlight.removeBackground();
                ui.activeBackgroundSlot = null;
            } else {
                if (ui.activeBackgroundSlot !== null) await game.narrativePortraitSpotlight.removeBackground();
                await game.narrativePortraitSpotlight.addBackground(path);
                ui.activeBackgroundSlot = idx;
            }
            await new Promise(r => setTimeout(r, 200));
            globalThis.pintarConsolaSpotlight(root);
        }));

        root.querySelectorAll('.t-btn').forEach(b => b.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = e.currentTarget.dataset.id;
            const target = canvas.tokens?.get(id) || canvas.tokens?.layer?.get(id);
            if (!target || !macroToggle) return;
            ui.activeSpotlights = ui.activeSpotlights.includes(id) ? ui.activeSpotlights.filter(x => x !== id) : [...ui.activeSpotlights, id];
            const prev = [...(canvas.tokens?.layer?.controlled || canvas.tokens?.controlled || [])];
            canvas.tokens?.layer ? canvas.tokens.layer.releaseAll() : canvas.tokens.releaseAll();
            target.control({ releaseOthers: true });
            await macroToggle.execute();
            canvas.tokens?.layer ? canvas.tokens.layer.releaseAll() : canvas.tokens.releaseAll();
            for (let x of prev) x.control({ releaseOthers: false });
            globalThis.pintarConsolaSpotlight(root);
        }));

        root.querySelector('#clear-all').onclick = async (e) => {
            e.preventDefault();
            if (!macroClear) return;
            ui.activeSpotlights = [];
            await macroClear.execute();
            globalThis.pintarConsolaSpotlight(root);
        };
    };

    function btnEventListenerClickPicker(btn, root) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = e.currentTarget.dataset.idx;
            const input = root.querySelector(`#in-${idx}`);
            new FilePicker({
                type: "image", current: input.value || "worlds/" + game.world.id,
                callback: async (path) => {
                    if (!path) return;
                    input.value = path;
                    rutas[idx-1] = path;
                    await game.user.setFlag(MODULE_ID, `bg-path-${idx}`, path);
                    globalThis.pintarConsolaSpotlight(root);
                }
            }).browse();
        });
    }

    let existing = Object.values(ui.windows).find(w => w.options?.id === ID_VENTANA);
    if (existing) {
        let r = existing.element instanceof HTMLElement ? existing.element : existing.element[0];
        if (r) globalThis.pintarConsolaSpotlight(r);
    } else {
        new Dialog({
            title: txt.titulo, content: htmlContent, buttons: {},
            render: (html) => {
                let r = html instanceof HTMLElement ? html : (html[0] instanceof HTMLElement ? html[0] : html.element);
                if (r) globalThis.pintarConsolaSpotlight(r);
            }
        }, { width: 680, id: ID_VENTANA }).render(true);
    }
})();