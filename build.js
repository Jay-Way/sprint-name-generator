#!/usr/bin/env node
/* ------------------------------------------------------------------
   BUILD — assembles dist/ from the source files.

   The site is still hand-written HTML. This exists for one reason:
   the corpus needs to be readable by a crawler, and a crawler will
   not press "Convene committee". So the names get emitted a second
   time, as flat HTML, on pages of their own.

   Design is not duplicated here — the <style> block, the LIMITS table
   and the seal are lifted straight out of index.html, so the generated
   pages can never drift from the office they belong to. Prose lives in
   content.js; this file is machinery.
------------------------------------------------------------------ */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { BLURBS, GENRE_PAGES, JIRA, MEMO } = require("./content.js");

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
const LIMITS = eval(lift(/const LIMITS = \[[\s\S]*?\];/, "the LIMITS table") + " LIMITS;");
const faviconLink = lift(/<link rel="icon"[^>]*>/, "the favicon");

/* The @font-face rules ride along inside styleBlock. What differs per page is
   which faces are worth preloading, and the generated pages lead with prose
   rather than chips — so IBM Plex Sans matters here and Mono 500 does not. */
const FONTS = [
  "archivo-black-400.woff2",
  "ibm-plex-mono-400.woff2",
  "ibm-plex-mono-500.woff2",
  "ibm-plex-mono-600.woff2",
  "ibm-plex-sans-var.woff2"
];
const PAGE_PRELOADS = [
  "archivo-black-400.woff2",
  "ibm-plex-mono-400.woff2",
  "ibm-plex-mono-600.woff2",
  "ibm-plex-sans-var.woff2"
].map(f => '<link rel="preload" href="/fonts/' + f + '" as="font" type="font/woff2" crossorigin>').join("\n");

/* ---------- helpers ---------- */

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
const allNames = GENRES.flatMap(g => g.names.map(n => ({ name: n, genre: g })));
const longest = g => Math.max(...g.names.map(n => n.length));

const REGISTER_URL = "/funny-sprint-names";
const JIRA_URL = "/sprint-names-for-jira";
const genreUrl = g => "/sprint-names/" + slug(g.label);

/* Every genre needs prose before it can have a page. Failing here is the
   point: a genre added to names.js with no entry in content.js would
   otherwise ship as a bare list, which is the shape search engines file
   under "doorway page". */
for (const g of GENRES) {
  if (!BLURBS[g.id]) throw new Error("build: genre '" + g.id + "' has no blurb in content.js");
  /* Runtime copy rather than page copy, but it fails the same way if it is
     missing: index.html would print "undefined" to anyone who worked their
     way through a whole genre, which is the least deserving audience for it. */
  if (!g.exhausted) throw new Error(
    "build: genre '" + g.id + "' has no exhausted line in names.js");
  const page = GENRE_PAGES[g.id];
  if (!page) throw new Error("build: genre '" + g.id + "' has no GENRE_PAGES entry in content.js");
  for (const [name] of page.picks) {
    if (!g.names.includes(name)) throw new Error(
      "build: '" + g.label + "' picks \"" + name + "\", which is not in that genre in names.js");
  }
}

/* ---------- page-only styles ---------- */

