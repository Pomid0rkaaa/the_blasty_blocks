import { TRACKS } from "./data/tracks";
import { UIElements } from "./ui";
import type { Track } from "./types";

export class SoundManager {
	ctx: AudioContext | null = null;
	initialized: boolean = false;
	muted: boolean = false;

	master: GainNode | null = null;
	sfxGain: GainNode | null = null;
	musicGain: GainNode | null = null;
	musicTimer: any = null;
	musicStep: number = 0;
	musicOn: boolean = true;

	tracks: Record<string, Track> = TRACKS;

	musicVolume: number = 0.25;
	trackId: string = "deep";

	_resumeBound: () => void;

	constructor() {
		const saved = Number(localStorage.getItem("musicVolume"));
		if (!Number.isNaN(saved))
			this.musicVolume = Math.min(1, Math.max(0, saved));

		this.trackId = localStorage.getItem("musicTrack") || "deep";
		this._resumeBound = () => this.resume();
	}

	init() {
		if (this.initialized) return;
		try {
			const AudioContextClass =
				(window as any).AudioContext ||
				(window as any).webkitAudioContext;
			this.ctx = new AudioContextClass();

			if (!this.ctx) return;

			this.master = this.ctx.createGain();
			this.sfxGain = this.ctx.createGain();
			this.musicGain = this.ctx.createGain();

			this.master.gain.value = 0.9;
			this.sfxGain.gain.value = 0.85;
			this.musicGain.gain.value = this.musicVolume;

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

			document.addEventListener("touchstart", this._resumeBound, {
				once: true,
				passive: true,
			});
			document.addEventListener("mousedown", this._resumeBound, {
				once: true,
				passive: true,
			});

			if (!this.muted) this.startMusic();
		} catch (e) {
			console.error("Audio init failed", e);
		}
	}

	resume() {
		if (!this.ctx) return;
		if (this.ctx.state === "suspended") this.ctx.resume();
	}

	setMusicVolume(v01: number) {
		this.musicVolume = Math.min(1, Math.max(0, v01));
		localStorage.setItem("musicVolume", String(this.musicVolume));
		if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
	}

	setTrack(id: string) {
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
		const btn = UIElements.volume.button;
		btn.innerText = this.muted ? "🔇" : "🔊";

		if (!this.initialized && !this.muted) {
			this.init();
		}

		if (this.initialized && this.master) {
			this.master.gain.value = this.muted ? 0.0001 : 0.9;
			if (this.muted) this.stopMusic();
			else this.startMusic();
		}
	}

