// ============================================================
// FIREWALL GUARDIAN — Particle System
// ============================================================

const Particles = (() => {
    let particles = [];

    class Particle {
        constructor(x, y, opts = {}) {
            this.x = x;
            this.y = y;
            this.vx = opts.vx || (Math.random() - 0.5) * 4;
            this.vy = opts.vy || (Math.random() - 0.5) * 4;
            this.life = opts.life || 1;
            this.maxLife = this.life;
            this.size = opts.size || 3;
            this.color = opts.color || CONFIG.COLORS.ACCENT;
            this.decay = opts.decay || 0.02;
            this.gravity = opts.gravity || 0;
            this.type = opts.type || 'circle'; // circle, spark, ring
        }

        update(dt) {
            this.x += this.vx * dt * 60;
            this.y += this.vy * dt * 60;
            this.vy += this.gravity * dt * 60;
            this.life -= this.decay * dt * 60;
            return this.life > 0;
        }

        draw(ctx) {
            const alpha = Math.max(0, this.life / this.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha;

            if (this.type === 'circle') {
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * (this.life / this.maxLife), 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'spark') {
                ctx.strokeStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 6;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
                ctx.stroke();
            } else if (this.type === 'ring') {
                ctx.strokeStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 10;
                ctx.lineWidth = 2;
                const radius = this.size * (1 - this.life / this.maxLife) * 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    return {
        update(dt) {
            particles = particles.filter(p => p.update(dt));
        },

        draw(ctx) {
            particles.forEach(p => p.draw(ctx));
        },

        // Burst effect for successful blocks
        burst(x, y, color = CONFIG.COLORS.SAFE, count = 15) {
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i;
                const speed = 1.5 + Math.random() * 2.5;
                particles.push(new Particle(x, y, {
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color,
                    size: 2 + Math.random() * 3,
                    life: 0.6 + Math.random() * 0.4,
                    decay: 0.015,
                    type: 'spark',
                }));
            }
        },

        // Shield flash effect
        shieldFlash(x, y) {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    particles.push(new Particle(x, y, {
                        vx: 0, vy: 0,
                        color: CONFIG.COLORS.ACCENT,
                        size: 15 + i * 8,
                        life: 0.5,
                        decay: 0.025,
                        type: 'ring',
                    }));
                }, i * 100);
            }
        },

        // Quarantine cage effect
        cageEffect(x, y) {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                particles.push(new Particle(x, y, {
                    vx: Math.cos(angle) * 0.3,
                    vy: Math.sin(angle) * 0.3,
                    color: CONFIG.COLORS.WARNING,
                    size: 4,
                    life: 1.2,
                    decay: 0.012,
                    type: 'circle',
                }));
            }
            particles.push(new Particle(x, y, {
                vx: 0, vy: 0,
                color: CONFIG.COLORS.WARNING,
                size: 20,
                life: 0.8,
                decay: 0.02,
                type: 'ring',
            }));
        },

        // Damage hit effect
        damageHit(x, y) {
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(x, y, {
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    color: CONFIG.COLORS.DANGER,
                    size: 2 + Math.random() * 2,
                    life: 0.4 + Math.random() * 0.3,
                    decay: 0.02,
                    type: 'spark',
                }));
            }
        },

        // Continuous data flow particles along a line
        dataFlow(x1, y1, x2, y2, color = CONFIG.COLORS.SAFE) {
            const t = Math.random();
            particles.push(new Particle(
                x1 + (x2 - x1) * t,
                y1 + (y2 - y1) * t,
                {
                    vx: (x2 - x1) * 0.005,
                    vy: (y2 - y1) * 0.005,
                    color,
                    size: 1.5,
                    life: 0.5,
                    decay: 0.02,
                    type: 'circle',
                }
            ));
        },

        // Ransomware dark wave
        darkWave(x, y) {
            for (let i = 0; i < 20; i++) {
                const angle = (Math.PI * 2 / 20) * i;
                const speed = 0.5 + Math.random() * 1;
                particles.push(new Particle(x, y, {
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: '#ff003366',
                    size: 5 + Math.random() * 5,
                    life: 1.5,
                    decay: 0.01,
                    type: 'circle',
                }));
            }
        },

        // Patch / wrench spinning sparks
        patchSparks(x, y) {
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.3;
                particles.push(new Particle(x, y, {
                    vx: Math.cos(angle) * 2,
                    vy: Math.sin(angle) * 2,
                    color: CONFIG.COLORS.SAFE,
                    size: 2,
                    life: 0.6,
                    decay: 0.02,
                    type: 'spark',
                }));
            }
        },

        clear() {
            particles = [];
        },

        get count() { return particles.length; },
    };
})();
