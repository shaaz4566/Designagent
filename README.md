# SZC AI v0.1 — Single-folder PWA

A first implementation scaffold for a local-first iPad creative and development workspace.

## Files

Everything is intentionally kept in one directory:
- `index.html` — application shell and views
- `styles.css` — responsive dark interface
- `app.js` — navigation, local database, editor, preview, model loading and exports
- `sw.js` — offline application-shell cache
- `manifest.webmanifest` — PWA installation metadata

## Run it

A PWA service worker requires a secure context (`https://`) or localhost. Since this project is a single-folder static site, deploy the folder to a free static host such as GitHub Pages or Cloudflare Pages, or serve it from a local development server during testing. No application backend is required.

On iPad:
1. Open the HTTPS site in Safari.
2. Use Share → Add to Home Screen.
3. Open SZC AI from the Home Screen.
4. Open Model & settings and check WebGPU support.
5. Download a compatible model while online. Subsequent inference may work offline if the browser retains the model cache.

## Current features

- Responsive PWA shell and navigation
- IndexedDB project persistence
- HTML/CSS/JS editor
- Sandboxed iframe preview
- ZIP export (JSZip is loaded on first export)
- WebLLM model loading experiment
- Local model chat after successful model initialization
- Offline app-shell cache

## Important limitations

This is an MVP foundation, not the complete autonomous agent described in the architecture plan.

- WebLLM model IDs and browser support can change. The selected model must be verified against the current WebLLM model registry.
- WebGPU support does not guarantee that a particular model fits the iPad's available memory.
- First-time runtime, ZIP library and model downloads need internet.
- Browser storage may be evicted by iPadOS. Export important projects.
- A PWA cannot run unrestricted terminal commands, install desktop applications, or continue executing after iPadOS suspends it.
- The chat model currently has no autonomous file-editing tool loop. The editor is functional independently.
- Remote fonts and dynamic libraries are optional network dependencies; for a stricter offline build, vendor them locally and remove the Google Fonts import.

## Safety

Code preview runs in a sandboxed iframe. Do not paste untrusted code into the editor and grant it access to sensitive information. The app does not currently provide a full operating-system shell.

## Next milestones

1. Verify WebLLM on the actual iPad and select a model that fits.
2. Add a structured tool-call protocol and task planner.
3. Add safe project file read/write tools.
4. Add test/repair loops for generated projects.
5. Add SVG design tools and Three.js 3D workspace.
6. Add audio and animation tools.
