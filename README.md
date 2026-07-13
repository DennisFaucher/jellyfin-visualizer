# jellyfin-visualizer

A [Butterchurn](https://github.com/jagheterfredrik/butterchurn) (MilkDrop) visualization plugin for [Jellyfin Web](https://github.com/jellyfin/jellyfin-web). Renders WebGL visualizations behind the Now Playing page while music plays.

## What it does

- Adds a full-screen Butterchurn MilkDrop visualizer behind the Now Playing page
- Automatically starts when music playback begins
- Cycles through presets every 15 seconds
- Pauses rendering when audio is paused
- Cleans up when playback stops or you navigate away
- Works alongside audio normalization

## Requirements

- Jellyfin server running
- Node.js >= 24
- npm >= 11

## Docker (recommended)

```bash
docker compose up --build -d
```

Dev server at `http://localhost:8080`. Point it at your Jellyfin server.

## Manual setup

```bash
npm install
npm start
```

## How it works

This is a patched fork of `jellyfin-web`. The changes are:

### New files
- `src/components/visualization/musicVisualizer.js` — Butterchurn wrapper (init, render loop, preset cycling, resize, cleanup)
- `patches/webcomponents.js+0.7.24.patch` — Fixes polyfill crash when TanStack Query DevTools passes an object to `document.createElement`
- `Dockerfile` / `docker-compose.yml` / `.dockerignore` — Docker dev environment

### Modified files
- `src/plugins/htmlAudioPlayer/plugin.js` — Exposes `audioCtx` and `sourceNode` on the player instance so the visualizer can tap the audio graph
- `src/components/remotecontrol/remotecontrol.js` — Lifecycle wiring: starts visualizer on playback, pauses/resumes on play/pause, destroys on stop/navigation
- `src/components/remotecontrol/remotecontrol.scss` — Canvas styles (fixed position, opacity, z-index)
- `package.json` — Added `butterchurn`, `butterchurn-presets`, `patch-package` deps and `postinstall` script

## License

GPL-2.0-or-later (same as Jellyfin Web)
