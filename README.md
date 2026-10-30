# Clark 🩺

**Clark** — from *"clerk"* — is a mobile-friendly web app that helps medical students clerk patients, from history taking through examination, assessment, and management, and then generates a structured case presentation you can copy or export to Word.

Built for clinical postings at JUTH (Jos University Teaching Hospital), Nigeria.

## Features

- **Posting categories** — Medicine, Surgery, Specialty Postings (Ophthalmology, Radiology, Psychiatry, ENT, Dermatology, Anaesthesiology), Community Medicine, Obstetrics & Gynaecology, Paediatrics. Clerks are tagged and filterable by posting.
- **Full clerking workflow** (5 tabs):
  - *Biodata* — name, age, sex, ward/bed, hospital number, date clerked, posting
  - *History* — presenting complaint, HPC, SOCRATES pain analysis, systemic review, past medical/surgical/drug history, allergies, family & social history, obstetric history (auto-shown for female patients)
  - *Examination* — vitals, general exam, two selectable system exams, other findings
  - *Assessment* — summary of findings, working diagnosis, differentials, investigations
  - *Plan* — management plan + cited sources/references
- **Presentation generator** — auto-builds a structured case write-up; copy to clipboard or download as a Word-compatible `.doc` file.
- **Library**
  - Link a **Google Drive folder per posting** (shared "anyone with the link") — the folder's files/subfolders render inside the app via Drive's embedded folder view.
  - **Textbooks & references** per posting — added from Drive links or manually, cited in clerks under a References section.
  - **Geeky Medics guides** — curated per-posting examination guides with video demonstrations (step-by-step OSCE guides, checklists).
- **Offline-first** — clerks, Drive links, and references are stored on-device (localStorage). Works without a network except for Drive embeds and external links.

## Getting started

Requires Node.js 18+ and npm.

```bash
# install dependencies (creates node_modules/ locally — never committed)
npm install

# start the dev server (hot reload at http://localhost:5173)
npm run dev

# production build to dist/
npm run build

# preview the production build locally
npm run preview
```

To install on a phone for offline use: run `npm run build`, host `dist/` anywhere static (GitHub Pages, Netlify, Vercel), then add to home screen.

## Tech

- **Vite 5 + React 18 + TypeScript** — bundling & dev server
- **Tailwind CSS 3** — utility styling
- **Radix UI primitives** (`react-tabs`, `react-select`, `react-label`) + `class-variance-authority`/`clsx`/`tailwind-merge` — the `@/components/ui/*` component layer (shadcn/ui-style)
- **No backend** — everything is client-side; data persists in `localStorage`
- `@` path alias is mapped to `src/` in both `vite.config.ts` and `tsconfig.json`

## Project structure

```
├── index.html
├── package.json            # scripts: dev / build / preview
├── vite.config.ts          # react plugin + @ alias
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx            # entry — mounts App on #root
    ├── index.css           # tailwind directives
    ├── App.tsx             # the entire Clark app
    ├── lib/
    │   └── utils.ts        # cn() class merger
    └── components/ui/     # button, input, textarea, label, tabs, card, badge, select
```

`node_modules/` and `dist/` are gitignored — dependencies are installed from `package.json` via `npm install`, never pushed to the repo.

## Disclaimer

For learning purposes only — an aid to clerking, not a substitute for consultant guidance. Patient data stays on your device; avoid entering identifying patient information where unnecessary.

## Roadmap ideas

- True authenticated Google Drive access (account-scoped) via a backend
- Pediatric-specific fields, GCS/GPA calculators
- Sync between devices
