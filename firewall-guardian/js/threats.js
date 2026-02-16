// ============================================================
// FIREWALL GUARDIAN — Threat System
// ============================================================

const Threats = (() => {
    let threats = [];
    let nextId = 0;
    let totalSpawned = 0;
    let totalMissed = 0;

    class Threat {
        constructor(type, target) {
            this.id = nextId++;
            this.type = type;
            this.cfg = CONFIG.THREATS[type];
            this.target = target;
            this.source = Network.getEntryPoint();
            this.path = Network.getPath(this.source, this.target);
            this.pathIndex = 0;
            this.progress = 0; // 0-1 between current path nodes
            this.x = 0;
            this.y = 0;
            this.alive = true;
            this.blocked = false;
            this.spawnTime = Date.now();
            this.size = 28;
            this.updatePosition();
        }

        updatePosition() {
            if (this.pathIndex >= this.path.length - 1) return;
            const fromNode = Network.getNode(this.path[this.pathIndex]);
            const toNode = Network.getNode(this.path[this.pathIndex + 1]);
            if (fromNode && toNode) {
                this.x = fromNode.x + (toNode.x - fromNode.x) * this.progress;
                this.y = fromNode.y + (toNode.y - fromNode.y) * this.progress;
            }
        }

        update(dt) {
            if (!this.alive) return;
            this.progress += this.cfg.speed * dt;
            if (this.progress >= 1) {
                this.progress = 0;
                this.pathIndex++;
                if (this.pathIndex >= this.path.length - 1) {
                    // Reached target — deal damage
                    this.reachTarget();
                    return;
                }
            }
            this.updatePosition();
        }

        reachTarget() {
            this.alive = false;
            totalMissed++;
            const node = Network.getNode(this.target);
            Network.damageNode(this.target, this.cfg.damage);
            if (node) {
                Particles.damageHit(node.x, node.y);
                Audio.damage();
            }
            Alerts.add(`${this.cfg.name} hit ${CONFIG.NODE_TYPES[this.target]?.label || this.target}!`, 'CRITICAL');
            HUD.addScore(CONFIG.SCORE.MISSED);
            HUD.damageHealth(this.cfg.damage);
        }

        draw(ctx, time) {
            if (!this.alive) return;
            Renderer.drawThreat(ctx, this.x, this.y, this.size, this.type, time);
        }

        block() {
            this.alive = false;
            this.blocked = true;
            Particles.burst(this.x, this.y, this.cfg.color, 20);
            Audio.blockSuccess();
            const responseTime = Date.now() - this.spawnTime;
            let score = CONFIG.SCORE.CORRECT;
            if (responseTime < CONFIG.SCORE.SPEED_BONUS_THRESHOLD) {
                score += CONFIG.SCORE.SPEED_BONUS;
            }
            HUD.addScore(score);
            HUD.showIntel(this.cfg.intel, this.cfg.name);
            Alerts.add(`${this.cfg.name} neutralized!`, 'INFO');
        }
    }

    return {
        init() {
            threats = [];
            nextId = 0;
            totalSpawned = 0;
            totalMissed = 0;
        },

        spawn(type) {
            const target = Network.getRandomTarget(type === 'PORT_SCAN' ? 1 : 2);
            const t = new Threat(type, target);
            threats.push(t);
            totalSpawned++;
            Audio.threatSpawn();
            Alerts.add(`${t.cfg.name} detected targeting ${CONFIG.NODE_TYPES[target]?.label || target}`, 'WARNING');
            return t;
        },

        update(dt) {
            threats.forEach(t => t.update(dt));
            threats = threats.filter(t => t.alive);
        },

        draw(ctx, time) {
            threats.forEach(t => t.draw(ctx, time));
        },

        getThreatAt(x, y) {
            for (let i = threats.length - 1; i >= 0; i--) {
                const t = threats[i];
                if (!t.alive) continue;
                const dx = x - t.x, dy = y - t.y;
                if (Math.sqrt(dx * dx + dy * dy) < t.size) return t;
            }
            return null;
        },

        get active() { return threats.filter(t => t.alive); },
        get stats() {
            return {
                total: totalSpawned,
                missed: totalMissed,
                blocked: totalSpawned - totalMissed - threats.filter(t => t.alive).length,
                active: threats.filter(t => t.alive).length,
            };
        },
    };
})();
