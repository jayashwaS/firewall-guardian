// ============================================================
// FIREWALL GUARDIAN — HUD (Heads-Up Display)
// ============================================================

const HUD = (() => {
    let score = 0;
    let health = 100;
    let currentPhase = 0;
    let phaseTime = 0;
    let totalTime = 300;
    let elapsedTime = 0;
    let floatingTexts = [];
    let intelPopup = null;
    let intelTimer = 0;
    let tutorialMsg = '';
    let tutorialTimer = 0;
    let phaseDamage = 0; // track damage per phase for perfect bonus

    class FloatingText {
        constructor(x, y, text, color) {
            this.x = x; this.y = y;
            this.text = text; this.color = color;
            this.life = 1.5; this.vy = -1.5;
        }
        update(dt) {
            this.y += this.vy; this.life -= dt;
            return this.life > 0;
        }
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 6;
            ctx.font = 'bold 14px "Share Tech Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }
    }

    return {
        init() {
            score = 0; health = 100; currentPhase = 0;
            phaseTime = 0; elapsedTime = 0;
            floatingTexts = []; intelPopup = null;
            phaseDamage = 0;
        },

        update(dt) {
            floatingTexts = floatingTexts.filter(f => f.update(dt));
            if (intelPopup) {
                intelTimer -= dt;
                if (intelTimer <= 0) intelPopup = null;
            }
            if (tutorialTimer > 0) {
                tutorialTimer -= dt;
                if (tutorialTimer <= 0) tutorialMsg = '';
            }
        },

        draw(ctx, canvasW, canvasH, time) {
            // ----- Top bar -----
            const topH = 40;
            ctx.save();
            ctx.fillStyle = CONFIG.COLORS.BG_PANEL;
            ctx.fillRect(0, 0, canvasW, topH);
            ctx.strokeStyle = CONFIG.COLORS.PANEL_BORDER;
            ctx.shadowColor = CONFIG.COLORS.PANEL_BORDER;
            ctx.shadowBlur = 8;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, topH); ctx.lineTo(canvasW, topH); ctx.stroke();

            // Title
            ctx.fillStyle = CONFIG.COLORS.TEXT_PRIMARY;
            ctx.font = 'bold 14px "Orbitron", "Share Tech Mono", monospace';
            ctx.shadowColor = CONFIG.COLORS.ACCENT;
            ctx.shadowBlur = 6;
            ctx.textAlign = 'left';
            ctx.fillText('NOVATECH SOC', 12, 26);

            // Threat level
            const phase = CONFIG.PHASES[currentPhase];
            const threatLevels = ['LOW', 'MEDIUM', 'HIGH', 'SEVERE', 'CRITICAL'];
            const threatColors = [CONFIG.COLORS.SAFE, CONFIG.COLORS.SAFE, CONFIG.COLORS.WARNING, CONFIG.COLORS.DANGER, CONFIG.COLORS.DANGER];
            const tl = currentPhase;
            ctx.fillStyle = threatColors[tl];
            ctx.shadowColor = threatColors[tl];
            ctx.font = 'bold 12px "Share Tech Mono", monospace';
            ctx.fillText(`THREAT: ${threatLevels[tl]}`, 170, 26);

            // Phase name
            if (phase) {
                ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
                ctx.font = '11px "Share Tech Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`PHASE ${phase.id}: ${phase.name}`, canvasW / 2, 26);
            }

            // Clock
            const mins = Math.floor((totalTime - elapsedTime) / 60);
            const secs = Math.floor((totalTime - elapsedTime) % 60);
            ctx.fillStyle = (totalTime - elapsedTime) < 30 ? CONFIG.COLORS.DANGER : CONFIG.COLORS.TEXT_PRIMARY;
            ctx.font = 'bold 16px "Share Tech Mono", monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`, canvasW - 12, 26);

            ctx.restore();

            // ----- Bottom bar -----
            const botH = 60;
            const botY = canvasH - botH;
            ctx.save();
            ctx.fillStyle = CONFIG.COLORS.BG_PANEL;
            ctx.fillRect(0, botY, canvasW, botH);
            ctx.strokeStyle = CONFIG.COLORS.PANEL_BORDER;
            ctx.shadowColor = CONFIG.COLORS.PANEL_BORDER;
            ctx.shadowBlur = 8;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, botY); ctx.lineTo(canvasW, botY); ctx.stroke();

            // Tool buttons
            const tools = Object.entries(CONFIG.TOOLS);
            const toolW = 70;
            const toolStartX = canvasW / 2 - (tools.length * toolW) / 2;
            tools.forEach(([key, tool], i) => {
                const tx = toolStartX + i * toolW + toolW / 2;
                const ty = botY + botH / 2;
                const isActive = Defense.activeTool === key;

                // Button background
                ctx.fillStyle = isActive ? CONFIG.COLORS.ACCENT + '33' : CONFIG.COLORS.DARK_SLATE;
                ctx.strokeStyle = isActive ? CONFIG.COLORS.ACCENT : CONFIG.COLORS.PANEL_BORDER + '88';
                ctx.shadowColor = isActive ? CONFIG.COLORS.ACCENT : 'transparent';
                ctx.shadowBlur = isActive ? 12 : 0;
                ctx.lineWidth = isActive ? 2 : 1;
                ctx.beginPath();
                ctx.roundRect(tx - toolW / 2 + 4, botY + 4, toolW - 8, botH - 8, 4);
                ctx.fill(); ctx.stroke();

                // Icon
                Renderer.drawToolIcon(ctx, tx, ty - 3, 30, tool.icon, isActive);

                // Key hint
                ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
                ctx.font = '8px "Share Tech Mono", monospace';
                ctx.textAlign = 'center';
                ctx.shadowBlur = 0;
                ctx.fillText(tool.key, tx, botY + botH - 5);
            });

            // Score (left)
            ctx.fillStyle = CONFIG.COLORS.TEXT_PRIMARY;
            ctx.font = 'bold 13px "Share Tech Mono", monospace';
            ctx.textAlign = 'left';
            ctx.shadowColor = CONFIG.COLORS.ACCENT;
            ctx.shadowBlur = 4;
            ctx.fillText(`SCORE: ${score.toLocaleString()}`, 12, botY + 22);
            ctx.font = '10px "Share Tech Mono", monospace';
            ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
            ctx.fillText(`PHASE ${currentPhase + 1}/5`, 12, botY + 40);

            // Health bar (right)
            const hbW = 150;
            const hbH = 14;
            const hbX = canvasW - hbW - 12;
            const hbY = botY + 15;
            ctx.fillStyle = CONFIG.COLORS.DARK_SLATE;
            ctx.fillRect(hbX, hbY, hbW, hbH);
            const hColor = health > 60 ? CONFIG.COLORS.HEALTH_HIGH : health > 30 ? CONFIG.COLORS.HEALTH_MID : CONFIG.COLORS.HEALTH_LOW;
            ctx.fillStyle = hColor;
            ctx.shadowColor = hColor;
            ctx.shadowBlur = 8;
            ctx.fillRect(hbX, hbY, hbW * (health / 100), hbH);
            ctx.strokeStyle = CONFIG.COLORS.PANEL_BORDER;
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;
            ctx.strokeRect(hbX, hbY, hbW, hbH);
            ctx.fillStyle = CONFIG.COLORS.TEXT_PRIMARY;
            ctx.font = 'bold 10px "Share Tech Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`HEALTH: ${Math.round(health)}%`, hbX + hbW / 2, hbY + 11);

            ctx.restore();

            // ----- Floating texts -----
            floatingTexts.forEach(f => f.draw(ctx));

            // ----- Intel popup -----
            if (intelPopup) {
                const ipW = 360;
                const ipH = 80;
                const ipX = canvasW / 2 - ipW / 2;
                const ipY = canvasH - botH - ipH - 20;
                ctx.save();
                ctx.fillStyle = 'rgba(0, 20, 40, 0.92)';
                ctx.strokeStyle = CONFIG.COLORS.SAFE;
                ctx.shadowColor = CONFIG.COLORS.SAFE;
                ctx.shadowBlur = 10;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(ipX, ipY, ipW, ipH, 6);
                ctx.fill(); ctx.stroke();
                ctx.fillStyle = CONFIG.COLORS.SAFE;
                ctx.font = 'bold 11px "Share Tech Mono", monospace';
                ctx.textAlign = 'left';
                ctx.fillText(`⚡ INTEL BRIEF: ${intelPopup.title}`, ipX + 12, ipY + 18);
                ctx.fillStyle = CONFIG.COLORS.TEXT_PRIMARY;
                ctx.font = '10px "Share Tech Mono", monospace';
                // Wrap text
                const words = intelPopup.text.split(' ');
                let line = '';
                let ly = ipY + 36;
                words.forEach(w => {
                    const test = line + w + ' ';
                    if (ctx.measureText(test).width > ipW - 24) {
                        ctx.fillText(line.trim(), ipX + 12, ly);
                        line = w + ' ';
                        ly += 14;
                    } else {
                        line = test;
                    }
                });
                ctx.fillText(line.trim(), ipX + 12, ly);
                ctx.restore();
            }

            // ----- Tutorial message -----
            if (tutorialMsg) {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 40, 80, 0.9)';
                ctx.strokeStyle = CONFIG.COLORS.ACCENT;
                ctx.shadowColor = CONFIG.COLORS.ACCENT;
                ctx.shadowBlur = 8;
                ctx.lineWidth = 1;
                const tw = 400;
                const th = 36;
                const tx = canvasW / 2 - tw / 2;
                const ty = 48;
                ctx.beginPath();
                ctx.roundRect(tx, ty, tw, th, 4);
                ctx.fill(); ctx.stroke();
                ctx.fillStyle = CONFIG.COLORS.TEXT_PRIMARY;
                ctx.font = '11px "Share Tech Mono", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(tutorialMsg, canvasW / 2, ty + 22);
                ctx.restore();
            }
        },

        addScore(amount) { score += amount; if (score < 0) score = 0; },
        get score() { return score; },

        damageHealth(amount) { health = Math.max(0, health - amount); phaseDamage += amount; },
        healHealth(amount) { health = Math.min(100, health + amount); },
        get health() { return health; },

        setPhase(p) { currentPhase = p; phaseDamage = 0; },
        get phase() { return currentPhase; },
        get phasePerfect() { return phaseDamage === 0; },

        setTime(elapsed, total) { elapsedTime = elapsed; totalTime = total; },

        showFloatingText(x, y, text, color) {
            floatingTexts.push(new FloatingText(x, y, text, color));
        },

        showIntel(text, title) {
            intelPopup = { text, title };
            intelTimer = 4;
        },

        showTutorial(msg, duration = 5) {
            tutorialMsg = msg;
            tutorialTimer = duration;
        },

        getToolButtonAt(x, y, canvasW, canvasH) {
            const botH = 60;
            const botY = canvasH - botH;
            if (y < botY + 4 || y > botY + botH - 4) return null;
            const tools = Object.keys(CONFIG.TOOLS);
            const toolW = 70;
            const toolStartX = canvasW / 2 - (tools.length * toolW) / 2;
            for (let i = 0; i < tools.length; i++) {
                const tx = toolStartX + i * toolW + 4;
                if (x >= tx && x <= tx + toolW - 8) return tools[i];
            }
            return null;
        },

        getRank() {
            let rank = CONFIG.RANKS[0].label;
            for (const r of CONFIG.RANKS) {
                if (score >= r.min) rank = r.label;
            }
            return rank;
        },
    };
})();
