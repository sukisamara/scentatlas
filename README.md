# Scent Atlas · Singapore Edition

Local perfumes, the history behind their notes, and where to smell them.
Plain HTML, CSS and JS with no build step, hosted on GitHub Pages.

## Put it online (GitHub web upload, no installs)

1. Go to github.com → **New repository** → name it `scent-atlas` → Public → **Create repository**.
2. On the empty repo page, click **uploading an existing file**.
3. Unzip `scent-atlas.zip` on your laptop. Drag **everything inside the folder** (index.html, style.css, app.js, README.md and the `data` folder) into the upload box.
   - Check the `data` folder came through with its 5 JSON files.
4. Click **Commit changes**.
5. Go to **Settings → Pages**. Under "Build and deployment", set Source = **Deploy from a branch**, Branch = **main**, folder = **/ (root)** → **Save**.
6. Wait 1–2 minutes, then open **https://sukisamara.github.io/scent-atlas/**

Note: opening `index.html` straight from your computer shows "Couldn't load the data", because browsers block local JSON files. Use the GitHub Pages link.

## How the files fit together

| File | What it holds |
| --- | --- |
| `data/editions.json` | The pins on the world map: which countries are live, coming soon, or the origin story |
| `lib/` | d3 and topojson-client, the libraries that draw and zoom the map. No need to edit |
| `data/world.json` | Country shapes from Natural Earth (public domain). No need to edit |
| `data/cities.json` | Up to 8 main cities for every country, from GeoNames (CC BY 4.0) |
| `data/notes.json` | The Singapore notes: story, sources, and `aliases` (the words that link a perfume note to this story) |
| `data/perfumes.json` | One entry per perfume: `top` / `heart` / `base` lists, or a flat `notes` list if the pyramid isn't published |
| `data/brands.json` | All brands. `"check": true` shows a "To verify" badge |
| `data/experiences.json` | Workshops (`"kind": "Workshop"`) and places (`"kind": "Place"`) |
| `data/trail.json` | The one-day scent trail |
| `data/families.json` | The note families (Citrus, White flowers, Spices…), inspired by Fragrantica's note groups. Every perfume note must be listed in one family, or be an alias of a story note in `notes.json` |
| `app.js` | Reads the JSON and draws each page. Links notes to stories automatically |
| `graphics.js` | The illustrated bottles and note icons |
| `style.css` | Palette and fonts at the top, under `:root` |

## Add a new edition to the world map

In `data/editions.json`, change a country's `"status"` from `"soon"` to `"live"` and give it an `"edition"`, `"tagline"`, `"link"` and `"icons"` (copy Singapore's entry). It then gets a red pin and its own pop-up window. Add `"country"` (its name as on the map) and `"city"` (a city name from `data/cities.json`) so the pin lands on that city.

### How the map works

- The 32 largest countries get a postage stamp label.
- Click any country (or its stamp) to zoom in and see its main cities. Click a city for its pop-up. Press Esc or "← World map" to zoom back out.
- Live editions get a red pin; Taiwan, where the idea started, gets an olive pin.

Credits: map data from Natural Earth; city data from GeoNames (CC BY 4.0), which asks for the credit line shown under the map.

## Add a perfume

Copy one entry in `perfumes.json`, change the fields, and save. Any note that matches an alias in `notes.json` (e.g. "Jasmine", "Oud", "Nutmeg") becomes a link to its story automatically. Set `"notesComplete": false` if you only have part of the notes list.

## Adding a note

- **A note with a Singapore story:** add it to `data/notes.json` with a `"family"` (an id from `families.json`).
- **Any other note:** add its name, in lowercase, to the `"notes"` list of the right family in `data/families.json`.

Every note then gets its own page at `#/notes/<name>`, shows up in its family on the Notes page, and becomes a link on every perfume that uses it.

## Graphics and real bottle photos

`graphics.js` draws every bottle and note icon in code, using the site palette. Each perfume always gets the same bottle shape, with the liquid coloured by its main Singapore note.

To use a real product photo instead (only with the brand's permission):
1. Upload the photo into an `images` folder, e.g. `images/nanyang.jpg`
2. In `data/perfumes.json`, add `"image": "images/nanyang.jpg"` to that perfume
3. The photo replaces the illustration everywhere that perfume appears

## Fonts

Bright Retro and AC Real Adult are Canva fonts, and there may not be web versions you can load on a website. The site uses free Google Fonts stand-ins:

- **Rozha One** for Bright Retro (headings)
- **Nanum Pen Script**, in capitals, for AC Real Adult (handwritten accents)

To use different fonts, change the `--font-display` and `--font-hand` lines at the top of `style.css`. For the logo, you can do what you did for Cami: export the wordmark from Canva as a transparent PNG and put it in the header.

## Data formats added in November 2026

- **Trail stops** (`data/trail.json`): each stop has `address`, `lat`, `lon` and `highlight` (true for must-go stops, with a one-line `why`). The map uses Leaflet (in `lib/`) with CARTO street tiles; Google Maps links are built from the name and address.
- **Brands** (`data/brands.json`): `links` holds `website`, `instagram`, `tiktok` and `facebook` (leave out any you can't confirm), and `sources` lists where the facts come from.
- **Notes** (`data/notes.json`): besides `story` (history and heritage), each note can have `everyday` and `lore` lists. Every item is `{ "text": ..., "src": { "title": ..., "url": ... } }`, so each fact carries its own source.
