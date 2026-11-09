/* Scent Atlas · Singapore Edition
   ---------------------------------------------------------------
   How it works:
   1. Load the five JSON files in /data.
   2. Read the part of the URL after "#" (e.g. #/perfume/nanyang).
   3. Draw the matching page into <main id="app">.

   The key trick: every note in perfumes.json is checked against the
   "aliases" in notes.json. If it matches, it becomes a link to its
   Singapore story. You never link notes by hand.
*/

const DATA = {};            // filled by loadData()
const app = document.getElementById("app");

/* ---------- Helpers ---------- */

// Make text safe to put inside HTML
function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Find the Singapore note (if any) for a perfume note like "Jasmine"
function findStoryNote(noteName) {
  const key = noteName.trim().toLowerCase();
  return DATA.notes.find(n => n.aliases.includes(key)) || null;
}

// All notes in a perfume, whether it has a pyramid or a flat list
function allNotesOf(perfume) {
  return [...(perfume.top || []), ...(perfume.heart || []), ...(perfume.base || []), ...(perfume.notes || [])];
}

// The Singapore story notes inside one perfume (no duplicates)
function storyNotesOf(perfume) {
  const found = allNotesOf(perfume).map(findStoryNote).filter(Boolean);
  return [...new Map(found.map(n => [n.id, n])).values()];
}

// Perfumes that contain a given Singapore note
function perfumesWith(noteId) {
  return DATA.perfumes.filter(p => storyNotesOf(p).some(n => n.id === noteId));
}

function brandById(id) { return DATA.brands.find(b => b.id === id); }
function noteById(id) { return DATA.notes.find(n => n.id === id); }

// One note chip: linked + coloured if it has a story, plain if not
function noteChip(noteName) {
  const story = findStoryNote(noteName);
  if (!story) return `<span class="chip">${esc(noteName)}</span>`;
  return `<a class="chip story c-${story.color}" href="#/notes/${story.id}">${noteIcon(story.id, 18)}${esc(noteName)}</a>`;
}

function storyChip(note) {
  return `<a class="chip story c-${note.color}" href="#/notes/${note.id}">${noteIcon(note.id, 18)}${esc(note.name)}</a>`;
}

