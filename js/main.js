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
