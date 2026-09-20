# Master Prompt for Bolt.new — Full Implementation Plan
### Senior Technical Lead Instruction — Step-by-Step Execution

Copy everything below into Bolt.new as your prompt.

---

You are acting as a Senior Full-Stack Technical Lead taking over an existing, partially-built codebase. Do not start from scratch or restyle the existing UI — extend it cleanly, file by file, following the sequential plan below.

**Current live reference (your own prior output — treat this as the current state of the codebase):**
https://developer-portfolio-8ll0.bolt.host/#projects

This is Mohamed Rashed Abdelazim's personal Developer Portfolio Platform — a Full-Stack .NET Engineer & AI Evaluation Specialist. The next development phase must implement the attached PRD (Product Requirements Document) faithfully, extending the current design system, not replacing it.

---

## 0. Ground Rules (apply to every step below)

- **Preserve the existing visual identity**: dark theme, cyan (`#22d3ee`-family) as the single primary accent, green used *only* for success/positive metrics, clean sans-serif typography with strong size contrast between headlines and body text, restrained glassmorphism (1–2 glass surfaces per view max), monospace font reserved for code/API/terminal content only.
- **Component-based, TypeScript-safe, modular code.** No inline styles scattered ad hoc — extend the existing Tailwind config/design tokens. No `any` types. Every new component gets its own file.
- **Every new feature must have Loading, Empty, and Error states.** Never leave a data-driven section with only a "happy path" — if data is missing or a request fails, show a clear, styled fallback, not a blank space or a raw error.
- **Use realistic Dummy/Seed Data** wherever a real backend endpoint doesn't exist yet, structured to match the exact JSON shape defined in the PRD's API contracts (Section 3.4) — so swapping in the real API later requires zero shape changes on the frontend.
- **Responsive at every step**: verify Desktop (≥1024px), Tablet (768–1023px), and Mobile (<768px) for each new component before moving to the next step. Mobile layouts must be purpose-built, not shrunk desktop versions.
- **Explicit environment honesty:** if a requirement in any step cannot be fully implemented inside Bolt's environment (e.g., a real persistent SQL Server connection, a real scheduled background job), stop and tell me clearly what the limitation is and what you're substituting instead (e.g., a mocked service with the same interface) — do not silently skip or fake completion.

---

## STEP 1 — Tech Stack Audit & Architecture Setup

1. Confirm/establish the stack: **React + Vite + TypeScript**, **Tailwind CSS** (extending existing config, not a new one), **Lucide Icons** for all iconography (replace any inconsistent icon sources), **Framer Motion** for animation (added in Step 5).
2. Reorganize (without breaking current functionality) into a clean, component-based structure:
   ```
   src/
   ├── components/          # Reusable UI: Nav, Footer, ProjectCard, SkillBar, ApiPlayground, Portrait, StatusPill, etc.
   ├── pages/                # Route-level views: Home, Projects, ProjectDetail, About, TechStack, AiLab, Contact, NotFound
   ├── hooks/                # Data-fetching hooks: useProjects, useProjectBySlug, useTechStack, useSubmitInquiry, useGitHubMetrics
   ├── services/             # api.ts — single fetch/service layer, environment-variable-driven base URL
   ├── data/                 # Seed/dummy data matching PRD API contract shapes exactly
   ├── types/                # TypeScript interfaces matching PRD entities (Project, ProjectMetric, Inquiry, AiEvaluationCase, GitHubMetrics)
   └── styles/               # Tailwind config extensions, design tokens
   ```
3. Confirm this structure with a short summary before proceeding to Step 2.

---

## STEP 2 — Design System Consolidation

1. Extract every color, spacing, and typography value currently used ad hoc across components into Tailwind theme tokens (`accent-primary`, `accent-success`, `bg-surface`, `text-muted`, etc.) — no hardcoded hex values remaining in component files.
2. Implement a Light/Dark mode toggle if not already present, using the same semantic token structure for both modes — Dark remains default.
3. Audit and fix any inconsistent glassmorphism usage — restrict frosted-glass surfaces to at most 1–2 per page.
4. Deliver a short before/after note on what was standardized.

---

## STEP 3 — Feature Implementation per PRD Modules

Implement each module below **in this order**, verifying acceptance criteria before moving to the next:

