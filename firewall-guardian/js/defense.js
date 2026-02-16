// ============================================================
// FIREWALL GUARDIAN — Defense System
// ============================================================

const Defense = (() => {
    let activeTool = null;
    let correctBlocks = 0;
    let wrongBlocks = 0;
    let falsePositives = 0;

    return {
        init() {
            activeTool = null;
            correctBlocks = 0;
            wrongBlocks = 0;
            falsePositives = 0;
        },

        selectTool(toolKey) {
            if (activeTool === toolKey) {
                activeTool = null; // toggle off
            } else {
                activeTool = toolKey;
                Audio.click();
            }
        },

        applyToThreat(threat) {
            if (!activeTool) return false;
            if (!threat || !threat.alive) return false;

            // Check if tool matches threat
            if (threat.cfg.defense === activeTool) {
                // Correct!
                correctBlocks++;
                threat.block();

                // Visual based on tool type
                switch (activeTool) {
                    case 'BLOCK_IP': Particles.shieldFlash(threat.x, threat.y); break;
                    case 'QUARANTINE': Particles.cageEffect(threat.x, threat.y); break;
                    case 'PATCH': Particles.patchSparks(threat.x, threat.y); break;
                    case 'INSPECT': Particles.burst(threat.x, threat.y, CONFIG.COLORS.ACCENT, 12); break;
                    case 'REVOKE_ACCESS': Particles.burst(threat.x, threat.y, CONFIG.COLORS.WARNING, 15); break;
                    case 'BACKUP_RESTORE': Particles.burst(threat.x, threat.y, CONFIG.COLORS.SAFE, 20); break;
                }

                // Heal node on backup restore
                if (activeTool === 'BACKUP_RESTORE') {
                    HUD.healHealth(10);
                    Network.healNode(threat.target, 30);
                    Alerts.add('Backup restored! Health +10%', 'INFO');
                }

                return true;
            } else {
                // Wrong tool
                wrongBlocks++;
                Audio.wrongTool();
                Alerts.add(`Wrong tool! ${CONFIG.TOOLS[activeTool].name} doesn't work against ${threat.cfg.name}`, 'WARNING');
                HUD.showFloatingText(threat.x, threat.y - 20, 'WRONG TOOL!', CONFIG.COLORS.WARNING);
                return false;
            }
        },

        applyToNode(nodeType) {
            if (!activeTool) return;
            // Check if any threat is targeting this node — if none, false positive
            const activeThreats = Threats.active;
            const threatOnNode = activeThreats.find(t => t.target === nodeType);
            if (!threatOnNode) {
                falsePositives++;
                HUD.addScore(CONFIG.SCORE.FALSE_POSITIVE);
                Audio.wrongTool();
                Alerts.add('False positive! No threat on that node. Service disrupted.', 'WARNING');
                HUD.showFloatingText(
                    Network.getNode(nodeType)?.x || 0,
                    (Network.getNode(nodeType)?.y || 0) - 20,
                    'FALSE POSITIVE! -150',
                    CONFIG.COLORS.WARNING
                );
            }
        },

        get activeTool() { return activeTool; },
        set activeTool(v) { activeTool = v; },

        get stats() {
            return { correct: correctBlocks, wrong: wrongBlocks, falsePositives };
        },
    };
})();
