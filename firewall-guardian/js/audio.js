// ============================================================
// FIREWALL GUARDIAN — Procedural Audio (Web Audio API)
// ============================================================

const Audio = (() => {
    let ctx = null;
    let masterGain = null;
    let muted = false;

    function init() {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.3;
        masterGain.connect(ctx.destination);
    }

    function ensure() {
        if (!ctx) init();
        if (ctx.state === 'suspended') ctx.resume();
    }

    function playTone(freq, duration, type = 'sine', vol = 0.3) {
        ensure();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }

    function playNoise(duration, vol = 0.1) {
        ensure();
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        source.connect(gain);
        gain.connect(masterGain);
        source.start();
    }

    return {
        init,
        toggleMute() { muted = !muted; if (masterGain) masterGain.gain.value = muted ? 0 : 0.3; return muted; },

        alertPing() {
            playTone(880, 0.15, 'sine', 0.25);
            setTimeout(() => playTone(1100, 0.1, 'sine', 0.2), 100);
        },

        blockSuccess() {
            playTone(523, 0.1, 'square', 0.15);
            setTimeout(() => playTone(659, 0.1, 'square', 0.15), 80);
            setTimeout(() => playTone(784, 0.15, 'square', 0.15), 160);
        },

        damage() {
            playNoise(0.2, 0.15);
            playTone(120, 0.3, 'sawtooth', 0.1);
        },

        phaseClear() {
            [523, 659, 784, 1047].forEach((f, i) => {
                setTimeout(() => playTone(f, 0.2, 'sine', 0.2), i * 120);
            });
        },

        victory() {
            [523, 659, 784, 1047, 1318].forEach((f, i) => {
                setTimeout(() => playTone(f, 0.3, 'triangle', 0.25), i * 150);
            });
        },

        gameOver() {
            [440, 370, 311, 261].forEach((f, i) => {
                setTimeout(() => playTone(f, 0.4, 'sawtooth', 0.15), i * 200);
            });
        },

        click() {
            playTone(600, 0.05, 'square', 0.1);
        },

        threatSpawn() {
            playTone(200, 0.15, 'sawtooth', 0.08);
            setTimeout(() => playTone(150, 0.1, 'sawtooth', 0.06), 80);
        },

        wrongTool() {
            playTone(200, 0.15, 'square', 0.15);
            setTimeout(() => playTone(150, 0.15, 'square', 0.15), 120);
        },

        typewriter() {
            playTone(800 + Math.random() * 400, 0.03, 'square', 0.05);
        },
    };
})();
