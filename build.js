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
const { BLURBS, GENRE_PAGES, JIRA, MEMO, REVISIONS, DOCUMENTS, RECORDS } = require("./content.js");

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
/* The committee's procedure, for the Committee Room in the basement, which
   must run the same session the form does. */
const PROCEDURE = eval(lift(/const PROCEDURE = \[[\s\S]*?\];/, "the PROCEDURE list") + " PROCEDURE;");
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
const DOCS_URL = "/administrative-documents";
const REVISIONS_URL = "/revision-history";

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
.signblock li:last-child{border-bottom:0}

/* ---------- the documents index and the revision history ---------- */
/* Both are filing, not prose: a code, a title, a status, and a line
   underneath explaining why the status is what it is. The code column is
   given a fixed measure so the statuses line up down the page, which is
   the entire aesthetic argument for a form. */
.doclist,.revlist{list-style:none;margin:0;padding:0}
.doclist > li{padding:11px 0;border-bottom:1px solid var(--rule-soft)}
.doclist > li:last-child{border-bottom:0}
.doc-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px}
.doc-code{
  flex:none;
  min-width:5.6em;
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.66rem;
  font-weight:600;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:var(--ink-3);
}
.doc-name{flex:1 1 12ch;font-size:.98rem;color:var(--ink)}
a.doc-name{text-decoration:none;text-underline-offset:3px}
a.doc-name:hover{color:var(--accent);text-decoration:underline}
/* SN-06 and after have no title, only a condition. The condition takes the
   title's place rather than sitting in the status column next to nothing. */
.doc-name--stamp{
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.74rem;
  letter-spacing:.16em;
  color:var(--ink-3);
}
.doc-status{
  flex:none;
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.62rem;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:var(--ink-3);
}
.doc-note{
  margin:5px 0 0;
  padding-left:calc(5.6em + 12px);
  max-width:60ch;
  font-size:.85rem;
  line-height:1.55;
  color:var(--ink-3);
}
.doclist a.doc-name:hover ~ .doc-status{color:var(--accent)}
@media (max-width:560px){.doc-note{padding-left:0}}

.revlist > li{padding:15px 0;border-bottom:1px solid var(--rule-soft)}
.revlist > li:last-child{border-bottom:0}
.rev-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px;margin-bottom:6px}
.rev-no{
  font-family:"Archivo Black","Arial Black",sans-serif;
  font-size:1.1rem;
  letter-spacing:-.02em;
  line-height:1;
}
.rev-status{
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.62rem;
  letter-spacing:.16em;
  text-transform:uppercase;
  color:var(--ink-3);
}
.rev--current .rev-no{color:var(--accent)}
.rev--current .rev-status{color:var(--accent)}
.rev-effective{
  margin-left:auto;
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.62rem;
  letter-spacing:.1em;
  text-transform:uppercase;
  color:var(--ink-3);
}
.filed{
  margin:18px 0 0;
  padding-top:12px;
  border-top:1px solid var(--rule);
  max-width:60ch;
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.68rem;
  line-height:1.85;
  letter-spacing:.04em;
  color:var(--ink-3);
}`;

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

function shell({ title, desc, url, stamp, ogType = "article", robotsMeta = "index, follow, max-image-preview:large", jsonLd = [], accent, body, extraCss = "", script = "" }) {
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
${PAGE_CSS}${extraCss}
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
    <a class="reglink" href="${DOCS_URL}">Administrative documents</a>
    <a class="ghlink" href="https://github.com/Jay-Way/sprint-name-generator"
       target="_blank" rel="noopener noreferrer"
       aria-label="Source on GitHub" title="Source on GitHub">
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A7.995 7.995 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
    </a>
  </footer>

</main>
${script}</body>
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
  title: `Unhinged Sprint Names — All ${total} in the Register`,
  desc: `All ${total} sprint names in the register — sarcastic, unhinged, occasionally funny — grouped into ${GENRES.length} genres, `
    + "with character counts for teams working under the Jira 30-character limit.",
  url: REGISTER_URL,
  stamp: ["Appendix A", "The complete register", `${total} entries &#183; ${GENRES.length} genres`],
  jsonLd: [crumbsLd([
    { label: "Sprint Name Generator", url: "/" },
    { label: "Unhinged Sprint Names", url: REGISTER_URL }
  ])],
  body: `  <section class="field">
    <div class="field-head">
      <span class="field-label">A.0 / Preamble</span>
      <span class="readout">Public record</span>
    </div>
    ${crumbs([{ label: "Generator", url: "/" }, { label: "Unhinged Sprint Names" }])}
    <h1 class="page-title">Unhinged Sprint Names</h1>
    <p class="lede">Every name this office has ever issued, all ${total} of them, published in full. They exist because the alternative was another sprint called <em>Synergy &amp; Innovation</em>, and because the generators that produce <em>Sprint Blue Falcon</em> by welding an adjective to a random noun are not actually funny — they just have the shape of a joke.</p>
    <p class="lede">The pages are generated; the names are not. A build script assembled everything you are reading except the entries themselves, each of which was written by a person, by hand, and earns its place by being either uncomfortably accurate (<em>Refactor and Pray</em>) or tonally deranged (<em>Soft Launch Into Darkness</em>). Mild office humour is the exact failure mode this register exists to escape.</p>
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
      { label: "Unhinged Sprint Names", url: REGISTER_URL },
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
    { label: "Unhinged Sprint Names", url: REGISTER_URL },
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

/* ---------- the documents index and Form SN-01's revisions ----------
   Both are noindex: two pages of filing with no names on them is exactly
   the thin content the register exists to avoid producing. They are linked
   from the seal on the form and from every generated footer, which is how
   a document nobody indexes is supposed to be found.

   The index is checked against reality below: every internal link it makes
   has to be a page this build actually emits, apart from the one flagged
   `absent`, which has to 404 or the joke does not land. */

const docRow = d => {
  const named = d.name
    ? (d.url
        ? '<a class="doc-name" href="' + d.url + '">' + esc(d.name) + "</a>"
        : '<span class="doc-name">' + esc(d.name) + "</span>")
    : '<span class="doc-name doc-name--stamp">' + esc(d.status) + "</span>";
  return `      <li>
        <div class="doc-head">
          <span class="doc-code">${esc(d.code)}</span>
          ${named}
          ${d.name ? '<span class="doc-status">' + esc(d.status) + "</span>" : ""}
        </div>
        <p class="doc-note">${d.note}</p>
      </li>`;
};

const documentsPage = shell({
  title: DOCUMENTS.title,
  desc: DOCUMENTS.desc,
  url: DOCS_URL,
  robotsMeta: "noindex, nofollow",
  stamp: DOCUMENTS.stamp,
  body: `  <section class="field">
    <div class="field-head">
      <span class="field-label">00 / Index</span>
      <span class="readout">Held and not held</span>
    </div>
    ${crumbs([
      { label: "Generator", url: "/" },
      { label: "Administrative documents" }
    ])}
    <h1 class="page-title">Administrative Documents</h1>
    <p class="lede">${DOCUMENTS.lede}</p>
  </section>

  <section class="field section">
    <div class="field-head">
      <span class="field-label">01 / Forms</span>
      <span class="readout">${DOCUMENTS.forms.length} listed</span>
    </div>
    <ol class="doclist">