const PAGE_CSS = `/* ---------- generated pages only ---------- */
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
.lede a,.blurb a{color:var(--accent);text-underline-offset:3px}
.lede b,.blurb b{color:var(--ink)}
.genre h2,.section h2,.field > h2{
  margin:0 0 10px;
  font-family:"Archivo Black","Arial Black",sans-serif;
  font-size:clamp(1.15rem,2.6vw,1.6rem);
  line-height:1.05;
  letter-spacing:-.02em;
}
.field > h2 a,.genre h2 a{color:inherit;text-decoration:none}
.field > h2 a:hover,.genre h2 a:hover{color:var(--accent);text-decoration:underline;text-underline-offset:4px}
.blurb{margin:0 0 18px;max-width:62ch;font-size:.94rem;line-height:1.6;color:var(--ink-2)}
.blurb:last-child{margin-bottom:0}
code{
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.88em;
  background:color-mix(in oklab, var(--ink) 7%, transparent);
  padding:1px 5px;
}
/* Each genre stamps in its own ink, as it does in the app. --accent-raw
   arrives inline; --accent is derived from it here so the dark-mode
   lightening still happens. */
.genre,.tinted{--accent:var(--accent-raw)}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]) .genre,
  :root:not([data-theme="light"]) .tinted{--accent:color-mix(in oklab, var(--accent-raw), #FFFFFF 42%)}
}
:root[data-theme="dark"] .genre,
:root[data-theme="dark"] .tinted{--accent:color-mix(in oklab, var(--accent-raw), #FFFFFF 42%)}
.genre .field-label{color:var(--accent)}
.crumbs{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-bottom:16px;
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.66rem;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:var(--ink-3);
}
.crumbs a{color:var(--ink-2);text-underline-offset:3px}
.crumbs a:hover{color:var(--accent)}
.crumbs span[aria-hidden]{color:var(--rule)}
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
.names a{color:var(--ink);text-decoration:none;flex:1;text-underline-offset:3px}
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
/* issue / withhold advisory pair */
.advice{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(258px,1fr));
  gap:0 28px;
  margin:0 0 26px;
  border-top:1px solid var(--rule);
}
.advice > div{padding:14px 0 0}
.advice dt{
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.66rem;
  font-weight:600;
  letter-spacing:.18em;
  text-transform:uppercase;
  color:var(--accent);
  margin-bottom:8px;
}
.advice dd{margin:0;font-size:.94rem;line-height:1.55;color:var(--ink-2)}
/* selected entries, with commentary */
.picks{list-style:none;margin:0;padding:0}
.picks li{padding:15px 0;border-bottom:1px solid var(--rule-soft)}
.picks li:first-child{border-top:1px solid var(--rule)}
.pick-name{
  display:flex;
  align-items:baseline;
  gap:10px;
  font-family:"Archivo Black","Arial Black",sans-serif;
  font-size:clamp(1rem,2.2vw,1.28rem);
  letter-spacing:-.02em;
  line-height:1.15;
}
.pick-name a{color:var(--ink);text-decoration:none}
.pick-name a:hover{color:var(--accent);text-decoration:underline;text-underline-offset:3px}
.pick-note{margin:7px 0 0;font-size:.92rem;line-height:1.55;color:var(--ink-2);max-width:62ch}
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
.limits a{color:var(--ink);text-underline-offset:3px}
.limits a:hover{color:var(--accent)}
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

/* ---------- Form SN-02 only ---------- */
/* A bar, not a deletion: the word underneath stays in the markup and stays
   reachable by a screen reader, which is the honest way to redact a joke. */
.redacted{
  background:var(--ink);
  color:transparent;
  padding:0 .12em;
  border-radius:1px;
  user-select:none;
}
.signblock{
  margin:0;
  padding:0;
  list-style:none;
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.72rem;
  letter-spacing:.06em;
  line-height:2.1;
  color:var(--ink-2);
}
.signblock li{border-bottom:1px dotted var(--rule);padding:2px 0}
.signblock li:last-child{border-bottom:0}`;

/* ---------- shared page furniture ---------- */

function crumbs(trail) {
  const sep = '<span aria-hidden="true">/</span>';
  return '<nav class="crumbs" aria-label="Breadcrumb">'
    + trail.slice(0, -1).map(c => '<a href="' + c.url + '">' + esc(c.label) + "</a>").join(sep)
    + sep + '<span aria-current="page">' + esc(trail[trail.length - 1].label) + "</span></nav>";
}

function crumbsLd(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: ORIGIN + c.url
    }))
  };
}

/* The names themselves, as a grid of links back into the app. */
function nameList(items) {
  return '<ol class="names">\n' + items.map(x =>
    '      <li><a href="/#/' + x.genre.id + "/" + slug(x.name) + '">' + esc(x.name)
    + '</a><span class="len">' + x.name.length + "</span></li>"
  ).join("\n") + "\n    </ol>";
}
const genreItems = g => g.names.map(n => ({ name: n, genre: g }));

