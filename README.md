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

Production now requires a running Next.js server. Use `npm run build` and `npm start`; do not serve a static export. The old `out/` export is removed.

## Password access

The entire site, including PDFs and client question-bank bundles, is protected by a server-side password check. A successful sign-in issues an HTTP-only, signed session cookie with a fixed 48-hour expiry; it is not extended by visiting more pages. The sidebar’s “Lock notebook” button deletes the cookie. An open page also returns to the password screen when its session expires.

Local credentials are already configured in the untracked `.env.local`. For a new installation or production deployment, set `REVIEW_PASSWORD` and `REVIEW_SESSION_SECRET` using `.env.example` as the key reference; generate a unique random session secret of at least 32 characters. Never expose these values using `NEXT_PUBLIC_` environment variables. Password or secret changes invalidate existing sessions.

Use HTTPS in production so the cookie is marked Secure. The normal local HTTP development flow is supported. The production host must support Next.js server execution: this password gate cannot be deployed as static HTML. The Sites manifest no longer advertises a public static directory.

Run `node scripts/check-auth.mjs` to check password rejection, cookie lifetime, tampering and expiration, file/chunk protection, safe redirects, origin checks, and logout.

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

## Expert Systems coding standards quiz · November 5

Route: `/subjects/computer-science/2026-11-05-coding-standards/`.

Based on the four-page 2026 course PDF in `public/jess-coding-standards-2026.pdf`. The bank in `src/data/jess-questions.json` has 150 problems: 50 recall, 40 diagnoses, 30 rewrites, 20 exception checks, and 10 interactive five-error sections. Sessions shuffle without repeats, filter by standard and question type, and save missed problem IDs locally. Five-error line selections are checked automatically; written explanations and rewrites use self-assessment against a key, not a Jess interpreter.

Run `node scripts/check-coding-bank.mjs` on Node 22+ to validate bank integrity, five-line grading edge cases, and nonrepeating shuffled decks. Snippets explicitly assume omitted file headers, documentation, and bounding blank lines unless the prompt tests them.

## English reading quiz · November 6

Route: `/subjects/english/2026-11-06-the-stranger-ending/`.

Pages 98–end continues the previous reading with Part Two, chapters 4–5 (digital PDF pages 67–82). Includes a ten-step plot progression, a speaker/reference guide, 199 authored detail/speaker/sequence questions, and 467 sentence-recall cards. The original November 4 quiz and its saved missed questions remain intact. The ending quiz uses its own `stranger-ending-quiz-missed` browser-storage key, with chapter filters for chapters 4 and 5.

The authored bank is `src/data/stranger-ending-details.json`. Run `node scripts/build-stranger-recall.mjs /absolute/path/to/pdfkit-extraction.txt --ending` to rebuild only the ending sentence cards. The book’s download-information footer is excluded. Run `node scripts/check-reading-banks.mjs` to validate both banks and render-check the two review variants and chapter filters.
