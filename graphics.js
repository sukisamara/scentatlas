/* Scent Atlas graphics
   ---------------------------------------------------------------
   Everything here is drawn in code (SVG), so there are no image files
   to manage and the colours always match the palette.

   - bottleSVG(perfume)  -> an illustrated perfume bottle
   - noteIcon(noteId)    -> a small botanical icon for each note
*/

const PALETTE = {
  navy: "#0B0F2E", cream: "#FAF5CF", coral: "#E57B62",
  maroon: "#6B1C1E", olive: "#B8B455", pink: "#E8A8C4"
};

// Turn a word into a stable number, so each perfume always gets the same bottle
function hashOf(text) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/* ---------- Perfume bottles ---------- */

// Four bottle shapes. Each returns { body, neck, cap } as SVG path/shape strings.
const BOTTLE_SHAPES = {
  tall: {
    body: `<rect x="32" y="66" width="56" height="100" rx="10"/>`,
    neck: `<rect x="50" y="50" width="20" height="18"/>`,
    cap: `<rect x="44" y="16" width="32" height="36" rx="4"/>`,
    label: { x: 40, y: 104, w: 40, h: 34 }
  },
  round: {
    body: `<circle cx="60" cy="120" r="46"/>`,
    neck: `<rect x="51" y="62" width="18" height="16"/>`,
    cap: `<rect x="46" y="22" width="28" height="42" rx="14"/>`,
    label: { x: 38, y: 108, w: 44, h: 26 }
  },
  square: {
    body: `<rect x="24" y="72" width="72" height="94" rx="4"/>`,
    neck: `<rect x="50" y="58" width="20" height="16"/>`,
    cap: `<rect x="38" y="22" width="44" height="38" rx="3"/>`,
    label: { x: 36, y: 102, w: 48, h: 34 }
  },
  flacon: {
    body: `<path d="M38 70 H82 L98 96 V160 Q98 168 90 168 H30 Q22 168 22 160 V96 Z"/>`,
    neck: `<rect x="50" y="56" width="20" height="16"/>`,
    cap: `<path d="M60 14 L80 36 L60 58 L40 36 Z"/>`,
    label: { x: 38, y: 112, w: 44, h: 32 }
  }
};

function bottleSVG(perfume, size = 160) {
  const h = hashOf(perfume.id);
  const shapeName = Object.keys(BOTTLE_SHAPES)[h % 4];
  const shape = BOTTLE_SHAPES[shapeName];

  // Liquid colour comes from the perfume's first Singapore-story note
  const stories = typeof storyNotesOf === "function" ? storyNotesOf(perfume) : [];
  let liquidName = stories[0] ? stories[0].color : ["coral", "pink", "olive"][h % 3];
  if (liquidName === "cream") liquidName = "olive";
  if (liquidName === "navy") liquidName = "coral";
  const liquid = PALETTE[liquidName];
  const capColor = [PALETTE.maroon, PALETTE.coral, PALETTE.olive, PALETTE.pink][(h >> 3) % 4];

  const initials = perfume.name.split(/\s+/).filter(w => /[A-Za-z]/.test(w[0]))
    .slice(0, 2).map(w => w[0].toUpperCase()).join("");
  const L = shape.label;
  const clip = `clip-${perfume.id}`;

  return `<svg class="bottle" viewBox="0 0 120 180" width="${size}" height="${size * 1.5}" role="img" aria-label="Illustration of ${esc(perfume.name)}">
    <defs><clipPath id="${clip}">${shape.body}</clipPath></defs>
    <!-- retro offset shadow -->
    <g transform="translate(6 6)" fill="${PALETTE.navy}">${shape.body}${shape.neck}${shape.cap}</g>
    <!-- glass -->
    <g fill="#fffdf0" stroke="${PALETTE.navy}" stroke-width="3">${shape.body}</g>
    <!-- liquid -->
    <g clip-path="url(#${clip})">
      <rect x="0" y="98" width="120" height="90" fill="${liquid}"/>
      <path d="M0 98 Q30 90 60 98 T120 98 V104 H0 Z" fill="${liquid}"/>
    </g>
    <g fill="none" stroke="${PALETTE.navy}" stroke-width="3">${shape.body}</g>
    <!-- shine -->
    <path d="M${shapeName === "round" ? "34 100 Q30 116 36 132" : "34 80 V126"}" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".8"/>
    <!-- neck and cap -->
    <g fill="${PALETTE.cream}" stroke="${PALETTE.navy}" stroke-width="3">${shape.neck}</g>
    <g fill="${capColor}" stroke="${PALETTE.navy}" stroke-width="3">${shape.cap}</g>
    <!-- label -->
    <rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="3" fill="${PALETTE.cream}" stroke="${PALETTE.navy}" stroke-width="2"/>
    <text x="${L.x + L.w / 2}" y="${L.y + L.h / 2 + 6}" text-anchor="middle" font-family="Rozha One, Georgia, serif" font-size="17" fill="${PALETTE.navy}">${initials}</text>
  </svg>`;
}

