// ============================================================
// FIREWALL GUARDIAN — Traffic Visualizer
// ============================================================

const Traffic = (() => {
    let lines = [];
    let maxLines = 30;
    let bounds = { x: 0, y: 0, w: 0, h: 0 };
    let scrollOffset = 0;

    const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'SSH', 'SMTP', 'FTP'];
    const SAFE_IPS = ['10.0.1.50', '10.0.1.51', '10.0.2.10', '10.0.2.20', '192.168.1.100', '172.16.0.5'];
    const THREAT_IPS = ['45.33.32.156', '185.220.101.1', '23.129.64.10', '91.219.237.1', '198.51.100.7'];

    function randIP(pool) { return pool[Math.floor(Math.random() * pool.length)]; }

    function generateSafeLine() {
        const ts = new Date().toTimeString().slice(0, 8);
        const src = randIP(SAFE_IPS);
        const dst = randIP(SAFE_IPS);
        const proto = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
        return { ts, src, dst, proto, status: 'OK', type: 'safe' };
    }

    function generateThreatLine(threatName) {
        const ts = new Date().toTimeString().slice(0, 8);
        const src = randIP(THREAT_IPS);
        const dst = randIP(SAFE_IPS);
        return { ts, src, dst, proto: 'TCP', status: threatName || 'ALERT', type: 'threat' };
    }

    function generateSuspiciousLine() {
        const ts = new Date().toTimeString().slice(0, 8);
        const src = randIP(THREAT_IPS);
        const dst = randIP(SAFE_IPS);
        const proto = PROTOCOLS[Math.floor(Math.random() * 3)];
        return { ts, src, dst, proto, status: 'SUS', type: 'suspicious' };
    }

    return {
        init(b) {
            bounds = b;
            lines = [];
            // Pre-populate with safe traffic
            for (let i = 0; i < 15; i++) lines.push(generateSafeLine());
        },

        update(dt) {
            scrollOffset += dt * 15;
            // Add random traffic
            if (Math.random() < dt * 2) {
                const roll = Math.random();
                if (roll < 0.7) lines.push(generateSafeLine());
                else if (roll < 0.9) lines.push(generateSuspiciousLine());
                // Threat lines added by addThreatLine()
            }
            while (lines.length > maxLines) lines.shift();
        },

        addThreatLine(name) {
            lines.push(generateThreatLine(name));
        },

        draw(ctx, time) {
            Renderer.drawPanel(ctx, bounds.x, bounds.y, bounds.w, bounds.h, 'TRAFFIC MONITOR');

            ctx.save();
            // Clip to panel
            ctx.beginPath();
            ctx.rect(bounds.x + 4, bounds.y + 20, bounds.w - 8, bounds.h - 24);
            ctx.clip();

            const lineH = 14;
            const startY = bounds.y + 30;
            const maxVisible = Math.floor((bounds.h - 30) / lineH);
            const start = Math.max(0, lines.length - maxVisible);

            for (let i = start; i < lines.length; i++) {
                const l = lines[i];
                const y = startY + (i - start) * lineH;
                let color;
                switch (l.type) {
                    case 'safe': color = CONFIG.COLORS.SAFE + '99'; break;
                    case 'suspicious': color = CONFIG.COLORS.WARNING; break;
                    case 'threat': color = CONFIG.COLORS.DANGER; break;
                }

                ctx.fillStyle = color;
                ctx.font = '10px "Share Tech Mono", monospace';
                ctx.textAlign = 'left';

                const text = `[${l.ts}] ${l.src.padEnd(16)} → ${l.dst.padEnd(16)} ${l.proto.padEnd(5)} ${l.status}`;
                ctx.fillText(text, bounds.x + 10, y);

                // Threat line glow
                if (l.type === 'threat') {
                    ctx.fillStyle = CONFIG.COLORS.DANGER + '15';
                    ctx.fillRect(bounds.x + 4, y - 10, bounds.w - 8, lineH);
                }
            }

            // Scanline effect
            const scanY = (time * 40) % (bounds.h - 24);
            ctx.strokeStyle = CONFIG.COLORS.PANEL_BORDER + '20';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bounds.x + 4, bounds.y + 20 + scanY);
            ctx.lineTo(bounds.x + bounds.w - 4, bounds.y + 20 + scanY);
            ctx.stroke();

            ctx.restore();
        },
    };
})();