function sourcesList(sources) {
  return `<p class="sources">Sources: ${sources.map(s =>
    `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(" · ")}</p>`;
}

/* ---------- Pages ---------- */

function pageHome() {
  const featured = DATA.perfumes.slice(0, 3);
  return `
  <section class="hero">
    <div class="hero-blob"></div><div class="hero-blob two"></div>
    <div class="hero-art" aria-hidden="true">${DATA.perfumes.slice(0, 3).map(p => bottleSVG(p, 130)).join("")}</div>
    <h1>Smell the story<br>of a place</h1>
    <p class="hand">Local perfumes · the history in every note</p>
    <p class="lead">A guide to Singapore's homegrown perfumes, the history behind their notes, and where to smell them for yourself.</p>
    <div class="btn-row" style="margin-top:20px">
      <a class="btn" href="#/trail">Walk the scent trail</a>
      <a class="btn ghost" href="#/notes">Explore the notes</a>
    </div>
    <div class="hero-chips">${DATA.notes.map(storyChip).join("")}</div>
  </section>

  <section class="section">
    <h2>Start here</h2>
    <div class="grid">
      ${homeCard("Notes", `${DATA.notes.length} notes with a Singapore story, from pandan to agarwood.`, "#/notes", "olive")}
      ${homeCard("Perfumes", "Local perfumes, with every note linked to its history.", "#/perfumes", "coral")}
      ${homeCard("Scent trail", "One walkable day: garlands, attar, spices, incense.", "#/trail", "pink")}
      ${homeCard("Brands", `${DATA.brands.length} homegrown perfume houses, old and new.`, "#/brands", "maroon")}
      ${homeCard("Experiences", "Make your own perfume, or visit the places behind the notes.", "#/experiences", "navy")}
    </div>
  </section>

  <section class="section">
    <h2>Experience it in person</h2>
    <div class="grid">
      ${homeCard("Scent walks", "Small-group guided walks through the places behind the notes.", "#/walks", "coral")}
      ${homeCard("Singapore in Six Scents", "A discovery set of local perfumes, each with its story.", "#/discovery-set", "pink")}
      ${homeCard("For businesses", "Scent storytelling, team trails and insight for brands and hotels.", "#/for-business", "olive")}
    </div>
  </section>

  <section class="section">
    <h2>Perfumes to start with</h2>
    <div class="grid">${featured.map(perfumeCard).join("")}</div>
  </section>`;
}

function homeCard(title, text, href, color) {
  return `<a class="card" href="${href}">
    <div class="swatch-top bg-${color}"></div>
    <h3>${title}</h3><p>${text}</p></a>`;
}

function perfumeCard(p) {
  const brand = brandById(p.brand);
  const stories = storyNotesOf(p);
  const tint = stories[0] ? (stories[0].color === "navy" ? "coral" : stories[0].color) : "pink";
  return `<a class="card perfume-card" href="#/perfume/${p.id}">
    <div class="card-art tint-${tint}">${perfumeVisual(p, 100)}</div>
    <span class="kicker">${esc(brand ? brand.name : "")}</span>
    <h3>${esc(p.name)}</h3>
    <p>${esc(p.about)}</p>
    <div class="chips">${stories.map(n =>
      `<span class="chip story c-${n.color}" style="pointer-events:none">${noteIcon(n.id, 16)}${esc(n.name)}</span>`).join("")}</div>
  </a>`;
}

function pagePerfumes() {
  return `
  <h1>Perfumes</h1>
  <p class="lead">Each perfume links its notes to Singapore's history. Filled notes have a story; outlined ones are part of the scent but don't have a Singapore link.</p>
  <div class="grid section" style="margin-top:28px">${DATA.perfumes.map(perfumeCard).join("")}</div>`;
}

function pagePerfume(id) {
  const p = DATA.perfumes.find(x => x.id === id);
  if (!p) return pageNotFound();
  const brand = brandById(p.brand);
  const stories = storyNotesOf(p);

  const hasPyramid = (p.top || p.heart || p.base);
  const tier = (label, cls, list) => list && list.length
    ? `<div class="tier ${cls}"><div class="tier-label">${label}</div><div class="chips">${list.map(noteChip).join("")}</div></div>` : "";

  const notesHtml = hasPyramid
    ? `<div class="pyramid">${tier("Top", "top", p.top)}${tier("Heart", "heart", p.heart)}${tier("Base", "base", p.base)}</div>`
    : `<div class="tier"><div class="tier-label">Notes</div><div class="chips">${p.notes.map(noteChip).join("")}</div></div>`;

  return `
  <a class="back" href="#/perfumes">← All perfumes</a>
  <div class="perfume-head">
    <div class="perfume-intro">
      <div class="bottle-stage">${perfumeVisual(p, 150)}</div>
      <div>
      <p class="brand-line">${esc(brand ? brand.name : "")}</p>
      <h1>${esc(p.name)}</h1>
      <p class="lead">${esc(p.about)}</p>
      <p class="muted">${esc(p.type)}${brand && brand.founded ? ` · Brand founded ${esc(brand.founded)}` : ""}</p>
      ${brand ? `<p><a href="#/brands">About ${esc(brand.name)}</a></p>` : ""}
      </div>
    </div>
    <div>
      ${notesHtml}
      ${p.notesComplete ? "" : `<p class="notice">We've only found part of this perfume's notes so far. Full list coming soon.</p>`}
    </div>
  </div>

  <section class="section">
    <h2>The stories in this bottle</h2>
    ${stories.length ? `<div class="grid">${stories.map(n => `
      <a class="card story-card" href="#/notes/${n.id}" style="border-left-color:var(--${n.color})">
        <div class="icon-row">${noteIcon(n.id, 44)}<span class="kicker">${esc(n.name)}</span></div>
        <p class="tagline">${esc(n.tagline)}</p>
        <p>${esc(n.story[0])}</p>
        <p><strong>Read the full story →</strong></p>
      </a>`).join("")}</div>`
      : `<p>None of this perfume's notes are linked to a Singapore story yet.</p>`}
  </section>
  <section class="section">${sourcesList(p.sources)}</section>`;
}

function pageNotes(focusId) {
  const trailStopsFor = id => DATA.trail.stops.filter(s => s.notes.includes(id));
  const placesFor = id => DATA.experiences.filter(e => e.notes.includes(id));

  setTimeout(() => {   // jump to a note if the URL asked for one
    if (focusId) document.getElementById("note-" + focusId)?.scrollIntoView();
  }, 0);

  return `
  <h1>The notes</h1>
  <p class="lead">${DATA.notes.length} scents with a documented place in Singapore's history, from the spice trade to the national flower.</p>
  <div class="note-index">${DATA.notes.map(storyChip).join("")}</div>

  ${DATA.notes.map(n => {
    const perfumes = perfumesWith(n.id);
    const stops = trailStopsFor(n.id);
    const places = placesFor(n.id);
    return `
    <article class="note-block" id="note-${n.id}">
      <div class="note-banner c-${n.color}">
        <div>
          <h2>${esc(n.name)}</h2>
          <div class="local">${esc(n.local)}</div>
        </div>
        <div class="icon-medallion">${noteIcon(n.id, 64)}</div>
      </div>
      <div class="note-body">
        <div>
          <p class="hand" style="color:var(--maroon);margin-top:0">${esc(n.tagline)}</p>
          ${n.story.map(s => `<p>${esc(s)}</p>`).join("")}
          <div class="chips" style="margin:12px 0">${n.communities.map(c => `<span class="chip">${esc(c)}</span>`).join("")}</div>
          ${sourcesList(n.sources)}
        </div>
        <div>
          <h3>Perfumes with this note</h3>
          ${perfumes.length
            ? `<div class="mini-bottles">${perfumes.map(p => `<a class="mini-bottle" href="#/perfume/${p.id}">${perfumeVisual(p, 46)}<span><strong>${esc(p.name)}</strong><br><small>${esc(brandById(p.brand)?.name || "")}</small></span></a>`).join("")}</div>`
            : `<p class="muted">None listed yet.</p>`}
          <h3 style="margin-top:22px">Smell it in Singapore</h3>
          ${places.length || stops.length
            ? `<ul>${places.map(e => `<li>${esc(e.name)} <span class="muted">(${esc(e.area)})</span></li>`).join("")}
                 ${stops.length ? `<li><a href="#/trail">On the scent trail</a></li>` : ""}</ul>`
            : `<p class="muted">Coming soon.</p>`}
        </div>
      </div>
    </article>`;
  }).join("")}`;
}

function pageTrail() {
  const t = DATA.trail;
  return `
  <h1>${esc(t.title)}</h1>
  <p class="lead">${esc(t.intro)}</p>
  <ol class="trail">
    ${t.stops.map(s => `
      <li>
        <div class="time">${esc(s.time)}</div>
        <div class="dot ${s.notes.length ? "has-icon" : "quiet"}">${s.notes.length ? noteIcon(s.notes[0], 30) : ""}</div>
        <div>
          <div class="area">${esc(s.area)}</div>
          <h3>${esc(s.name)}</h3>
          <p style="margin:0 0 8px">${esc(s.blurb)}</p>
          <div class="chips">${s.notes.map(id => storyChip(noteById(id))).join("")}</div>
        </div>
      </li>`).join("")}
  </ol>`;
}

let brandFilter = "All";
function pageBrands() {
  const tiers = ["All", "Heritage", "Indie", "New & small", "Online-first"];
  const list = DATA.brands.filter(b => brandFilter === "All" || b.tier === brandFilter);
  return `
  <h1>Brands</h1>
  <p class="lead">Homegrown perfume houses, from a 1933 attar shop to online-only labels launched in 2025.</p>
  <div class="filter" role="group" aria-label="Filter by tier">
    ${tiers.map(t => `<button data-tier="${t}" aria-pressed="${t === brandFilter}">${t}</button>`).join("")}
  </div>
  <div class="grid">${list.map(b => {
    const perfumes = DATA.perfumes.filter(p => p.brand === b.id);
    return `<div class="card">
      <span class="kicker">${esc(b.tier)}${b.founded ? " · since " + esc(b.founded) : ""}</span>
      <h3>${esc(b.name)}</h3>
      <p>${esc(b.story)}</p>
      <p class="muted">${esc(b.makes)}</p>
      <p><strong>Where:</strong> ${esc(b.address)}</p>
      ${perfumes.length ? `<p>${perfumes.map(p => `<a href="#/perfume/${p.id}">${esc(p.name)}</a>`).join(" · ")}</p>` : ""}
      <div class="links">
        <a href="${esc(b.url)}" target="_blank" rel="noopener">Source ↗</a>
        ${b.check ? `<span class="badge check">To verify</span>` : ""}
      </div>
    </div>`;
  }).join("")}</div>`;
}

function pageExperiences() {
  const block = (kind, title, intro) => {
    const items = DATA.experiences.filter(e => e.kind === kind);
    return `<section class="section">
      <h2>${title}</h2><p class="lead">${intro}</p>
      <div class="grid" style="margin-top:20px">${items.map(e => `
        <div class="card">
          <span class="kicker">${esc(e.area)} · ${esc(e.host)}</span>
          <h3>${esc(e.name)}</h3>
          <p>${esc(e.what)}</p>
          <p class="muted">${esc(e.address)}</p>
          ${e.notes.length ? `<div class="chips">${e.notes.map(id => storyChip(noteById(id))).join("")}</div>` : ""}
          <div class="links">
            ${e.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}
            ${e.check ? `<span class="badge check">To verify</span>` : ""}
          </div>
        </div>`).join("")}</div></section>`;
  };
  return `
  <h1>Experiences</h1>
  <p class="lead">Make your own perfume, or go and smell the history for yourself. Book directly or through the third-party links.</p>
  ${block("Workshop", "Make your own", "Perfume-making workshops around the island.")}
  ${block("Place", "Smell the history", "Gardens, streets and temples where the notes come from. Most are free.")}`;
}


/* ---------- Offer pages (walks, discovery set, business) ---------- */

// The "register interest" button. Shows "Opening soon" until a form link is added in offers.json
function interestButton(url, label) {
  return url
    ? `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`
    : `<span class="btn btn-disabled" aria-disabled="true">${esc(label)} · opening soon</span>`;
}

function offerHero(o, color) {
  return `<section class="offer-hero bg-${color}">
    <p class="hand">${esc(o.tagline)}</p>
    <h1>${esc(o.title)}</h1>
    <p class="lead">${esc(o.intro)}</p>
  </section>`;
}

function pageWalks() {
  const w = DATA.offers.walks;
  return `
  ${offerHero(w, "coral")}
  <div class="facts">
    <div><span class="kicker">When</span><p>${esc(w.dates)}</p></div>
    <div><span class="kicker">Group</span><p>${esc(w.groupSize)}</p></div>
    <div><span class="kicker">Price</span><p>${esc(w.price)}</p></div>
  </div>

  <section class="section">
    <h2>Choose your walk</h2>
    <div class="grid">${w.options.map(opt => `
      <div class="card">
        <span class="kicker">${esc(opt.duration)}</span>
        <h3>${esc(opt.name)}</h3>
        <ol class="stop-list">${opt.stops.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
        <div class="chips">${opt.notes.map(id => storyChip(noteById(id))).join("")}</div>
      </div>`).join("")}
    </div>
  </section>

  <section class="section two-col">
    <div><h3>Included</h3><ul>${w.included.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>
    <div><h3>Not included</h3><ul>${w.notIncluded.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>
  </section>

  <section class="section cta-band">
    <h2>Want to join a walk?</h2>
    <p>Dates are limited. Register your interest and you'll be the first to hear when bookings open.</p>
    ${interestButton(w.interestUrl, "Register interest")}
    <p class="muted" style="margin-top:14px">Prefer to go on your own? <a href="#/trail">Use the free self-guided trail</a>.</p>
  </section>`;
}

function pageSet() {
  const st = DATA.offers.set;
  const items = st.lineup.map(l => {
    const p = DATA.perfumes.find(x => x.id === l.perfume);
    const n = noteById(l.note);
    const b = p ? brandById(p.brand) : null;
    return { p, n, b };
  }).filter(x => x.p && x.n);

  return `
  ${offerHero(st, "pink")}
  <p class="notice">${esc(st.status)}</p>

  <section class="section">
    <h2>The six</h2>
    <div class="grid">${items.map(({ p, n, b }, i) => `
      <a class="card story-card" href="#/perfume/${p.id}" style="border-left-color:var(--${n.color === "cream" ? "olive" : n.color})">
        <div class="set-art">${perfumeVisual(p, 70)}${noteIcon(n.id, 40)}</div>
        <span class="kicker">No. ${i + 1} · ${esc(n.name)}</span>
        <h3>${esc(p.name)}</h3>
        <p class="muted">${esc(b ? b.name : "")}</p>
        <p class="tagline">${esc(n.tagline)}</p>
      </a>`).join("")}
    </div>
  </section>

  <section class="section two-col">
    <div><h3>In the box</h3><ul>${st.inTheBox.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>
    <div><h3>Price</h3><p>${esc(st.price)}</p></div>
  </section>

  <section class="section cta-band">
    <h2>Join the waitlist</h2>
    <p>Tell us you're interested and you'll hear first when the set is ready.</p>
    ${interestButton(st.interestUrl, "Join the waitlist")}
  </section>`;
}

function pageBusiness() {
  const bz = DATA.offers.business;
  return `
  ${offerHero(bz, "olive")}

  <section class="section">
    <h2>What I offer</h2>
    <div class="grid">${bz.services.map(sv => `
      <div class="card"><h3>${esc(sv.name)}</h3><p>${esc(sv.what)}</p></div>`).join("")}
    </div>
  </section>

  <section class="section">
    <h2>The market already exists</h2>
    <p class="lead">Singapore organisations already invest in scent. These are public examples, not my clients:</p>
    <ul class="proof">${bz.proof.map(pr => `<li>${esc(pr.text)} <a href="${esc(pr.url)}" target="_blank" rel="noopener">Source ↗</a></li>`).join("")}</ul>
  </section>

  <section class="section cta-band">
    <h2>Let's talk</h2>
    <p>${esc(bz.about)}</p>
    ${interestButton(bz.interestUrl, "Send an enquiry")}
  </section>`;
}


/* ---------- World map (the atlas cover) ---------- */

function pinPercent(id) {
  const [x, y] = WORLD_MAP.pins[id];
  return { left: (x / WORLD_MAP.width) * 100, top: (y / WORLD_MAP.height) * 100 };
}

function pageWorld() {
  const eds = DATA.editions;
  const live = eds.filter(e => e.status === "live");
  const editionCountries = new Set(eds.map(e => e.name));

  const countries = WORLD_MAP.countries.map(c =>
    `<path d="${c.d}" class="land ${editionCountries.has(c.name) ? "land-edition" : ""}"><title>${esc(c.name)}</title></path>`).join("");

  // Grey dots for editions still to come
  const dots = eds.filter(e => e.status !== "live" && e.showDot !== false).map(e => {
    const p = pinPercent(e.id);
    return `<button class="map-dot ${e.status}" style="left:${p.left}%;top:${p.top}%" data-tip="${esc(e.name)}: ${esc(e.tagline)}" aria-label="${esc(e.name)}, ${esc(e.tagline)}"></button>`;
  }).join("");

  // Red pins + pop-up windows for live editions
  const pins = live.map(e => {
    const p = pinPercent(e.id);
    return `
    <button class="map-pin" style="left:${p.left}%;top:${p.top}%" data-edition="${e.id}" aria-label="Open ${esc(e.name)}" aria-expanded="false">
      <span class="pin-pulse"></span>
      <svg viewBox="0 0 40 56" width="34" height="48" aria-hidden="true">
        <path d="M20 54 C20 54 4 32 4 20 A16 16 0 0 1 36 20 C36 32 20 54 20 54 Z" fill="#D63B2F" stroke="#0B0F2E" stroke-width="3"/>
        <circle cx="20" cy="20" r="6.5" fill="#FAF5CF" stroke="#0B0F2E" stroke-width="2.5"/>
      </svg>
    </button>`;
  }).join("");

  const popups = live.map(e => {
    const p = pinPercent(e.id);
    return `
    <div class="map-popup" id="popup-${e.id}" style="left:${p.left}%;top:${p.top}%" role="dialog" aria-label="${esc(e.name)}" hidden>
      <button class="popup-close" aria-label="Close">×</button>
      <div class="popup-art">${(e.icons || []).map(id => noteIcon(id, 34)).join("")}</div>
      <span class="kicker">${esc(e.edition)} · Live</span>
      <h3>${esc(e.name)}</h3>
      <p class="hand popup-tag">${esc(e.tagline)}</p>
      <p class="popup-stats"><strong>${DATA.notes.length}</strong> notes · <strong>${DATA.perfumes.length}</strong> perfumes · <strong>${DATA.brands.length}</strong> brands · <strong>1</strong> scent trail</p>
      <a class="btn" href="${esc(e.link)}">Enter ${esc(e.name)} →</a>
    </div>`;
  }).join("");

  const stamps = eds.map(e => `
    <${e.status === "live" ? `a href="${esc(e.link)}"` : "div"} class="stamp stamp-${e.status}">
      <span class="stamp-status">${e.status === "live" ? esc(e.edition) : e.status === "origin" ? "Origin story" : "Coming soon"}</span>
      <strong>${esc(e.name)}</strong>
      <small>${esc(e.status === "soon" ? e.tagline.replace(/^Coming soon:?\s*/, "") || "Notes to be mapped" : e.tagline)}</small>
    </${e.status === "live" ? "a" : "div"}>`).join("");

  return `
  <section class="world-intro">
    <p class="hand">An atlas of scent</p>
    <h1>Smell the world,<br>one city at a time</h1>
    <p class="lead">Each edition maps a place through the scents in its history: the spices it traded, the flowers it prays with, the breakfasts it wakes up to. Tap the red pin to begin.</p>
  </section>

  <section class="map-frame">
    <div class="map-cartouche"><span class="hand">Scent Atlas</span><small>Edition 01 · 2026</small></div>
    <div class="map-wrap">
      <div class="map-canvas">
        <svg class="world-svg" viewBox="0 0 ${WORLD_MAP.width} ${WORLD_MAP.height}" role="img" aria-label="World map with Scent Atlas editions">
          <path d="${WORLD_MAP.sphere}" class="ocean"/>
          <path d="${WORLD_MAP.graticule}" class="graticule"/>
          ${countries}
          <path d="${WORLD_MAP.sphere}" class="sphere-edge"/>
        </svg>
        ${dots}
        ${pins}
        <div class="map-tip" hidden></div>
      </div>
      ${popups}
    </div>
    ${compassRose()}
  </section>

  <section class="section">
    <h2>Editions</h2>
    <div class="stamps">${stamps}</div>
  </section>`;
}

function compassRose() {
  return `<svg class="compass" viewBox="0 0 100 100" width="92" height="92" aria-hidden="true">
    <circle cx="50" cy="50" r="30" fill="#FAF5CF" stroke="#0B0F2E" stroke-width="2"/>
    <circle cx="50" cy="50" r="24" fill="none" stroke="#0B0F2E" stroke-width="1" stroke-dasharray="2 3"/>
    <path d="M50 8 L57 50 L50 92 L43 50 Z" fill="#E57B62" stroke="#0B0F2E" stroke-width="2"/>
    <path d="M8 50 L50 43 L92 50 L50 57 Z" fill="#B8B455" stroke="#0B0F2E" stroke-width="2"/>
    <path d="M50 8 L57 50 L43 50 Z" fill="#6B1C1E"/>
    <circle cx="50" cy="50" r="4" fill="#0B0F2E"/>
    <text x="50" y="6" text-anchor="middle" font-family="Rozha One, Georgia, serif" font-size="11" fill="#0B0F2E">N</text>
  </svg>`;
}

function setUpWorldMap() {
  const wrap = app.querySelector(".map-wrap");
  if (!wrap) return;
  const tip = wrap.querySelector(".map-tip");

  function closeAll() {
    wrap.querySelectorAll(".map-popup").forEach(p => p.hidden = true);
    wrap.querySelectorAll(".map-pin").forEach(b => b.setAttribute("aria-expanded", "false"));
  }

  wrap.querySelectorAll(".map-pin").forEach(pin => {
    pin.addEventListener("click", ev => {
      ev.stopPropagation();
      const popup = document.getElementById("popup-" + pin.dataset.edition);
      const willOpen = popup.hidden;
      closeAll();
      popup.hidden = !willOpen;
      pin.setAttribute("aria-expanded", String(willOpen));
    });
  });
  wrap.querySelectorAll(".popup-close").forEach(b => b.addEventListener("click", ev => { ev.stopPropagation(); closeAll(); }));
  wrap.querySelectorAll(".map-popup").forEach(p => p.addEventListener("click", ev => ev.stopPropagation()));
  wrap.addEventListener("click", closeAll);

  // Little tooltips on the "coming soon" dots
  wrap.querySelectorAll(".map-dot").forEach(dot => {
    const show = () => { tip.textContent = dot.dataset.tip; tip.style.left = dot.style.left; tip.style.top = dot.style.top; tip.hidden = false; };
    dot.addEventListener("mouseenter", show);
    dot.addEventListener("focus", show);
    dot.addEventListener("click", ev => { ev.stopPropagation(); show(); });
    dot.addEventListener("mouseleave", () => tip.hidden = true);
    dot.addEventListener("blur", () => tip.hidden = true);
  });
}

function pageNotFound() {
  return `<h1>Lost the scent</h1><p class="lead">That page doesn't exist. <a href="#/">Back to the world map</a>.</p>`;
}

/* ---------- Router ---------- */

function render() {
  const parts = location.hash.replace(/^#\/?/, "").split("/"); // "#/perfume/nanyang" -> ["perfume","nanyang"]
  const [page, id] = parts;

  const routes = {
    "": pageWorld,
    "singapore": pageHome,
    "notes": () => pageNotes(id),
    "perfumes": pagePerfumes,
    "perfume": () => pagePerfume(id),
    "trail": pageTrail,
    "brands": pageBrands,
    "experiences": pageExperiences,
    "walks": pageWalks,
    "discovery-set": pageSet,
    "for-business": pageBusiness,
  };
  app.innerHTML = (routes[page] || pageNotFound)();

  // The world map is the atlas cover; every other page belongs to the Singapore edition
  const onWorld = page === "";
  document.body.classList.toggle("is-world", onWorld);
  document.querySelector(".wordmark-sub").textContent = onWorld ? "Smell the world" : "Singapore edition";
  document.querySelector(".wordmark").setAttribute("href", onWorld ? "#/" : "#/singapore");
  if (onWorld) setUpWorldMap();

  // Highlight the current menu item
  document.querySelectorAll(".site-nav a").forEach(a => {
    const target = a.getAttribute("href").replace("#/", "");
    a.classList.toggle("active", target === page || (page === "perfume" && target === "perfumes"));
  });

  if (!(page === "notes" && id)) window.scrollTo(0, 0);

  // Brand filter buttons
  app.querySelectorAll(".filter button").forEach(btn =>
    btn.addEventListener("click", () => { brandFilter = btn.dataset.tier; render(); }));
}

/* ---------- Start ---------- */

async function loadData() {
  const files = ["notes", "perfumes", "brands", "experiences", "trail", "offers", "editions"];
  const results = await Promise.all(files.map(f => fetch(`data/${f}.json`).then(r => r.json())));
  files.forEach((f, i) => DATA[f] = results[i]);
}

loadData()
  .then(() => { render(); window.addEventListener("hashchange", render); })
  .catch(err => {
    console.error(err);
    app.innerHTML = `<h1>Couldn't load the data</h1>
      <p class="lead">If you opened index.html straight from your computer, browsers block the data files.
      Open the GitHub Pages link instead (or run a local server).</p>`;
  });
