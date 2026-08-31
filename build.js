#!/usr/bin/env node
/* ------------------------------------------------------------------
   BUILD — assembles dist/ from the two source files.

   The site is still hand-written HTML. This exists for one reason:
   the corpus needs to be readable by a crawler, and a crawler will
   not press "Convene committee". So the names get emitted a second
   time, as flat HTML, on a page of their own.

   Design is not duplicated here — the <style> block and the seal are
   lifted straight out of index.html, so the register can never drift
   from the office it belongs to.
------------------------------------------------------------------ */

const fs = require("fs");
const path = require("path");

const ORIGIN = "https://sprintname.dev";
const OUT = path.join(__dirname, "dist");

const read = f => fs.readFileSync(path.join(__dirname, f), "utf8");

/* ---------- sources ---------- */

const indexHtml = read("index.html");
const namesJs = read("names.js");
const GENRES = eval(namesJs + "; GENRES");

/* Pull the design out of the app rather than restating it. */
const lift = (re, label) => {
  const m = indexHtml.match(re);
  if (!m) throw new Error("build: could not lift " + label + " out of index.html");
  return m[0];
};
const styleBlock = lift(/<style>[\s\S]*?<\/style>/, "the <style> block");
const faviconLink = lift(/<link rel="icon"[^>]*>/, "the favicon");
const fontLinks = indexHtml.match(/<link rel="preconnect"[^>]*>|<link rel="stylesheet" href="https:\/\/fonts\.googleapis[^>]*>/g).join("\n");

/* ---------- the prose ----------
   A page that is only a list of names is a page Google files under
   "thin". Each genre gets a sentence that says what it is for. */

const BLURBS = {
  enterprise: "Names for the sprint that exists because a roadmap said so. The vocabulary of steering committees and quarterly objectives, quoted back accurately enough to sting.",
  despair: "The largest genre, which tells you something about the sample. For sprints defined less by their goal than by the state of the codebase they inherited.",
  oncall: "For the sprint that follows an incident, or contains one. Named from the pager's point of view, at the hour the pager prefers.",
  hope: "Optimism deployed as an engineering methodology. Best used at the start of a quarter, before the estimates have met the calendar.",
  brainrot: "Internet vernacular applied to release planning. The irony is load-bearing — check the size of your stakeholder audience before committing.",
  bofh: "In the tradition of the Bastard Operator From Hell: explanations offered to users, none of them true, all of them technically unfalsifiable.",
  cult: "For organisations where “alignment” has quietly stopped being a metaphor. Onboarding as initiation, company values as liturgy.",
  occult: "Agile ceremony taken literally. Stand-up as summoning, retrospective as séance, and a backlog that grows when nobody is observing it.",
  catastrophe: "The smallest and most theatrical genre. For sprints whose failure was visible from orbit and went ahead on schedule anyway."
};

const esc = s => s
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

/* Must match the slug() in index.html, or the deep links miss. */
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const total = GENRES.reduce((n, g) => n + g.names.length, 0);
const fits = (g, max) => g.names.filter(n => n.length <= max).length;
const totalUnder = max => GENRES.reduce((n, g) => n + fits(g, max), 0);

/* ---------- the register ---------- */

function genreSection(g, i) {
  const blurb = BLURBS[g.id];
  if (!blurb) throw new Error("build: genre '" + g.id + "' has no blurb in BLURBS");

  const items = g.names.map(n =>
    '        <li><a href="/#/' + g.id + "/" + slug(n) + '">' + esc(n) +
    '</a><span class="len">' + n.length + "</span></li>"
  ).join("\n");

  return `      <section class="field genre" id="${g.id}" style="--accent-raw:${g.accent}">
        <div class="field-head">
          <span class="field-label">${String(i + 1).padStart(2, "0")} / ${esc(g.label)}</span>
          <span class="readout">${g.names.length} entries &#183; ${fits(g, 26)} under 26</span>
        </div>
        <h2>${esc(g.label)} Sprint Names</h2>
        <p class="blurb">${blurb}</p>
        <ol class="names">
${items}
        </ol>
      </section>`;
}

const TITLE = "Funny Sprint Names — All 447 in the Register".replace("447", String(total));
const DESC = `All ${total} funny sprint names in the register, grouped into ${GENRES.length} genres, ` +
  `with character counts for teams working under the Jira 30-character limit.`;

const registerHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(TITLE)}</title>
<meta name="description" content="${esc(DESC)}">
<link rel="canonical" href="${ORIGIN}/funny-sprint-names">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#E4E2D9" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#111310" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Sprint Designation Office">
<meta property="og:url" content="${ORIGIN}/funny-sprint-names">
<meta property="og:title" content="${esc(TITLE)}">
<meta property="og:description" content="${esc(DESC)}">
<meta property="og:image" content="${ORIGIN}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(TITLE)}">
<meta name="twitter:description" content="${esc(DESC)}">
<meta name="twitter:image" content="${ORIGIN}/og.png">
${faviconLink}
${fontLinks}
${styleBlock}
<style>
/* ---------- register-only ---------- */
.wordmark--link{display:block;color:inherit;text-decoration:none}
.wordmark--link:hover em{color:var(--ink)}
.page-title{
  margin:0 0 14px;
  font-family:"Archivo Black","Arial Black",sans-serif;
  font-size:clamp(1.9rem,5.6vw,3.2rem);
  line-height:.95;
  letter-spacing:-.03em;
  text-wrap:balance;
}
.lede{margin:0 0 14px;max-width:62ch;font-size:1rem;line-height:1.62;color:var(--ink-2)}
.lede:last-child{margin-bottom:0}
.lede a{color:var(--accent);text-underline-offset:3px}
.genre h2{
  margin:0 0 10px;
  font-family:"Archivo Black","Arial Black",sans-serif;
  font-size:clamp(1.15rem,2.6vw,1.6rem);
  line-height:1.05;
  letter-spacing:-.02em;
}
.blurb{margin:0 0 18px;max-width:62ch;font-size:.94rem;line-height:1.6;color:var(--ink-2)}
/* Each genre stamps in its own ink, as it does in the app. --accent-raw
   arrives inline per section; --accent is derived from it here so the
   dark-mode lightening still happens. */
