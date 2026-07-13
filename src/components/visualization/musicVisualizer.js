import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';

const PRESET_CYCLE_MS = 15000;

let presets = null;
let presetKeys = null;

function getPresets() {
    if (!presets) {
        presets = butterchurnPresets.getPresets();
        presetKeys = Object.keys(presets);
    }
    return { presets, presetKeys };
}

function isWebGL2Supported() {
    try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
    } catch {
        return false;
    }
}

export default class MusicVisualizer {
    constructor() {
        this.visualizer = null;
        this.canvas = null;
        this.rendering = false;
        this._rafId = null;
        this._cycleInterval = null;
        this._currentPresetIndex = -1;
    }

    isSupported() {
        return isWebGL2Supported() && typeof butterchurn !== 'undefined';
    }

    init(canvas, audioCtx, sourceNode) {
        if (!this.isSupported()) {
            console.warn('[MusicVisualizer] WebGL 2 or butterchurn not available');
            return false;
        }

        if (!audioCtx || !sourceNode || !canvas) {
            console.warn('[MusicVisualizer] Missing audioCtx, sourceNode, or canvas');
            return false;
        }

        this.canvas = canvas;

        // Set canvas internal resolution to match display size
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        canvas.height = Math.max(1, Math.floor(rect.height * dpr));

        try {
            this.visualizer = butterchurn.createVisualizer(audioCtx, canvas, {
                width: canvas.width,
                height: canvas.height,
                pixelRatio: dpr,
                textureRatio: 1
            });

            this.visualizer.connectAudio(sourceNode);

            // Load a random initial preset
            this.loadRandomPreset(0);

            return true;
        } catch (e) {
            console.error('[MusicVisualizer] Failed to create visualizer', e);
            return false;
        }
    }

    loadRandomPreset(blendTime = 2.7) {
        if (!this.visualizer) return;
        const { presets: p, presetKeys: keys } = getPresets();
        this._currentPresetIndex = Math.floor(Math.random() * keys.length);
        this.visualizer.loadPreset(p[keys[this._currentPresetIndex]], blendTime);
    }

    startRenderLoop() {
        if (this.rendering) return;
        this.rendering = true;

        const render = () => {
            if (!this.rendering) return;
            try {
                this.visualizer?.render();
            } catch (e) {
                console.warn('[MusicVisualizer] render error', e);
            }
            this._rafId = requestAnimationFrame(render);
        };
        render();
    }

    stopRenderLoop() {
        this.rendering = false;
        if (this._rafId != null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    startPresetCycling(intervalMs = PRESET_CYCLE_MS) {
        this.stopPresetCycling();
        this._cycleInterval = setInterval(() => {
            this.loadRandomPreset(2.7);
        }, intervalMs);
    }

    stopPresetCycling() {
        if (this._cycleInterval != null) {
            clearInterval(this._cycleInterval);
            this._cycleInterval = null;
        }
    }

    resize() {
        if (!this.canvas || !this.visualizer) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width * dpr));
        const h = Math.max(1, Math.floor(rect.height * dpr));
        if (this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
    }

    destroy() {
        this.stopRenderLoop();
        this.stopPresetCycling();

        this.visualizer = null;
        this.canvas = null;
        this._currentPresetIndex = -1;
    }
}
