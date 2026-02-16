// ============================================================
// FIREWALL GUARDIAN — Renderer (Individual Icons + Procedural)
// ============================================================

const Renderer = (() => {
    // Image cache: key → Image object
    const images = {};
    let loadedCount = 0;
    let totalCount = 0;

    // ---- init: preload all individual icon PNGs ----
    function init() {
        const S = CONFIG.SPRITES;

        // Collect all unique paths
        const paths = new Set();
        Object.values(S.NODES).forEach(p => paths.add(p));
        Object.values(S.TOOLS).forEach(p => paths.add(p));
        if (S.THREAT) paths.add(S.THREAT);
        if (S.ALERT_RING) paths.add(S.ALERT_RING);
        if (S.PANEL) paths.add(S.PANEL);

        totalCount = paths.size;

        paths.forEach(src => {
            const img = new Image();
            img.onload = () => { loadedCount++; };
            img.onerror = () => { console.warn('Failed to load sprite:', src); loadedCount++; };
            img.src = src;
            images[src] = img;
        });
    }

    function isLoaded() { return loadedCount >= totalCount && totalCount > 0; }

    // ---- Helper: neon glow wrapper ----
    function withGlow(ctx, color, blur, fn) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = blur;
        fn();
        ctx.restore();
    }

    function getNodeColor(status) {
        switch (status) {
            case 'healthy': return CONFIG.COLORS.SAFE;
            case 'at-risk': return CONFIG.COLORS.WARNING;
            case 'attacked': return CONFIG.COLORS.DANGER;
            case 'compromised': return '#666666';
            default: return CONFIG.COLORS.SAFE;
        }
    }

    // ---- Draw a single icon image ----
    function drawIcon(ctx, src, x, y, size) {
        const img = images[src];
        if (!img || !img.complete || img.naturalWidth === 0) {
            // Fallback circle
            ctx.fillStyle = '#112233';
            ctx.strokeStyle = CONFIG.COLORS.PANEL_BORDER;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            return;
        }
        ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
    }

    // ---- Nodes ----
    function drawNodeIcon(ctx, x, y, size, nodeType, status) {
        const type = CONFIG.NODE_TYPES[nodeType];
        if (!type) return;

        const src = CONFIG.SPRITES.NODES[type.icon];
        if (!src) return;

        // Targeting ring
        if (status === 'targeting' || status === 'attacked') {
            ctx.save();
            ctx.strokeStyle = CONFIG.COLORS.DANGER;
            ctx.globalAlpha = 0.5;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Glow based on status
        ctx.save();
        const color = getNodeColor(status);
        ctx.shadowColor = color;
        ctx.shadowBlur = status === 'compromised' ? 20 : status === 'attacked' ? 15 : 8;

        drawIcon(ctx, src, x, y, size);
        ctx.restore();

        // Compromised overlay
        if (status === 'compromised') {
            ctx.save();
            ctx.strokeStyle = CONFIG.COLORS.MALWARE;
            ctx.globalAlpha = 0.6;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, size / 2 + 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    // ---- Tools ----
    // toolKey: the CONFIG.TOOLS key (BLOCK_IP, QUARANTINE, etc.)
    // OR the icon string (shield, cage, etc.) — we handle both
    function drawToolIcon(ctx, x, y, size, toolKeyOrIcon, isActive) {
        // Resolve tool key: hud.js passes tool.icon (e.g. 'shield'),
        // but we need the TOOLS key (e.g. 'BLOCK_IP')
        let toolKey = toolKeyOrIcon;
        const iconToKey = {
            'shield': 'BLOCK_IP', 'cage': 'QUARANTINE', 'wrench': 'PATCH',
            'magnify': 'INSPECT', 'key_x': 'REVOKE_ACCESS', 'rewind': 'BACKUP_RESTORE',
        };
        if (iconToKey[toolKey]) toolKey = iconToKey[toolKey];

        const src = CONFIG.SPRITES.TOOLS[toolKey];

        // Button background
        ctx.save();
        ctx.fillStyle = isActive ? 'rgba(0, 229, 255, 0.15)' : 'rgba(10, 14, 39, 0.6)';
        ctx.strokeStyle = isActive ? CONFIG.COLORS.ACCENT : CONFIG.COLORS.PANEL_BORDER;
        ctx.lineWidth = isActive ? 2 : 1;
        if (isActive) {
            ctx.shadowColor = CONFIG.COLORS.ACCENT;
            ctx.shadowBlur = 12;
        }
        ctx.beginPath();
        ctx.roundRect(x - size / 2, y - size / 2, size, size, 6);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Icon sprite
        if (src) {
            ctx.save();
            if (isActive) {
                ctx.shadowColor = CONFIG.COLORS.ACCENT;
                ctx.shadowBlur = 10;
            }
            drawIcon(ctx, src, x, y, size * 0.7);
            ctx.restore();
        }

        // Keybind label
        const tool = CONFIG.TOOLS[toolKey];
        if (tool) {
            ctx.fillStyle = isActive ? CONFIG.COLORS.TEXT_PRIMARY : CONFIG.COLORS.TEXT_SECONDARY;
            ctx.font = 'bold 12px "Share Tech Mono"';
            ctx.textAlign = 'right';
            ctx.fillText(tool.key, x + size / 2 - 5, y + size / 2 - 5);
        }
    }

    // ---- Grid ----
    function drawGrid(ctx, w, h, time) {
        ctx.save();
        ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        ctx.lineWidth = 0.5;
        const spacing = 40;
        const offset = (time * 10) % spacing;

        ctx.beginPath();
        for (let gx = offset; gx < w; gx += spacing) {
            ctx.moveTo(gx, 0); ctx.lineTo(gx, h);
        }
        for (let gy = offset; gy < h; gy += spacing) {
            ctx.moveTo(0, gy); ctx.lineTo(w, gy);
        }
        ctx.stroke();

        // Scan line
        const scanY = (time * 50) % h;
        const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
        grad.addColorStop(0, 'rgba(0, 229, 255, 0)');
        grad.addColorStop(0.5, 'rgba(0, 229, 255, 0.1)');
        grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 20, w, 40);
        ctx.restore();
    }

    // ---- Connections ----
    function drawConnection(ctx, x1, y1, x2, y2, status = 'healthy', time = 0) {
        const color = status === 'compromised' ? CONFIG.COLORS.MALWARE : CONFIG.COLORS.ACCENT;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -time * 20;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }

    // ---- Panel ----
    function drawPanel(ctx, x, y, w, h, label = '') {
        ctx.save();
        ctx.fillStyle = CONFIG.COLORS.BG_PANEL;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 4);
        ctx.fill();

        // Border glow
        ctx.strokeStyle = CONFIG.COLORS.PANEL_BORDER;
        ctx.shadowColor = CONFIG.COLORS.PANEL_BORDER;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 4);
        ctx.stroke();

        // Tech corners
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2;
        const c = 10;
        ctx.beginPath();
        ctx.moveTo(x, y + c); ctx.lineTo(x, y); ctx.lineTo(x + c, y);
        ctx.moveTo(x + w - c, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + c);
        ctx.moveTo(x, y + h - c); ctx.lineTo(x, y + h); ctx.lineTo(x + c, y + h);
        ctx.moveTo(x + w - c, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - c);
        ctx.stroke();

        if (label) {
            ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
            ctx.font = '10px "Share Tech Mono"';
            ctx.fillText(label, x + 12, y + 16);
        }
        ctx.restore();
    }

    // ---- Threats (procedural — animated) ----
    function drawThreat(ctx, x, y, size, typeKey, time = 0) {
        const cfg = CONFIG.THREATS[typeKey];
        if (!cfg) return;

        const color = cfg.color;
        const s = size * 0.4;

        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = color;
        ctx.fillStyle = color + '66';
        ctx.lineWidth = 1.5;

        switch (cfg.shape) {
            case 'radar':
                const pulse = 0.5 + Math.sin(time * 4) * 0.5;
                ctx.beginPath(); ctx.arc(x, y, s * pulse, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.arc(x, y, s * pulse * 0.5, 0, Math.PI * 2); ctx.stroke();
                ctx.fillStyle = color;
                ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
                break;

            case 'envelope':
                ctx.beginPath(); ctx.rect(x - s, y - s * 0.6, s * 2, s * 1.2); ctx.fill(); ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x - s, y - s * 0.6); ctx.lineTo(x, y + s * 0.1); ctx.lineTo(x + s, y - s * 0.6);
                ctx.stroke();
                ctx.fillStyle = color; ctx.font = `${s * 0.7}px sans-serif`; ctx.textAlign = 'center';
                ctx.fillText('☠', x, y + s * 0.4);
                break;

            case 'syringe':
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.rect(x - s * 0.15, y - s * 0.8, s * 0.3, s * 1.2); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x, y + s * 0.4); ctx.lineTo(x, y + s); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x - s * 0.25, y - s * 0.8); ctx.lineTo(x + s * 0.25, y - s * 0.8); ctx.stroke();
                ctx.fillStyle = color + 'aa'; ctx.fillRect(x - s * 0.12, y - s * 0.3, s * 0.24, s * 0.5);
                break;

            case 'ram':
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + s, y);
                ctx.lineTo(x - s * 0.3, y - s * 0.5); ctx.lineTo(x - s, y - s * 0.5);
                ctx.lineTo(x - s, y + s * 0.5); ctx.lineTo(x - s * 0.3, y + s * 0.5);
                ctx.closePath(); ctx.fill(); ctx.stroke();
                const imp = Math.sin(time * 8) * 0.3;
                ctx.beginPath();
                ctx.moveTo(x + s + 3, y - s * 0.3); ctx.lineTo(x + s + 8 + imp * 5, y - s * 0.4);
                ctx.moveTo(x + s + 3, y); ctx.lineTo(x + s + 10 + imp * 5, y);
                ctx.moveTo(x + s + 3, y + s * 0.3); ctx.lineTo(x + s + 8 + imp * 5, y + s * 0.4);
                ctx.stroke();
                break;

            case 'virus':
                ctx.fillStyle = color + '88';
                ctx.beginPath(); ctx.arc(x, y, s * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                for (let i = 0; i < 6; i++) {
                    const a = (Math.PI * 2 / 6) * i + time * 2;
                    const len = s * 0.8 + Math.sin(time * 3 + i) * s * 0.2;
                    ctx.beginPath();
                    ctx.moveTo(x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5);
                    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
                    ctx.stroke();
                    ctx.beginPath(); ctx.arc(x + Math.cos(a) * len, y + Math.sin(a) * len, 2, 0, Math.PI * 2); ctx.fill();
                }
                break;

            case 'leak':
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.rect(x - s * 0.2, y - s, s * 0.4, s * 2); ctx.fill(); ctx.stroke();
                const drip = (time * 2) % 1;
                ctx.fillStyle = color;
                ctx.beginPath(); ctx.arc(x, y + s + drip * s * 0.5, 3, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#00ff8888'; ctx.font = '8px monospace';
                for (let i = 0; i < 3; i++) {
                    const by = y - s * 0.7 + i * s * 0.5 + ((time * 50) % (s * 0.5));
                    ctx.fillText(Math.random() > 0.5 ? '1' : '0', x - 3, by);
                }
                break;

            case 'skull_lock':
                ctx.fillStyle = '#000000aa'; ctx.strokeStyle = color;
                ctx.beginPath(); ctx.rect(x - s * 0.5, y - s * 0.1, s, s * 0.8); ctx.fill(); ctx.stroke();
                ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.arc(x, y - s * 0.1, s * 0.35, Math.PI, 0); ctx.stroke();
                ctx.fillStyle = color; ctx.font = `${s * 0.5}px sans-serif`; ctx.textAlign = 'center';
                ctx.fillText('☠', x, y + s * 0.5);
                ctx.strokeStyle = color + Math.floor(128 + Math.sin(time * 6) * 127).toString(16);
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(x, y + s * 0.3, s * 0.8 + Math.sin(time * 4) * s * 0.2, 0, Math.PI * 2); ctx.stroke();
                break;
        }
        ctx.restore();
    }

    // ---- Danger ring ----
    function drawDangerRing(ctx, x, y, size, time) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 2);
        ctx.strokeStyle = CONFIG.COLORS.DANGER;
        ctx.shadowColor = CONFIG.COLORS.DANGER;
        ctx.shadowBlur = 15;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 1.5); ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, size * 0.75, Math.PI * 0.5, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }

    // ---- Compromised effect ----
    function drawCompromisedEffect(ctx, x, y, size, time) {
        ctx.save();
        ctx.strokeStyle = CONFIG.COLORS.MALWARE;
        ctx.shadowColor = CONFIG.COLORS.MALWARE;
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 / 4) * i + time * 3;
            const r = size * 0.6;
            const ox = Math.cos(angle) * r;
            const oy = Math.sin(angle) * r;
            ctx.beginPath();
            ctx.moveTo(x + ox * 0.3, y + oy * 0.3);
            ctx.lineTo(x + ox * 0.6 + Math.sin(time * 10 + i) * 4, y + oy * 0.6);
            ctx.lineTo(x + ox * 0.5, y + oy * 0.5 + 3);
            ctx.lineTo(x + ox, y + oy);
            ctx.stroke();
        }
        ctx.restore();
    }

    return {
        init,
        isLoaded,
        drawNodeIcon,
        drawToolIcon,
        drawGrid,
        drawPanel,
        drawConnection,
        drawThreat,
        drawDangerRing,
        drawCompromisedEffect,
        getNodeColor,
        withGlow,
    };
})();