${DOCUMENTS.forms.map(docRow).join("\n")}
    </ol>
  </section>

  <section class="field section">
    <div class="field-head">
      <span class="field-label">02 / Annexes</span>
      <span class="readout">${DOCUMENTS.annexes.length} listed</span>
    </div>
    <ol class="doclist">
${DOCUMENTS.annexes.map(docRow).join("\n")}
    </ol>
    <p class="filed">${DOCUMENTS.note}</p>
    <a class="cta" href="/">Return to the form</a>
  </section>`
});

const revisionsPage = shell({
  title: REVISIONS.title,
  desc: REVISIONS.desc,
  url: REVISIONS_URL,
  robotsMeta: "noindex, nofollow",
  stamp: REVISIONS.stamp,
  body: `  <section class="field">
    <div class="field-head">
      <span class="field-label">00 / Revisions</span>
      <span class="readout">${REVISIONS.entries.length} on record</span>
    </div>
    ${crumbs([
      { label: "Generator", url: "/" },
      { label: "Administrative documents", url: DOCS_URL },
      { label: "Revision history" }
    ])}
    <h1 class="page-title">Revision History</h1>
    <p class="lede">${REVISIONS.lede}</p>
  </section>

  <section class="field section">
    <div class="field-head">
      <span class="field-label">01 / Form SN-01</span>
      <span class="readout">Rev. ${REVISIONS.entries.length} current</span>
    </div>
    <ol class="revlist">
${REVISIONS.entries.map(e => `      <li class="rev--${e.state}">
        <div class="rev-head">
          <span class="rev-no">${esc(e.rev)}</span>
          <span class="rev-status">${esc(e.status)}</span>
          <span class="rev-effective">${e.effective}</span>
        </div>
        <p class="blurb">${e.p}</p>
      </li>`).join("\n")}
    </ol>
    <p class="filed">${REVISIONS.note}</p>
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

/* ---------- keeping the typed numbers honest ----------

   index.html and 404.html both state the size of the corpus in copy no
   script can reach at runtime — <title>, the meta descriptions, the social
   cards, the JSON-LD, the 404's holdings section. Rather than let those
   drift every time a name is added or a genre is withheld, the shipped
   copies get the real figures written in at build time.

   Genre counts are spelled out in prose ("eight genres deep"), so the word
   is derived too — the alternative is copy that says nine while the register
   ships eight, which is the exact failure this whole mechanism exists to
   prevent.

   Every pattern must match. A silent miss would defeat the point, so a
   pattern that stops matching is a build failure rather than a warning. */
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve"];
const numberWord = n => NUMBER_WORDS[n] || String(n);
const capitalise = s => s[0].toUpperCase() + s.slice(1);

const genreCount = GENRES.length;
const genreWord = numberWord(genreCount);

/* [pattern, label, replacement] — the pattern must capture everything either
   side of the figure, so the substitution can never widen its own match. */
