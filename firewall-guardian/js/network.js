// ============================================================
// FIREWALL GUARDIAN — Network Map Manager
// ============================================================

const Network = (() => {
    let nodes = {};
    let connections = [];
    let selectedNode = null;
    let mapBounds = { x: 0, y: 0, w: 0, h: 0 };

    function init(bounds) {
        mapBounds = bounds;
        nodes = {};
        connections = [];
        selectedNode = null;

        // Calculate node positions in a tree layout
        const cx = bounds.x + bounds.w / 2;
        const tierH = bounds.h / 5;
        const startY = bounds.y + 45;

        // Tier 0: Cloud
        addNode('CLOUD', cx, startY + tierH * 0.3);
        // Tier 1: Firewall
        addNode('FIREWALL', cx, startY + tierH * 1.1);
        // Tier 2: Router & Switch
        addNode('ROUTER', cx - bounds.w * 0.15, startY + tierH * 2.0);
        addNode('SWITCH', cx + bounds.w * 0.15, startY + tierH * 2.0);
        // Tier 3: Servers
        addNode('WEB', cx - bounds.w * 0.25, startY + tierH * 2.9);
        addNode('DB', cx, startY + tierH * 2.9);
        addNode('MAIL', cx + bounds.w * 0.25, startY + tierH * 2.9);
        // Tier 4: PCs
        addNode('PC1', cx - bounds.w * 0.25, startY + tierH * 3.8);
        addNode('PC2', cx, startY + tierH * 3.8);
        addNode('PC3', cx + bounds.w * 0.25, startY + tierH * 3.8);

        // Build connections from topology
        CONFIG.TOPOLOGY.forEach(([a, b]) => {
            connections.push({ from: a, to: b });
        });
    }

    function addNode(type, x, y) {
        nodes[type] = {
            type,
            x, y,
            health: 100,
            status: 'healthy', // healthy, at-risk, attacked, compromised
            size: 50,
            label: CONFIG.NODE_TYPES[type].label,
            pulseTime: Math.random() * Math.PI * 2,
        };
    }

    function update(dt) {
        Object.values(nodes).forEach(n => {
            n.pulseTime += dt * 2;
            if (n.health <= 0) n.status = 'compromised';
            else if (n.health < 30) n.status = 'attacked';
            else if (n.health < 70) n.status = 'at-risk';
            else n.status = 'healthy';
        });
    }

    function draw(ctx, time) {
        // Draw panel
        Renderer.drawPanel(ctx, mapBounds.x, mapBounds.y, mapBounds.w, mapBounds.h, 'NETWORK MAP');

        // Draw connections
        connections.forEach(c => {
            const a = nodes[c.from];
            const b = nodes[c.to];
            if (a && b) {
                const worst = a.status === 'attacked' || b.status === 'attacked' ? 'attacked' :
                    a.status === 'at-risk' || b.status === 'at-risk' ? 'at-risk' : 'healthy';
                Renderer.drawConnection(ctx, a.x, a.y, b.x, b.y, worst, time);
                // Data flow particles (sparse)
                if (Math.random() < 0.06) {
                    Particles.dataFlow(a.x, a.y, b.x, b.y, Renderer.getNodeColor(worst));
                }
            }
        });

        // Draw nodes
        Object.values(nodes).forEach(n => {
            // Glow pulse for attacked/at-risk
            if (n.status === 'attacked') {
                Renderer.drawDangerRing(ctx, n.x, n.y, n.size * 0.55, time);
            }
            if (n.status === 'compromised') {
                Renderer.drawCompromisedEffect(ctx, n.x, n.y, n.size, time);
            }

            // Draw icon
            Renderer.drawNodeIcon(ctx, n.x, n.y, n.size, n.type, n.status);

            // Label
            ctx.save();
            ctx.fillStyle = CONFIG.COLORS.TEXT_SECONDARY;
            ctx.font = '9px "Share Tech Mono", monospace';
            ctx.textAlign = 'center';
            ctx.shadowColor = CONFIG.COLORS.TEXT_SECONDARY;
            ctx.shadowBlur = 3;
            ctx.fillText(n.label, n.x, n.y + n.size * 0.55);
            ctx.restore();

            // Selected highlight
            if (selectedNode === n.type) {
                ctx.save();
                ctx.strokeStyle = CONFIG.COLORS.ACCENT;
                ctx.shadowColor = CONFIG.COLORS.ACCENT;
                ctx.shadowBlur = 15;
                ctx.lineWidth = 2;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.size * 0.55, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }
        });
    }

    function getNodeAt(x, y) {
        for (const n of Object.values(nodes)) {
            const dx = x - n.x, dy = y - n.y;
            if (Math.sqrt(dx * dx + dy * dy) < n.size * 0.5) return n.type;
        }
        return null;
    }

    function damageNode(type, amount) {
        if (nodes[type]) {
            nodes[type].health = Math.max(0, nodes[type].health - amount);
            return nodes[type].health;
        }
        return 100;
    }

    function healNode(type, amount) {
        if (nodes[type]) {
            nodes[type].health = Math.min(100, nodes[type].health + amount);
        }
    }

    function setStatus(type, status) {
        if (nodes[type]) nodes[type].status = status;
    }

    function getNode(type) {
        return nodes[type];
    }

    function getRandomTarget(minTier = 2) {
        const targets = Object.values(nodes).filter(n =>
            CONFIG.NODE_TYPES[n.type].tier >= minTier && n.status !== 'compromised'
        );
        return targets.length > 0 ? targets[Math.floor(Math.random() * targets.length)].type : 'DB';
    }

    function getEntryPoint() {
        return 'CLOUD';
    }

    function getPath(from, to) {
        // BFS to find path
        const adj = {};
        CONFIG.TOPOLOGY.forEach(([a, b]) => {
            if (!adj[a]) adj[a] = [];
            if (!adj[b]) adj[b] = [];
            adj[a].push(b);
            adj[b].push(a);
        });
        const visited = new Set();
        const queue = [[from]];
        visited.add(from);
        while (queue.length > 0) {
            const path = queue.shift();
            const last = path[path.length - 1];
            if (last === to) return path;
            for (const neighbor of (adj[last] || [])) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]);
                }
            }
        }
        return [from, to]; // fallback
    }

    return {
        init, update, draw, getNodeAt,
        damageNode, healNode, setStatus, getNode,
        getRandomTarget, getEntryPoint, getPath,
        get selectedNode() { return selectedNode; },
        set selectedNode(v) { selectedNode = v; },
        get nodes() { return nodes; },
    };
})();