function genreNav(current) {
  return '<nav class="toc" aria-label="Genres">\n' + GENRES
    .filter(g => g !== current)
    .map(g => '      <a href="' + genreUrl(g) + '">' + esc(g.label) + " (" + g.names.length + ")</a>")
    .join("\n") + "\n    </nav>";
}

function shell({ title, desc, url, stamp, ogType = "article", robotsMeta = "index, follow, max-image-preview:large", jsonLd = [], accent, body }) {
  const ld = jsonLd.map(o =>
    '<script type="application/ld+json">\n' + JSON.stringify(o, null, 2) + "\n</script>").join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${ORIGIN}${url}">
<meta name="robots" content="${robotsMeta}">
<meta name="theme-color" content="#E4E2D9" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#111310" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Sprint Designation Office">
<meta property="og:url" content="${ORIGIN}${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ORIGIN}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ORIGIN}/og.png">
${faviconLink}
${PAGE_PRELOADS}
${styleBlock}
<style>
${PAGE_CSS}
</style>
${ld}
</head>
<body>
<main class="sheet${accent ? " tinted" : ""}"${accent ? ' style="--accent-raw:' + accent + '"' : ""}>

  <header class="masthead">
    <a class="wordmark wordmark--link" href="/">Sprint<br>Designation <em>Office</em></a>
    <div class="stamp-no">
      ${stamp.join("<br>\n      ")}
    </div>
  </header>

${body}

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
}

/* ---------- the register ---------- */

function registerSection(g, i) {
  return `  <section class="field genre" id="${g.id}" style="--accent-raw:${g.accent}">
    <div class="field-head">
      <span class="field-label">${String(i + 1).padStart(2, "0")} / ${esc(g.label)}</span>
      <span class="readout">${g.names.length} entries &#183; ${fits(g, 26)} under 26</span>
    </div>
    <h2><a href="${genreUrl(g)}">${esc(g.label)} Sprint Names</a></h2>
    <p class="blurb">${BLURBS[g.id]} <a href="${genreUrl(g)}">More on this genre &#8594;</a></p>
    ${nameList(genreItems(g))}
  </section>`;
}

const registerPage = shell({
  title: `Funny Sprint Names — All ${total} in the Register`,
  desc: `All ${total} funny sprint names in the register, grouped into ${GENRES.length} genres, `
    + "with character counts for teams working under the Jira 30-character limit.",
  url: REGISTER_URL,
  stamp: ["Appendix A", "The complete register", `${total} entries &#183; ${GENRES.length} genres`],
  jsonLd: [crumbsLd([
    { label: "Sprint Name Generator", url: "/" },
    { label: "Funny Sprint Names", url: REGISTER_URL }
  ])],
  body: `  <section class="field">
    <div class="field-head">
      <span class="field-label">A.0 / Preamble</span>
      <span class="readout">Public record</span>
    </div>
    ${crumbs([{ label: "Generator", url: "/" }, { label: "Funny Sprint Names" }])}
    <h1 class="page-title">Funny Sprint Names</h1>
    <p class="lede">Every name this office has ever issued, all ${total} of them, published in full. They exist because the alternative was another sprint called <em>Synergy &amp; Innovation</em>, and because the generators that produce <em>Sprint Blue Falcon</em> by welding an adjective to a random noun are not actually funny — they just have the shape of a joke.</p>
    <p class="lede">Nothing here is generated. Every entry was written by hand and earns its place by being either uncomfortably accurate (<em>Refactor and Pray</em>) or tonally deranged (<em>Soft Launch Into Darkness</em>). Mild office humour is the exact failure mode this register exists to escape.</p>
    <p class="lede">The number after each name is its character count, which matters more than it should — see <a href="${JIRA_URL}">sprint name character limits in Jira</a>. Click any name to have it stamped properly by <a href="/">the generator</a>.</p>
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

${GENRES.map(registerSection).join("\n\n")}

  <section class="field" id="limits">
    <div class="field-head">
      <span class="field-label">A.${GENRES.length + 1} / Character limits</span>
      <span class="readout">Why the counts are there</span>
    </div>
    <h2>How many of these fit in Jira</h2>
    <p class="blurb">Jira caps a sprint name at <b>30 characters</b>, and a board prefix spends part of that before the name begins. The full explanation, with sources, is on <a href="${JIRA_URL}">sprint names for Jira</a>. The short version is this table.</p>
    <table class="limits">
      <thead><tr><th>Genre</th><th>Names</th><th>&#8804; 30</th><th>&#8804; 26</th></tr></thead>
      <tbody>
${GENRES.map(g => `        <tr><td><a href="${genreUrl(g)}">${esc(g.label)}</a></td><td>${g.names.length}</td><td>${fits(g, 30)}</td><td>${fits(g, 26)}</td></tr>`).join("\n")}
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
  </section>`
});