const INDEX_NUMBERS = [
  [/(<title>Sprint Name Generator - )\d+( Funny Sprint Names<\/title>)/, "title", total],
  [/(og:title" content="Sprint Name Generator - )\d+( Funny Sprint Names")/, "og:title", total],
  [/(twitter:title" content="Sprint Name Generator - )\d+( Funny Sprint Names")/, "twitter:title", total],
  [/(funny sprint names - )\d+( across )/, "description count", total],
  [/( across )[a-z]+( genres, filtered)/, "description genre count", genreWord],
  [/(A curated generator of )\d+( funny sprint names)/, "JSON-LD count", total],
  [/(, across )[a-z]+( genres, filterable)/, "JSON-LD genre count", genreWord],
  [/(og:description" content=")[A-Z][a-z]+( genres of sprint name)/, "og:description genre count", capitalise(genreWord)],
  [/(twitter:description" content=")[A-Z][a-z]+( genres of sprint name)/, "twitter:description genre count", capitalise(genreWord)],
  [/(<span id="corpus">)\d+(<\/span>)/, "footer count", total]
];

/* 404.html is hand-written and shipped as-is, which made it the one page
   whose figures nobody was checking. It states the totals three times and
   lists every genre with its size, so it gets the same treatment. */
const NOTFOUND_NUMBERS = [
  [/(register of sprint names, )[a-z]+( genres deep)/, "finding", genreWord],
  [/(<span class="readout">)\d+( designations &#183; )/, "holdings readout total", total],
  [/( designations &#183; )\d+( genres<\/span>)/, "holdings readout genres", genreCount],
  [/(>The register \()\d+(\)<\/a>)/, "register link", total],
  [/(<p class="blurb">)[A-Z][a-z]+( genre files sit under)/, "genre files line", capitalise(genreWord)],
  [/(<span>)\d+( designations on file<\/span>)/, "footer count", total]
];

function syncNumbers(html, file, patterns) {
  let out = html;
  for (const [re, label, value] of patterns) {
    if (!re.test(out)) throw new Error(
      "build: the " + label + " in " + file + " no longer matches its pattern. "
      + "Update it in build.js, or the figure will silently go stale.");
    out = out.replace(re, "$1" + value + "$2");
  }
  return out;
}

/* The 404's genre list is regenerated rather than pattern-matched: a withheld
   genre has to disappear from it entirely, which no substitution can do. */
function renderGenreList(html) {
  const links = GENRES
    .map(g => '      <a href="' + genreUrl(g) + '">' + esc(g.label)
      + " (" + g.names.length + ")</a>")
    .join("\n");
  const re = /(<nav class="toc" aria-label="Genres">\n)[\s\S]*?(\n *<\/nav>)/;
  if (!re.test(html)) throw new Error(
    "build: could not find the Genres nav in 404.html. Update renderGenreList().");
  return html.replace(re, "$1" + links + "$2");
}

const syncIndex = html => syncNumbers(html, "index.html", INDEX_NUMBERS);
const syncNotFound = html =>
  renderGenreList(syncNumbers(html, "404.html", NOTFOUND_NUMBERS));

console.log("  (figures synced: " + total + " names across "
  + genreWord + " genres)");

/* ---------- sitemap and robots ----------

   Every generated page has the same dependency set - the corpus, the prose,
   the template and the style block - so they genuinely are all regenerated
   together, and one lastmod across the whole sitemap is the honest answer
   rather than a convenient one.

   It comes from git rather than the clock: stamping today's date on every URL
   at every build is the pattern that teaches Google to ignore the field. If
   the history isn't there (a shallow CI clone), lastmod is omitted entirely -
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
  } catch {
    return null;                       // not a git checkout, or no history
  }
}

/* index.html is served at "/", and that is what its canonical says, so that
   is what the sitemap has to list. A sitemap URL that disagrees with the
   page's own canonical is a self-inflicted crawl problem. */
const pageUrl = key => ORIGIN + (key === "index.html" ? "/" : "/" + key);

function sitemap(pageKeys) {
  const mod = lastModified();
  if (!mod) console.warn("  ! no git history for the build inputs - sitemap omits <lastmod>");
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

/* ---------- Records and Retention ----------
   The basement. See docs/plans/records-and-retention.md for what it is
   and why it is here; this is how it is built.

   One page, rooms in the hash (#/b3/corridor-17), same convention as the
   generator's deep links. A few hundred static room pages would cost
   minutes on every deploy, because the workflow uploads object by object.

   Every room is a pure function of its address and RECORDS_SEED. The
   functions below run twice: here, to render B1 into the markup and to
   prove the labyrinth has a way down from everywhere; and in the
   browser, inlined by .toString(), to render whichever room the hash
   names. One source, so the build cannot vouch for a building the page
   does not then construct. They must therefore stay self-contained:
   no references to anything else in this file.

   Changing the seed moves every room. People will share room addresses,
   so treat that as a breaking change. */

const RECORDS_URL = "/records-and-retention";
const RECORDS_SEED = "records-and-retention/1";
/* Levels open so far. The landing one below this is "closed pending
   review" until it exists; B13, the bottom, is phase 5 of the plan. */
const RECORDS_OPEN = 12;

/* FNV-1a and mulberry32: small, fast, and identical in Node and every
   browser, which is the only property that matters here. */
function rHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rRng(seed) {
  let a = seed;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rPick(r, list) { return list[Math.floor(r() * list.length)]; }

/* A level's floor plan: a ring of corridors with filing rooms hanging off
   them, one chord across, the service stairs somewhere along it, and from
   B3 a dead end. From B4 the landing's own stairs down may arrive back on
   the same level, more often the deeper it goes - the service stairs are
   then the only real way on, and they are never where the false stairs
   leave you. Pressing "Stairs down" repeatedly gets a visitor to B4 and
   no further, which is roughly where the building should stop being a
   staircase and start being a place. */
function rLevel(d, seed) {
  const r = rRng(rHash(seed + "/b" + d));
  const used = new Set();
  const draw = () => {
    let n;
    do { n = 1 + Math.floor(r() * 60); } while (used.has(n));
    used.add(n);
    return n;
  };
  const count = 4 + Math.floor(r() * 3);
  const corridors = [];
  for (let i = 0; i < count; i++) corridors.push({ n: draw(), rooms: [], loop: d >= 4 && r() < 0.3 });
  for (const c of corridors) for (let k = Math.floor(r() * 3); k > 0; k--) c.rooms.push(draw());
  return {
    corridors,
    chord: [Math.floor(r() * count), Math.floor(r() * count)],
    stairsAt: 1 + Math.floor(r() * (count - 1)),
    spur: d >= 3 && r() < 0.6 ? draw() : 0,
    fakeDown: d >= 4 && r() < Math.min(0.9, 0.45 + (d - 4) * 0.12)
  };
}

/* `weekend` swaps words, never doors: on Saturdays and Sundays the same
   rooms stand at the same addresses with the same exits, and only some of
   what is written in them changes. The building inspection checks that. */
function roomAt(id, R, seed, open, weekend) {
  const m = /^b(\d{1,2})\/(landing|corridor-(\d+)|room-(\d+)|[a-z][a-z-]*)$/.exec(id);
  const d = m ? Number(m[1]) : 0;
  const sub = s => s.replace(/\{d\}/g, String(d));
  const r = rRng(rHash(seed + "/" + id));
  /* Section numbers carry on from the front desk's 04. Orderly for three
     levels, then they start to skip. */
  const no = d <= 3 ? 5 + (d - 1) * 3 : 5 + (d - 1) * 3 + Math.floor(r() * (d - 3) * 9);
  /* From B7 a corridor may hold one line of committee log with no
     committee - the procedure from the front desk, running unattended. */
  /* The last draws from r(), so that adding them moved nothing that was
     drawn before: `flaw` picks which part of an old form has come loose,
     sx/sy where the water got in. */
  const room = (kind, place, name, text, notice, exits) =>
    ({ id, d, no, kind, place, name, text, notice, exits, log: kind === "corridor" && d >= 7 && r() < 0.35,
      flaw: Math.floor(r() * 4), sx: 15 + Math.floor(r() * 70), sy: 10 + Math.floor(r() * 60) });
  const unknown = () => ({
    id, d: 0, no: 0, kind: "unknown", place: "Unplanned",
    name: R.unknown.name, text: R.unknown.text, notice: R.unknown.notice,
    exits: [{ label: "Return to Records and Retention", to: "b1/landing" }]
  });
  if (!m || d < 1 || d > open + 1) return unknown();

  if (d === open + 1) {
    if (m[2] !== "landing") return unknown();
    /* The bottom: the level after the last line of the threads, once every
       level above it is open. Records without referents - so nothing. */
    if (d === R.levels.length + 1 && open === R.levels.length) return room("bottom", "", "", "", "", []);
    return room("closed", "Landing", R.closed.name, sub(R.closed.text), sub(R.closed.notice),
      [{ label: "Stairs up", to: "b" + (d - 1) + "/landing" }]);
  }

  const lv = rLevel(d, seed);
  const band = R.bands.find(b => d <= b.upTo) || R.bands[R.bands.length - 1];
  /* Roughly one room or notice in five comes from the mundane pool, at
     every depth. The contrast is the point - see content.js. */
  const plain = () => r() < 0.2;
  const cid = c => "b" + d + "/corridor-" + c.n;
  const corridorLink = c => ({ label: "Corridor " + c.n, to: cid(c) });
  const fixedHere = Object.keys(R.fixed).filter(k => R.fixed[k].d === d);

  if (m[2] === "landing") {
    /* False stairs arrive two corridors along from the service stairs -
       never at corridor 0, which the landing also links to: two doors to
       the same place would give the trick away. */
    let fake = (lv.stairsAt + 2) % lv.corridors.length;
    if (fake === 0) fake = 1;
    /* The landing carries the threads: every level is entered here, so
       every visitor reads them, one line per level, in order. */
    const level = R.levels[Math.min(d, R.levels.length) - 1];
    const exits = [
      { label: "Stairs down", to: lv.fakeDown ? cid(lv.corridors[fake]) : "b" + (d + 1) + "/landing" },
      { label: "Stairs up", to: d === 1 ? "/" : "b" + (d - 1) + "/landing" },
      corridorLink(lv.corridors[0]),
      { label: "Lift", to: null, note: level.lift }
    ];
    return d === 1
      ? Object.assign(room("landing", "Landing", R.reception.name, R.reception.text + (weekend ? " " + R.weekend.reception : ""), level.status, exits), { special: "ticket" })
      : room("landing", "Landing", "Landing, B" + d, sub(rPick(r, band.landing)), level.status, exits);
  }

  if (!m[3] && !m[4]) {
    const f = R.fixed[m[2]];
    if (!f || f.d !== d) return unknown();
    /* A `through` room is a passage: in from one corridor, out to the next. */
    const exits = [corridorLink(lv.corridors[f.at])];
    if (f.through) exits.push(corridorLink(lv.corridors[(f.at + 1) % lv.corridors.length]));
    return Object.assign(room("fixed", f.through ? "Passage" : "Office", f.name, f.text, f.notice, exits), { special: f.special || "" });
  }

  if (m[3]) {
    const n = Number(m[3]);
    const k = lv.corridors.length;
    if (lv.spur && n === lv.spur) {
      return room("spur", "Corridor " + n, R.spurName, R.spurText, R.spurNotice,
        [corridorLink(lv.corridors[k - 1]), { label: R.loopExit, to: id }]);
    }
    const i = lv.corridors.findIndex(c => c.n === n);
    if (i < 0) return unknown();
    const c = lv.corridors[i];
    const exits = [];
    const add = (label, to) => { if (to !== id && !exits.some(e => e.to === to)) exits.push({ label, to }); };
    if (i === 0) add("Landing", "b" + d + "/landing");
    if (i === lv.stairsAt) add("Service stairs down", "b" + (d + 1) + "/landing");
    for (const j of [i - 1, i + 1]) add("Corridor " + lv.corridors[(j + k) % k].n, cid(lv.corridors[(j + k) % k]));
    if (lv.chord.includes(i)) {
      const o = lv.corridors[lv.chord[0] === i ? lv.chord[1] : lv.chord[0]];
      add("Corridor " + o.n, cid(o));
    }
    for (const rn of c.rooms) add("Filing room " + rn, "b" + d + "/room-" + rn);
    for (const k of fixedHere) if (R.fixed[k].at === i) add(R.fixed[k].name, "b" + d + "/" + k);
    if (lv.spur && i === k - 1) add("Corridor " + lv.spur, "b" + d + "/corridor-" + lv.spur);
    /* Doors in no particular order, as in any building that grew. */
    for (let j = exits.length - 1; j > 0; j--) {
      const s = Math.floor(r() * (j + 1));
      [exits[j], exits[s]] = [exits[s], exits[j]];
    }
    if (c.loop) exits.push({ label: R.loopExit, to: id });
    return room("corridor", "Corridor " + n, c.loop ? sub(R.loopName) : "Corridor " + n,
      sub(rPick(r, band.corridor)), sub(rPick(r, plain() ? (weekend ? R.weekend.notices : R.mundane.notices) : band.corridorNotice)), exits);
  }

  const n = Number(m[4]);
  const host = lv.corridors.find(c => c.rooms.includes(n));
  if (!host) return unknown();
  /* Name and text are written as a pair: a room called "Telephony" should
     not be described as carpet tiles. */
  const pair = rPick(r, plain() ? R.mundane.rooms : band.rooms);
  return room("room", "Filing room " + n, pair.name, sub(pair.text), "", [corridorLink(host)]);
}

/* The seal. Revisions run backwards from B4; nothing down here is Rev. 5,
   which IDEAS.md has reserved. U+2212 for the minus: the hyphen reads as
   a dash at this size. */
function rStamp(room) {
  if (room.kind === "bottom") return [];
  const rev = room.d <= 3 ? 4 : 7 - room.d;
  return [
    "Records and Retention",
    room.d ? "Level B" + room.d + " &#183; unstaffed" : "Level unknown",
    "Rev. " + (rev < 0 ? "&#8722;" + -rev : rev) + " &#183; Supersedes all"
  ];
}

/* The ticket field at reception. Pure, like the rest, so that B1 can be
   rendered at build time with the machine still unused. */
function rTicket(R, n) {
  return {
    label: "Ticket",
    readout: n ? "Issued" : "Dispenser",
    html: n
      ? '<p class="blurb">' + R.ticket.taken.replace("{n}", String(n).replace(/\B(?=(\d{3})+$)/g, "\u2009")) + "</p>"
      : '<p class="blurb">' + R.ticket.none + '</p><button class="btn btn--ghost ticket" type="button" id="take-number">' + R.ticket.button + "</button>"
  };
}

/* `extra` is one more field after the location - { label, readout, html }
   - for the rooms only the browser can fill in: the personnel file, the
   ticket machine, the timecard, the committee in session. */
function renderRoom(room, extra) {
  /* The masthead and the ruled paper, and nothing else. The heading is
     for screen readers, which should be told where they are, and nothing
     more than sighted visitors are. */
  if (room.kind === "bottom") {
    return '<h1 class="vh" id="room-title" tabindex="-1">B' + room.d + '</h1><div class="bottom"></div>';
  }
  const e = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  /* The form comes apart in the markup as well as the styles: from B7 the
     readouts are left blank, from B10 the fields lose their numbers. */
  const nn = k => room.d >= 10 ? "" : String(room.no + k).padStart(2, "0") + " / ";
  const head = (k, label, readout) => '<div class="field-head"><span class="field-label">' + nn(k) + label
    + '</span><span class="readout">' + (room.d >= 7 ? "&nbsp;" : readout) + "</span></div>";
  const where = room.d ? "B" + room.d + " &#183; " + e(room.place) : e(room.place);
  let html = '<section class="field">' + head(0, "Location", where)
    + '<h1 class="page-title" id="room-title" tabindex="-1">' + e(room.name) + "</h1>"
    + '<p class="lede">' + e(room.text) + "</p>"
    + (room.log ? '<div class="ghost-log" aria-hidden="true"><div class="cline"><span>01</span>Convening committee&hellip;</div></div>' : "")
    + "</section>";
  let k = 1;
  if (extra) html += '<section class="field section">' + head(k++, extra.label, extra.readout) + extra.html + "</section>";
  /* The Long Corridor is long: the notice is posted halfway along it. */
  const long = room.special === "long" ? '<div class="long" aria-hidden="true"></div>' : "";
  html += long;
  if (room.notice) {
    html += '<section class="field section">' + head(k++, "Notice", "Posted")
      + '<p class="blurb">' + e(room.notice) + "</p></section>";
  }
  html += long;
  html += '<section class="field">' + head(k, "Exits", room.exits.length + " marked")
    + '<nav class="toc exits" aria-label="Exits">' + room.exits.map(x => x.to
      ? '<a href="' + (x.to === "/" ? "/" : "#/" + x.to) + '">' + e(x.label) + "</a>"
      : '<span class="exit-shut">' + e(x.label) + " &#8212; " + e(x.note) + "</span>").join("") + "</nav></section>";
  return html;
}

/* The records audit. The generator trusts RECORDS completely - a missing
   band or an empty list would not fail, it would render a room with
   "undefined" in it, deep enough that nobody testing would ever see it.
   So the shape is checked here, along with two house rules the corpus
   already keeps: plain text only (it is set with textContent, so markup
   would print literally), and typographic apostrophes, never '. */
{
  const fail = msg => { throw new Error("build: RECORDS - " + msg); };
  const text = (v, where) => { if (typeof v !== "string" || !v.trim()) fail(where + " must be non-empty text"); };
  const list = (v, where) => { if (!Array.isArray(v) || !v.length) fail(where + " must be a non-empty list"); };

  for (const k of ["title", "desc", "welcomeBack", "loopName", "loopExit", "spurName", "spurText", "spurNotice"]) text(RECORDS[k], k);
  text(RECORDS.reception.name, "reception.name");
  text(RECORDS.reception.text, "reception.text");
  for (const k of ["closed", "unknown"]) { text(RECORDS[k].name, k + ".name"); text(RECORDS[k].text, k + ".text"); }

  /* One line of each thread per open level: a level without one would
     break the thread at exactly the point it is meant to be read. */
  list(RECORDS.levels, "levels");
  if (RECORDS.levels.length < RECORDS_OPEN) fail("levels has " + RECORDS.levels.length + " entries; B1-B" + RECORDS_OPEN + " are open");
  RECORDS.levels.forEach((l, i) => { text(l.lift, "levels[" + i + "].lift"); text(l.status, "levels[" + i + "].status"); });

  list(RECORDS.bands, "bands");
  let floor = 0;
  RECORDS.bands.forEach((b, i) => {
    const at = "bands[" + i + "]";
    if (!(b.upTo > floor)) fail(at + ".upTo must be above the band before it");
    floor = b.upTo;
    for (const k of ["landing", "corridor", "corridorNotice"]) { list(b[k], at + "." + k); b[k].forEach((s, j) => text(s, at + "." + k + "[" + j + "]")); }
    list(b.rooms, at + ".rooms");
    b.rooms.forEach((r, j) => { text(r.name, at + ".rooms[" + j + "].name"); text(r.text, at + ".rooms[" + j + "].text"); });
  });
  if (floor < RECORDS_OPEN) fail("no band covers B" + (floor + 1) + "-B" + RECORDS_OPEN);

  list(RECORDS.mundane.rooms, "mundane.rooms");
  list(RECORDS.mundane.notices, "mundane.notices");
  text(RECORDS.weekend.reception, "weekend.reception");
  list(RECORDS.weekend.notices, "weekend.notices");

  /* rLevel() draws at least four corridors, so `at` must name one of the
     first four or the room would open off a corridor that may not exist. */
  for (const [k, f] of Object.entries(RECORDS.fixed)) {
    if (!/^[a-z][a-z-]*$/.test(k) || k === "landing") fail("fixed room key '" + k + "' is not a usable address");
    if (!Number.isInteger(f.d) || f.d < 1 || f.d > RECORDS.levels.length) fail("fixed." + k + ".d is not a level");
    if (!Number.isInteger(f.at) || f.at < 0 || f.at > 3) fail("fixed." + k + ".at must be 0-3");
    text(f.name, "fixed." + k + ".name");
    text(f.text, "fixed." + k + ".text");
  }

  /* Specials are filled in by the page script, which knows these. */
  const SPECIAL_ROOMS = { department: ["summary", "none"], timecard: ["card", "overtime"], committee: ["result"], long: [] };
  for (const [k, f] of Object.entries(RECORDS.fixed)) {
    if (!f.special) continue;
    if (!SPECIAL_ROOMS[f.special]) fail("fixed." + k + ".special '" + f.special + "' is not one the page script knows");
    for (const t of SPECIAL_ROOMS[f.special]) text(f[t], "fixed." + k + "." + t);
  }
  for (const t of ["button", "none", "taken"]) text(RECORDS.ticket[t], "ticket." + t);

  /* The page script reads these two by name. */
  if (!RECORDS.fixed.personnel) fail("fixed.personnel is missing; the page script fills it in");
  text(RECORDS.fixed.personnel.empty, "fixed.personnel.empty");
  text(RECORDS.fixed.personnel.summary, "fixed.personnel.summary");

  const walk = (v, where) => {
    if (typeof v === "string") {
      if (v.includes("<")) fail(where + " contains markup; RECORDS is plain text");
      if (v.includes("'")) fail(where + " uses ' - the house rule is ’");
    } else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) walk(x, where + "." + k);
    }
  };
  walk(RECORDS, "RECORDS");
}

/* The building inspection. Walks every room reachable from B1 and fails
   the build unless the bottom is reachable, every room has a way out,
   and no room is a trap - from anywhere, some sequence of exits leads
   down. Dead ends are allowed; dead ends without a way back are not. */
{
  const at = id => roomAt(id, RECORDS, RECORDS_SEED, RECORDS_OPEN, false);
  const doors = room => JSON.stringify(room.exits);
  const bottom = "b" + (RECORDS_OPEN + 1) + "/landing";
  const rooms = new Map();
  const queue = ["b1/landing"];
  while (queue.length) {
    const id = queue.shift();
    if (rooms.has(id)) continue;
    const room = at(id);
    if (room.kind === "unknown") throw new Error("build: the basement links to " + id + ", which is not on the plan.");
    if (doors(roomAt(id, RECORDS, RECORDS_SEED, RECORDS_OPEN, true)) !== doors(room)) throw new Error(
      "build: basement room " + id + " has different exits at the weekend. Words may change; doors may not.");
    const targets = room.exits.filter(x => x.to && x.to !== id).map(x => x.to);
    if (new Set(targets).size !== targets.length) throw new Error(
      "build: basement room " + id + " has two doors to the same place, which gives away whichever one is lying.");
    rooms.set(id, room);
    for (const x of room.exits) if (x.to && x.to !== "/") queue.push(x.to);
  }
  if (!rooms.has(bottom)) throw new Error("build: the basement has no way down to " + bottom + ".");
  const reaches = new Set([bottom]);
  for (let grew = true; grew;) {
    grew = false;
    for (const [id, room] of rooms) {
      if (!reaches.has(id) && room.exits.some(x => reaches.has(x.to))) { reaches.add(id); grew = true; }
    }
  }
  for (const id of rooms.keys()) {
    if (!reaches.has(id)) throw new Error("build: basement room " + id + " is a trap - no route leads down from it.");
  }
  for (const [k, f] of Object.entries(RECORDS.fixed)) {
    if (f.d <= RECORDS_OPEN && !rooms.has("b" + f.d + "/" + k)) throw new Error(
      "build: fixed room " + k + " on B" + f.d + " cannot be reached. Check its `at`.");
  }
  console.log("  basement: " + rooms.size + " rooms on B1-B" + RECORDS_OPEN + ", all with a way down");
}

/* The torn foot of a form older than the Office: a fixed ragged edge, the
   same on every page, because it is the same sheet. */
const TORN = (() => {
  const r = rRng(rHash("torn"));
  const pts = ["0 0", "100% 0"];
  for (let x = 100; x >= 0; x -= 2.5) pts.push(x + "% calc(100% - " + (r() * 9).toFixed(1) + "px)");
  return "polygon(" + pts.join(", ") + ")";
})();

const RECORDS_CSS = `
/* ---------- Records and Retention only ---------- */
.exits{margin-top:4px}
.exit-shut{
  display:inline-flex;
  align-items:center;
  padding:8px 13px;
  border:1px dashed var(--rule);
  color:var(--ink-3);
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.7rem;
  letter-spacing:.08em;
  text-transform:uppercase;
}
#room-title:focus{outline:none}
/* The Long Corridor: the page is the length of it. */
.long{height:140vh}
.ticket{margin-top:6px}

/* Arriving somewhere, including back where you were. */
#room.arrive{animation:arrive .32s ease both}
@keyframes arrive{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){#room.arrive{animation:none}}

/* B13. The sheet goes, so the ruled paper behind it is all there is, and
   there is more of it than anything would need. */
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.bottom{min-height:300vh}
:root[data-band="5"] .sheet{background:transparent;border-color:transparent;box-shadow:none !important}
:root[data-band="5"] .fineprint{display:none}

/* The personnel file: genre as a filing tab, names under it. */
.file{margin:4px 0 0}
.file dt{
  margin:14px 0 4px;
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.66rem;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:var(--ink-3);
}
.file dt:first-child{margin-top:0}
.file dd{margin:0;font-size:.94rem;line-height:1.6;color:var(--ink-2)}

/* Decay. The script sets --depth (0 at B1, 1 at B13) and data-band on
   <html>; everything below keys off those two and nothing else. It is
   meant to be noticed late: by B6 the visitor should suspect it has been
   going on for a while, not have watched it start. */
body{background-position:0 calc(var(--depth, 0) * 11px)}
.sheet{
  --fade:calc(var(--depth, 0) * 88%);
  --accent:color-mix(in oklab, var(--accent-raw), var(--ink-3) var(--fade));
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]) .sheet{
    --accent:color-mix(in oklab, color-mix(in oklab, var(--accent-raw), #FFFFFF 42%), var(--ink-3) var(--fade));
  }
}
:root[data-theme="dark"] .sheet{
  --accent:color-mix(in oklab, color-mix(in oklab, var(--accent-raw), #FFFFFF 42%), var(--ink-3) var(--fade));
}
/* B7-B9: field heads no longer quite sit on their fields, and the ruled
   paper creeps - one line every two minutes, too slow to see moving. */
[data-band="3"] .field:nth-child(odd) .field-head{translate:3px 0}
[data-band="3"] .field:nth-child(even) .field-head{translate:-2px 0}
[data-band="3"] body,[data-band="4"] body{animation:creep 120s linear infinite}
@keyframes creep{to{background-position:0 calc(var(--depth, 0) * 11px + 28px)}}
/* Same type as the committee log on the form, whose container sets it. */
.ghost-log{
  margin-top:16px;
  font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-size:.76rem;
  letter-spacing:.04em;
  color:var(--ink-2);
}
.ghost-log .cline{opacity:.42}
/* B10-B12: no rules between fields; what is left of the form is labels. */
[data-band="4"] .field + .field{border-top-color:transparent}
[data-band="4"] .field:nth-child(odd) .field-head{translate:5px 0}

/* ---------- Eras ----------
   Revisions count backwards on the way down, so the paperwork gets older:
   the same form, in the editions that came before it. Each era is the
   form as it was printed then, and printed badly. No new fonts: the
   period type is whatever the visitor's system has for Courier and
   Georgia, which is what period type looks like now anyway.

   Rev. 3, B4-B6 - continuous stationery and a tired ribbon. Barely there
   at B4 and settling in by B6: everything here scales with --depth. */
[data-band="2"] .sheet{position:relative}
[data-band="2"] .sheet::before,[data-band="2"] .sheet::after{
  content:"";
  position:absolute;
  top:0;bottom:0;
  width:14px;
  background:radial-gradient(circle at 7px 12px, var(--paper) 3.2px, transparent 3.8px) 0 0/14px 24px repeat-y;
  opacity:calc((var(--depth, 0) - .2) * 4);
  pointer-events:none;
}
[data-band="2"] .sheet::before{left:3px}
[data-band="2"] .sheet::after{right:3px}
[data-band="2"] .lede,[data-band="2"] .blurb{
  font-family:"Courier New",Courier,ui-monospace,monospace;
  font-size:1.02rem;
  text-shadow:calc(var(--depth, 0) * 2.4px) calc(var(--depth, 0) * 1px) 0 color-mix(in oklab, #3550A0 32%, transparent);
}
[data-band="2"] .field-label,[data-band="2"] .readout{color:color-mix(in oklab, var(--ink-2), #3550A0 calc(var(--depth, 0) * 120%))}

/* Rev. 1 to 0, B7-B9 - spirit duplicator. Violet ink that bled, paper
   gone yellow, a water stain, and one part of the form that has come
   loose, chosen per room. */
[data-band="3"] .sheet{
  background:
    radial-gradient(ellipse 34% 26% at var(--sx) var(--sy), color-mix(in oklab, #A07A2C 16%, transparent), transparent 70%),
    radial-gradient(ellipse 18% 14% at calc(100% - var(--sx)) calc(var(--sy) + 30%), color-mix(in oklab, #A07A2C 10%, transparent), transparent 70%),
    color-mix(in oklab, var(--sheet), #D9B96A 20%);
}
[data-band="3"] .page-title,[data-band="3"] .lede,[data-band="3"] .blurb,[data-band="3"] .file dd{
  font-family:"Courier New",Courier,ui-monospace,monospace;
  color:color-mix(in oklab, var(--ink), #6B4FA0 58%);
  text-shadow:0 0 .8px currentColor;
}
[data-band="3"] .page-title{letter-spacing:-.04em}
[data-band="3"] .lede,[data-band="3"] .blurb{font-size:1.02rem}
[data-band="3"][data-flaw="1"] .field:nth-child(2){rotate:-.5deg}
[data-band="3"][data-flaw="2"] .field:nth-child(1) .field-head{rotate:-2.5deg;translate:8px 5px}
[data-band="3"][data-flaw="3"] .field:last-of-type{rotate:.4deg;translate:-4px 0}

/* Rev. -1 and below, B10-B12 - before there was an Office: ledger paper,
   a clerk's serif, brown ink, a torn foot, and sections that have slipped
   onto each other or faded out. */
[data-band="4"] .sheet{
  background:
    repeating-linear-gradient(to bottom, transparent 0 28px, color-mix(in oklab, #8DB97C 16%, transparent) 28px 56px),
    color-mix(in oklab, var(--sheet), #CFE0C3 14%);
  clip-path:${TORN};
}
/* On a dark sheet the same tint reads three times as strong. */
@media (prefers-color-scheme: dark){
  :root[data-band="4"]:not([data-theme="light"]) .sheet{
    background:repeating-linear-gradient(to bottom, transparent 0 28px, color-mix(in oklab, #8DB97C 5%, transparent) 28px 56px), color-mix(in oklab, var(--sheet), #CFE0C3 4%);
  }
  :root[data-band="3"]:not([data-theme="light"]) .sheet{
    background:radial-gradient(ellipse 34% 26% at var(--sx) var(--sy), color-mix(in oklab, #A07A2C 10%, transparent), transparent 70%), color-mix(in oklab, var(--sheet), #D9B96A 7%);
  }
}
[data-band="4"] .page-title{font-family:Georgia,"Times New Roman",serif;font-style:italic;font-weight:700;letter-spacing:-.01em}
[data-band="4"] .page-title,[data-band="4"] .lede,[data-band="4"] .blurb,[data-band="4"] .file dd{color:color-mix(in oklab, var(--ink), #7A5A34 55%)}
[data-band="4"] .lede,[data-band="4"] .blurb{font-family:Georgia,"Times New Roman",serif;font-size:1.04rem}
[data-band="4"][data-flaw="1"] .field:nth-child(2){opacity:.45}
[data-band="4"][data-flaw="2"] .field:nth-child(2){margin-top:-22px;rotate:-.6deg}
[data-band="4"][data-flaw="3"] .field:nth-child(1) .lede{filter:blur(.5px)}

/* The weekend: same building, lights off. An inset shadow paints over
   the sheet's background and under its contents, so nothing else needs
   to know. */
[data-weekend] .sheet{box-shadow:inset 0 0 0 100vmax rgba(25,27,24,.06), 0 1px 0 var(--rule-soft), 0 18px 40px -32px rgba(0,0,0,.5)}
@media (prefers-color-scheme: dark){
  :root[data-weekend]:not([data-theme="light"]) .sheet{box-shadow:inset 0 0 0 100vmax rgba(0,0,0,.28)}
}
:root[data-weekend][data-theme="dark"] .sheet{box-shadow:inset 0 0 0 100vmax rgba(0,0,0,.28)}

@media (prefers-reduced-motion:reduce){
  [data-band] body{animation:none}
}`;

const recordsB1 = roomAt("b1/landing", RECORDS, RECORDS_SEED, RECORDS_OPEN, false);

const recordsPage = shell({
  title: RECORDS.title,
  desc: RECORDS.desc,
  url: RECORDS_URL,
  robotsMeta: "noindex, nofollow",
  stamp: rStamp(recordsB1),
  extraCss: RECORDS_CSS,
  /* B1 is in the markup, so the page is whole before - or without - the
     script. The script only takes over when the hash names another room. */
  body: '  <div id="room">' + renderRoom(recordsB1, rTicket(RECORDS, null)) + "</div>",
  script: `<!-- The personnel file on B8 is your own localStorage, read in your own
     browser by personnelFile() below. Nothing about you has left it, and
     nothing down here writes to it. Look. -->
<script>
/* Records and Retention. Every room is generated from its address by the
   functions below, which are the same functions build.js ran to check the
   building has a way down. Nothing is fetched and nothing is stored. */
const RECORDS = ${JSON.stringify(RECORDS).replace(/</g, "\\u003c")};
const SEED = ${JSON.stringify(RECORDS_SEED)};
const OPEN = ${RECORDS_OPEN};
${[rHash, rRng, rPick, rLevel, roomAt, rStamp, rTicket, renderRoom].map(f => f.toString()).join("\n")}
const PROCEDURE = ${JSON.stringify(PROCEDURE)};
const GENRE_LABELS = ${JSON.stringify(Object.fromEntries(GENRES.map(g => [g.id, g.label])))};
/* Dated in the Office's own hand, as on the form. */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };
const pad = n => String(n).padStart(2, "0");
/* Office hours as the form keeps them, by the visitor's own clock. */
const outOfHours = d => d.getDay() === 0 || d.getDay() === 6 || d.getHours() < 9 || d.getHours() >= 17;

/* Clocked in on the first room of this visit to the basement. Session
   storage: a new visit is a new shift. */
let clockIn = Date.now();
try {
  clockIn = Number(sessionStorage.getItem("sng.clockin")) || clockIn;
  sessionStorage.setItem("sng.clockin", String(clockIn));
} catch (e) { /* no shift is recorded */ }

/* Every special reads this browser's own storage and nothing else. None of
   them writes, apart from the ticket machine, which keeps the one number
   it gave you under sng.ticket.v1. */
const SPECIALS = {
  ticket() { return rTicket(RECORDS, (read("sng.ticket.v1") || {}).n); },
  department() {
    const F = RECORDS.fixed.department;
    const reg = read("sng.registry.v1");
    if (!reg || !reg.token) return { label: "File", readout: "None", html: '<p class="blurb">' + esc(F.none) + "</p>" };
    /* Eight characters of the token, as the form shows it. Never more. */
    const file = (reg.token.slice(0, 4) + "-" + reg.token.slice(4, 8)).toUpperCase();
    const names = Object.keys(reg.adopted || {}).sort((a, b) => reg.adopted[b] - reg.adopted[a]);
    return { label: "File", readout: file, html: '<p class="blurb">' + esc(F.summary.replace("{file}", file).replace("{n}", String(names.length))) + "</p>"
      + (names.length ? '<dl class="file">' + names.map(x => "<dd>" + esc(x) + "</dd>").join("") + "</dl>" : "") };
  },
  timecard() {
    const T = RECORDS.fixed.timecard;
    return { label: "Card", readout: "Stamped", html: '<p class="blurb" id="timecard">' + esc(T.card) + "</p>"
      + (outOfHours(new Date()) ? '<p class="blurb">' + esc(T.overtime) + "</p>" : "") };
  },
  committee() {
    return { label: "Session", readout: "In progress", html: '<div class="stage"><p class="name is-idle" id="session-name" style="visibility:hidden">'
      + esc(RECORDS.fixed.committee.result) + '</p><div class="committee" id="session-log"></div></div>' };
  }
};

/* What a special does once it is on the page. Each returns a function that
   stops it, called when the visitor leaves the room. */
const RUNNING = {
  timecard() {
    const T = RECORDS.fixed.timecard;
    const el = document.getElementById("timecard");
    const t = new Date(clockIn);
    const tick = () => {
      const s = Math.floor((Date.now() - clockIn) / 1000);
      el.textContent = T.card.replace("{time}", pad(t.getHours()) + ":" + pad(t.getMinutes()))
        .replace("{elapsed}", pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  },
  /* The form's own committee session, line for line, and then the form's
     own empty result. */
  committee() {
    const log = document.getElementById("session-log");
    const name = document.getElementById("session-name");
    const steps = PROCEDURE.slice().sort(() => Math.random() - 0.5).slice(0, 4);
    steps.push("Approved without discussion");
    const gap = matchMedia("(prefers-reduced-motion: reduce)").matches ? 70 : 420;
    let i = 0;
    const id = setInterval(() => {
      if (i < steps.length) {
        const row = document.createElement("div");
        row.className = "cline";
        row.innerHTML = "<span>" + pad(i + 1) + "</span>" + steps[i] + (i < steps.length - 1 ? "&hellip;" : ".");
        log.appendChild(row);
        i++;
      } else {
        clearInterval(id);
        log.hidden = true;
        name.style.visibility = "";
        const readout = log.closest(".field").querySelector(".readout");
        if (readout.textContent.trim()) readout.textContent = "Adjourned";
      }
    }, gap);
    return () => clearInterval(id);
  }
};

function personnelFile() {
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const P = RECORDS.fixed.personnel;
  let seen = {}, record = {};
  try { seen = JSON.parse(localStorage.getItem("sng.seen.v1")) || {}; } catch (e) { seen = {}; }
  try { record = JSON.parse(localStorage.getItem("sng.record.v1")) || {}; } catch (e) { record = {}; }
  const genres = Object.keys(seen).filter(k => Array.isArray(seen[k]) && seen[k].length);
  if (!genres.length) return '<p class="blurb">' + esc(P.empty) + "</p>";
  const n = genres.reduce((t, k) => t + seen[k].length, 0);
  const d = record.first ? new Date(record.first) : null;
  const opened = d ? String(d.getDate()).padStart(2, "0") + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() : "a date not recorded";
  return '<p class="blurb">' + esc(P.summary.replace("{date}", opened).replace("{n}", String(n))) + "</p>"
    + '<dl class="file">' + genres.map(k => "<dt>" + esc(GENRE_LABELS[k] || k) + "</dt>"
      + seen[k].map(x => "<dd>" + esc(x) + "</dd>").join("")).join("") + "</dl>";
}
(function () {
  const host = document.getElementById("room");
  const seal = document.querySelector(".stamp-no");
  const root = document.documentElement;
  /* The visitor's own calendar, as with officeShift() on the form. */
  const weekend = [0, 6].includes(new Date().getDay());
  if (weekend) root.dataset.weekend = "";
  /* The only thing the basement keeps: the deepest level this browser has
     reached, and when. In this browser's storage, like everything else
     the site knows; the form reads it for its seal, and shredding the
     minutes removes it. */
  const RETENTION_KEY = "sng.retention.v1";
  let deepest = 0;
  try { deepest = (JSON.parse(localStorage.getItem(RETENTION_KEY)) || {}).deepest || 0; } catch (e) { deepest = 0; }
  let stop = null;
  function show(moved) {
    const m = location.hash.match(/^#\\/(.+)$/);
    const room = roomAt(m ? m[1] : "b1/landing", RECORDS, SEED, OPEN, weekend);
    /* Somebody who has been far enough down to be treated as staff is
       not asked to sign in again. */
    if (room.id === "b1/landing" && deepest >= 7) room.notice = RECORDS.welcomeBack;
    if (room.d > deepest) {
      deepest = room.d;
      try { localStorage.setItem(RETENTION_KEY, JSON.stringify({ deepest, at: Date.now() })); } catch (e) { /* the basement forgets */ }
    }
    if (stop) stop();
    stop = null;
    const extra = room.id === "b8/personnel" ? { label: "File", readout: "Provisional", html: personnelFile() }
      : SPECIALS[room.special] ? SPECIALS[room.special]() : null;
    host.innerHTML = renderRoom(room, extra);
    if (RUNNING[room.special]) stop = RUNNING[room.special]();
    seal.innerHTML = rStamp(room).join("<br>");
    root.style.setProperty("--depth", String(Math.max(0, room.d - 1) / 12));
    root.dataset.band = String(room.kind === "bottom" ? 5 : room.d <= 3 ? 1 : room.d <= 6 ? 2 : room.d <= 9 ? 3 : 4);
    root.dataset.flaw = String(room.flaw || 0);
    root.style.setProperty("--sx", (room.sx || 50) + "%");
    root.style.setProperty("--sy", (room.sy || 40) + "%");
    document.title = (room.name ? room.name + " \\u2014 " : "") + "Records and Retention";
    if (moved) {
      window.scrollTo(0, 0);
      document.getElementById("room-title").focus({ preventScroll: true });
    }
  }
  function arrive() {
    host.classList.remove("arrive");
    void host.offsetWidth;
    host.classList.add("arrive");
  }
  addEventListener("hashchange", () => { show(true); arrive(); });
  /* A door that leads back into the room it is in ("Continue along the
     corridor") changes nothing in the address bar, so the browser fires no
     hashchange and the click looked broken. Walk the visitor through it
     anyway: the room is entered again, from the top. */
  host.addEventListener("click", ev => {
    if (ev.target.id === "take-number") {
      try { localStorage.setItem("sng.ticket.v1", JSON.stringify({ n: 1000000 + Math.floor(Math.random() * 9000000), at: Date.now() })); } catch (e) { /* no number */ }
      show(false);
      return;
    }
    const a = ev.target.closest("a");
    if (a && a.getAttribute("href") === location.hash) {
      ev.preventDefault();
      show(true);
      arrive();
    }
  });
  /* B1 is already in the markup, as a weekday, for a first visit. */
  if (location.hash || weekend || deepest >= 7 || read("sng.ticket.v1")) show(false);
})();
</script>
`
});

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
  page("index.html", renderChips(syncIndex(indexHtml))),
  { key: "names.js", body: namesJs, contentType: "text/javascript; charset=utf-8", cacheControl: SHORT },
  /* The registry function's allowlist - api/handler.mjs fetches it and
     files nothing that isn't in it. Read from here rather than bundled
     into the function, so a new name ships with the site and the
     function never needs redeploying. Plain JSON rather than names.js:
     the function has no business eval()ing anything. */
  {
    key: "corpus.json",
    body: JSON.stringify({ names: allNames.map(x => x.name) }) + "\n",
    contentType: "application/json; charset=utf-8",
    cacheControl: SHORT
  },
  page(REGISTER_URL, registerPage),
  page(JIRA_URL, jiraPage),
  /* Absent from the sitemap by way of unlisted, but still uploaded. */
  { ...page(MEMO_URL, memoPage), unlisted: true },
  { ...page("404.html", syncNotFound(read("404.html"))), unlisted: true },
  /* Filing rather than content, and noindex for that reason - see the
     comment above the two of them. Uploaded, unlisted, and linked from the
     seal on the form. */
  { ...page(DOCS_URL, documentsPage), unlisted: true },
  { ...page(REVISIONS_URL, revisionsPage), unlisted: true },
  /* The basement. Unlisted, noindex, linked from nowhere a visitor would
     click by accident - see docs/plans/records-and-retention.md. */
  { ...page(RECORDS_URL, recordsPage), unlisted: true },
  ...GENRES.map(g => page(genreUrl(g), genrePage(g))),
  { key: "og.png", body: fs.readFileSync(path.join(__dirname, "og.png")), contentType: "image/png", cacheControl: LONG },
  ...FONTS.map(f => ({
    key: "fonts/" + f,
    body: fs.readFileSync(path.join(__dirname, "fonts", f)),
    contentType: "font/woff2",
    cacheControl: LONG
  }))
];

/* The documents index is only funny while it is accurate. Every internal
   link it makes must be a page this build emits - except the one flagged
   `absent`, which must not be, because the 404 it produces is Form SN-03
   and following the link is how the index demonstrates it. */
{
  const emitted = new Set(files.map(f => "/" + f.key.replace(/^index\.html$/, "")));
  for (const d of [...DOCUMENTS.forms, ...DOCUMENTS.annexes]) {
    if (!d.url || !d.url.startsWith("/")) continue;
    const held = emitted.has(d.url);
    if (d.absent && held) throw new Error(
      "build: the documents index flags " + d.code + " (" + d.url + ") as absent, "
      + "but the build emits it. One of the two is wrong.");
    if (!d.absent && !held) throw new Error(
      "build: the documents index links " + d.code + " at " + d.url
      + ", which this build does not emit. Add the page, fix the link, or flag it `absent`.");
  }
}

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
console.log("\ndist/ built - "
  + files.filter(f => f.contentType.startsWith("text/html")).length + " pages, "
  + total + " names across " + GENRES.length + " genres");
