// This file is loaded on every page. Each function checks whether its
// elements exist before doing anything, since not every page has a
// countdown, a leaderboard table, or a form.

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('is-open'));
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('is-open'));
  });
}

// ---------- Countdown (home page only) ----------
// EDIT THIS DATE when the real event date is confirmed:
const EVENT_DATE = new Date('2026-11-06T09:00:00+05:30');

function updateCountdown() {
  const daysEl = document.getElementById('cd-days');
  if (!daysEl) return; // not on this page

  const diff = EVENT_DATE - new Date();
  const countdownEl = document.getElementById('countdown');

  if (diff <= 0) {
    countdownEl.innerHTML = '<p>It has begun.</p>';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  daysEl.textContent = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- Leaderboard (home teaser + full leaderboard page) ----------
async function loadLeaderboard(tbodyId, limit) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return; // not on this page

  try {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="3">Standings will appear once the fest begins.</td></tr>';
      return;
    }

    const sorted = data.sort((a, b) => b.points - a.points);
    const rows = limit ? sorted.slice(0, limit) : sorted;

    tbody.innerHTML = rows
      .map((row, i) => `<tr><td>${i + 1}</td><td>${row.institution}</td><td>${row.points}</td></tr>`)
      .join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="3">Could not load standings right now.</td></tr>';
  }
}
loadLeaderboard('leaderboard-body');       // full leaderboard page
loadLeaderboard('home-leaderboard-body', 3); // home page teaser (top 3)

// ---------- Registration form (register page only) ----------
const form = document.getElementById('register-form');
if (form) {
  const status = document.getElementById('form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Submitting…';
    status.className = 'register__status';

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Server error');

      status.textContent = 'Registered — the organizing team will follow up by email.';
      status.className = 'register__status success';
      form.reset();
    } catch (err) {
      status.textContent = 'Something went wrong. Please try again in a moment.';
      status.className = 'register__status error';
    }
  });
}