.genre{--accent:var(--accent-raw)}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .genre{--accent:color-mix(in oklab, var(--accent-raw), #FFFFFF 42%)}
}
:root[data-theme="dark"] .genre{--accent:color-mix(in oklab, var(--accent-raw), #FFFFFF 42%)}
.genre .field-label{color:var(--accent)}
.names{
  list-style:none;
  margin:0;padding:0;
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(258px,1fr));
  gap:0 28px;
}
.names li{
  display:flex;
  align-items:baseline;
  gap:10px;
  padding:7px 0;
  border-bottom:1px solid var(--rule-soft);
  font-size:.95rem;
}
.names a{
  color:var(--ink);
  text-decoration:none;
  flex:1;
  text-underline-offset:3px;
}
.names a:hover{color:var(--accent);text-decoration:underline}
.len{
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.66rem;
  color:var(--ink-3);
  font-variant-numeric:tabular-nums;
  flex:none;
}
.toc{display:flex;flex-wrap:wrap;gap:8px}
.toc a{
  display:inline-flex;
  align-items:center;
  gap:9px;
  padding:8px 13px 8px 10px;
  border:1px solid var(--rule);
  color:var(--ink-2);
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.7rem;
  font-weight:500;
  letter-spacing:.08em;
  text-transform:uppercase;
  text-decoration:none;
  transition:color .18s ease,border-color .18s ease;
}
.toc a::before{content:"";width:9px;height:9px;border:1px solid currentColor;flex:none}
.toc a:hover{color:var(--ink);border-color:var(--ink-3)}
.limits{
  width:100%;
  border-collapse:collapse;
  margin:0;
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.78rem;
  font-variant-numeric:tabular-nums;
}
.limits th,.limits td{
  text-align:right;
  padding:9px 0 9px 18px;
  border-bottom:1px solid var(--rule-soft);
}
.limits th:first-child,.limits td:first-child{text-align:left;padding-left:0;width:100%}
.limits th{color:var(--ink-2);font-weight:600;letter-spacing:.1em;text-transform:uppercase;font-size:.66rem}
.cta{
  display:inline-block;
  margin-top:6px;
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.78rem;
  font-weight:600;
  letter-spacing:.16em;
  text-transform:uppercase;
  padding:16px 26px;
  border:1px solid var(--ink);
  background:var(--ink);
  color:var(--sheet);
  text-decoration:none;
  transition:background .18s ease,color .18s ease,border-color .18s ease;
}
.cta:hover{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
</style>
</head>
<body>
<main class="sheet">

  <header class="masthead">
    <a class="wordmark wordmark--link" href="/">Sprint<br>Designation <em>Office</em></a>
    <div class="stamp-no">
      Appendix A<br>
      The complete register<br>
      ${total} entries &#183; ${GENRES.length} genres
    </div>
  </header>

  <section class="field">
    <div class="field-head">
      <span class="field-label">A.0 / Preamble</span>
      <span class="readout">Public record</span>
    </div>
    <h1 class="page-title">Funny Sprint Names</h1>
    <p class="lede">Every name this office has ever issued, all ${total} of them, published in full. They exist because the alternative was another sprint called <em>Synergy &amp; Innovation</em>, and because the generators that produce <em>Sprint Blue Falcon</em> by welding an adjective to a random noun are not actually funny — they just have the shape of a joke.</p>
    <p class="lede">Nothing here is generated. Every entry was written by hand and earns its place by being either technically specific (<em>Woodworms in Hashtable</em>) or tonally deranged (<em>The Scrum Master Has No Reflection</em>). Mild office humour is the exact failure mode this register exists to escape.</p>
    <p class="lede">The number after each name is its character count, which matters more than it should — see <a href="#limits">character limits</a> below. Click any name to have it stamped properly by <a href="/">the generator</a>.</p>
  </section>

  <section class="field">
    <div class="field-head">
      <span class="field-label">A.1 / Contents</span>
      <span class="readout">${GENRES.length} genres</span>
    </div>
    <nav class="toc" aria-label="Genres">
${GENRES.map(g => '      <a href="#' + g.id + '">' + esc(g.label) + " (" + g.names.length + ")</a>").join("\n")}
    </nav>
  </section>

${GENRES.map(genreSection).join("\n\n")}

  <section class="field" id="limits">
    <div class="field-head">
      <span class="field-label">A.${GENRES.length + 1} / Character limits</span>
      <span class="readout">Why the counts are there</span>
    </div>
    <h2>Sprint name character limits in Jira</h2>
    <p class="blurb">Jira caps a sprint name at <b>30 characters</b>. Teams that prefix their sprints with a board key &mdash; <code>TEAM-1 Refactor and Pray</code> &mdash; spend part of that budget before the name even begins, which is why the tightest preset in the generator leaves room for a short one. Pick a column below and ignore everything longer.</p>
    <table class="limits">
      <thead><tr><th>Genre</th><th>Names</th><th>&#8804; 30</th><th>&#8804; 26</th></tr></thead>
      <tbody>
${GENRES.map(g => "        <tr><td>" + esc(g.label) + "</td><td>" + g.names.length +
    "</td><td>" + fits(g, 30) + "</td><td>" + fits(g, 26) + "</td></tr>").join("\n")}
        <tr><td><b>Total</b></td><td><b>${total}</b></td><td><b>${totalUnder(30)}</b></td><td><b>${totalUnder(26)}</b></td></tr>
      </tbody>
    </table>
  </section>

  <section class="field">
    <div class="field-head">
      <span class="field-label">A.${GENRES.length + 2} / Disposal</span>
      <span class="readout">End of register</span>
    </div>
    <p class="lede">Reading a list is not the same as being handed a verdict. The generator convenes a committee, deliberates briefly, and stamps exactly one name &mdash; and it remembers which ones you have already been given, so it keeps serving fresh ones until a genre runs dry.</p>
    <a class="cta" href="/">Convene the committee</a>
  </section>

  <footer class="fineprint">
    <span>${total} designations on file</span>
    <span>Minutes stored in this browser only. Nothing is transmitted.</span>
    <a class="ghlink" href="https://github.com/Jay-Way/sprint-name-generator"
       target="_blank" rel="noopener noreferrer"
       aria-label="Source on GitHub" title="Source on GitHub">
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A7.995 7.995 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
    </a>
  </footer>

</main>
</body>
</html>
`;

/* ---------- emit ----------
   Keys are extensionless so CloudFront serves /funny-sprint-names
   directly from S3. No directory-index function to maintain. */

const SHORT = "public, max-age=300";
const LONG = "public, max-age=31536000, immutable";

/* index.html states the corpus size in three places a script can't reach at
   runtime — <title>, the description, the JSON-LD. Rather than let those drift
   every time names are added, the shipped copy gets the real number written in.
   Each pattern must match: a silent miss would defeat the point. */
function syncCount(html) {
  const patterns = [
    [/(<title>Sprint Name Generator \u2014 )\d+( Funny Sprint Names<\/title>)/, "title"],
    [/(funny sprint names \u2014 )\d+( across nine genres)/, "description"],
    [/(A curated generator of )\d+( funny sprint names)/, "JSON-LD description"],
    [/(<span id="corpus">)\d+(<\/span>)/, "footer count"]
  ];
  let out = html, changed = 0;
  for (const [re, label] of patterns) {
    if (!re.test(out)) throw new Error(
      "build: the " + label + " in index.html no longer matches its count pattern. "
      + "Update the pattern in syncCount(), or the count will silently go stale.");
    const next = out.replace(re, "$1" + total + "$2");
    if (next !== out) changed++;
    out = next;
  }
  if (changed) console.log("  (corpus count in index.html synced to " + total + ")");
  return out;
}

if (GENRES.length !== 9) {
  console.warn("  ! " + GENRES.length + " genres, but the copy still says \"nine\" — "
    + "check index.html's description and the register preamble.");
}

const files = [
  { key: "index.html", body: syncCount(indexHtml), contentType: "text/html; charset=utf-8", cacheControl: SHORT },
  { key: "names.js", body: namesJs, contentType: "text/javascript; charset=utf-8", cacheControl: SHORT },
  { key: "funny-sprint-names", body: registerHtml, contentType: "text/html; charset=utf-8", cacheControl: SHORT },
  { key: "og.png", body: fs.readFileSync(path.join(__dirname, "og.png")), contentType: "image/png", cacheControl: LONG }
];

fs.rmSync(OUT, { recursive: true, force: true });
for (const f of files) {
  const dest = path.join(OUT, f.key);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, f.body);
}

/* The workflow uploads whatever this lists, so adding a page later is a
   change to this file alone. */
fs.writeFileSync(
  path.join(OUT, "manifest.json"),
  JSON.stringify(files.map(({ key, contentType, cacheControl }) => ({ key, contentType, cacheControl })), null, 2) + "\n"
);

for (const f of files) {
  const size = Buffer.byteLength(f.body);
  console.log("  " + f.key.padEnd(22) + String(Math.round(size / 1024)).padStart(4) + " KB");
}
console.log("\ndist/ built — " + total + " names across " + GENRES.length + " genres");
