// server.js — backend for the Ashvamedha multi-page site
//
// Handles:
// 1. Rendering each page (home, events, leaderboard, gallery, sponsors, team, register)
//    using EJS templates in ../views, which share one nav.ejs and footer.ejs
//    so you only ever edit the navbar/footer in ONE place.
// 2. Serving static files (CSS, JS) from ../public
// 3. POST /api/register — saves team registrations to registrations.json
// 4. GET /api/leaderboard — serves current standings from leaderboard.json
// 5. POST /api/leaderboard — updates a standing (organizing team use)

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const REGISTRATIONS_FILE = path.join(__dirname, 'registrations.json');
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function ensureFile(filePath, defaultContent) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, 'utf-8');
  }
}

// ---------- Pages ----------
app.get('/', (req, res) => res.render('home'));
app.get('/events', (req, res) => res.render('events'));
app.get('/leaderboard', (req, res) => res.render('leaderboard'));
app.get('/gallery', (req, res) => res.render('gallery'));
app.get('/sponsors', (req, res) => res.render('sponsors'));
app.get('/team', (req, res) => res.render('team'));
app.get('/register', (req, res) => res.render('register'));

// ---------- Registration API ----------
app.post('/api/register', (req, res) => {
  const { team_name, captain_name, email, phone, sport, players } = req.body;

  if (!team_name || !captain_name || !email || !phone || !sport || !players) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'That email address does not look valid.' });
  }

  ensureFile(REGISTRATIONS_FILE, '[]');
  const registrations = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE, 'utf-8'));

  registrations.push({
    id: Date.now(),
    team_name,
    captain_name,
    email,
    phone,
    sport,
    players,
    registeredAt: new Date().toISOString(),
  });

  fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2), 'utf-8');
  console.log(`New registration: ${team_name} (${sport})`);
  res.status(200).json({ ok: true });
});

app.get('/api/registrations', (req, res) => {
  ensureFile(REGISTRATIONS_FILE, '[]');
  res.json(JSON.parse(fs.readFileSync(REGISTRATIONS_FILE, 'utf-8')));
});

// ---------- Leaderboard API ----------
const DEFAULT_LEADERBOARD = JSON.stringify(
  [
    { institution: 'IIT Bhubaneswar', points: 0 },
    { institution: 'College A', points: 0 },
    { institution: 'College B', points: 0 },
  ],
  null,
  2
);

app.get('/api/leaderboard', (req, res) => {
  ensureFile(LEADERBOARD_FILE, DEFAULT_LEADERBOARD);
  res.json(JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf-8')));
});

app.post('/api/leaderboard', (req, res) => {
  const { institution, points } = req.body;
  if (!institution || points === undefined) {
    return res.status(400).json({ error: 'institution and points are required.' });
  }

  ensureFile(LEADERBOARD_FILE, DEFAULT_LEADERBOARD);
  const board = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf-8'));

  const existing = board.find(row => row.institution === institution);
  if (existing) {
    existing.points = points;
  } else {
    board.push({ institution, points });
  }

  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(board, null, 2), 'utf-8');
  res.status(200).json({ ok: true, board });
});

// ---------- 404 fallback ----------
app.use((req, res) => {
  res.status(404).send('Page not found. <a href="/">Go home</a>');
});

app.listen(PORT, () => {
  console.log(`Ashvamedha site running at http://localhost:${PORT}`);
});
