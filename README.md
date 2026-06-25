# Roomify

Roomify is a learning project that turns a 2D floor plan into a top-down 3D architectural render using AI.

I built this project while following a [JavaScript Mastery](https://www.youtube.com/@javascriptmastery/videos) tutorial. I am still learning React and TypeScript, so this project helped me understand how a complete application is put together and how different services work together.

## What I learned

While building Roomify, I practiced:

- Creating pages and routes with React Router
- Writing components with React and TypeScript
- Styling a responsive interface with Tailwind CSS
- Handling drag-and-drop image uploads
- Using Puter for authentication, storage, and AI image generation
- Saving projects and loading them again
- Comparing the original floor plan with the generated result
- Building and checking a project before deployment

## Features

- Sign in with a Puter account
- Upload JPEG, PNG, or WebP floor plans up to 10 MB
- Generate a top-down 3D visualization with AI
- Save uploaded and generated images
- View previous projects
- Compare before and after images with a slider
- Download the generated image as a PNG

## Built with

- React 19
- React Router 7
- TypeScript
- Vite
- Tailwind CSS 4
- Puter.js

## Run the app locally

You need Node.js 20 or newer and npm installed.

### 1. Clone the repository

```bash
git clone https://github.com/rare1yhuman/roomify.git
cd roomify
```

### 2. Install the packages

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. Sign in with Puter before uploading a floor plan.

## Other useful commands

Check the TypeScript code:

```bash
npm run typecheck
```

Create a production build:

```bash
npm run build
```

Run the production build:

```bash
npm run start
```

## Project folders

```text
app/          Pages, routes, and application styles
components/   Reusable interface components
lib/          Puter, AI, hosting, and utility code
public/       Static files
type.d.ts     Shared TypeScript types
```

## Note

This is one of my learning projects, so there are still things I would like to improve as I learn more. Building it gave me useful experience with React, TypeScript, third-party services, and working through a larger project from start to finish.