/* ---------- genre pages ---------- */

function genrePage(g) {
  const c = GENRE_PAGES[g.id];
  const label = esc(g.label);
  const n30 = fits(g, 30), n26 = fits(g, 26);
  const picks = c.picks.map(([name, note]) =>
    `      <li>
        <span class="pick-name"><a href="/#/${g.id}/${slug(name)}">${esc(name)}</a><span class="len">${name.length}</span></span>
        <p class="pick-note">${note}</p>
      </li>`).join("\n");

  return shell({
    title: `${g.label} Sprint Names — ${g.names.length} of Them`,
    desc: `${g.names.length} ${g.label.toLowerCase()} sprint names, with character counts and notes `
      + `on when the genre lands. ${n26} fit under Jira's limit with room for a board prefix.`,
    url: genreUrl(g),
    accent: g.accent,
    stamp: ["Genre file", label, `${g.names.length} entries`],
    jsonLd: [crumbsLd([
      { label: "Sprint Name Generator", url: "/" },
      { label: "Funny Sprint Names", url: REGISTER_URL },
      { label: g.label, url: genreUrl(g) }
    ])],
    body: `  <section class="field">
    <div class="field-head">
      <span class="field-label">01 / The genre</span>
      <span class="readout">${g.names.length} entries &#183; ${n30} under 30</span>
    </div>
    ${crumbs([
      { label: "Generator", url: "/" },
      { label: "Register", url: REGISTER_URL },
      { label: g.label }
    ])}
    <h1 class="page-title">${label} Sprint Names</h1>
${c.lede.map(p => '    <p class="lede">' + p + "</p>").join("\n")}
  </section>

  <section class="field">
    <div class="field-head">
      <span class="field-label">02 / Advisory</span>
      <span class="readout">Non-binding</span>
    </div>
    <dl class="advice">
      <div><dt>Issue when</dt><dd>${c.useIt}</dd></div>
      <div><dt>Withhold when</dt><dd>${c.avoid}</dd></div>
    </dl>
    <h2>Selected entries</h2>
    <ol class="picks">
${picks}
    </ol>
  </section>

  <section class="field genre" id="${g.id}">
    <div class="field-head">
      <span class="field-label">03 / The full list</span>
      <span class="readout">${n26} under 26 &#183; longest ${longest(g)}</span>
    </div>
    <h2>All ${g.names.length} ${label} sprint names</h2>
    <p class="blurb">The number after each is its character count. ${n30} of these ${n30 === 1 ? "fits" : "fit"} Jira's 30-character cap, and ${n26} still ${n26 === 1 ? "fits" : "fit"} with a short board prefix in front — see <a href="${JIRA_URL}">sprint names for Jira</a>. Click one to have it stamped by <a href="/">the generator</a>.</p>
    ${nameList(genreItems(g))}
  </section>

  <section class="field">
    <div class="field-head">
      <span class="field-label">04 / Other genres</span>
      <span class="readout">${GENRES.length - 1} more on file</span>
    </div>
    <h2>The other ${GENRES.length - 1} genres</h2>
    <p class="blurb">If this is not the register you needed, the rest are one click away. All ${total} names sit together on <a href="${REGISTER_URL}">the complete register</a>.</p>
    ${genreNav(g)}
  </section>

  <section class="field">
    <div class="field-head">
      <span class="field-label">05 / Disposal</span>
      <span class="readout">End of file</span>
    </div>
    <p class="lede">Reading a list is not the same as being handed a verdict. The generator convenes a committee, deliberates briefly, and stamps exactly one name &mdash; and it remembers which ones you have already had, so it keeps serving fresh ones until the genre runs dry.</p>
    <a class="cta" href="/#/${g.id}/${slug(g.names[0])}">Convene the committee</a>
  </section>`
  });
}

