# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

- This is an Astro-based web app (`astro` 5.x) currently in an early stage.
- React support is enabled via `@astrojs/react`, so you can use React "islands" for interactive UI where needed.

## Important commands

All commands should be run from the project root.

- Install dependencies: `npm install`
- Start the dev server (defaults to `http://localhost:4321`): `npm run dev`
- Build for production (outputs to `dist/`): `npm run build`
- Preview the production build locally: `npm run preview`
- Run Astro CLI subcommands (e.g. `check`, `add`): `npm run astro -- <subcommand>`
  - Example: `npm run astro -- check`

### Tests and linting

- There are currently **no test or lint scripts** defined in `package.json`.
- If you add tooling (e.g. Jest/Vitest for tests or ESLint for linting), update this section with:
  - The command to run the full suite.
  - The command to run a single test file or test name.
  - Any project-specific flags or environment requirements.

## Code structure and architecture

### Tooling and configuration

- `astro.config.mjs`
  - Uses `defineConfig` and registers `react()` from `@astrojs/react` in `integrations`.
  - This is the central place to add more Astro integrations or change global Astro behavior.
- `tsconfig.json`
  - Extends `astro/tsconfigs/strict`.
  - Includes `.astro` types and all project files, excluding `dist/`.
  - Configures TypeScript for React JSX via `"jsx": "react-jsx"` and `"jsxImportSource": "react"`.

### Application layout and routing

- `src/pages/`
  - Astro's file-based routing lives here.
  - `src/pages/index.astro`
    - Home page.
    - Wraps content in `AppLayout.astro` and renders a simple "Trackly" heading and description.
  - `src/pages/history.astro`, `src/pages/stats.astro`
    - Present but currently empty; they are placeholders for future routes.

- `src/layouts/AppLayout.astro`
  - Defines the HTML document shell used by pages.
  - Accepts a `title` prop (defaults to `"Trackly"`).
  - Sets up `<!DOCTYPE html>`, `<html>`, `<head>` (including `<title>`), and `<body>`.
  - Renders page content inside a `<main>` element via `<slot />`.
  - To keep the app consistent, new pages should generally wrap their content in this layout.

### Domain and service layers

- `src/domain/`
  - `src/domain/session.ts`
  - `src/domain/tag.ts`
  - These files are currently empty but are intended as the **domain layer** for the app (e.g. session and tagging models, pure business logic, and helpers that are UI-agnostic).
  - Prefer putting reusable domain logic here rather than directly in UI components.

- `src/services/`
  - `src/services/storage.ts`
  - Currently empty, likely intended as a **service layer** for storage and persistence (e.g. `localStorage` helpers, API calls, or data access abstractions).
  - When you add persistence or data-fetching logic, consider centralizing it here.

### Islands and interactivity

- `src/islands/`
  - `src/islands/SessionModal.tsx`
  - `src/islands/SessionTimer.tsx`
  - `src/islands/StartStopButton.tsx`
  - These files are currently empty but are clearly reserved for React components used as Astro "islands".
  - Typical usage pattern:
    - Implement interactive React components in this directory.
    - Import them into `.astro` pages and attach an appropriate `client:*` directive (e.g. `client:load`, `client:visible`) so Astro hydrates them on the client only where needed.
  - This separation keeps Astro pages focused on layout and data wiring, with client-side behavior encapsulated in React components.

## How to extend the app

- **New pages / routes**
  - Create a new `.astro` file under `src/pages/`.
  - Wrap the content with `AppLayout` to get a consistent `<head>` and page structure, similar to `index.astro`.

- **Shared layout changes**
  - Modify `src/layouts/AppLayout.astro` when you need to change global markup such as `<head>` metadata, document structure, or shared layout around all pages.

- **Adding interactive features**
  - Implement or update React components under `src/islands/`.
  - Import them into the relevant `.astro` page and use Astro's client directives to control hydration.

- **Business and data logic**
  - Place reusable, UI-agnostic logic (e.g. session calculations, tag operations) in `src/domain/`.
  - Centralize storage, persistence, and data-fetching logic in `src/services/storage.ts` and call that logic from domain or UI layers as appropriate.
