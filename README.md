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

## Tech

- Single-file React app (`src/App.tsx`) using Tailwind-style utility classes and a small set of UI primitives (`Button`, `Input`, `Textarea`, `Label`, `Tabs`, `Card`, `Badge`, `Select`).
- No backend — everything is client-side. To deploy as a standalone site, wrap `App.tsx` in any React bundler (e.g. Vite) and map the `@/components/ui/*` imports to your component library (e.g. shadcn/ui).

## Disclaimer

For learning purposes only — an aid to clerking, not a substitute for consultant guidance. Patient data stays on your device; avoid entering identifying patient information where unnecessary.

## Roadmap ideas

- True authenticated Google Drive access (account-scoped) via a backend
- Pediatric-specific fields, GCS/GPA calculators
- Sync between devices
