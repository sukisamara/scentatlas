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


/* ---------- World map (the atlas cover) ----------
   Drawn with d3 from Natural Earth data (data/world.json).
   - Click any country (or its postage stamp) to zoom in and see its cities.
   - Cities with an edition get a red pin; the rest are "coming soon".
   - Editions and their cities are set in data/editions.json.
*/

const MAP_W = 1000, MAP_H = 520;
const BIG_COUNTRY_STAMPS = 32;   // how many of the largest countries get a postage stamp

function pageWorld() {
  const eds = DATA.editions;
  const stamps = eds.map(e => `
    <${e.status === "live" ? `a href="${esc(e.link)}"` : `button type="button" data-zoom="${esc(e.country)}"`} class="stamp stamp-${e.status}">
      <span class="stamp-status">${e.status === "live" ? esc(e.edition) : e.status === "origin" ? "Origin story" : "Coming soon"}</span>
      <strong>${esc(e.name)}</strong>
      <small>${esc(e.status === "soon" ? e.tagline.replace(/^Coming soon:?\s*/, "") || "Notes to be mapped" : e.tagline)}</small>
    </${e.status === "live" ? "a" : "button"}>`).join("");

  return `
  <section class="world-intro">
    <p class="hand">An atlas of scent</p>
    <h1>Smell the world,<br>one city at a time</h1>
    <p class="lead">Each edition maps a place through the scents in its history: the spices it traded, the flowers it prays with, the breakfasts it wakes up to. Tap the red pin to begin, or click any country to zoom in.</p>
  </section>

  <section class="map-frame">
    <div class="map-cartouche"><span class="hand">Scent Atlas</span><small>Edition 01 · 2026</small></div>
    <div class="map-wrap">
      <div class="map-canvas">
        <svg class="world-svg" viewBox="0 0 ${MAP_W} ${MAP_H}" role="img" aria-label="Interactive world map of Scent Atlas editions"></svg>
        <div class="map-tip" hidden></div>
        <div class="zoom-panel" hidden></div>
      </div>
      <div class="map-popup" role="dialog" hidden></div>
    </div>
    ${compassRose()}
    <p class="map-credit">Map: Natural Earth. Cities: GeoNames (CC BY 4.0).</p>
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

// The biggest single piece of a country (so France zooms to France, not French Guiana)
function mainlandOf(feature) {
  if (feature.geometry.type !== "MultiPolygon") return feature;
  let best = null, bestArea = -1;
  for (const coords of feature.geometry.coordinates) {
    const poly = { type: "Feature", geometry: { type: "Polygon", coordinates: coords } };
    const a = d3.geoArea(poly);
    if (a > bestArea) { bestArea = a; best = poly; }
  }
  return best;
}

const PIN_PATH = "M0 0 C0 0 -12 -16 -12 -26 A12 12 0 0 1 12 -26 C12 -16 0 0 0 0 Z";

function setUpWorldMap() {
  const canvas = app.querySelector(".map-canvas");
  if (!canvas || typeof d3 === "undefined") return;

  const svg = d3.select(canvas).select("svg");
  const tip = canvas.querySelector(".map-tip");
  const panel = canvas.querySelector(".zoom-panel");
  const popup = app.querySelector(".map-popup");

  const countries = topojson.feature(DATA.world, DATA.world.objects.countries).features
    .filter(f => f.properties.name !== "Antarctica");
  const projection = d3.geoNaturalEarth1().fitExtent([[10, 10], [MAP_W - 10, MAP_H - 10]], { type: "Sphere" });
  const path = d3.geoPath(projection);

  const editionByCountry = new Map(DATA.editions.map(e => [e.country, e]));
  let k = 1;            // current zoom level
  let current = null;   // the country we're zoomed into

  // Layers
  const layer = svg.append("g").attr("class", "zoom-layer");
  layer.append("path").datum({ type: "Sphere" }).attr("class", "ocean").attr("d", path);
  layer.append("path").datum(d3.geoGraticule10()).attr("class", "graticule").attr("d", path);

  const land = layer.append("g").selectAll("path").data(countries).join("path")
    .attr("class", d => "land" + (editionByCountry.has(d.properties.name) ? " land-edition" : ""))
    .attr("d", path)
    .attr("tabindex", 0)
    .attr("aria-label", d => d.properties.name)
    .on("click", (ev, d) => { ev.stopPropagation(); zoomTo(d); })
    .on("keydown", (ev, d) => { if (ev.key === "Enter") zoomTo(d); })
    .on("mousemove", (ev, d) => showTip(ev, d.properties.name + (current ? "" : " · click to explore")))
    .on("mouseleave", hideTip);

  layer.append("path").datum({ type: "Sphere" }).attr("class", "sphere-edge").attr("d", path);

  // Postage stamps on the biggest countries
  // Largest countries first; skip any stamp that would overlap one already placed, and skip edition countries (they have pins)
  const big = [], placed = [];
  for (const f of [...countries].sort((a, b) => d3.geoArea(b) - d3.geoArea(a))) {
    if (big.length >= BIG_COUNTRY_STAMPS) break;
    if (editionByCountry.has(f.properties.name)) continue;
    const [x, y] = path.centroid(mainlandOf(f));
    const w = Math.max(30, shortName(f.properties.name).length * 4.1 + 10);
    const box = [x - w / 2 - 3, y - 12, x + w / 2 + 3, y + 12];
    if (placed.some(b => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]))) continue;
    placed.push(box); big.push(f);
  }
  const stampLayer = layer.append("g").attr("class", "stamp-layer");
  const stampG = stampLayer.selectAll("g").data(big).join("g")
    .attr("class", "map-stamp")
    .attr("transform", d => { const [x, y] = path.centroid(mainlandOf(d)); return `translate(${x},${y})`; })
    .on("click", (ev, d) => { ev.stopPropagation(); zoomTo(d); });
  stampG.each(function (d) {
    const name = shortName(d.properties.name);
    const w = Math.max(30, name.length * 4.1 + 10);
    const g = d3.select(this).append("g").attr("class", "stamp-body")
      .attr("transform", `rotate(${(hashOf(name) % 9) - 4})`);
    g.append("rect").attr("x", -w / 2).attr("y", -9).attr("width", w).attr("height", 18).attr("class", "stamp-paper");
    g.append("rect").attr("x", -w / 2 + 2.5).attr("y", -6.5).attr("width", w - 5).attr("height", 13).attr("class", "stamp-inner");
    g.append("text").attr("y", 2.6).attr("text-anchor", "middle").text(name.toUpperCase());
  });

  // City pins (one group per country, drawn only when zoomed in)
  const cityLayer = layer.append("g").attr("class", "city-layer");

  // World-level pins for live editions and origin story
  const worldPins = layer.append("g").attr("class", "world-pins");
  DATA.editions.filter(e => e.city).forEach(e => {
    const city = (DATA.cities[e.country] || []).find(c => c.n === e.city);
    if (!city) return;
    const [x, y] = projection([city.lon, city.lat]);
    const g = worldPins.append("g").attr("class", "pin pin-" + e.status).attr("transform", `translate(${x},${y})`)
      .attr("tabindex", 0).attr("role", "button").attr("aria-label", `${e.city}, ${e.name}`)
      .on("click", (ev) => { ev.stopPropagation(); openPopup(e, city, ev); })
      .on("keydown", (ev) => { if (ev.key === "Enter") openPopup(e, city, ev); });
    const s = g.append("g").attr("class", "pin-scale");
    if (e.status === "live") s.append("circle").attr("class", "pin-pulse").attr("r", 6);
    s.append("path").attr("d", PIN_PATH).attr("class", "pin-shape");
    s.append("circle").attr("cy", -26).attr("r", 5).attr("class", "pin-eye");
  });
  // Grey dots for countries coming soon (at their capital)
  DATA.editions.filter(e => e.status === "soon").forEach(e => {
    const list = DATA.cities[e.country] || [];
    const cap = list.find(c => c.cap) || list[0];
    if (!cap) return;
    const [x, y] = projection([cap.lon, cap.lat]);
    worldPins.append("circle").attr("class", "soon-dot").attr("cx", x).attr("cy", y).attr("r", 4)
      .on("mousemove", ev => showTip(ev, `${e.name}: ${e.tagline}`)).on("mouseleave", hideTip)
      .on("click", (ev) => { ev.stopPropagation(); zoomTo(countries.find(c => c.properties.name === e.country)); });
  });
  sizePins();

  // ----- behaviour -----

  function shortName(n) {
    return ({ "United States of America": "USA", "Russia": "Russia", "Dem. Rep. Congo": "DR Congo",
      "Central African Rep.": "C. Africa", "Saudi Arabia": "Saudi", "South Africa": "S. Africa" })[n] || n;
  }

  function sizePins() {
    // Keep pins and labels the same size on screen whatever the zoom
    layer.selectAll(".pin-scale, .city-scale").attr("transform", `scale(${1 / k})`);
    layer.selectAll(".soon-dot").attr("r", 4 / k).attr("stroke-width", 1.5 / k);
  }

  function zoomTo(feature) {
    if (!feature) return;
    closePopup(); hideTip();
    current = feature;
    const name = feature.properties.name;
    const [[x0, y0], [x1, y1]] = path.bounds(mainlandOf(feature));
    const dx = Math.max(x1 - x0, 1), dy = Math.max(y1 - y0, 1);
    k = Math.min(60, 0.8 / Math.max(dx / MAP_W, dy / MAP_H));
    const tx = MAP_W / 2 - k * (x0 + x1) / 2, ty = MAP_H / 2 - k * (y0 + y1) / 2;

    land.classed("land-active", d => d === feature).classed("land-dim", d => d !== feature);
    canvas.classList.add("zoomed");
    drawCities(feature);
    layer.transition().duration(900).ease(d3.easeCubicInOut)
      .attr("transform", `translate(${tx},${ty}) scale(${k})`)
      .on("start", sizePins);
    showPanel(name);
  }

  function zoomOut() {
    closePopup(); hideTip();
    current = null; k = 1;
    land.classed("land-active", false).classed("land-dim", false);
    canvas.classList.remove("zoomed");
    cityLayer.selectAll("*").remove();
    layer.transition().duration(800).ease(d3.easeCubicInOut).attr("transform", "translate(0,0) scale(1)").on("start", sizePins);
    panel.hidden = true;
  }

  function drawCities(feature) {
    cityLayer.selectAll("*").remove();
    const name = feature.properties.name;
    const ed = editionByCountry.get(name);
    const list = DATA.cities[name] || [];
    list.forEach(city => {
      const status = ed && ed.city === city.n ? ed.status : "soon";
      const [x, y] = projection([city.lon, city.lat]);
      const g = cityLayer.append("g").attr("class", "city city-" + status).attr("transform", `translate(${x},${y})`)
        .attr("tabindex", 0).attr("role", "button").attr("aria-label", city.n)
        .on("click", ev => { ev.stopPropagation(); openPopup(ed && ed.city === city.n ? ed : null, city, ev, name); })
        .on("keydown", ev => { if (ev.key === "Enter") openPopup(ed && ed.city === city.n ? ed : null, city, ev, name); });
      const s = g.append("g").attr("class", "city-scale");
      if (status === "soon") {
        s.append("circle").attr("r", 5).attr("class", "city-dot");
      } else {
        if (status === "live") s.append("circle").attr("class", "pin-pulse").attr("r", 6);
        s.append("path").attr("d", PIN_PATH).attr("class", "pin-shape");
        s.append("circle").attr("cy", -26).attr("r", 5).attr("class", "pin-eye");
      }
      s.append("text").attr("x", 9).attr("y", status === "soon" ? 4 : -20).attr("class", "city-label").text(city.n);
    });
    sizePins();
  }

  function showPanel(name) {
    const ed = editionByCountry.get(name);
    const count = (DATA.cities[name] || []).length;
    const status = ed ? (ed.status === "live" ? `${ed.edition} · Live` : ed.status === "origin" ? "Origin story" : "Coming soon") : "Not mapped yet";
    panel.innerHTML = `
      <button class="zoom-back" type="button">← World map</button>
      <div class="zoom-stamp stamp-${ed ? ed.status : "none"}">
        <span class="stamp-status">${esc(status)}</span>
        <strong>${esc(name)}</strong>
        <small>${count ? `${count} cities on the map${ed && ed.status === "live" ? "" : " · tap one"}` : "No cities in the data"}</small>
        ${ed && ed.status === "live" ? `<a class="btn" href="${esc(ed.link)}">Enter ${esc(ed.name)} →</a>` : ""}
      </div>`;
    panel.hidden = false;
    panel.querySelector(".zoom-back").addEventListener("click", ev => { ev.stopPropagation(); zoomOut(); });
    panel.addEventListener("click", ev => ev.stopPropagation());
  }

  function openPopup(ed, city, ev, countryName) {
    hideTip();
    let html;
    if (ed && ed.status === "live") {
      html = `
        <div class="popup-art">${(ed.icons || []).map(id => noteIcon(id, 34)).join("")}</div>
        <span class="kicker">${esc(ed.edition)} · Live</span>
        <h3>${esc(city.n)}</h3>
        <p class="hand popup-tag">${esc(ed.tagline)}</p>
        <p class="popup-stats"><strong>${DATA.notes.length}</strong> notes · <strong>${DATA.perfumes.length}</strong> perfumes · <strong>${DATA.brands.length}</strong> brands · <strong>1</strong> scent trail</p>
        <a class="btn" href="${esc(ed.link)}">Enter ${esc(ed.name)} →</a>`;
    } else if (ed && ed.status === "origin") {
      html = `
        <div class="popup-art">${noteIcon("jasmine", 34)}${noteIcon("agarwood-sandalwood", 34)}</div>
        <span class="kicker">Origin story</span>
        <h3>${esc(city.n)}</h3>
        <p class="hand popup-tag">${esc(ed.tagline)}</p>
        <p class="popup-stats">Scent Atlas began here, at a make-your-own-scent experience in Amping. A ${esc(ed.name)} edition is on the wishlist.</p>`;
    } else {
      html = `
        <span class="kicker">Coming soon</span>
        <h3>${esc(city.n)}</h3>
        <p class="popup-stats">${esc(countryName || "")}${city.cap ? " · capital" : ""}. This city hasn't been mapped yet. Its notes, perfumes and scent trail are still to come.</p>`;
    }
    popup.innerHTML = `<button class="popup-close" aria-label="Close">×</button>` + html;
    popup.querySelector(".popup-close").addEventListener("click", e2 => { e2.stopPropagation(); closePopup(); });

    // Place the window beside the pin (on phones, CSS puts it under the map instead)
    const box = canvas.getBoundingClientRect();
    const px = ev.clientX - box.left, py = ev.clientY - box.top;
    popup.style.left = (px / box.width * 100) + "%";
    popup.style.top = (py / box.height * 100) + "%";
    popup.classList.toggle("popup-right", px < box.width * 0.45);
    popup.hidden = false;
  }

  function closePopup() { popup.hidden = true; }
  function showTip(ev, text) {
    const box = canvas.getBoundingClientRect();
    tip.textContent = text;
    tip.style.left = (ev.clientX - box.left) + "px";
    tip.style.top = (ev.clientY - box.top) + "px";
    tip.hidden = false;
  }
  function hideTip() { tip.hidden = true; }

  canvas.addEventListener("click", () => { if (!popup.hidden) closePopup(); else if (current) zoomOut(); });
  popup.addEventListener("click", ev => ev.stopPropagation());
  document.addEventListener("keydown", function onKey(ev) {
    if (!document.body.contains(canvas)) return document.removeEventListener("keydown", onKey);
    if (ev.key === "Escape") { if (!popup.hidden) closePopup(); else if (current) zoomOut(); }
  });

  // Edition stamps under the map zoom the map too
  app.querySelectorAll(".stamps [data-zoom]").forEach(b => b.addEventListener("click", () => {
    const f = countries.find(c => c.properties.name === b.dataset.zoom);
    canvas.scrollIntoView({ behavior: "smooth", block: "center" });
    zoomTo(f);
  }));
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
  const files = ["notes", "perfumes", "brands", "experiences", "trail", "offers", "editions", "cities", "world"];
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
