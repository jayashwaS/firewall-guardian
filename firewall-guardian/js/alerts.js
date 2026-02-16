// ============================================================
// FIREWALL GUARDIAN — Alert Panel
// ============================================================

const Alerts = (() => {
    let alerts = [];
    let maxAlerts = 20;
    let bounds = { x: 0, y: 0, w: 0, h: 0 };

    return {
        init(b) {
            bounds = b;
            alerts = [];
        },

        add(message, severity = 'INFO') {
            const ts = new Date().toTimeString().slice(0, 8);
            alerts.push({ message, severity, ts, time: Date.now() });
            while (alerts.length > maxAlerts) alerts.shift();
        },

        draw(ctx, time) {
            Renderer.drawPanel(ctx, bounds.x, bounds.y, bounds.w, bounds.h, 'ALERT FEED');

            ctx.save();
            ctx.beginPath();
            ctx.rect(bounds.x + 4, bounds.y + 20, bounds.w - 8, bounds.h - 24);
            ctx.clip();

            const lineH = 16;
            const startY = bounds.y + 32;
            const maxVisible = Math.floor((bounds.h - 32) / lineH);
            const start = Math.max(0, alerts.length - maxVisible);

            for (let i = start; i < alerts.length; i++) {
                const a = alerts[i];
                const y = startY + (i - start) * lineH;
                let color, icon;
                switch (a.severity) {
                    case 'INFO':
                        color = CONFIG.COLORS.ACCENT;
                        icon = 'ℹ';
                        break;
                    case 'WARNING':
                        color = CONFIG.COLORS.WARNING;
                        icon = '⚠';
                        break;
                    case 'CRITICAL':
                        color = CONFIG.COLORS.DANGER;
                        icon = '⛔';
                        // Pulse unhandled critical alerts
                        const age = (Date.now() - a.time) / 1000;
                        if (age < 3) {
                            ctx.fillStyle = CONFIG.COLORS.DANGER + Math.floor(20 + Math.sin(time * 6) * 15).toString(16);
                            ctx.fillRect(bounds.x + 4, y - 11, bounds.w - 8, lineH);
                        }
                        break;
                }

                ctx.fillStyle = color;
                ctx.font = '10px "Share Tech Mono", monospace';
                ctx.textAlign = 'left';
                ctx.fillText(`${icon} [${a.ts}] ${a.message}`, bounds.x + 10, y);
            }

            ctx.restore();
        },

        get count() { return alerts.length; },
    };
})();
