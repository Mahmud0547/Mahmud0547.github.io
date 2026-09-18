/*
 * Typing effect in Hero
 * Cycles through a list of phrases, typing and deleting each one
 * with a blinking cursor to give the "live terminal" feel.
 */
(function initTyping() {
  const el = document.getElementById('hero-typed');
  if (!el) return;

  // Phrases to cycle through — edit freely
  const phrases = [
    'things for the web.',
    'landing pages.',
    'clean interfaces.',
    'websites that work.',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let deleting    = false;

  function tick() {
    const current = phrases[phraseIndex];

    if (!deleting) {
      // Type one character
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        // Finished typing — pause then start deleting
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 70);
    } else {
      // Delete one character
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        // Finished deleting — move to next phrase
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 35); // delete faster than type
    }
  }

  // Small delay before starting so the page settles first
  setTimeout(tick, 1000);
})();


/*
 * Theme Toggle — dark / light mode
 * Saves preference to localStorage so it persists on next visit.
 */
const themeBtn = document.getElementById('theme-toggle');
const root     = document.documentElement;

// Apply saved preference on load
if (localStorage.getItem('theme') === 'light') {
  root.setAttribute('data-theme', 'light');
  themeBtn.textContent = '☀️';
}

/*
 * Animated counters in Hero stats row
 * Hero is always visible on load — run after a short delay so user sees the animation.
 */
setTimeout(() => {
  document.querySelectorAll('.hero__stat-num').forEach(el => {
    const target = +el.dataset.target;
    const step   = 1200 / target; // spread over 1.2 seconds
    let count    = 0;
    const timer  = setInterval(() => {
      count++;
      el.textContent = count;
      if (count >= target) clearInterval(timer);
    }, step);
  });
}, 600); // slight delay so page finishes rendering first

themeBtn.addEventListener('click', () => {
  const isLight = root.getAttribute('data-theme') === 'light';
  if (isLight) {
    root.removeAttribute('data-theme');
    themeBtn.textContent = '🌙';
    localStorage.setItem('theme', 'dark');
  } else {
    root.setAttribute('data-theme', 'light');
    themeBtn.textContent = '☀️';
    localStorage.setItem('theme', 'light');
  }
});

/*
 * Scroll Reveal
 * Watches all elements with class "reveal" and adds "visible"
 * once they enter the viewport. Uses IntersectionObserver for
 * performance — no scroll event listener needed.
 */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Stop observing after reveal — no need to re-trigger
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12, // trigger when 12% of element is visible
  }
);

// Attach observer to every .reveal element on the page
document.querySelectorAll('.reveal').forEach((el) => {
  revealObserver.observe(el);
});

/*
 * Active nav link highlight
 * Tracks which section is in view and visually marks the nav link.
 */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__links a');

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === '#' + entry.target.id;
        link.style.color = isActive ? 'var(--color-accent)' : '';
      });
    });
  },
  {
    rootMargin: '-40% 0px -55% 0px', // trigger near the middle of the viewport
  }
);

sections.forEach((section) => navObserver.observe(section));


/*
 * Interactive Map — Distance from Tajikistan to Visitor
 *
 * Uses ipapi.co to get the visitor's approximate location (city/country).
 * We never get their exact address — just a general geographic coordinate.
 * Then we calculate the great-circle distance to Dushanbe and draw a line
 * on the SVG map.
 */

// Dushanbe coordinates (home base)
const HOME = { lat: 38.56, lon: 68.77, svgX: 645, svgY: 148 };

// Convert a lat/lon to approximate SVG coordinates for our 1000x500 viewBox
// This is a simple equirectangular projection — good enough for a decorative map
function latLonToSvg(lat, lon) {
  const x = ((lon + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x: Math.round(x), y: Math.round(y) };
}

// Haversine formula — distance between two lat/lon points in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)));
}

