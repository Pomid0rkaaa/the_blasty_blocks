import { TRACKS } from "./data/tracks.js";

export class SoundManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.muted = false;

        this.master = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.musicTimer = null;
        this.musicStep = 0;
        this.musicOn = true;

        this.tracks = TRACKS;

        this.musicVolume = 0.25;
        const saved = Number(localStorage.getItem("musicVolume"));
        if (!Number.isNaN(saved))
            this.musicVolume = Math.min(1, Math.max(0, saved));

        this.trackId = localStorage.getItem("musicTrack") || "deep";

        this._resumeBound = () => this.resume();
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext =
                window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.master = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();
            this.musicGain = this.ctx.createGain();

            this.master.gain.value = 0.9;
            this.sfxGain.gain.value = 0.85;
            this.musicGain.gain.value = this.musicVolume;

            // Small ambience chain for music
            const delay = this.ctx.createDelay(0.6);
            delay.delayTime.value = 0.22;
            const fb = this.ctx.createGain();
            fb.gain.value = 0.22;
            const lp = this.ctx.createBiquadFilter();
            lp.type = "lowpass";
            lp.frequency.value = 1400;

            this.musicGain.connect(lp);
            lp.connect(this.master);
            lp.connect(delay);
            delay.connect(fb);
            fb.connect(delay);
            delay.connect(this.master);

            this.sfxGain.connect(this.master);
            this.master.connect(this.ctx.destination);

            this.initialized = true;

            document.addEventListener(
                "touchstart",
                this._resumeBound,
                { once: true, passive: true }
            );
            document.addEventListener(
                "mousedown",
                this._resumeBound,
                { once: true, passive: true }
            );

            if (!this.muted) this.startMusic();
        } catch (e) {
            console.error("Audio init failed", e);
        }
    }

    resume() {
        if (!this.ctx) return;
        if (this.ctx.state === "suspended") this.ctx.resume();
    }

    setMusicVolume(v01) {
        this.musicVolume = Math.min(1, Math.max(0, v01));
        localStorage.setItem(
            "musicVolume",
            String(this.musicVolume)
        );
        if (this.musicGain)
            this.musicGain.gain.value = this.musicVolume;
    }

    setTrack(id) {
        if (!id) return;
        if (!(id in this.tracks)) id = "deep";
        this.trackId = id;
        localStorage.setItem("musicTrack", String(id));

        if (this.initialized && !this.muted) {
            this.stopMusic();
            this.startMusic();
        }
    }

    toggle() {
        this.muted = !this.muted;
        const btn = document.getElementById("volume-btn");
        btn.innerText = this.muted ? "🔇" : "🔊";

        if (!this.initialized && !this.muted) {
            this.init();
        }

        if (this.initialized) {
            this.master.gain.value = this.muted ? 0.0001 : 0.9;
            if (this.muted) this.stopMusic();
            else this.startMusic();
        }
    }

    playTone(freq, type, duration, vol = 0.1, detune = 0) {
        if (this.muted || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.detune.setValueAtTime(detune, this.ctx.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(
            Math.min(7000, Math.max(500, freq * 10)),
            this.ctx.currentTime
        );

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            this.ctx.currentTime + duration
        );

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playNoise(duration = 0.05, vol = 0.03, hp = 4200) {
        if (this.muted || !this.ctx) return;
        const sr = this.ctx.sampleRate;
        const len = Math.max(1, Math.floor(sr * duration));
        const buf = this.ctx.createBuffer(1, len, sr);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++)
            data[i] = (Math.random() * 2 - 1) * (1 - i / len);

        const src = this.ctx.createBufferSource();
        src.buffer = buf;

        const hpF = this.ctx.createBiquadFilter();
        hpF.type = "highpass";
        hpF.frequency.value = hp;

        const gain = this.ctx.createGain();
        gain.gain.value = vol;
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            this.ctx.currentTime + duration
        );

        src.connect(hpF);
        hpF.connect(gain);
        gain.connect(this.musicGain);
        src.start();
    }

    playKick(vol = 0.06) {
        if (this.muted || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(48, t + 0.09);
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    play(sound) {
        switch (sound) {
            case "place":
                this.playTone(420, "square", 0.08, 0.05);
                break;
            case "pickup":
                this.playTone(520, "triangle", 0.06, 0.045);
                break;
            case "invalid":
                this.playTone(150, "sawtooth", 0.18, 0.1);
                break;
            case "clear":
                this.playTone(660, "sine", 0.1, 0.09);
                setTimeout(() => this.playTone(880, "sine", 0.18, 0.08), 70);
                break;
            case "damage":
                this.playTone(95, "sawtooth", 0.12, 0.18);
                break;
            case "hit":
                this.playTone(220, "triangle", 0.08, 0.1, -8);
                break;
            case "crit":
                this.playTone(800, "square", 0.06, 0.1);
                setTimeout(
                    () => this.playTone(1200, "square", 0.08, 0.08),
                    50
                );
                break;
            case "win":
                [523, 659, 784, 1046].forEach((f, i) =>
                    setTimeout(
                        () => this.playTone(f, "square", 0.18, 0.09),
                        i * 90
                    )
                );
                break;
            case "lose":
                [392, 330, 262, 196].forEach((f, i) =>
                    setTimeout(
                        () => this.playTone(f, "sawtooth", 0.28, 0.1),
                        i * 140
                    )
                );
                break;
            default:
                break;
        }
    }

    startMusic() {
        if (!this.ctx || this.muted || !this.musicOn) return;
        if (this.musicTimer) return;

        const track = this.tracks[this.trackId] || this.tracks.deep;
        const tempo = track.tempo;
        const stepMs = 60_000 / tempo / 2; // 8th notes
        this.musicStep = 0;

        const prog = track.prog;
        const arp = track.arp;

        const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

        const playNote = (
            midi,
            dur,
            vol,
            type,
            outGain,
            lpHz = 1800
        ) => {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = type;
            osc.frequency.setValueAtTime(midiToFreq(midi), t);
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(lpHz, t);

            gain.gain.setValueAtTime(Math.max(0.0001, vol), t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(outGain);
            osc.start(t);
            osc.stop(t + dur);
        };

        this.musicTimer = setInterval(() => {
            if (!this.ctx || this.muted) return;
            if (this.ctx.state === "suspended") return;

            const bar =
                Math.floor(this.musicStep / 8) % prog.length;
            const chord = prog[bar];

            // drums (very subtle)
            if (this.musicStep % 4 === 0) this.playKick(0.035);
            if (this.musicStep % 2 === 1)
                this.playNoise(0.035, 0.012, 5200);

            // bass
            if (this.musicStep % 2 === 0) {
                const bassMidi = chord[0] - 12;
                playNote(
                    bassMidi,
                    0.18,
                    0.1,
                    track.bassType,
                    this.musicGain,
                    1200
                );
            }

            // arp lead
            const idx = arp[this.musicStep % arp.length];
            playNote(
                chord[idx] + 12,
                0.14,
                0.06,
                track.leadType,
                this.musicGain,
                2200
            );

            // top sparkle
            if (this.musicStep % 8 === 7) {
                playNote(
                    chord[2] + 24,
                    0.1,
                    0.04,
                    track.lead2Type,
                    this.musicGain,
                    2500
                );
            }

            this.musicStep++;
        }, stepMs);
    }

    stopMusic() {
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
    }
}

export const soundManager = new SoundManager();