### 3.1 Interactive Project Showcase & Live API Explorer
- Extend each Project Detail page (Adros Core, HelpDesk Systems, Dentzone Portal) with: scale summary stats, a Clean Architecture layer diagram specific to that project (Domain → Application → Infrastructure → WebApi), and an embedded `ApiPlayground` component scoped to that project's sandbox endpoint (e.g., `/api/playground/adros/courses`).
- `ApiPlayground` behavior: a dropdown/selector of **whitelisted GET-only endpoints**; clicking "Send Request" returns a syntax-highlighted JSON response within a simulated ~1–2s delay (using seed data matching the PRD's sample payload shape); attempting any non-whitelisted or write-method action must show a styled 403 message explaining the Playground is read-only for security — never a broken/blank result.

### 3.2 Interactive Database Schema Viewer
- Build a clickable, visual ER-diagram component for Adros and Dentzone using seed data matching the `SchemaDiagrams` entity shape (TableName, ColumnsJson, RelationshipsJson).
- Clicking a table node expands a panel showing its columns, types, and foreign-key relationships. Provide a dedicated, simplified mobile interaction pattern (e.g., tap-to-expand accordion) rather than horizontal-scrolling the desktop diagram.

### 3.3 AI Evaluation Lab (full page)
- Build this as its own routed page (`/ai-lab`), not just a homepage section.
- Show curated before/after case studies (flawed LLM response → identified flaw → corrected evaluation), using seed data matching the `AiEvaluationCases` entity.
- Include the guided "Request a Code Review" micro-tool: a fixed list of selectable pre-written C# snippets (not free-text input, per PRD's security decision) that reveal an annotated review on selection.

### 3.4 Dynamic GitHub Metrics Widget
- Build a `useGitHubMetrics()` hook returning data matching the PRD's `/api/github/metrics` shape (totalRepos, topLanguages, totalCommitsLast90Days, lastSyncedAt).
- Since a real scheduled backend job isn't available in this environment, use realistic static seed data for now and clearly comment in the code where the real GitHub API + caching job would be wired in.

### 3.5 Contact & Lead Generation Module
- Build a fully functional Contact form (Name, Email, Message, Inquiry Type) with client-side validation (required fields, valid email format) matching the PRD's `POST /api/inquiries` request/response shape.
- On submit: show a loading state, then a success confirmation matching the response shape (`id`, `status: "New"`, `createdAt`), or a clear error state if the mock/service call fails.
- Apply basic client-side rate-limiting UX (disable the submit button briefly after submission) matching the PRD's rate-limiting intent, even though real server-side rate limiting requires the actual backend.

### 3.6 Admin Dashboard (scaffold only)
- Build a simple, JWT-gated `/admin` route scaffold: a login form and a placeholder dashboard shell showing tabs for Projects, Inquiries, and Metrics — using mocked auth for now (clearly commented as a placeholder for real JWT validation against the future ASP.NET Core backend).

---

## STEP 4 — Backend Scaffolding Documentation (not runtime execution)

Since this environment cannot run a real ASP.NET Core + SQL Server backend:
1. Generate a `/backend-reference/` folder in the project (not part of the deployed frontend) containing: the Clean Architecture folder structure from the PRD (Domain/Application/Infrastructure/WebApi), EF Core entity class stubs matching the PRD's database tables (Projects, ProjectMetrics, SchemaDiagrams, Inquiries, AiEvaluationCases, GitHubMetricsCache, AdminUsers), and the exact API contracts from PRD Section 3.4 as C# DTO stubs.
2. This gives me a ready reference to hand to a real .NET development environment later — clearly label it as **reference-only, not executable in this environment**.

---

## STEP 5 — Interactivity & Motion Pass (Framer Motion)

1. Add Framer Motion for: page transitions (subtle fade/slide, 200–300ms), hover elevation on cards, animated counters for hero stats, and a smooth cross-fade for the Light/Dark mode toggle.
2. Keep motion purposeful and restrained — no motion on elements that don't need it, matching the existing site's understated tone.

---

## STEP 6 — Performance, SEO & Best Practices Pass

1. Add proper `<title>` and meta tags per page (unique per route: Home, Projects, Project Detail per slug, About, Tech Stack, AI Lab, Contact).
2. Add Open Graph tags and basic `schema.org` `Person`/`ProfilePage` structured data on the Home/About pages.
3. Audit for accessibility: minimum 4.5:1 text contrast, visible focus states (2px ring) on all interactive elements, semantic HTML/ARIA labels on the API Playground, Schema Viewer, and forms.
4. Run a final TypeScript strictness pass — no implicit `any`, all props typed, all hooks typed.
5. Confirm final responsive QA across Desktop/Tablet/Mobile for every page touched in Steps 2–5.

---

## Final Deliverable Checklist (confirm each before declaring complete)

- [ ] Design tokens consolidated, no hardcoded colors remaining
- [ ] All 6 PRD modules (3.1–3.6) implemented with loading/empty/error states
- [ ] Backend reference scaffold generated and clearly labeled
- [ ] Motion pass applied, restrained and consistent
- [ ] SEO/meta/accessibility pass complete
- [ ] Fully responsive on Desktop, Tablet, and Mobile
- [ ] Any environment limitations clearly flagged to me, not silently worked around

Proceed step by step, confirming completion of each step with a brief summary before moving to the next — do not attempt all 6 steps in a single pass.