/* ---------- the Jira page ---------- */

const SHORT_MAX = 16;
const shortNames = allNames
  .filter(x => x.name.length <= SHORT_MAX)
  .sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name));
const exactly30 = allNames.filter(x => x.name.length === 30).length;

const jiraPage = shell({
  title: "Jira Sprint Name Character Limit (and What Fits)",
  desc: "Jira caps sprint names at 30 characters — in the UI only; the database column holds 255. "
    + `What that means for board prefixes, plus ${totalUnder(26)} names that fit.`,
  url: JIRA_URL,
  stamp: ["Technical note", "Character limits", "Cloud &amp; Data Center"],
  jsonLd: [crumbsLd([
    { label: "Sprint Name Generator", url: "/" },
    { label: "Funny Sprint Names", url: REGISTER_URL },
    { label: "Sprint Names for Jira", url: JIRA_URL }
  ])],
  body: `  <section class="field">
    <div class="field-head">
      <span class="field-label">01 / The number</span>
      <span class="readout">Answered immediately</span>
    </div>
    ${crumbs([
      { label: "Generator", url: "/" },
      { label: "Register", url: REGISTER_URL },
      { label: "Sprint Names for Jira" }
    ])}
    <h1 class="page-title">Jira Sprint Name Character Limit</h1>
    <p class="lede">${JIRA.answer}</p>
    <p class="lede">Of the ${total} names in this register, <b>${totalUnder(30)}</b> fit inside it, and <b>${totalUnder(26)}</b> still fit with a short board prefix in front. ${exactly30} of them land on exactly 30 characters, which is either satisfying or intolerable depending on the week.</p>
  </section>

${JIRA.body.map((s, i) => `  <section class="field section">
    <div class="field-head">
      <span class="field-label">0${i + 2} / ${esc(s.label)}</span>
      <span class="readout">&nbsp;</span>
    </div>
    <h2>${esc(s.h)}</h2>
${s.p.map(p => '    <p class="blurb">' + p + "</p>").join("\n")}
  </section>`).join("\n\n")}

  <section class="field">
    <div class="field-head">
      <span class="field-label">0${JIRA.body.length + 2} / By genre</span>
      <span class="readout">Counted at build time</span>
    </div>
    <h2>How many sprint names fit the Jira limit, by genre</h2>
    <p class="blurb">Every figure below is counted from the same file the generator reads, so it cannot drift as names are added.</p>
    <table class="limits">
      <thead><tr><th>Genre</th><th>Names</th><th>&#8804; 30</th><th>&#8804; 26</th></tr></thead>
      <tbody>
${GENRES.map(g => `        <tr><td><a href="${genreUrl(g)}">${esc(g.label)}</a></td><td>${g.names.length}</td><td>${fits(g, 30)}</td><td>${fits(g, 26)}</td></tr>`).join("\n")}
        <tr><td><b>Total</b></td><td><b>${total}</b></td><td><b>${totalUnder(30)}</b></td><td><b>${totalUnder(26)}</b></td></tr>
      </tbody>
    </table>
  </section>

  <section class="field">
    <div class="field-head">
      <span class="field-label">0${JIRA.body.length + 3} / Short list</span>
      <span class="readout">${shortNames.length} at ${SHORT_MAX} characters or fewer</span>
    </div>
    <h2>Short sprint names that fit any prefix convention</h2>
    <p class="blurb">These ${shortNames.length} are ${SHORT_MAX} characters or shorter, leaving at least ${30 - SHORT_MAX} for whatever your board puts in front of them. If your naming convention is long, start here.</p>
    ${nameList(shortNames)}
  </section>

  <section class="field">
    <div class="field-head">
      <span class="field-label">0${JIRA.body.length + 4} / Disposal</span>
      <span class="readout">End of note</span>
    </div>
    <p class="lede">${JIRA.closing} The generator filters the whole corpus to either threshold before it offers you anything, and prints the count on every name it issues.</p>
    <a class="cta" href="/">Convene the committee</a>
  </section>`
});