async function initMap() {
  const caption     = document.getElementById('map-caption');
  const line        = document.getElementById('map-connection-line');
  const dotVisitor  = document.getElementById('dot-visitor');
  const labelVisitor = document.getElementById('label-visitor');

  try {
    // ipapi.co is free, no key needed — works better on mobile Safari than ip-api.com
    const res  = await fetch('https://ipapi.co/json/');
    const data = await res.json();

    if (!data.lat) throw new Error('No location data');

    const visitor = latLonToSvg(data.lat, data.lon);
    const distKm  = getDistanceKm(HOME.lat, HOME.lon, data.lat, data.lon).toLocaleString();
    const place   = data.city ? `${data.city}, ${data.country}` : data.country;

    // Place visitor dot on the map
    dotVisitor.setAttribute('cx', visitor.x);
    dotVisitor.setAttribute('cy', visitor.y);
    dotVisitor.setAttribute('visibility', 'visible');

    // Label next to visitor dot
    labelVisitor.setAttribute('x', visitor.x + 8);
    labelVisitor.setAttribute('y', visitor.y - 6);
    labelVisitor.setAttribute('visibility', 'visible');
    labelVisitor.textContent = place;

    // Draw the dashed line connecting home to visitor
    line.setAttribute('x1', HOME.svgX);
    line.setAttribute('y1', HOME.svgY);
    line.setAttribute('x2', visitor.x);
    line.setAttribute('y2', visitor.y);
    line.setAttribute('visibility', 'visible');

    // Update caption
    caption.innerHTML = `📍 I'm in <strong>Tajikistan</strong> — roughly <strong>${distKm} km</strong> from you in ${place}`;

  } catch {
    // If the lookup fails just show a static message — no broken UI
    caption.innerHTML = `📍 Based in <strong>Tajikistan</strong>, working with clients worldwide`;
  }
}

initMap();


/* ==========================================================================
 * NEWS CAROUSEL
 *
 * Priority system:
 *   1. Load own news from data/news.json — always displayed first
 *   2. Fill remaining slots with Dev.to public API (webdev articles)
 *   3. If both fail — show a friendly "check back later" message
 *
 * Carousel behaviour:
 *   - Shows 3 cards on desktop, 1 on mobile
 *   - Auto-advances every 5 seconds, pauses on hover
 *   - Arrow buttons + dot indicators for manual navigation
 * ==========================================================================
 */

