/* ============================================
   ambient-sounds.js v1.0 — Web Audio API 环境音生成器
   零文件依赖，纯代码合成，离线可用
   用于紧急躯体化时快速播放舒缓声音
   ============================================ */

let audioContext = null;
let currentSound = null;
let currentGain = null;

const SOUND_PRESETS = [
    {
        id: "brown_noise", name: "布朗噪音", emoji: "🌊",
        desc: "低沉连续的轰鸣声，类似瀑布，对焦虑和失眠特别有效",
        create: createBrownNoise
    },
    {
        id: "rain", name: "雨声", emoji: "🌧️",
        desc: "模拟雨滴落下的声音，经典的放松环境音",
        create: createRain
    },
    {
        id: "white_noise", name: "白噪音", emoji: "💨",
        desc: "均匀的全频段噪音，帮助集中注意力或屏蔽环境噪音",
        create: createWhiteNoise
    },
    {
        id: "pink_noise", name: "粉红噪音", emoji: "🍃",
        desc: "比白噪音更柔和，类似风吹树叶的自然声音",
        create: createPinkNoise
    },
    {
        id: "ocean", name: "海浪", emoji: "🌊",
        desc: "模拟海浪拍打和退去的声音",
        create: createOcean
    },
    {
        id: "chime", name: "风铃", emoji: "🎐",
        desc: "轻柔的风铃声，随机音高产生冥想般的氛围",
        create: createChime
    }
];

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
    return audioContext;
}

// ==================== 播放控制 ====================

function playAmbientSound(presetId) {
    stopAmbientSound();  // 停止当前声音

    const preset = SOUND_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const ctx = getAudioContext();
    currentGain = ctx.createGain();
    currentGain.gain.value = 0.3;  // 默认30%音量
    currentGain.connect(ctx.destination);

    currentSound = preset.create(ctx, currentGain);

    // 淡入
    currentGain.gain.setValueAtTime(0, ctx.currentTime);
    currentGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1.5);

    return preset;
}

function stopAmbientSound(fadeOut = true) {
    if (!currentSound || !currentGain) return;

    if (fadeOut && audioContext) {
        currentGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
        setTimeout(() => {
            if (currentSound && typeof currentSound.stop === "function") {
                try { currentSound.stop(); } catch (e) { /* already stopped */ }
            }
            if (currentSound) {
                currentSound = null;
                currentGain = null;
            }
        }, 1100);
    } else {
        try {
            if (typeof currentSound.stop === "function") currentSound.stop();
        } catch (e) { /* already stopped */ }
        if (currentSound) {
            currentSound.disconnect?.();
        }
        currentSound = null;
        currentGain = null;
    }
}

function setAmbientVolume(value) {
    if (currentGain && audioContext) {
        currentGain.gain.linearRampToValueAtTime(value, audioContext.currentTime + 0.1);
    }
}

// ==================== 声音生成器 ====================

// 布朗噪音 — 低频为主，最舒缓
function createBrownNoise(ctx, gainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNode);
    source.start();
    return source;
}

// 白噪音
function createWhiteNoise(ctx, gainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNode);
    source.start();
    return source;
}

// 粉红噪音 — 白噪音经过低频滤波
function createPinkNoise(ctx, gainNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNode);
    source.start();
    return source;
}

// 雨声 — 用噪声+滤波模拟
function createRain(ctx, gainNode) {
    // 使用粉红噪音作为基础 + 高频强调
    const source = createPinkNoise(ctx, gainNode);
    // 额外添加随机滴答声
    const tickGain = ctx.createGain();
    tickGain.gain.value = 0.15;
    tickGain.connect(gainNode);

    // 用低频振荡器模拟随机雨滴
    const lfo = ctx.createOscillator();
    lfo.type = "sawtooth";
    lfo.frequency.value = 0.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.1;
    lfo.connect(lfoGain);
    lfoGain.connect(tickGain);
    lfo.start();

    return {
        stop: () => { source.stop(); lfo.stop(); },
        disconnect: () => { source.disconnect(); lfo.disconnect(); }
    };
}

// 海浪 — 低频振荡+白噪音
function createOcean(ctx, gainNode) {
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;  // 很慢的周期

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.5;

    const noiseSource = createWhiteNoise(ctx, lfoGain);
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode);

    lfo.start();
    return {
        stop: () => { noiseSource.stop(); lfo.stop(); },
        disconnect: () => { noiseSource.disconnect(); lfo.disconnect(); }
    };
}

// 风铃 — 随机音高的正弦波
function createChime(ctx, gainNode) {
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047]; // C5-C6 pentatonic
    const oscillators = [];

    function playRandomChime() {
        const freq = notes[Math.floor(Math.random() * notes.length)];
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;

        const envGain = ctx.createGain();
        envGain.gain.setValueAtTime(0.03, ctx.currentTime);
        envGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3 + Math.random() * 2);

        osc.connect(envGain);
        envGain.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 4);

        oscillators.push(osc);
        // 清理
        setTimeout(() => {
            const idx = oscillators.indexOf(osc);
            if (idx > -1) oscillators.splice(idx, 1);
        }, 5000);
    }

    // 随机间隔播放
    const interval = setInterval(playRandomChime, 2000 + Math.random() * 3000);
    playRandomChime();

    return {
        stop: () => { clearInterval(interval); oscillators.forEach(o => { try { o.stop(); } catch (e) {} }); },
        disconnect: () => {}
    };
}
