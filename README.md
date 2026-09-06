# Ashvamedha — Multi-page Site

Separate pages (Home, Events, Leaderboard, Gallery, Sponsors, Team, Register)
sharing one consistent navbar, footer, and visual design.

## A note on the theme

This uses an **original visual identity** — a cracked emblem, dark
atmosphere, countdown timer — inspired by the mood of "something huge is
about to happen," without using any actual Marvel/Avengers characters,
logos, or the word "Doomsday" anywhere on the site. Those are
copyrighted/trademarked, so I built the *feeling* instead of copying the IP.
This keeps the fest's branding entirely its own and safe to publish under
the institute's name.

## Why this project looks different from a single HTML file

Instead of one big HTML file, this uses:
- **views/** — one `.ejs` file per page (`home.ejs`, `events.ejs`, etc.)
- **views/partials/** — `nav.ejs` and `footer.ejs`, included on every page

This means the navbar and footer are written **once** and reused everywhere
— if you fix a typo or add a link, you do it in one file instead of seven,
which avoids exactly the kind of inconsistency bugs that come from
copy-pasting the same HTML into multiple files.

## Run it locally

```bash
cd ashvamedha2
npm install
npm start
```
Open **http://localhost:3000**. Visit `/events`, `/leaderboard`,
`/gallery`, `/sponsors`, `/team`, `/register` to see the other pages.

## What to edit, and where

| To change... | Edit this file |
|---|---|
| Navbar links (same on every page) | `views/partials/nav.ejs` |
| Footer (same on every page) | `views/partials/footer.ejs` |
| Home page hero, countdown text | `views/home.ejs` |
| Event list & rules | `views/events.ejs` |
| Team names | `views/team.ejs` |
| Sponsor names | `views/sponsors.ejs` |
| Registration form fields | `views/register.ejs` |
| Event date (countdown) | `public/script.js` — the `EVENT_DATE` line |
| Colors, fonts | `public/styles.css` — the `:root` block at the top |

## Adding a new page

1. Create `views/yourpage.ejs`, copy the structure from an existing page (e.g. `sponsors.ejs`)
2. In `server/server.js`, add a route: `app.get('/yourpage', (req, res) => res.render('yourpage'));`
3. Add a link to it in `views/partials/nav.ejs`

## Managing the leaderboard

Standings live in `server/leaderboard.json` (auto-created on first run).
Update a score with:

```bash
curl -X POST http://localhost:3000/api/leaderboard \
  -H "Content-Type: application/json" \
  -d '{"institution": "IIT Bhubaneswar", "points": 42}'
```

**Before going public**, this endpoint and `/api/registrations` should be
password-protected — right now anyone with the URL could change scores.
Ask me when you're ready to add that.

## Merging in last year's site

Once you upload the zip(s) from the four repos you shared, I'll go through
them and pull in anything worth reusing — page structure, specific copy,
or components like the events card layout — into this same file structure.

## Publishing it live

Same as before: push this folder to GitHub, then deploy on Render or
Railway using `npm install` as the build command and `npm start` to run it.