/* ---------- Form SN-02 ----------
   Deliberately thin on machinery. No JSON-LD, because it asks not to be
   indexed; no genre nav, because it is not part of the register. It is one
   internal document that happens to be reachable. */

const MEMO_URL = "/form-sn-02";

const memoPage = shell({
  title: MEMO.title,
  desc: MEMO.desc,
  url: MEMO_URL,
  robotsMeta: "noindex, nofollow",
  stamp: MEMO.stamp,
  body: `  <section class="field">
    <div class="field-head">
      <span class="field-label">00 / Notice</span>
      <span class="readout">Internal distribution</span>
    </div>
    ${crumbs([
      { label: "Generator", url: "/" },
      { label: "Form SN-02" }
    ])}
    <h1 class="page-title">Notice of Continued Operation</h1>
    <p class="lede">${MEMO.lede}</p>
  </section>

${MEMO.body.map((s, i) => `  <section class="field section">
    <div class="field-head">
      <span class="field-label">0${i + 1} / ${esc(s.label)}</span>
      <span class="readout">&nbsp;</span>
    </div>
    <h2>${esc(s.h)}</h2>
${s.p.map(p => '    <p class="blurb">' + p + "</p>").join("\n")}
  </section>`).join("\n\n")}

  <section class="field">
    <div class="field-head">
      <span class="field-label">0${MEMO.body.length + 1} / Signatures</span>
      <span class="readout">&nbsp;</span>
    </div>
    <ul class="signblock">
${MEMO.sign.map(s => "      <li>" + s + "</li>").join("\n")}
    </ul>
    <a class="cta" href="/">Return to the form</a>
  </section>`
});

/* ---------- index.html adjustments ---------- */

/* The chips are the page's only JS-built markup above the fold, and building
   them at runtime reflowed everything below. Written in here they are present
   at first paint; index.html's wireChips() then only attaches handlers. The
   genre labels become indexable text on the homepage as a side effect. */
function renderChips(html) {
  const chips = labels => labels
    .map(l => '<button class="chip" type="button">' + esc(l) + "</button>")
    .join("");
  const into = (h, id, labels) => {
    const re = new RegExp('(<div class="chips" id="' + id + '"[^>]*>)</div>');
    if (!re.test(h)) throw new Error(
      "build: could not find an empty #" + id + " container in index.html. "
      + "If its markup changed, update renderChips().");
    return h.replace(re, "$1" + chips(labels) + "</div>");
  };
  return into(
    into(html, "genre-chips", GENRES.map(g => g.label)),
    "limit-chips", LIMITS.map(l => l.label));
}

/* index.html states the corpus size in three places a script can't reach at
   runtime — <title>, the description, the JSON-LD. Rather than let those drift
   every time names are added, the shipped copy gets the real number written in.
   Each pattern must match: a silent miss would defeat the point. */