// Use a real photo if one is set in perfumes.json ("image": "images/nanyang.jpg"), else the illustration
function perfumeVisual(perfume, size = 160) {
  if (perfume.image) {
    return `<img class="bottle-photo" src="${esc(perfume.image)}" alt="${esc(perfume.name)} bottle" width="${size}">`;
  }
  return bottleSVG(perfume, size);
}

/* ---------- Note icons ---------- */
// 64 x 64 line drawings, navy outlines with palette fills

const S = `stroke="${PALETTE.navy}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`;

const NOTE_ICONS = {
  pandan: `
    <path ${S} fill="${PALETTE.olive}" d="M32 58 C24 40 14 26 6 18 C20 24 30 36 34 52 Z"/>
    <path ${S} fill="${PALETTE.olive}" d="M32 58 C32 38 32 20 30 6 C38 20 38 40 36 58 Z"/>
    <path ${S} fill="${PALETTE.olive}" d="M34 58 C40 40 50 28 60 20 C52 32 44 44 38 58 Z"/>`,

  jasmine: `
    ${[0, 72, 144, 216, 288].map(r => `<ellipse ${S} fill="#fffdf0" cx="32" cy="18" rx="7" ry="13" transform="rotate(${r} 32 32)"/>`).join("")}
    <circle ${S} fill="${PALETTE.pink}" cx="32" cy="32" r="5"/>`,

  nutmeg: `
    <ellipse ${S} fill="#8a5a3b" cx="32" cy="34" rx="16" ry="20"/>
    <path ${S} fill="none" stroke="${PALETTE.coral}" d="M20 22 Q32 34 22 46 M44 22 Q32 34 42 46 M32 14 Q36 34 32 54"/>`,

  clove: `
    <path ${S} fill="#7a4a2c" d="M30 58 L28 30 H36 L34 58 Z"/>
    ${[0, 90, 180, 270].map(r => `<ellipse ${S} fill="#7a4a2c" cx="32" cy="18" rx="5" ry="8" transform="rotate(${r} 32 26)"/>`).join("")}
    <circle ${S} fill="${PALETTE.maroon}" cx="32" cy="26" r="5"/>`,

  pepper: `
    ${[[22, 24], [38, 20], [30, 36], [46, 34], [20, 42], [36, 50]].map(([x, y]) => `<circle ${S} fill="${PALETTE.navy}" cx="${x}" cy="${y}" r="7"/><circle fill="#ffffff" opacity=".5" cx="${x - 2}" cy="${y - 2}" r="2"/>`).join("")}`,

  orchid: `
    <ellipse ${S} fill="${PALETTE.pink}" cx="32" cy="14" rx="8" ry="11"/>
    <ellipse ${S} fill="${PALETTE.pink}" cx="16" cy="28" rx="11" ry="8" transform="rotate(-20 16 28)"/>
    <ellipse ${S} fill="${PALETTE.pink}" cx="48" cy="28" rx="11" ry="8" transform="rotate(20 48 28)"/>
    <path ${S} fill="${PALETTE.maroon}" d="M24 34 Q32 58 40 34 Q32 40 24 34 Z"/>
    <circle ${S} fill="${PALETTE.olive}" cx="32" cy="30" r="4"/>`,

  "agarwood-sandalwood": `
    <rect ${S} fill="${PALETTE.maroon}" x="29" y="30" width="6" height="28" rx="2"/>
    <circle fill="${PALETTE.coral}" cx="32" cy="29" r="3"/>
    <path ${S} fill="none" d="M32 24 C24 18 40 14 32 8 M38 22 C44 16 36 12 42 6"/>`,

  // The six Batik Flora flowers
  "aquatic-ginger": `
    <path ${S} fill="${PALETTE.olive}" d="M30 60 Q26 36 14 20 Q28 26 32 44 Z"/>
    <path ${S} fill="${PALETTE.olive}" d="M34 60 Q40 34 52 22 Q40 30 34 46 Z"/>
    ${[[32, 14], [26, 22], [38, 22], [32, 30]].map(([x, y]) => `<ellipse ${S} fill="#fffdf0" cx="${x}" cy="${y}" rx="5" ry="6"/><circle fill="${PALETTE.pink}" cx="${x}" cy="${y + 1}" r="2"/>`).join("")}`,

  "common-dianella": `
    <path ${S} fill="none" d="M32 60 V30 M32 40 L20 24 M32 36 L44 20"/>
    ${[[20, 22], [44, 18], [32, 26], [26, 14], [38, 30]].map(([x, y]) => `<circle ${S} fill="#3557b7" cx="${x}" cy="${y}" r="5"/><circle fill="#fffdf0" cx="${x - 1.5}" cy="${y - 1.5}" r="1.3"/>`).join("")}`,

  "seashore-purslane": `
    <path ${S} fill="none" d="M4 52 Q16 46 30 52 T60 50"/>
    ${[[12, 46], [22, 44], [44, 44], [54, 46]].map(([x, y]) => `<ellipse ${S} fill="${PALETTE.olive}" cx="${x}" cy="${y}" rx="3" ry="6"/>`).join("")}
    ${[0, 72, 144, 216, 288].map(r => `<path ${S} fill="${PALETTE.pink}" d="M32 26 L28 12 L32 8 L36 12 Z" transform="rotate(${r} 32 26)"/>`).join("")}
    <circle fill="${PALETTE.coral}" cx="32" cy="26" r="3"/>`,

  "simpoh-lak": `
    ${[0, 72, 144, 216, 288].map(r => `<ellipse ${S} fill="#f2cf3c" cx="32" cy="15" rx="10" ry="12" transform="rotate(${r} 32 32)"/>`).join("")}
    <circle ${S} fill="${PALETTE.maroon}" cx="32" cy="32" r="8"/>
    <circle fill="${PALETTE.pink}" cx="32" cy="32" r="3"/>`,

  "utania-nervosa": `
    <path ${S} fill="none" d="M8 10 Q32 4 56 10 M32 7 V20"/>
    <path ${S} fill="${PALETTE.olive}" d="M10 12 Q4 24 12 30 Q18 22 10 12 Z M54 12 Q60 24 52 30 Q46 22 54 12 Z"/>
    ${[[32, 24], [26, 32], [38, 32], [30, 41], [36, 41], [32, 50]].map(([x, y]) => `<circle ${S} fill="#fbf0c4" cx="${x}" cy="${y}" r="5"/>`).join("")}`,

  "white-kopsia": `
    ${[0, 72, 144, 216, 288].map(r => `<path ${S} fill="#fffdf0" d="M32 30 Q24 10 34 6 Q44 12 34 30 Z" transform="rotate(${r} 32 32)"/>`).join("")}
    <circle ${S} fill="#c8283a" cx="32" cy="32" r="6"/>`,

  "kopi-teh": `
    <path ${S} fill="#fffdf0" d="M12 30 H46 V44 Q46 56 29 56 Q12 56 12 44 Z"/>
    <path ${S} fill="none" d="M46 34 Q56 34 54 42 Q52 48 45 47"/>
    <ellipse fill="#7a4a2c" cx="29" cy="31" rx="15" ry="2.5"/>
    <path ${S} fill="none" d="M22 22 Q18 16 22 10 M30 22 Q26 16 30 10 M38 22 Q34 16 38 10"/>`,

  calamansi: `
    <circle ${S} fill="${PALETTE.olive}" cx="32" cy="32" r="22"/>
    <circle ${S} fill="#f3e9a0" cx="32" cy="32" r="16"/>
    ${[0, 60, 120].map(r => `<line ${S} x1="32" y1="16" x2="32" y2="48" transform="rotate(${r} 32 32)"/>`).join("")}`,

  frangipani: `
    ${[0, 72, 144, 216, 288].map(r => `<path ${S} fill="#fffdf0" d="M32 32 C26 22 28 8 38 8 C44 10 42 24 32 32 Z" transform="rotate(${r} 32 32)"/>`).join("")}
    <circle fill="#f2c94c" cx="32" cy="32" r="6"/>`,

  "torch-ginger": `
    <path ${S} fill="none" d="M32 60 V36"/>
    <path ${S} fill="${PALETTE.coral}" d="M20 36 Q32 2 44 36 Z"/>
    <path ${S} fill="${PALETTE.pink}" d="M25 34 Q32 12 39 34 Z"/>
    <path ${S} fill="${PALETTE.olive}" d="M32 52 Q20 50 16 42 Q26 42 32 48"/>`
};

