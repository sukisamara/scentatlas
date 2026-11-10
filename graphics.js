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

  bandung: `
    <path ${S} fill="#fffdf0" d="M18 14 H46 L42 58 H22 Z"/>
    <path fill="${PALETTE.pink}" d="M20 26 H44 L41 56 H23 Z"/>
    <rect ${S} fill="#fffdf0" opacity=".8" x="26" y="30" width="7" height="7" rx="1.5"/>
    <path ${S} fill="none" d="M36 4 L32 40"/>`,

  durian: `
    <ellipse ${S} fill="${PALETTE.olive}" cx="32" cy="36" rx="20" ry="22"/>
    ${[[22, 24], [32, 20], [42, 24], [18, 36], [30, 32], [44, 36], [24, 46], [36, 46], [32, 56]].map(([x, y]) => `<path ${S} fill="#d9c25a" d="M${x - 3} ${y + 2} L${x} ${y - 4} L${x + 3} ${y + 2} Z"/>`).join("")}
    <path ${S} fill="none" d="M32 14 V6 Q36 4 38 8"/>`,

  kaya: `
    <path ${S} fill="#fffdf0" d="M10 20 H54 V50 Q54 54 50 54 H14 Q10 54 10 50 Z"/>
    <path fill="#9bbf5a" d="M14 24 H50 V34 Q32 40 14 34 Z"/>
    <rect fill="#f2cf3c" x="20" y="40" width="24" height="6" rx="2"/>`,

  "gula-melaka": `
    <path ${S} fill="${PALETTE.maroon}" d="M14 34 Q14 22 32 22 Q50 22 50 34 V44 Q50 54 32 54 Q14 54 14 44 Z"/>
    <ellipse ${S} fill="#a0522d" cx="32" cy="32" rx="18" ry="8"/>
    <path ${S} fill="none" d="M44 18 Q50 10 56 14"/>`,

  chempaka: `
    ${[0, 40, 80, 120, 160, 200, 240, 280, 320].map(r => `<ellipse ${S} fill="#f5b85a" cx="32" cy="16" rx="4" ry="12" transform="rotate(${r} 32 32)"/>`).join("")}
    <circle ${S} fill="${PALETTE.coral}" cx="32" cy="32" r="5"/>`,

  tembusu: `
    <rect ${S} fill="#8a6a4a" x="28" y="34" width="8" height="26" rx="2"/>
    <path ${S} fill="${PALETTE.olive}" d="M10 34 Q8 14 32 10 Q56 14 54 34 Q44 42 32 38 Q20 42 10 34 Z"/>
    ${[[20, 24], [32, 18], [44, 24], [26, 32], [40, 31]].map(([x, y]) => `<circle fill="#fbf0c4" stroke="${PALETTE.navy}" stroke-width="1.5" cx="${x}" cy="${y}" r="3"/>`).join("")}`,

  "joss-sticks": `
    <path ${S} fill="${PALETTE.coral}" d="M14 46 H50 L46 58 H18 Z"/>
    ${[24, 32, 40].map(x => `<path ${S} fill="none" stroke="${PALETTE.maroon}" d="M${x} 46 V22"/><circle fill="${PALETTE.coral}" cx="${x}" cy="21" r="2"/>`).join("")}
    <path ${S} fill="none" d="M24 16 Q20 10 24 4 M32 16 Q28 10 32 4 M40 16 Q36 10 40 4"/>`,

  "bunga-rampai": `
    <path ${S} fill="#fffdf0" d="M12 30 Q32 22 52 30 L48 54 Q32 60 16 54 Z"/>
    ${[[22, 30], [30, 26], [38, 28], [44, 32], [26, 36], [36, 36]].map(([x, y], i) => i % 2 ? `<path ${S} fill="${PALETTE.olive}" d="M${x - 6} ${y} L${x + 6} ${y - 3}"/>` : `<circle ${S} fill="${PALETTE.pink}" cx="${x}" cy="${y}" r="3.5"/>`).join("")}`,

  "tiger-balm": `
    <path ${S} fill="#f2cf3c" d="M14 26 L22 16 H42 L50 26 V48 L42 56 H22 L14 48 Z"/>
    <path ${S} fill="${PALETTE.coral}" d="M18 30 H46 V44 H18 Z"/>
    <path ${S} fill="none" d="M24 40 Q30 32 36 36 Q40 38 42 34"/>`,

  // ---- Everyday Singapore notes (Nov 2026) ----
  "ylang-ylang": `
    <path ${S} fill="none" d="M32 6 V16"/>
    ${[-60, -30, 0, 30, 60].map(r => `<path ${S} fill="#e9d76a" d="M32 16 Q24 32 30 52 Q40 38 32 16 Z" transform="rotate(${r} 32 16)"/>`).join("")}
    <circle ${S} fill="${PALETTE.olive}" cx="32" cy="16" r="4"/>`,

  tuberose: `
    <path ${S} fill="none" stroke="#5b7a32" d="M32 60 V8"/>
    ${[[32, 10, 0], [24, 22, -35], [40, 24, 35], [25, 38, -35], [39, 40, 35]].map(([x, y, r]) => `<path ${S} fill="#fffdf0" d="M${x} ${y} l-4 -8 h8 Z" transform="rotate(${r} ${x} ${y})"/>`).join("")}`,

  "mandarin-orange": `
    <circle ${S} fill="${PALETTE.coral}" cx="22" cy="40" r="14"/>
    <circle ${S} fill="#f09a4a" cx="42" cy="38" r="14"/>
    <path ${S} fill="#5b7a32" d="M42 24 Q50 14 58 18 Q52 26 42 24 Z"/>
    <path ${S} fill="none" d="M42 24 V20 M22 26 V22"/>`,

  vetiver: `
    <path ${S} fill="none" stroke="#5b7a32" d="M32 30 L22 6 M32 30 L32 4 M32 30 L42 6 M32 30 L14 12 M32 30 L50 12"/>
    <path ${S} fill="none" stroke="#8a6a4a" d="M32 30 Q26 44 20 58 M32 30 Q30 46 28 60 M32 30 Q34 46 36 60 M32 30 Q38 44 44 58 M32 30 Q42 40 52 50 M32 30 Q22 40 12 50"/>`,

  ginger: `
    <path ${S} fill="#e2c27a" d="M8 40 Q8 30 18 32 Q20 22 28 26 Q34 18 40 26 Q48 22 50 32 Q58 32 56 42 Q50 50 40 46 Q32 54 24 46 Q12 50 8 40 Z"/>
    <path ${S} fill="none" d="M20 38 Q24 36 26 40 M36 34 Q40 32 42 36"/>`,

  lotus: `
    <path ${S} fill="none" d="M6 54 Q20 50 32 54 T58 54"/>
    <path ${S} fill="${PALETTE.pink}" d="M32 14 Q42 30 32 46 Q22 30 32 14 Z"/>
    <path ${S} fill="${PALETTE.pink}" d="M32 46 Q14 42 12 24 Q26 28 32 46 Z"/>
    <path ${S} fill="${PALETTE.pink}" d="M32 46 Q50 42 52 24 Q38 28 32 46 Z"/>`,

  lemongrass: `
    ${[24, 32, 40].map((x, i) => `<path ${S} fill="#e8e6a8" d="M${x - 3} 60 L${x - 2} 28 L${x + 2} 28 L${x + 3} 60 Z"/><path ${S} fill="none" stroke="#5b7a32" d="M${x} 28 Q${x - 10 + i * 10} 14 ${x - 14 + i * 14} 4"/>`).join("")}`,

  "limau-purut": `
    <circle ${S} fill="#7fa04a" cx="22" cy="42" r="14"/>
    ${[[16, 38], [24, 34], [26, 46], [18, 48], [30, 40]].map(([x, y]) => `<circle fill="#5b7a32" cx="${x}" cy="${y}" r="2"/>`).join("")}
    <path ${S} fill="${PALETTE.olive}" d="M46 6 Q58 12 46 22 Q34 12 46 6 Z M46 22 Q58 30 46 42 Q34 30 46 22 Z"/>`,

  attar: `
    <path ${S} fill="${PALETTE.maroon}" d="M22 30 L32 22 L42 30 L42 52 L32 58 L22 52 Z"/>
    <path fill="#fffdf0" opacity=".5" d="M26 32 L30 29 V50 L26 48 Z"/>
    <rect ${S} fill="#d4b14a" x="29" y="14" width="6" height="8" rx="1"/>
    <path ${S} fill="#d4b14a" d="M32 14 L28 4 H36 Z"/>`,

  haze: `
    <circle ${S} fill="${PALETTE.coral}" cx="32" cy="22" r="10"/>
    ${[30, 40, 50].map(y => `<path ${S} fill="none" stroke="#8c8c8c" stroke-width="4" d="M6 ${y} Q16 ${y - 5} 26 ${y} T46 ${y} T58 ${y}"/>`).join("")}`,

  marigold: `
    <path ${S} fill="none" d="M4 10 Q32 30 60 10"/>
    ${[[12, 20], [24, 26], [36, 26], [48, 20]].map(([x, y]) => `<circle ${S} fill="#f09a2a" cx="${x}" cy="${y + 8}" r="7"/><circle fill="${PALETTE.coral}" cx="${x}" cy="${y + 8}" r="3"/>`).join("")}
    <circle ${S} fill="#f2cf3c" cx="32" cy="50" r="10"/><circle fill="#f09a2a" cx="32" cy="50" r="5"/>`,

  "pomelo-leaves": `
    <circle ${S} fill="#d9e07a" cx="30" cy="40" r="18"/>
    <path ${S} fill="#5b7a32" d="M40 22 Q56 8 60 20 Q50 30 40 22 Z"/>
    <path ${S} fill="#7fa04a" d="M36 22 Q32 4 46 4 Q46 18 36 22 Z"/>`,

  rose: `
    <circle ${S} fill="#d9485f" cx="32" cy="28" r="18"/>
    <path ${S} fill="none" d="M32 28 Q38 22 32 18 Q22 20 24 30 Q28 40 40 34 Q46 24 38 14"/>
    <path ${S} fill="#5b7a32" d="M32 46 V60 M32 52 Q22 48 20 56 Q28 58 32 52 Z"/>`,

  sireh: `
    <path ${S} fill="#5b7a32" d="M32 58 Q8 40 12 20 Q18 8 32 18 Q46 8 52 20 Q56 40 32 58 Z"/>
    <path ${S} fill="none" stroke="#d9e07a" d="M32 18 V56 M32 30 Q22 28 18 22 M32 30 Q42 28 46 22 M32 42 Q22 40 18 34 M32 42 Q42 40 46 34"/>`,

  "star-anise": `
    ${[0, 45, 90, 135, 180, 225, 270, 315].map(r => `<path ${S} fill="#8a4a2c" d="M32 32 Q27 18 32 8 Q37 18 32 32 Z" transform="rotate(${r} 32 32)"/>`).join("")}
    ${[0, 90, 180, 270].map(r => `<ellipse fill="#e2c27a" cx="32" cy="18" rx="2" ry="3" transform="rotate(${r} 32 32)"/>`).join("")}
    <circle ${S} fill="${PALETTE.maroon}" cx="32" cy="32" r="4"/>`,

  belacan: `
    <path ${S} fill="#d8d8d8" d="M8 30 L30 18 L58 28 L58 46 L34 58 L8 46 Z"/>
    <path ${S} fill="#6b3a2a" d="M14 32 L30 24 L52 31 L52 44 L34 52 L14 44 Z"/>
    <path ${S} fill="none" d="M14 32 L34 40 L52 31 M34 40 V52"/>`,

  "coconut-milk": `
    <path ${S} fill="#8a5a3a" d="M6 30 H58 Q58 56 32 56 Q6 56 6 30 Z"/>
    <path ${S} fill="#fffdf0" d="M12 30 H52 Q50 48 32 48 Q14 48 12 30 Z"/>
    <path ${S} fill="none" d="M44 22 Q48 14 54 18 Q50 22 44 22 Z"/>`,

  "axe-oil": `
    <rect ${S} fill="#5b9a4a" x="20" y="20" width="24" height="38" rx="4"/>
    <rect ${S} fill="#fffdf0" x="17" y="10" width="30" height="10" rx="2"/>
    <rect ${S} fill="#fffdf0" x="23" y="30" width="18" height="18" rx="2"/>
    <path ${S} fill="${PALETTE.coral}" d="M28 44 L36 34 M34 33 Q40 34 38 40 Z"/>`,

  fogging: `
    <rect ${S} fill="${PALETTE.coral}" x="4" y="36" width="20" height="14" rx="3"/>
    <path ${S} fill="#8c8c8c" d="M24 40 H34 V46 H24 Z"/>
    <path ${S} fill="#fffdf0" d="M34 32 Q40 24 48 30 Q56 24 60 34 Q62 44 54 46 Q48 54 40 48 Q32 50 34 42 Q28 38 34 32 Z"/>`,

  "bak-kwa": `
    <rect ${S} fill="#a8332a" x="10" y="12" width="44" height="40" rx="6" transform="rotate(-8 32 32)"/>
    ${[22, 32, 42].map(y => `<path ${S} fill="none" stroke="#3a1410" d="M16 ${y} L48 ${y - 5}"/>`).join("")}`,

  rubber: `
    <rect ${S} fill="#8a6a4a" x="20" y="4" width="22" height="56"/>
    ${[14, 22, 30].map(y => `<path ${S} fill="none" stroke="#fffdf0" d="M22 ${y} L31 ${y + 6} L40 ${y}"/>`).join("")}
    <path ${S} fill="#fffdf0" d="M31 36 V44"/>
    <path ${S} fill="${PALETTE.coral}" d="M24 46 H38 L36 54 H26 Z"/>`,

  "satay-smoke": `
    <rect ${S} fill="#3a3a3a" x="6" y="44" width="52" height="12" rx="2"/>
    ${[18, 30, 42].map(x => `<path ${S} fill="none" stroke="#8a6a4a" d="M${x - 8} 44 L${x + 10} 30"/><circle fill="#a8332a" cx="${x - 2}" cy="39" r="3"/><circle fill="#a8332a" cx="${x + 3}" cy="35" r="3"/>`).join("")}
    <path ${S} fill="none" d="M20 22 Q16 14 22 8 M34 20 Q30 12 36 6 M48 22 Q44 14 50 8"/>`,

  milo: `
    <rect ${S} fill="#2e7a3a" x="16" y="12" width="32" height="46" rx="3"/>
    <rect ${S} fill="#c9a24a" x="14" y="8" width="36" height="6" rx="2"/>
    <path fill="#fffdf0" d="M22 26 H42 V36 H22 Z"/>
    <path ${S} fill="none" stroke="#2e7a3a" d="M24 34 L28 28 L32 34 L36 28 L40 34"/>`,

  pineapple: `
    <ellipse ${S} fill="#f2cf3c" cx="32" cy="42" rx="14" ry="18"/>
    <path ${S} fill="none" d="M22 32 L42 52 M20 44 L34 58 M30 26 L44 40 M42 32 L22 52 M44 44 L30 58 M34 26 L20 40"/>
    <path ${S} fill="#5b7a32" d="M32 24 L24 6 L30 14 L32 2 L34 14 L40 6 Z"/>`,

  "chinese-herbs": `
    <rect ${S} fill="#8a4a2c" x="6" y="8" width="52" height="48" rx="3"/>
    ${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect ${S} fill="#c08a5a" x="${10 + c * 16}" y="${12 + r * 14}" width="12" height="10" rx="1"/><circle fill="#f2cf3c" cx="${16 + c * 16}" cy="${17 + r * 14}" r="1.6"/>`).join("")).join("")}`,

  "laksa-leaf": `
    <path ${S} fill="none" stroke="#7a3a4a" d="M32 60 V12"/>
    ${[[18, -40], [26, 40], [34, -40], [42, 40]].map(([y, r]) => `<path ${S} fill="#5b7a32" d="M32 ${y} Q40 ${y - 4} 48 ${y} Q40 ${y + 4} 32 ${y} Z" transform="rotate(${r} 32 ${y})"/><path ${S} fill="#5b7a32" d="M32 ${y} Q24 ${y - 4} 16 ${y} Q24 ${y + 4} 32 ${y} Z" transform="rotate(${-r} 32 ${y})"/>`).join("")}`,

  saffron: `
    ${[22, 32, 42].map((x, i) => `<path fill="none" stroke="#c8281e" stroke-width="4" stroke-linecap="round" d="M${x} 36 Q${x + (i - 1) * 4} 20 ${x + (i - 1) * 8} 6"/>`).join("")}
    <path ${S} fill="#fffdf0" d="M8 36 H56 Q54 56 32 56 Q10 56 8 36 Z"/>
    <path ${S} fill="#f2cf3c" d="M14 37 Q32 32 50 37"/>`,

  "curry-powder": `
    <path ${S} fill="#e8a628" d="M6 54 Q20 26 32 24 Q44 26 58 54 Z"/>
    <path ${S} fill="#c8281e" d="M40 54 Q46 40 52 54 Z"/>
    <path ${S} fill="#c0c0c0" d="M40 14 L58 8 L56 14 Z M40 14 Q30 16 30 22 Q38 24 40 14 Z"/>`,

  "bunga-tanjung": `
    ${[[22, 24], [42, 22], [32, 42]].map(([x, y]) => [0, 45, 90, 135, 180, 225, 270, 315].map(r => `<path ${S} fill="#fffdf0" d="M${x} ${y} L${x - 2} ${y - 9} L${x + 2} ${y - 9} Z" transform="rotate(${r} ${x} ${y})"/>`).join("") + `<circle fill="#e9d76a" cx="${x}" cy="${y}" r="3"/>`).join("")}`,

  gelam: `
    <path ${S} fill="#e8dcc0" d="M26 60 L28 30 L36 30 L38 60 Z"/>
    <path ${S} fill="none" d="M28 38 L36 36 M27 48 L37 46"/>
    <path ${S} fill="#7fa04a" d="M10 30 Q8 10 32 6 Q56 10 54 30 Q44 36 32 32 Q20 36 10 30 Z"/>
    ${[[20, 20], [32, 14], [44, 20]].map(([x, y]) => `<circle fill="#fffdf0" cx="${x}" cy="${y}" r="2.5"/>`).join("")}`,

  benzoin: `
    <rect ${S} fill="#3a3a3a" x="14" y="44" width="36" height="12" rx="2"/>
    <path ${S} fill="#d4a24a" d="M20 44 L24 36 L30 40 L28 44 Z M32 44 L36 34 L44 38 L42 44 Z"/>
    <path ${S} fill="none" d="M26 30 Q22 22 28 16 Q34 10 30 4 M38 30 Q42 22 38 14"/>`,

  chrysanthemum: `
    ${Array.from({ length: 16 }, (_, i) => `<path ${S} fill="#f2cf3c" d="M32 32 Q29 18 32 8 Q35 18 32 32 Z" transform="rotate(${i * 22.5} 32 32)"/>`).join("")}
    <circle ${S} fill="#e8a628" cx="32" cy="32" r="6"/>`,

  hibiscus: `
    ${[0, 72, 144, 216, 288].map(r => `<path ${S} fill="#d9363e" d="M32 32 Q16 22 24 8 Q36 6 40 18 Q40 26 32 32 Z" transform="rotate(${r} 32 32)"/>`).join("")}
    <path ${S} fill="none" stroke="#f2cf3c" d="M32 32 L50 52"/>
    <circle fill="#f2cf3c" cx="50" cy="52" r="3"/>`,

  cardamom: `
    ${[[20, 34, -30], [34, 28, 10], [42, 44, 50]].map(([x, y, r]) => `<ellipse ${S} fill="#9ab85a" cx="${x}" cy="${y}" rx="8" ry="13" transform="rotate(${r} ${x} ${y})"/><path ${S} fill="none" d="M${x} ${y - 10} V${y + 10}" transform="rotate(${r} ${x} ${y})"/>`).join("")}`,

  "green-tea": `
    <path ${S} fill="#7fa04a" d="M12 28 H48 V44 Q48 56 30 56 Q12 56 12 44 Z"/>
    <path ${S} fill="none" d="M48 32 Q58 32 56 42 Q54 46 48 46"/>
    <path ${S} fill="#7fa04a" d="M8 30 Q2 22 10 18 L14 28"/>
    <ellipse ${S} fill="#5b7a32" cx="30" cy="26" rx="12" ry="4"/>
    <circle ${S} fill="#5b7a32" cx="30" cy="20" r="3"/>`,

  kapur: `
    <rect ${S} fill="#8a6a4a" x="28" y="34" width="8" height="26"/>
    <path ${S} fill="#5b7a32" d="M6 30 Q6 12 18 12 Q26 14 26 30 Z"/>
    <path ${S} fill="#7fa04a" d="M28 28 Q28 6 40 6 Q46 10 44 28 Z"/>
    <path ${S} fill="#5b7a32" d="M46 32 Q46 16 54 16 Q60 20 58 32 Z"/>`,

  ketupat: `
    <path ${S} fill="#b8d06a" d="M32 6 L56 30 L32 54 L8 30 Z"/>
    <path ${S} fill="none" stroke="#5b7a32" d="M20 18 L44 42 M44 18 L20 42 M26 12 L50 36 M38 12 L14 36"/>
    <path ${S} fill="none" stroke="#5b7a32" d="M32 54 Q30 60 26 62 M32 54 Q36 60 40 62"/>`,

  ghee: `
    <path ${S} fill="${PALETTE.coral}" d="M10 40 Q32 30 54 40 Q48 56 32 56 Q16 56 10 40 Z"/>
    <path ${S} fill="#f2cf3c" d="M40 36 Q36 26 42 16 Q50 26 44 36 Z"/>
    <path fill="#fffdf0" d="M42 32 Q40 26 42 22 Q45 28 42 32 Z"/>`,

  petrichor: `
    <path ${S} fill="#fffdf0" d="M12 26 Q10 14 22 14 Q26 4 38 8 Q50 6 50 18 Q60 20 56 30 H14 Q8 30 12 26 Z"/>
    ${[18, 30, 42].map(x => `<path ${S} fill="none" stroke="#5a8ac8" d="M${x} 34 L${x - 4} 44"/>`).join("")}
    <path ${S} fill="#8a6a4a" d="M4 52 Q32 46 60 52 V60 H4 Z"/>`,

  mangrove: `
    <path ${S} fill="none" d="M2 50 Q16 46 32 50 T62 50"/>
    <path ${S} fill="none" stroke="#8a6a4a" d="M32 30 V46 M32 40 Q22 44 18 56 M32 40 Q42 44 46 56 M32 36 Q20 40 12 54 M32 36 Q44 40 52 54"/>
    <path ${S} fill="#5b7a32" d="M8 26 Q8 8 32 6 Q56 8 56 26 Q44 32 32 28 Q20 32 8 26 Z"/>`,

  galangal: `
    <path ${S} fill="#e8b0a0" d="M8 36 Q10 26 22 28 Q30 20 40 26 Q54 24 56 36 Q50 46 36 42 Q24 50 14 44 Q6 44 8 36 Z"/>
    ${[20, 32, 44].map(x => `<path ${S} fill="none" stroke="#a8332a" d="M${x} 28 Q${x + 2} 36 ${x} 44"/>`).join("")}`,

  "curry-leaf": `
    <path ${S} fill="none" stroke="#5b7a32" d="M32 60 Q30 34 34 6"/>
    ${[12, 22, 32, 42].map(y => `<ellipse ${S} fill="#3f7a2a" cx="24" cy="${y}" rx="8" ry="4" transform="rotate(-20 24 ${y})"/><ellipse ${S} fill="#3f7a2a" cx="42" cy="${y + 4}" rx="8" ry="4" transform="rotate(20 42 ${y + 4})"/>`).join("")}`,

  tamarind: `
    <path ${S} fill="#8a5a3a" d="M8 20 Q16 12 22 20 Q28 12 34 22 Q40 14 46 26 Q54 30 56 44 Q50 40 44 32 Q38 38 32 30 Q26 36 20 28 Q14 32 8 20 Z"/>
    <path ${S} fill="#a8703a" d="M10 50 Q20 40 30 50 Q40 40 50 52 Q40 58 30 54 Q20 60 10 50 Z"/>`,

  honeysuckle: `
    <path ${S} fill="none" d="M32 60 V38"/>
    <path ${S} fill="#fffdf0" d="M32 38 L14 12 Q10 6 16 6 Q20 6 22 12 L34 34 Z"/>
    <path ${S} fill="#f2cf3c" d="M32 38 L50 12 Q54 6 48 6 Q44 6 42 12 L30 34 Z"/>
    <path ${S} fill="none" d="M14 8 Q8 4 6 10 M50 8 Q56 4 58 10"/>
    <ellipse ${S} fill="#5b7a32" cx="22" cy="50" rx="8" ry="4" transform="rotate(-20 22 50)"/>`,

  "orange-blossom": `
    <path ${S} fill="#fffdf0" d="M24 60 Q14 60 14 48 Q14 38 24 36 V20 Q24 12 30 10 V4 H34 V10 Q40 12 40 20 V36 Q50 38 50 48 Q50 60 40 60 Z"/>
    ${[[24, 48], [38, 50]].map(([x, y]) => [0, 72, 144, 216, 288].map(r => `<ellipse fill="${PALETTE.pink}" cx="${x}" cy="${y - 4}" rx="2" ry="3.5" transform="rotate(${r} ${x} ${y})"/>`).join("") + `<circle fill="#f2cf3c" cx="${x}" cy="${y}" r="1.6"/>`).join("")}`,

  cinnamon: `
    ${[[14, 0], [26, -6], [38, 0]].map(([x, d]) => `<rect ${S} fill="#9a5a32" x="${x}" y="${12 + d}" width="12" height="44" rx="5"/><path ${S} fill="none" d="M${x + 3} ${14 + d} Q${x + 6} ${20 + d} ${x + 9} ${14 + d}"/>`).join("")}`,

  mangosteen: `
    <circle ${S} fill="#5a2340" cx="32" cy="38" r="20"/>
    <path ${S} fill="#5b7a32" d="M32 20 Q22 12 18 20 Q26 22 32 20 Q42 12 46 20 Q38 22 32 20 Z"/>
    <path ${S} fill="none" d="M32 20 V12"/>
    <path fill="#fffdf0" d="M24 36 Q32 30 40 36 Q32 44 24 36 Z"/>`,

  chempedak: `
    <ellipse ${S} fill="#b8a040" cx="32" cy="34" rx="16" ry="24" transform="rotate(20 32 34)"/>
    ${[[26, 20], [36, 22], [24, 32], [34, 34], [28, 44], [38, 46], [42, 34]].map(([x, y]) => `<circle fill="#7a6a28" cx="${x}" cy="${y}" r="2"/>`).join("")}
    <path ${S} fill="none" d="M24 12 L18 4"/>`,

  tulsi: `
    <path ${S} fill="none" stroke="#5b7a32" d="M32 60 V8"/>
    ${[44, 30].map(y => `<ellipse ${S} fill="#5b7a32" cx="22" cy="${y}" rx="10" ry="5" transform="rotate(-25 22 ${y})"/><ellipse ${S} fill="#5b7a32" cx="42" cy="${y}" rx="10" ry="5" transform="rotate(25 42 ${y})"/>`).join("")}
    ${[8, 13, 18].map(y => `<circle fill="#9a6ac8" cx="29" cy="${y}" r="2.5"/><circle fill="#9a6ac8" cx="35" cy="${y}" r="2.5"/>`).join("")}`,

  chenpi: `
    ${[-30, 30, 90].map(r => `<path ${S} fill="#c8602a" d="M32 34 Q20 26 22 10 Q32 6 36 16 Q38 28 32 34 Z" transform="rotate(${r} 32 34)"/>`).join("")}
    <circle ${S} fill="#7a3a1a" cx="32" cy="34" r="4"/>`,

  "joss-paper": `
    <rect ${S} fill="#e8c86a" x="10" y="20" width="38" height="34" rx="2" transform="rotate(-8 29 37)"/>
    <rect ${S} fill="#d4a24a" x="20" y="28" width="16" height="16" transform="rotate(-8 29 37)"/>
    <path ${S} fill="${PALETTE.coral}" d="M46 22 Q42 12 50 4 Q58 14 52 22 Z"/>`,

  penaga: `
    ${[45, 135, 225, 315].map(r => `<ellipse ${S} fill="#fffdf0" cx="32" cy="16" rx="11" ry="13" transform="rotate(${r} 32 32)"/>`).join("")}
    <circle ${S} fill="#f2cf3c" cx="32" cy="32" r="9"/>
    ${[0, 60, 120, 180, 240, 300].map(r => `<circle fill="#e8a628" cx="32" cy="26" r="1.5" transform="rotate(${r} 32 32)"/>`).join("")}`,

  "banana-shrub": `
    <path ${S} fill="#8a5a3a" d="M18 36 Q14 22 22 16 Q28 24 24 36 Z"/>
    <path ${S} fill="#fffdf0" d="M30 50 Q24 32 36 22 Q50 30 44 50 Z"/>
    <path ${S} fill="#e9d76a" d="M34 50 Q32 38 38 30 Q44 40 40 50 Z"/>
    <path ${S} fill="none" stroke="#5b7a32" d="M20 36 Q24 50 30 58 L38 50"/>`,

  gardenia: `
    ${[0, 60, 120, 180, 240, 300].map((r, i) => `<path ${S} fill="${i % 2 ? "#f2d27a" : "#fffdf0"}" d="M32 32 Q20 22 28 8 Q40 10 38 24 Z" transform="rotate(${r} 32 32)"/>`).join("")}
    <circle ${S} fill="#e8a628" cx="32" cy="32" r="4"/>`,

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
  if (!art) {
    // No drawing of its own yet: use its family's drawing
    const note = (typeof DATA !== "undefined" && DATA.notes) ? DATA.notes.find(n => n.id === noteId) : null;
    return note ? familyIcon(note.family, size) : "";
  }
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
