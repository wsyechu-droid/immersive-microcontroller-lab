# Immersive Microcontroller Lab — Cloudflare Workers edition

This edition serves the interactive 3D front end as static assets and provides `/api/health` and `/api/generate` through a Cloudflare Worker. Generative practice questions use the Cloudflare Workers AI binding (no OpenAI API key is embedded in the browser or repository).

## GitHub + Cloudflare Workers deployment

1. Upload the contents of this folder to the root of the GitHub repository `immersive-microcontroller-lab` (merge/replace existing files; do not upload `.env` or API keys).
2. In Cloudflare, create a Worker from the connected GitHub repository.
3. The repository contains `wrangler.jsonc`; the deployment command should be `npx wrangler deploy` (Cloudflare Workers Builds default).
4. The Wrangler configuration creates the `AI` binding and serves files from `public/`.
5. After deployment, test `https://YOUR-WORKER.workers.dev/api/health`. Expected JSON includes `status: "ok"` and `genaiConfigured: true`.
6. Open the Worker root URL and test the AI Practice Studio. If Workers AI is not enabled for the account, enable Workers AI in the Cloudflare dashboard and retry.

## Local preview

Requires Node.js 20+:

```bash
npm install
npx wrangler dev
```

## Notes

- The AR/VR buttons depend on WebXR support in the browser/device and secure-context access (HTTPS or localhost). Desktop 3D remains available when WebXR is unsupported.
- Workers AI usage is subject to the account's current free quota and model availability. Exceeding the free quota can cause requests to fail until reset; do not select a paid plan unless you intend to.
- The source includes a Cloudflare Worker backend. The old Express `server.js` is not used by this edition.

## AI model and free quota

This project uses `@cf/google/gemma-4-26b-a4b-it`, which Cloudflare lists among Workers AI models available on Workers Free. Workers AI has a 10,000-Neuron daily free allocation; after the free allocation is exhausted, requests fail until the daily reset unless the account is upgraded. Do not upgrade to a paid plan for this assignment unless you explicitly choose to.