function syncCount(html) {
  const patterns = [
    [/(<title>Sprint Name Generator — )\d+( Funny Sprint Names<\/title>)/, "title"],
    [/(funny sprint names — )\d+( across nine genres)/, "description"],
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

/* ---------- sitemap and robots ----------

   Every generated page has the same dependency set — the corpus, the prose,
   the template and the style block — so they genuinely are all regenerated
   together, and one lastmod across the whole sitemap is the honest answer
   rather than a convenient one.

   It comes from git rather than the clock: stamping today's date on every URL
   at every build is the pattern that teaches Google to ignore the field. If
   the history isn't there (a shallow CI clone), lastmod is omitted entirely —
   no date beats a wrong one. The workflow checks out with fetch-depth: 0 so
   that this works.

   No <priority> or <changefreq>: Google ignores both, and has said so. */
const BUILD_INPUTS = ["index.html", "names.js", "content.js", "build.js"];

function lastModified() {
  try {
    const dates = BUILD_INPUTS
      .map(f => execSync("git log -1 --format=%cI -- " + f,
        { cwd: __dirname, stdio: ["ignore", "pipe", "ignore"] }).toString().trim())
      .filter(Boolean);
    return dates.length ? dates.sort().pop() : null;
  } catch (e) {
    console.error(e);
  }
    return null;                       // not a git checkout, or no history
  }
}

/* index.html is served at "/", and that is what its canonical says, so that
   is what the sitemap has to list. A sitemap URL that disagrees with the
   page's own canonical is a self-inflicted crawl problem. */
const pageUrl = key => ORIGIN + (key === "index.html" ? "/" : "/" + key);

function sitemap(pageKeys) {
  const mod = lastModified();
  if (!mod) console.warn("  ! no git history for the build inputs — sitemap omits <lastmod>");
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + pageKeys.map(k => "  <url>\n    <loc>" + esc(pageUrl(k)) + "</loc>\n"
        + (mod ? "    <lastmod>" + mod + "</lastmod>\n" : "") + "  </url>")
      .join("\n")
    + "\n</urlset>\n";
}

/* There is nothing here worth disallowing. The file exists so that the
   sitemap gets announced, and so that /robots.txt stops returning the 403
   that an empty S3 key produces. */
const robots = `User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;

/* ---------- emit ----------
   Keys are extensionless so CloudFront serves /funny-sprint-names directly
   from S3. No directory-index function to maintain. */

const SHORT = "public, max-age=300";
const LONG = "public, max-age=31536000, immutable";
const page = (url, body) => ({
  key: url.replace(/^\//, ""),
  body,
  contentType: "text/html; charset=utf-8",
  cacheControl: SHORT
});

const files = [
  page("index.html", renderChips(syncCount(indexHtml))),
  { key: "names.js", body: namesJs, contentType: "text/javascript; charset=utf-8", cacheControl: SHORT },
  page(REGISTER_URL, registerPage),
  page(JIRA_URL, jiraPage),
  /* Absent from the sitemap by way of unlisted, but still uploaded. */
  { ...page(MEMO_URL, memoPage), unlisted: true },
  ...GENRES.map(g => page(genreUrl(g), genrePage(g))),
  { key: "og.png", body: fs.readFileSync(path.join(__dirname, "og.png")), contentType: "image/png", cacheControl: LONG },
  ...FONTS.map(f => ({
    key: "fonts/" + f,
    body: fs.readFileSync(path.join(__dirname, "fonts", f)),
    contentType: "font/woff2",
    cacheControl: LONG
  }))
];

/* Appended after the fact so the sitemap lists exactly the pages that were
   actually emitted, and can never fall out of step with them. */
const pageKeys = files
  .filter(f => f.contentType.startsWith("text/html") && !f.unlisted)
  .map(f => f.key);
files.push(
  { key: "sitemap.xml", body: sitemap(pageKeys), contentType: "application/xml; charset=utf-8", cacheControl: SHORT },
  { key: "robots.txt", body: robots, contentType: "text/plain; charset=utf-8", cacheControl: SHORT }
);

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
  console.log("  " + f.key.padEnd(36) + String(Math.round(Buffer.byteLength(f.body) / 1024)).padStart(4) + " KB");
}
console.log("\ndist/ built — "
  + files.filter(f => f.contentType.startsWith("text/html")).length + " pages, "
  + total + " names across " + GENRES.length + " genres");
