// ============================================================
// FIREWALL GUARDIAN — Main Game Loop & Scene Management
// ============================================================

const Game = (() => {
    let canvas, ctx;
    let state = 'MENU'; // MENU, INTRO, PLAYING, PHASE_TRANSITION, GAME_OVER, VICTORY, REPORT
    let time = 0;
    let lastFrame = 0;
    let phaseIndex = 0;
    let phaseTimer = 0;
    let spawnTimer = 0;
    let spawnQueue = [];
    let totalElapsed = 0;
    let totalDuration = 0;
    let transitionTimer = 0;
    let screenShake = 0;
    let menuPulse = 0;

    function init() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        canvas.addEventListener('click', onClick);
        canvas.addEventListener('mousemove', onMouseMove);
        window.addEventListener('keydown', onKeyDown);

        // Initialize systems
        Renderer.init();

        // Calculate total duration
        totalDuration = CONFIG.PHASES.reduce((sum, p) => sum + p.duration, 0);

        lastFrame = performance.now();
        requestAnimationFrame(loop);
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function getBounds() {
        const w = canvas.width;
        const h = canvas.height;
        const topH = 40;
        const botH = 60;
        const playH = h - topH - botH;
        const mapW = Math.floor(w * 0.38);
        const rightW = w - mapW;
        return {
            map: { x: 0, y: topH, w: mapW, h: playH },
            traffic: { x: mapW, y: topH, w: rightW, h: Math.floor(playH * 0.5) },
            alerts: { x: mapW, y: topH + Math.floor(playH * 0.5), w: rightW, h: Math.ceil(playH * 0.5) },
        };
    }

    function startGame() {
        state = 'INTRO';
        Audio.init();
        Story.start(CONFIG.STORY.INTRO_LINES, () => {
            beginPlaying();
        }, 0.025);
    }

    function beginPlaying() {
        state = 'PLAYING';
        phaseIndex = 0;
        totalElapsed = 0;
        const bounds = getBounds();
        Network.init(bounds.map);
        Threats.init();
        Defense.init();
        HUD.init();
        Traffic.init(bounds.traffic);
        Alerts.init(bounds.alerts);
        Particles.clear();
        Story.reset();
        startPhase(0);
    }

    function startPhase(idx) {
        phaseIndex = idx;
        const phase = CONFIG.PHASES[idx];
        if (!phase) {
            // All phases complete — victory!
            state = 'VICTORY';
            Audio.victory();
            transitionTimer = 3;
            return;
        }
        HUD.setPhase(idx);
        phaseTimer = phase.duration;
        spawnQueue = [...phase.threats];
        spawnTimer = 1.5; // Initial delay before first spawn

        // Tutorial messages for phase 1
        if (phase.isTutorial) {
            HUD.showTutorial('TIP: Select a tool (1-6) then click on a threat to block it!', 8);
        }

        // Show phase transition
        state = 'PHASE_TRANSITION';
        transitionTimer = 3;
        Audio.phaseClear();
        Alerts.add(`PHASE ${phase.id}: ${phase.name}`, 'CRITICAL');
    }

    function loop(now) {
        const dt = Math.min((now - lastFrame) / 1000, 0.05); // cap dt
        lastFrame = now;
        time += dt;

        update(dt);
        draw();

        requestAnimationFrame(loop);
    }

    function update(dt) {
        if (state === 'INTRO') {
            Story.update(dt);
            return;
        }

        if (state === 'PHASE_TRANSITION') {
            transitionTimer -= dt;
            if (transitionTimer <= 0) {
                state = 'PLAYING';
            }
            // Still update particles during transition
            Particles.update(dt);
            return;
        }

        if (state === 'VICTORY' || state === 'GAME_OVER') {
            transitionTimer -= dt;
            if (transitionTimer <= 0) {
                state = 'REPORT';
            }
            Particles.update(dt);
            return;
        }

        if (state === 'REPORT') return;
        if (state === 'MENU') {
            menuPulse += dt;
            return;
        }

        if (state !== 'PLAYING') return;

        // Phase timer
        phaseTimer -= dt;
        totalElapsed += dt;
        HUD.setTime(totalElapsed, totalDuration);

        // Spawn threats
        spawnTimer -= dt;
        if (spawnTimer <= 0 && spawnQueue.length > 0) {
            const type = spawnQueue.shift();
            const threat = Threats.spawn(type);
            Traffic.addThreatLine(CONFIG.THREATS[type].name);
            spawnTimer = CONFIG.PHASES[phaseIndex].spawnInterval / 1000;
        }

        // Phase end check
        if (phaseTimer <= 0 && spawnQueue.length === 0 && Threats.active.length === 0) {
            // Perfect phase bonus
            if (HUD.phasePerfect) {
                HUD.addScore(CONFIG.SCORE.PERFECT_PHASE);
                HUD.showFloatingText(canvas.width / 2, canvas.height / 2, 'PERFECT PHASE! +500', CONFIG.COLORS.SAFE);
            }
            startPhase(phaseIndex + 1);
            return;
        }

        // Check if time ran out for phase but threats remain — advance anyway after grace period
        if (phaseTimer <= -5 && spawnQueue.length === 0) {
            startPhase(phaseIndex + 1);
            return;
        }

        // Game over check
        if (HUD.health <= 0) {
            state = 'GAME_OVER';
            Audio.gameOver();
            transitionTimer = 3;
            return;
        }

        // Update systems
        Network.update(dt);
        Threats.update(dt);
        HUD.update(dt);
        Traffic.update(dt);
        Particles.update(dt);

        // Screen shake decay
        if (screenShake > 0) screenShake *= 0.9;
    }

    function draw() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = CONFIG.COLORS.BG;
        ctx.fillRect(0, 0, w, h);

        if (state === 'MENU') {
            drawMenu(w, h);
            return;
        }

        if (state === 'INTRO') {
            Story.draw(ctx, w, h);
            return;
        }

        if (state === 'REPORT') {
            const won = HUD.health > 0;
            Story.drawReport(ctx, w, h, won, time);
            return;
        }

        // Apply screen shake
        if (screenShake > 0.5) {
            ctx.save();
            ctx.translate(
                (Math.random() - 0.5) * screenShake,
                (Math.random() - 0.5) * screenShake
            );
        }

        // Grid background
        Renderer.drawGrid(ctx, w, h, time);

        // Game panels
        const bounds = getBounds();
        Network.draw(ctx, time);
        Traffic.draw(ctx, time);
        Alerts.draw(ctx, time);

        // Threats
        Threats.draw(ctx, time);

        // Particles
        Particles.draw(ctx);

        // HUD (top + bottom bars, toolbar)
        HUD.draw(ctx, w, h, time);

        if (screenShake > 0.5) ctx.restore();

        // Phase transition overlay
        if (state === 'PHASE_TRANSITION') {
            const phase = CONFIG.PHASES[phaseIndex];
            if (phase) Story.drawPhaseTransition(ctx, w, h, phase, time);
        }

        // Victory / Game Over overlays
        if (state === 'VICTORY' || state === 'GAME_OVER') {
            ctx.save();
            ctx.fillStyle = 'rgba(5, 8, 20, 0.7)';
            ctx.fillRect(0, 0, w, h);
            ctx.font = 'bold 36px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            if (state === 'VICTORY') {
                ctx.fillStyle = CONFIG.COLORS.SAFE;
                ctx.shadowColor = CONFIG.COLORS.SAFE;
                ctx.shadowBlur = 25;
                ctx.fillText('ATTACK NEUTRALIZED', w / 2, h / 2);
            } else {
                ctx.fillStyle = CONFIG.COLORS.DANGER;
                ctx.shadowColor = CONFIG.COLORS.DANGER;
                ctx.shadowBlur = 25;
                ctx.fillText('NETWORK COMPROMISED', w / 2, h / 2);
            }
            ctx.restore();
        }
    }

    function drawMenu(w, h) {
        Renderer.drawGrid(ctx, w, h, time);

        // Floating network nodes in background
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 8; i++) {
            const nx = w * 0.15 + (i % 4) * (w * 0.2);
            const ny = h * 0.2 + Math.floor(i / 4) * (h * 0.4) + Math.sin(time + i) * 20;
            const types = ['CLOUD', 'FIREWALL', 'ROUTER', 'WEB', 'DB', 'MAIL', 'PC1', 'SWITCH'];
            Renderer.drawNodeIcon(ctx, nx, ny, 60, types[i], 'healthy');
        }
        ctx.globalAlpha = 1;

        // Title
        const pulse = 0.7 + Math.sin(menuPulse * 2) * 0.3;
        ctx.save();
        ctx.fillStyle = CONFIG.COLORS.PANEL_BORDER;
        ctx.shadowColor = CONFIG.COLORS.PANEL_BORDER;
        ctx.shadowBlur = 30 * pulse;
        ctx.font = 'bold 48px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FIREWALL', w / 2, h / 2 - 60);
        ctx.fillStyle = CONFIG.COLORS.DANGER;
        ctx.shadowColor = CONFIG.COLORS.DANGER;
        ctx.fillText('GUARDIAN', w / 2, h / 2 - 10);
        ctx.restore();

        // Subtitle
        ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
        ctx.font = '14px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Can you stop Phantom Claw?', w / 2, h / 2 + 25);

        // Start button
        const btnW = 220;
        const btnH = 50;
        const btnX = w / 2 - btnW / 2;
        const btnY = h / 2 + 55;
        ctx.save();
        ctx.fillStyle = CONFIG.COLORS.ACCENT + '22';
        ctx.strokeStyle = CONFIG.COLORS.ACCENT;
        ctx.shadowColor = CONFIG.COLORS.ACCENT;
        ctx.shadowBlur = 15 * pulse;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 6);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = CONFIG.COLORS.TEXT_PRIMARY;
        ctx.font = 'bold 16px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText('[ START MISSION ]', w / 2, btnY + 32);
        ctx.restore();

        // Store button bounds
        Game._menuBtnBounds = { x: btnX, y: btnY, w: btnW, h: btnH };

        // Instructions
        ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY + '88';
        ctx.font = '11px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Select tools with keys 1-6, then click threats to neutralize them', w / 2, h / 2 + 135);
        ctx.fillText('Defend the network for 5 minutes to win', w / 2, h / 2 + 155);
    }

    function onClick(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (state === 'MENU') {
            const btn = Game._menuBtnBounds;
            if (btn && x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                startGame();
            }
            return;
        }

        if (state === 'INTRO') {
            Story.skip();
            return;
        }

        if (state === 'REPORT') {
            const btn = Story._reportBtnBounds;
            if (btn && x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                state = 'MENU';
            }
            return;
        }

        if (state !== 'PLAYING') return;

        // Check toolbar click
        const toolKey = HUD.getToolButtonAt(x, y, canvas.width, canvas.height);
        if (toolKey) {
            Defense.selectTool(toolKey);
            return;
        }

        // Check threat click
        const threat = Threats.getThreatAt(x, y);
        if (threat) {
            if (Defense.activeTool) {
                Defense.applyToThreat(threat);
            } else {
                HUD.showFloatingText(threat.x, threat.y - 20, 'Select a tool first! (1-6)', CONFIG.COLORS.TEXT_SECONDARY);
            }
            return;
        }

        // Check node click
        const nodeType = Network.getNodeAt(x, y);
        if (nodeType) {
            if (Defense.activeTool) {
                Defense.applyToNode(nodeType);
            } else {
                Network.selectedNode = Network.selectedNode === nodeType ? null : nodeType;
            }
            return;
        }
    }

    function onMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (state === 'PLAYING') {
            // Change cursor based on context
            const threat = Threats.getThreatAt(x, y);
            const toolBtn = HUD.getToolButtonAt(x, y, canvas.width, canvas.height);
            if (Defense.activeTool && threat) {
                canvas.style.cursor = 'crosshair';
            } else if (toolBtn) {
                canvas.style.cursor = 'pointer';
            } else {
                canvas.style.cursor = 'default';
            }
        } else if (state === 'MENU' || state === 'REPORT') {
            canvas.style.cursor = 'pointer';
        }
    }

    function onKeyDown(e) {
        if (state === 'INTRO') {
            Story.skip();
            return;
        }

        if (state !== 'PLAYING') return;

        // Number keys for tool selection
        const key = e.key;
        const toolMap = { '1': 'BLOCK_IP', '2': 'QUARANTINE', '3': 'PATCH', '4': 'INSPECT', '5': 'REVOKE_ACCESS', '6': 'BACKUP_RESTORE' };
        if (toolMap[key]) {
            Defense.selectTool(toolMap[key]);
        }

        // Escape to deselect
        if (key === 'Escape') {
            Defense.activeTool = null;
            Network.selectedNode = null;
        }
    }

    return {
        init,
        _menuBtnBounds: null,
    };
})();

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => Game.init());
