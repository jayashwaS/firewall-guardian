// ============================================================
// FIREWALL GUARDIAN — Story / Cutscenes
// ============================================================

const Story = (() => {
    let state = 'idle'; // idle, typing, done
    let lines = [];
    let currentLine = 0;
    let charIndex = 0;
    let timer = 0;
    let typingSpeed = 0.03; // seconds per character
    let displayedLines = [];
    let onComplete = null;
    let skipEnabled = false;

    return {
        start(textLines, callback, speed = 0.03) {
            lines = textLines;
            currentLine = 0;
            charIndex = 0;
            timer = 0;
            typingSpeed = speed;
            displayedLines = [];
            state = 'typing';
            onComplete = callback;
            skipEnabled = true;
        },

        update(dt) {
            if (state !== 'typing') return;
            timer += dt;
            if (timer >= typingSpeed) {
                timer = 0;
                if (currentLine < lines.length) {
                    const line = lines[currentLine];
                    if (charIndex < line.length) {
                        charIndex++;
                        if (line[charIndex - 1] !== ' ') Audio.typewriter();
                    } else {
                        if (!displayedLines[currentLine]) displayedLines[currentLine] = '';
                        displayedLines[currentLine] = line;
                        currentLine++;
                        charIndex = 0;
                    }
                } else {
                    state = 'done';
                    if (onComplete) setTimeout(onComplete, 1500);
                }
            }
        },

        skip() {
            if (!skipEnabled) return;
            displayedLines = [...lines];
            currentLine = lines.length;
            state = 'done';
            if (onComplete) setTimeout(onComplete, 500);
        },

        draw(ctx, canvasW, canvasH) {
            if (state === 'idle') return;

            // Full screen dark overlay
            ctx.save();
            ctx.fillStyle = 'rgba(5, 8, 20, 0.95)';
            ctx.fillRect(0, 0, canvasW, canvasH);

            // Terminal border
            const margin = 60;
            Renderer.drawPanel(ctx, margin, margin, canvasW - margin * 2, canvasH - margin * 2, 'SECURE TERMINAL');

            // Scanline effect
            for (let y = margin; y < canvasH - margin; y += 3) {
                ctx.fillStyle = `rgba(0, 229, 255, ${0.01 + Math.sin(y * 0.1 + Date.now() * 0.002) * 0.005})`;
                ctx.fillRect(margin, y, canvasW - margin * 2, 1);
            }

            // Text
            const textX = margin + 30;
            let textY = margin + 50;
            const lineH = 22;

            // Already displayed lines
            for (let i = 0; i < Math.min(currentLine, lines.length); i++) {
                const line = displayedLines[i] || lines[i];
                ctx.fillStyle = line.startsWith('>>') ? CONFIG.COLORS.DANGER :
                    line.startsWith('[') ? CONFIG.COLORS.ACCENT :
                        CONFIG.COLORS.SAFE;
                ctx.font = line.startsWith('>>') ? 'bold 14px "Share Tech Mono", monospace' : '13px "Share Tech Mono", monospace';
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 4;
                ctx.textAlign = 'left';
                ctx.fillText(line, textX, textY);
                textY += lineH;
            }

            // Currently typing line
            if (currentLine < lines.length && state === 'typing') {
                const partial = lines[currentLine].substring(0, charIndex);
                const line = lines[currentLine];
                ctx.fillStyle = line.startsWith('>>') ? CONFIG.COLORS.DANGER :
                    line.startsWith('[') ? CONFIG.COLORS.ACCENT :
                        CONFIG.COLORS.SAFE;
                ctx.font = line.startsWith('>>') ? 'bold 14px "Share Tech Mono", monospace' : '13px "Share Tech Mono", monospace';
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 4;
                ctx.fillText(partial + (Math.sin(Date.now() * 0.006) > 0 ? '█' : ''), textX, textY);
            }

            // Skip hint
            if (state === 'typing') {
                ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY + '88';
                ctx.font = '10px "Share Tech Mono", monospace';
                ctx.textAlign = 'center';
                ctx.shadowBlur = 0;
                ctx.fillText('[ Click or press any key to skip ]', canvasW / 2, canvasH - margin - 15);
            }

            ctx.restore();
        },

        get isActive() { return state !== 'idle'; },
        get isDone() { return state === 'done'; },

        reset() {
            state = 'idle';
            lines = [];
            displayedLines = [];
            currentLine = 0;
            charIndex = 0;
            onComplete = null;
        },

        // Phase transition screen
        drawPhaseTransition(ctx, canvasW, canvasH, phase, time) {
            ctx.save();
            ctx.fillStyle = 'rgba(5, 8, 20, 0.88)';
            ctx.fillRect(0, 0, canvasW, canvasH);

            // Phase title
            const pulse = 0.7 + Math.sin(time * 4) * 0.3;
            ctx.fillStyle = CONFIG.COLORS.ACCENT;
            ctx.shadowColor = CONFIG.COLORS.ACCENT;
            ctx.shadowBlur = 20 * pulse;
            ctx.font = 'bold 28px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`PHASE ${phase.id}: ${phase.name}`, canvasW / 2, canvasH / 2 - 30);

            // Subtitle
            ctx.fillStyle = CONFIG.COLORS.TEXT_PRIMARY;
            ctx.shadowColor = 'transparent';
            ctx.font = '14px "Share Tech Mono", monospace';
            ctx.fillText(phase.subtitle, canvasW / 2, canvasH / 2 + 10);

            // Narration
            ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
            ctx.font = '11px "Share Tech Mono", monospace';
            const words = phase.narration.split(' ');
            let line = '';
            let ly = canvasH / 2 + 40;
            words.forEach(w => {
                const test = line + w + ' ';
                if (ctx.measureText(test).width > 500) {
                    ctx.fillText(line.trim(), canvasW / 2, ly);
                    line = w + ' ';
                    ly += 16;
                } else {
                    line = test;
                }
            });
            ctx.fillText(line.trim(), canvasW / 2, ly);

            ctx.restore();
        },

        // Report card screen
        drawReport(ctx, canvasW, canvasH, won, time) {
            ctx.save();
            ctx.fillStyle = 'rgba(5, 8, 20, 0.95)';
            ctx.fillRect(0, 0, canvasW, canvasH);

            const cx = canvasW / 2;
            const rw = 420;
            const rh = 460;
            const rx = cx - rw / 2;
            const ry = (canvasH - rh) / 2;

            Renderer.drawPanel(ctx, rx, ry, rw, rh, 'SECURITY ANALYST REPORT');

            let y = ry + 35;
            const lineH = 22;

            // Result
            ctx.font = 'bold 22px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            if (won) {
                ctx.fillStyle = CONFIG.COLORS.SAFE;
                ctx.shadowColor = CONFIG.COLORS.SAFE;
                ctx.shadowBlur = 15;
                ctx.fillText('ATTACK NEUTRALIZED', cx, y);
            } else {
                ctx.fillStyle = CONFIG.COLORS.DANGER;
                ctx.shadowColor = CONFIG.COLORS.DANGER;
                ctx.shadowBlur = 15;
                ctx.fillText('NETWORK COMPROMISED', cx, y);
            }
            ctx.shadowBlur = 0;

            y += lineH * 1.8;

            // Stats
            const stats = Threats.stats;
            const defStats = Defense.stats;
            const detected = stats.blocked + stats.missed;
            const avgResponse = '~2.1s';
            const grade = getGrade(HUD.score);

            const rows = [
                ['Threats Detected:', `${detected}/${stats.total}`],
                ['Correct Responses:', `${defStats.correct}/${detected}`],
                ['False Positives:', `${defStats.falsePositives}`],
                ['Network Health:', `${Math.round(HUD.health)}%`],
                ['Final Score:', HUD.score.toLocaleString()],
            ];

            ctx.font = '12px "Share Tech Mono", monospace';
            rows.forEach(([label, value]) => {
                ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
                ctx.textAlign = 'left';
                ctx.fillText(label, rx + 40, y);
                ctx.fillStyle = CONFIG.COLORS.TEXT_PRIMARY;
                ctx.textAlign = 'right';
                ctx.fillText(value, rx + rw - 40, y);
                y += lineH;
            });

            y += lineH * 0.5;

            // Grade
            ctx.font = 'bold 18px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = CONFIG.COLORS.ACCENT;
            ctx.shadowColor = CONFIG.COLORS.ACCENT;
            ctx.shadowBlur = 10;
            ctx.fillText(`GRADE: ${grade}`, cx, y);
            y += lineH;
            ctx.font = '13px "Share Tech Mono", monospace';
            ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
            ctx.shadowBlur = 0;
            ctx.fillText(`RANK: ${HUD.getRank()}`, cx, y);

            y += lineH * 1.5;

            // Concepts learned
            ctx.font = 'bold 11px "Share Tech Mono", monospace';
            ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
            ctx.textAlign = 'left';
            ctx.fillText('CONCEPTS LEARNED:', rx + 40, y);
            y += lineH * 0.8;
            const concepts = ['Firewall Rules', 'Phishing Detection', 'SQL Injection Defense',
                'Incident Response', 'Network Segmentation', 'Backup & Recovery'];
            ctx.font = '11px "Share Tech Mono", monospace';
            concepts.forEach(c => {
                const learned = HUD.score > 1000; // simplified
                ctx.fillStyle = learned ? CONFIG.COLORS.SAFE : CONFIG.COLORS.TEXT_SECONDARY + '66';
                ctx.fillText(`${learned ? '✓' : '○'} ${c}`, rx + 50, y);
                y += lineH * 0.75;
            });

            y += lineH;

            // Play again button
            const btnW = 160;
            const btnH = 36;
            const btnX = cx - btnW / 2;
            const btnY = y;
            const pulse = 0.8 + Math.sin(time * 3) * 0.2;
            ctx.fillStyle = CONFIG.COLORS.ACCENT + '33';
            ctx.strokeStyle = CONFIG.COLORS.ACCENT;
            ctx.shadowColor = CONFIG.COLORS.ACCENT;
            ctx.shadowBlur = 10 * pulse;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(btnX, btnY, btnW, btnH, 4);
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = CONFIG.COLORS.TEXT_PRIMARY;
            ctx.font = 'bold 13px "Share Tech Mono", monospace';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 0;
            ctx.fillText('[ PLAY AGAIN ]', cx, btnY + 23);

            // Store button bounds for click detection
            Story._reportBtnBounds = { x: btnX, y: btnY, w: btnW, h: btnH };

            ctx.restore();
        },

        _reportBtnBounds: null,
    };

    function getGrade(score) {
        if (score >= 9500) return 'S';
        if (score >= 8000) return 'A+';
        if (score >= 6500) return 'A';
        if (score >= 5000) return 'B+';
        if (score >= 3500) return 'B';
        if (score >= 2000) return 'C+';
        if (score >= 1000) return 'C';
        return 'D';
    }
})();