function noteIcon(noteId, size = 48) {
  const art = NOTE_ICONS[noteId];
  if (!art) return "";
  return `<svg class="note-icon" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${art}</svg>`;
}

/* ---------- Note family icons ----------
   One small drawing per family (families are in data/families.json).
   Families that already have a Singapore note reuse that note's drawing. */
const FAMILY_ICONS = {
  citrus: NOTE_ICONS.calamansi,
  flowers: NOTE_ICONS.orchid,
  "white-flowers": NOTE_ICONS.jasmine,
  greens: NOTE_ICONS.pandan,
  spices: NOTE_ICONS.clove,
  woods: NOTE_ICONS["agarwood-sandalwood"],
  beverages: NOTE_ICONS["kopi-teh"],
  fruits: `
    <path ${S} fill="${PALETTE.olive}" d="M32 14 Q36 6 44 6 Q42 14 34 16 Z"/>
    <circle ${S} fill="${PALETTE.pink}" cx="32" cy="38" r="20"/>
    ${[[24, 30], [36, 28], [28, 42], [40, 40], [32, 50], [20, 42]].map(([x, y]) => `<circle fill="${PALETTE.maroon}" cx="${x}" cy="${y}" r="2"/>`).join("")}`,
  gourmand: `
    <path ${S} fill="#3a2418" d="M14 52 Q30 34 50 10 Q54 12 52 16 Q34 38 18 56 Q14 56 14 52 Z"/>
    <path ${S} fill="#fffdf0" d="M40 40 Q48 34 56 40 Q52 52 44 54 Q36 52 40 40 Z"/>
    <circle fill="${PALETTE.coral}" cx="47" cy="46" r="3"/>`,
  resins: `
    <path ${S} fill="${PALETTE.coral}" d="M32 8 Q48 30 48 40 A16 16 0 0 1 16 40 Q16 30 32 8 Z"/>
    <path fill="#fffdf0" opacity=".7" d="M24 38 Q24 30 30 24 Q28 34 28 40 Z"/>`,
  musk: `
    <path ${S} fill="#fffdf0" d="M14 40 Q10 28 22 26 Q24 14 36 18 Q48 12 52 26 Q60 32 52 42 Q46 52 32 48 Q20 54 14 40 Z"/>
    <circle fill="${PALETTE.pink}" cx="26" cy="36" r="5"/><circle fill="${PALETTE.coral}" cx="38" cy="32" r="4"/><circle fill="${PALETTE.olive}" cx="42" cy="42" r="3"/>`,
  natural: `
    <path ${S} fill="none" d="M6 26 Q14 18 22 26 T38 26 T54 26 T62 26"/>
    <path ${S} fill="none" d="M6 38 Q14 30 22 38 T38 38 T54 38 T62 38"/>
    <path ${S} fill="none" d="M6 50 Q14 42 22 50 T38 50 T54 50 T62 50"/>`,
};

function familyIcon(familyId, size = 48) {
  const art = FAMILY_ICONS[familyId];
  if (!art) return "";
  return `<svg class="note-icon family-icon" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${art}</svg>`;
}

/* ---------- Retro social icons (drawn, not brand logos) ---------- */
const SOCIAL_ICONS = {
  website: `<circle cx="12" cy="12" r="8.5" fill="none"/><path fill="none" d="M3.5 12h17M12 3.5c-3 3-3 14 0 17M12 3.5c3 3 3 14 0 17"/>`,
  instagram: `<rect x="4" y="4" width="16" height="16" rx="5" fill="none"/><circle cx="12" cy="12" r="3.8" fill="none"/><circle cx="16.8" cy="7.2" r="1" fill="currentColor" stroke="none"/>`,
  tiktok: `<path fill="none" d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path fill="none" d="M14 4c.5 2.6 2.4 4.3 5 4.5"/>`,
  facebook: `<path fill="none" d="M15.5 4.5h-2a3.5 3.5 0 0 0-3.5 3.5v12M7.5 11.5h7"/>`,
};
const SOCIAL_LABELS = { website: "Website", instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook" };

function socialIcon(kind, size = 20) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SOCIAL_ICONS[kind]}</svg>`;
}
