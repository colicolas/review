# Review — school notebook

Next.js App Router + TypeScript + Tailwind CSS 4. Light mode, responsive subject pages, dated exam subpages, interactive diagrams, practice questions, and browser-local readiness tracking.

## Develop

```sh
npm install
npm run dev
```

## Check and build

```sh
npm run typecheck
npm run build
```

The static export is in `out/`.

## Add a new test

1. Add the exam to `src/lib/exams.ts` to populate the calendar and its subject notebook.
2. Add its route to `generateStaticParams` in `src/app/subjects/[slug]/[exam]/page.tsx` and render its review component.
3. Keep existing test routes intact.

Subjects and accent colors live in `src/lib/content.ts`.

## English reading quiz · November 4

Route: `/subjects/english/2026-11-04-the-stranger/`.

The working mapping for assigned pages 63–97 is Part Two, chapters 1–3 (PDF pages 46–66 in the supplied Matthew Ward digital edition). The review makes this mapping explicit because the digital PDF has different pagination. Confirm the scope against the class assignment if necessary.

- Nine-step plot progression and a witness guide.
- 187 authored detail, speaker/reference, and sequence questions in `src/data/stranger-details.json`.
- 624 sentence-recall cards in `src/data/stranger-sentences.json`, generated from every sentence detected by `Intl.Segmenter` in the working scope.
- Shuffle without replacement; filters by type and chapter; session sizes 10, 20, 40, or all.
- Optional typed recall, answer reveal, self-grading, and browser-local missed-question tracking.

`node scripts/build-stranger-recall.mjs /absolute/path/to/pdfkit-extraction.txt` regenerates the sentence-recall data. This helper expects PDFKit text with `=== PDF PAGE N ===` markers. The full-book extraction is not part of the repository or published output.

## Psychology test · November 6

Route: `/subjects/psychology/2026-11-06-learning/`.

Unit 4, Chapter 6, based on `public/psychology-learning-notes.pdf`. Includes interactive diagrams, eight classical-conditioning labeling scenarios, twelve operant-conditioning scenarios, mixed practice, and a browser-local readiness checklist. Summary content clarifies inconsistent source phrases about prediction error and context-dependent tolerance.
