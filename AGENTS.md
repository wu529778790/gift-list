# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + React + TypeScript single-file app for local gift-book management. Application entrypoints live in `src/app`, with route pages such as `page.tsx`, `main/page.tsx`, `setup/page.tsx`, and `guest-screen/page.tsx`. Reusable UI and workflow pieces are under `src/components` (`business`, `layout`, `ui`). Shared logic lives in `src/lib`, `src/hooks`, `src/store`, `src/utils`, `src/constants`, and `src/types`. Build output goes to `dist/`; the release workflow copies `dist/index.html` to the repository root for GitHub Releases.

## Build, Test, and Development Commands
- `pnpm dev`: start the local Vite dev server on port `3000`.
- `pnpm build`: run TypeScript checks, then create the production single-file bundle in `dist/`.
- `pnpm preview`: serve the built app locally for final verification.
- `pnpm lint`: run ESLint on `src/**/*.ts` and `src/**/*.tsx`.

Run `pnpm build && pnpm preview` before shipping changes that affect file export, printing, or `file://` usage.

## Coding Style & Naming Conventions
Use TypeScript with strict mode. Follow the existing style: 2-space indentation, single quotes, semicolons, and functional React components. Use `PascalCase` for components (`ImportExcelModal.tsx`), `camelCase` for hooks/utilities (`useGiftStats.ts`, `format.ts`), and keep route files named `page.tsx`. Prefer the `@/` alias for imports from `src`.

ESLint is the active quality gate. Avoid unused locals, keep `any` rare, and do not add casual `console.log` calls; only `console.warn` and `console.error` are permitted by lint rules.

## Testing Guidelines
There is no automated test framework configured yet. For every change, run `pnpm lint` and `pnpm build`, then manually verify the affected flows in the browser. Focus on high-risk paths: Excel import/export, local storage persistence, print/PDF output, voice prompts, and guest-screen sync.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commit prefixes such as `feat:`, `fix:`, and `refactor:`. Keep commit messages short and imperative, for example: `fix: prevent duplicate event imports`.

Pull requests should include a concise summary, manual verification steps, and screenshots or short recordings for UI changes. Call out any impact on release packaging, offline behavior, or GitHub Pages deployment workflows in `.github/workflows/`.
