<!-- GSD:project-start source:PROJECT.md -->
## Project

**Michelle Ngo Portfolio (michelle_ngo_six)**

A cinematic, YouTube-style portfolio website for filmmaker and producer Michelle Ngo — a ground-up redesign of her current flat WordPress site (michellengo.net). The homepage presents her body of work the way YouTube presents content: a featured hero reel up top, then stacked horizontal "rails" — one per category — that visitors scroll through, with each card opening a watch page. Built in SvelteKit, deployed static to GitHub Pages.

**Core Value:** A visitor lands on the homepage and can immediately *watch Michelle's work* — browsing her films/videos by category in an engaging, cinematic, scroll-and-play interface. If everything else fails, the homepage rails + watch experience must work.

### Constraints

- **Tech stack**: SvelteKit 5 + adapter-static + Tailwind v4 + pnpm — match `_three` so components/data port cleanly.
- **Hosting**: GitHub Pages (static, prerendered). Requires `BASE_PATH=/michelle_ngo_six`; no hardcoded absolute asset paths.
- **Performance**: Cinematic but fast — protect LCP. No heavy 3D/WebGL. Lazy-load video iframes; eager-load only the hero poster.
- **Accessibility**: Honor `prefers-reduced-motion`; keyboard-navigable rails; visible focus rings (carried from `_three`'s design system).
- **Repo**: Own git repo, remote `https://github.com/wolfwdavid/michelle_ngo_six.git` (user `wolfwdavid`).
- **Commits**: No mention of AI assistants in commit messages or code.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