async function initNews() {
  const track   = document.getElementById('news-track');
  const dotsEl  = document.getElementById('news-dots');
  const prevBtn = document.getElementById('news-prev');
  const nextBtn = document.getElementById('news-next');
  if (!track) return;

  let ownNews = [];
  let extNews = [];

  // Helper: fetch with timeout so we never hang forever
  async function fetchWithTimeout(url, ms = 6000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  }

  // --- 1. Fetch own news (priority) ---
  try {
    const res = await fetchWithTimeout('data/news.json');
    if (res.ok) ownNews = await res.json();
  } catch {
    // File missing or empty — fall back to external only
  }

  // --- 2. Fetch external news via HackerNews public API (no CORS issues) ---
  // Gets top stories, filters for web/JS/CSS/frontend topics
  try {
    const topRes  = await fetchWithTimeout('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (topRes.ok) {
      const ids = (await topRes.json()).slice(0, 30); // check first 30 stories

      // Fetch story details in parallel
      const stories = await Promise.all(
        ids.map(id =>
          fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );

      // Keep only stories relevant to web dev
      const keywords = ['javascript', 'css', 'html', 'web', 'frontend', 'react', 'node', 'typescript', 'browser', 'api', 'developer'];
      extNews = stories
        .filter(s => s && s.title && s.url && keywords.some(k => s.title.toLowerCase().includes(k)))
        .slice(0, 8)
        .map(s => ({
          title: s.title,
          desc:  `${s.score || 0} points · ${s.descendants || 0} comments on Hacker News`,
          url:   s.url,
          date:  s.time ? new Date(s.time * 1000).toISOString().slice(0, 10) : '',
          tag:   'Hacker News',
          own:   false
        }));
    }
  } catch {
    // HN unavailable — show own news only
  }

  // --- 3. Merge: own news first, external fills the rest ---
  const tagged = [
    ...ownNews.map(n => ({ ...n, own: true })),
    ...extNews.filter(e => !e.own)
  ].slice(0, 12); // max 12 cards

  // Clear skeleton placeholders
  track.innerHTML = '';

  if (tagged.length === 0) {
    track.innerHTML = `
      <div class="news-card" style="flex:1; align-items:center; justify-content:center; text-align:center;">
        <div style="font-size:1.5rem;">📡</div>
        <div style="color:var(--color-muted); font-size:0.9rem;">Нет доступных новостей — зайдите позже</div>
      </div>`;
    return;
  }

  // --- 4. Render cards ---
  tagged.forEach(item => {
    const isOwn    = item.own;
    const dateStr  = item.date ? new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const badgeClass = isOwn ? '' : 'news-card__badge--ext';
    const badgeIcon  = isOwn ? '🟢' : '🔗';
    const sourceName = isOwn ? 'SimorghDev' : (item.tag || 'Dev.to');

    const card = document.createElement('a');
    card.className  = `news-card${isOwn ? ' news-card--own' : ''}`;
    card.href       = item.url || '#';
    card.target     = '_blank';
    card.rel        = 'noopener noreferrer';
    card.innerHTML  = `
      <div class="news-card__badge ${badgeClass}">${badgeIcon} ${sourceName}</div>
      <div class="news-card__title">${item.title}</div>
      <div class="news-card__desc">${item.desc || ''}</div>
      <div class="news-card__footer">
        <span>${dateStr}</span>
        <span class="news-card__read">Читать →</span>
      </div>`;
    track.appendChild(card);
  });

  // --- 5. Carousel logic (scroll-snap based — no JS width math needed) ---
  const CARD_W  = 300 + 20; // card width + gap
  let current   = 0;
  let autoTimer = null;
  const viewport = track.parentElement;
  const total    = track.querySelectorAll('.news-card').length;

  function goTo(index) {
    current = Math.max(0, Math.min(index, total - 1));
    viewport.scrollTo({ left: current * CARD_W, behavior: 'smooth' });

    document.querySelectorAll('.news-dot').forEach((dot, i) => {
      dot.classList.toggle('news-dot--active', i === current);
    });
  }

  function next() { goTo(current + 1 >= total ? 0 : current + 1); }
  function prev() { goTo(current - 1 < 0 ? total - 1 : current - 1); }

  function startAuto() { stopAuto(); autoTimer = setInterval(next, 5000); }
  function stopAuto()  { if (autoTimer) clearInterval(autoTimer); }

  // Build dot indicators (one per card)
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = `news-dot${i === 0 ? ' news-dot--active' : ''}`;
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
    dotsEl.appendChild(dot);
  }

  prevBtn.addEventListener('click', () => { prev(); startAuto(); });
  nextBtn.addEventListener('click', () => { next(); startAuto(); });

  viewport.addEventListener('mouseenter', stopAuto);
  viewport.addEventListener('mouseleave', startAuto);

  startAuto();
}

initNews();


/*
 * Cursor glow — soft teal orb that follows the mouse
 * Uses requestAnimationFrame so it stays smooth without janking the page.
 * Hidden on touch devices (no cursor there anyway).
 */
(function initCursorGlow() {
  // Skip on touch-only devices — they have no cursor
  if (window.matchMedia('(hover: none)').matches) return;

  const orb = document.getElementById('cursor-glow');
  if (!orb) return;

  let mouseX = 0, mouseY = 0;
  let orbX   = 0, orbY   = 0;
  let rafId  = null;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Show on first move
    orb.style.opacity = '1';

    if (!rafId) loop();
  }, { passive: true });

  // Lazy follow — orb trails slightly behind for a soft feel
  function loop() {
    orbX += (mouseX - orbX) * 0.1;
    orbY += (mouseY - orbY) * 0.1;
    orb.style.left = orbX + 'px';
    orb.style.top  = orbY + 'px';

    // Keep looping only while still moving
    if (Math.abs(mouseX - orbX) > 0.5 || Math.abs(mouseY - orbY) > 0.5) {
      rafId = requestAnimationFrame(loop);
    } else {
      rafId = null;
    }
  }
})();


/*
 * Back-to-top button
 * Shows the button once the user has scrolled past 300px.
 * Clicking it scrolls smoothly back to the very top.
 */
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  // Toggle "visible" class based on scroll position
  backToTopBtn.classList.toggle('visible', window.scrollY > 300);
}, { passive: true }); // passive = no janky scroll blocking

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