	playTone(
		freq: number,
		type: OscillatorType,
		duration: number,
		vol = 0.1,
		detune = 0
	) {
		if (this.muted || !this.ctx || !this.sfxGain) return;
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

		gain.gain.setValueAtTime(Math.max(0.0001, vol), this.ctx.currentTime);
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
		if (this.muted || !this.ctx || !this.musicGain) return;
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
		if (this.muted || !this.ctx || !this.musicGain) return;
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

	async play(sound: string) {
		const randomize = (v: number, amt = 0.05) =>
			v * (1 + (Math.random() * amt * 2 - amt));

		switch (sound) {
			case "place":
				this.playTone(420, "square", 0.08, randomize(0.05));
				break;
			case "pickup":
				this.playTone(520, "triangle", 0.06, randomize(0.045));
				break;
			case "invalid":
			case "error":
				this.playTone(150, "sawtooth", 0.18, 0.1);
				break;
			case "clear":
			case "lines":
				this.playTone(660, "sine", 0.1, 0.09);
                await this.audioWait(70);
				() => this.playTone(880, "sine", 0.18, 0.08);
				break;
			case "damage":
				this.playTone(95, "sawtooth", 0.12, 0.18);
				break;
			case "hit":
				this.playTone(220, "triangle", 0.08, 0.1, -8);
				break;
			case "crit":
				this.playTone(800, "square", 0.06, 0.1);
				await this.audioWait(50);
                this.playTone(1200, "square", 0.08, 0.08);
				break;
			case "victory":
			case "win":
				[523, 659, 784, 1046].forEach(async (f, i) => {
					await this.audioWait(i * 90);
                    this.playTone(f, "square", 0.18, 0.09);
				});
				break;
			case "gameover":
			case "lose":
				[392, 330, 262, 196].forEach(async (f, i) => {
					await this.audioWait(i * 140);
                    this.playTone(f, "sawtooth", 0.28, 0.1)
                });
				break;
			case "hover":
				this.playNoise(0.005, 0.005, 3000);
				break;
			case "click":
				this.playNoise(0.012, 0.02, 1800);
				break;
			case "start":
				this.playTone(440, "sine", 0.3, 0.2);
				break;
		}
	}

	startMusic() {
		if (!this.ctx || this.muted || !this.musicOn) return;
		if (this.musicTimer) return;

		const track = this.tracks[this.trackId] || this.tracks.deep;
		const tempo = track.tempo;

		// Original speed: 60000 / tempo / 2 (8th notes)
		// User wants it slowed down to x0.75 or x0.5.
		// Let's go with x0.75 by using a multiplier of 1.33 on the interval.
		const speedMult = 1.33;
		const stepMs = (60_000 / tempo / 2) * speedMult;

		this.musicStep = 0;

		const prog = track.prog;
		const arp = track.arp;

		const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

		const getInst = (type: string) => {
			const types: OscillatorType[] = [
				"sine",
				"square",
				"sawtooth",
				"triangle",
			];
			if (type === "random")
				return types[Math.floor(Math.random() * types.length)];
			return (type || "sine") as OscillatorType;
		};

		const playNote = (
			midi: number,
			dur: number,
			vol: number,
			type: OscillatorType,
			outGain: GainNode,
			lpHz = 1800
		) => {
			if (!this.ctx || !Number.isFinite(midi)) return;
			const freq = midiToFreq(midi);
			if (!Number.isFinite(freq)) return;

			const t = this.ctx.currentTime;
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			const filter = this.ctx.createBiquadFilter();

			osc.type = type;
			osc.frequency.setValueAtTime(freq, t);
			filter.type = "lowpass";
			filter.frequency.setValueAtTime(
				Number.isFinite(lpHz) ? lpHz : 1800,
				t
			);

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
			if (!this.musicGain) return;

			const bar = Math.floor(this.musicStep / 8) % prog.length;
			const chord = prog[bar];

			// Drums handling
			const dPattern = track.drums || "k.s.";
			const dStep = dPattern[this.musicStep % dPattern.length];
			if (dStep === "k") this.playKick(0.04);
			if (dStep === "s") this.playNoise(0.04, 0.015, 3000);
			if (dStep === "h") this.playNoise(0.01, 0.01, 8000);

			// pad layer
			if (this.musicStep % 8 === 0) {
				chord.forEach((m, i) => {
					playNote(
						m,
						(60 / tempo) * 4,
						0.02,
						getInst(track.padType || "sine"),
						this.musicGain!,
						600 + i * 200
					);
				});
			}

			// bass
			if (this.musicStep % 2 === 0) {
				const bassMidi = chord[0] - 12;
				playNote(
					bassMidi,
					0.18,
					0.1,
					getInst(track.bassType),
					this.musicGain,
					1000
				);
			}

			// arp lead
			const idx = arp[this.musicStep % arp.length];
			if (idx !== null && idx >= 0) {
				playNote(
					chord[idx] + 12,
					0.14,
					0.06,
					getInst(track.leadType),
					this.musicGain,
					2200
				);
			}

			// top sparkle
			if (this.musicStep % 16 === 15) {
				const sparkleNote = chord[chord.length - 1];
				if (sparkleNote !== undefined) {
					playNote(
						sparkleNote + 24,
						0.12,
						0.03,
						getInst(track.lead2Type),
						this.musicGain,
						3000
					);
				}
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

	audioWait(ms: number): Promise<void> {
		if (!this.ctx) return Promise.resolve();
		const start = this.ctx.currentTime;
		const waitSec = ms / 1000;
		return new Promise(resolve => {
			const check = () => {
				if (this.ctx!.currentTime - start >= waitSec) resolve();
				else requestAnimationFrame(check);
			};
			check();
		});
	}
}

export const soundManager = new SoundManager();
