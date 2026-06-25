# Roomify

Roomify is an AI-powered architectural visualization application that turns 2D floor plans into polished, top-down 3D renders. It combines a React interface with Puter authentication, storage, hosting, workers, and image generation.

Built and maintained by [rare1yhuman](https://github.com/rare1yhuman).

## Features

- Puter authentication for user-scoped projects
- Drag-and-drop uploads for JPEG, PNG, and WebP floor plans up to 10 MB
- AI-generated top-down architectural renders
- Hosted source and rendered images
- Persistent project history backed by a Puter Worker and KV storage
- Before-and-after image comparison
- PNG export for completed renders
- Responsive dashboard and visualization workspace

## Tech stack

- [React 19](https://react.dev/)
- [React Router 7](https://reactrouter.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Puter.js](https://docs.puter.com/)

## How it works

1. A user signs in with Puter and uploads a floor-plan image.
2. Roomify hosts the source image and saves the project through a Puter Worker.
3. The visualization route sends the floor plan to Puter's image-generation API.
4. The generated render is hosted, attached to the project, and shown beside the source image.
5. The user can compare both versions and export the final render as a PNG.

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- A [Puter](https://puter.com/) account
- A deployed Puter Worker based on `lib/puter.worker.js`

### Installation

```bash
git clone https://github.com/rare1yhuman/roomify.git
cd roomify
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set the URL of your deployed Puter Worker:

```env
VITE_PUTER_WORKER_URL="https://your-worker.example"
```

Start the development server:

```bash
npm run dev
```

The application is available at `http://localhost:5173` by default.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the React Router development server |
| `npm run typecheck` | Generate route types and run TypeScript checks |
| `npm run build` | Create the production client and server bundles |
| `npm run start` | Serve the production build |

## Project structure

```text
app/          Routes, application shell, and styles
components/   Shared interface components
lib/          AI, Puter, hosting, worker, and utility logic
public/       Static browser assets
type.d.ts     Shared application types
```

## Docker

Build and run the production container:

```bash
docker build \
  --build-arg VITE_PUTER_WORKER_URL="https://your-worker.example" \
  -t roomify .
docker run -p 3000:3000 roomify
```

Puter-backed functionality requires a valid worker URL and an authenticated Puter session in the browser.
