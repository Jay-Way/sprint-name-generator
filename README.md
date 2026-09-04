# Sprint Name Generator

![Website Screenshot](/og.png?raw=true)


A fast, static, slightly unhinged source of genuinely funny sprint names for software teams.

Because naming a sprint should not produce another round of *"Synergy & Innovation"*, *"Customer Centricity"*, or whatever corporate compliance accidentally generated this morning.

**Less "Corporate Agile Excellence". More "Refactor and Pray".**

→ [sprintname.dev](https://sprintname.dev)

---

## What it does

Pick a genre, press **Convene committee**, and the site runs a short bureaucratic pantomime —

```
01  Deferring the objection to next quarter…
02  Redacting the first proposal…
03  Escalating to steering committee…
04  Awaiting sign-off from Klaus…
05  Approved without discussion.
```

— before stamping down a single name at absurd size. The joke is the gap between the ceremony and the payload.

Names you've already been given are recorded in `localStorage`, so the generator keeps serving fresh ones until a genre is exhausted. When it runs dry it says so, and offers to forget everything.

Other things it does:

- **Character limit filter** for teams whose tracker caps sprint names (see below)
- **Live character count** on every result, so you can eyeball it against any limit
- **Deep links** — every name has a URL (`#/oncall/three-am-deployment`)
- **[The register](https://sprintname.dev/funny-sprint-names)** — all 385 names on one page, grouped by genre, with character counts
- **[A page per genre](https://sprintname.dev/sprint-names/occult-scrum)** — what each one is for, when it lands, when it doesn't
- **[Character limits in Jira](https://sprintname.dev/sprint-names-for-jira)** — the number, where it comes from, and what fits under it
- **Copy button** for pasting straight into your tracker
- **Genre-tinted UI** — each genre stamps in its own ink
- Escalating button labels, for the persistent

No backend, no accounts, no tracking, no network requests after page load. Nothing you do here leaves your browser.

## Character limits

Jira caps sprint names at **30 characters** — in the UI only; the database column holds 255. The open requests to raise it ([JSWCLOUD-17483](https://jira.atlassian.com/browse/JSWCLOUD-17483), [JSWSERVER-16256](https://jira.atlassian.com/browse/JSWSERVER-16256)) have been sitting at *Gathering Interest* for years. [The full note is on the site](https://sprintname.dev/sprint-names-for-jira). Teams that prefix their sprints (`TEAM-1 Refactor and Pray`) spend part of that budget before the name begins, so the tightest preset leaves room for one.

| Preset | Names available |
|---|--:|
| No limit | 385 |
| ≤ 30 — Jira's actual cap | 365 |
| ≤ 26 — room for a short prefix | 326 |

Your choice persists between visits. When a filtered pool runs dry but longer names remain unissued, the main button becomes **Raise the limit** and steps out one notch — it won't silently strand you with nothing to press.

If your prefix is longer than four characters, adjust the tightest preset in `LIMITS` at the top of the script block in `index.html`. It's one number.

## Genres

| Genre | Names | ≤ 30 | ≤ 26 |
|---|--:|--:|--:|
| Developer Despair | 84 | 81 | 79 |
| Gen Z Brainrot | 70 | 67 | 57 |
| Enterprise Sarcasm | 69 | 69 | 66 |
| Hope Driven Dev | 42 | 42 | 38 |
| BOFH Excuses | 36 | 32 | 26 |
| Occult Scrum | 33 | 26 | 19 |
| Corporate Cult | 28 | 25 | 18 |
| On-Call Horror | 23 | 23 | 23 |
| **Total** | **385** | **365** | **326** |

## Project structure

```
index.html        app — markup, styles, generator logic (~600 lines, no dependencies)
404.html          the not-found sheet, hand-written; CloudFront's error response
names.js          the corpus — one array per genre
og.png            social card, 1200×630
fonts/            self-hosted woff2, latin subset
content.js        the prose for every generated page, and the documents index
build.js          assembles dist/ — no dependencies either
tools/og-card.html   source of og.png, for when the card needs redrawing
```

There is no framework and no `package.json`.

Opening `index.html` straight from disk still works, but the `@font-face` rules use absolute `/fonts/…` paths, so from `file://` the type falls back to system fonts. To see it as it ships, serve the build:

```bash
node build.js && (cd dist && python3 -m http.server 8000)
```

The corpus is deliberately a separate file: names change far more often than code, and editing them shouldn't mean touching the app.

### Fonts

Self-hosted, latin subset, five woff2 files totalling 116 KB — of which the homepage fetches 64 KB, because nothing on it renders in IBM Plex Sans. Both families are OFL-licensed, so redistributing them here is fine.

They were served from Google Fonts until PageSpeed put a number on it: a render-blocking stylesheet on a third origin, 750 ms before a single glyph could be resolved, and a second hop to `fonts.gstatic.com` after that. The `@font-face` rules now sit inline in the style block and the files ship from the same CloudFront distribution as the page, preloaded. That also makes the footer's *nothing is transmitted* claim true — the site now makes no third-party request at all.

The `unicode-range` descriptors are copied verbatim from Google's CSS rather than dropped, so characters outside latin still fall through to a system font instead of rendering as `.notdef` boxes. `≤`, in the character-limit chips, is one of them.

To change weights, edit the Google Fonts URL in `tools/`, download the latin-subset woff2 it points at, and update the `@font-face` block and the `FONTS` list in `build.js` to match.

### What `build.js` is for

A crawler will not press **Convene committee**, so a search engine sees a page whose entire content is the words *No designation issued*. `build.js` fixes that by emitting the corpus a second time as flat HTML at [`/funny-sprint-names`](https://sprintname.dev/funny-sprint-names) — every name, grouped by genre, each one linking back to its deep link in the app.

It now emits fifteen pages — the app, the register, one file per genre at `/sprint-names/<genre>`, a technical note on Jira's character limit at `/sprint-names-for-jira`, and four pages that are uploaded but kept out of the sitemap: an internal memo, a documents index at `/administrative-documents`, the revision history of Form SN-01 at `/revision-history`, and `404.html`, which CloudFront returns as its error response — plus `sitemap.xml` and `robots.txt`. Everything on them that is a number — counts, totals, "N under 26", the longest name — is computed from `names.js` at build time rather than typed, so none of it can go stale. `index.html` and `404.html` are hand-written and carry their figures in prose, so the build writes the real ones in on the way past, genre counts included: the word *eight* in "eight genres deep" is derived from `GENRES.length` like everything else. A pattern that stops matching fails the build rather than warning, because a silent miss is the only outcome worth guarding against.

Prose lives in [`content.js`](content.js). Eight genre pages generated from one template is the shape search engines file under *doorway* if the only thing that differs is the list, so each genre carries its own argument, its own issue/withhold advisory and its own annotated picks — about 340 words of bespoke copy per page. `build.js` refuses to run if a genre has no entry, or if a pick names something that isn't in that genre.

It also **pre-renders the genre and character-limit chips** into `index.html`. They used to be built by the script at runtime, which meant two rows of buttons appeared after first paint and shoved every section below them down the page — 0.30 of cumulative layout shift, and the single largest CLS contributor the site had. Written into the markup they cost nothing, and the genre labels become indexable text as a side effect. `wireChips()` in the app only attaches handlers to whatever is already there, and falls back to creating the buttons when the page is opened unbuilt from disk.

It has no dependencies and reads the design straight out of `index.html`: the `<style>` block, the `LIMITS` table and the seal are lifted by regex rather than restated, so the register cannot drift from the app it belongs to. Adding a genre to `names.js` adds a section to the register, but it also needs a one-line entry in `BLURBS` — the build fails loudly if you forget, because a page of bare lists is a page Google files under *thin*.

```bash
node build.js     # → dist/, plus dist/manifest.json listing what to upload where
```

The sitemap is built from the list of pages that were actually emitted, so it cannot fall out of step with them, and its `<loc>` values are the same strings as each page's own `rel=canonical`. Its `lastmod` comes from `git log` on the build inputs rather than from the clock — stamping today's date on every URL at every build is exactly the pattern that teaches Google to ignore the field. If the history isn't available the date is omitted rather than guessed, which is why the workflow checks out with `fetch-depth: 0`. There is no `<priority>` or `<changefreq>`; Google ignores both.

`dist/` is generated and gitignored. `dist/manifest.json` is what the deploy workflow iterates over, so **adding a page later is a change to `build.js` alone** — the workflow does not need touching.

## Adding names

Append to the relevant array in `names.js`:

```js
{ id:"oncall", label:"On-Call Horror", accent:"#33307A",
  exhausted:"The register sleeps. You do not.",
  names:[
  "Three AM Deployment",
  "Prod Knows Where You Sleep",
  "Your name here"
]},
```

House rules, so the corpus stays coherent:

- **Title Case, with small words lowercase** — `Refactor and Pray`, not `Refactor And Pray`
- **Acronyms and identifiers keep their casing** — `Must Be DNS`, `Waiting for Godot.js`
- **Typographic apostrophes** (`’`, not `'`) — they're set at display size and it shows
- **Under ~42 characters.** Longer still renders, at the smallest tier, but it stops being a sprint name and starts being a sentence
- **No duplicates across genres.** A name belongs to exactly one

The bar for inclusion: a name earns its place by being either **uncomfortably accurate** (`Refactor and Pray`) or **tonally deranged** (`Soft Launch Into Darkness`). Merely mild office humour is the failure mode this project exists to escape.

### Adding a genre

Add an object with a unique `id`, a `label`, an `accent` — an institutional ink distinct from the eight already in use — and an `exhausted` line, printed when a team has issued every name in the genre. Write that line in the genre's own voice rather than deriving it from the label; the whole point is that it lands differently for On-Call Horror than for Hope Driven Dev. `build.js` refuses to build a genre that has none, because the alternative is showing `undefined` to the one visitor who read all the way to the end of a genre. The UI picks it up automatically; the accent tints the whole page when that genre is selected.

### Withholding a genre

`names.js` ends with a second array, `WITHHELD`, holding genres that are kept in
the source but struck from the corpus — currently Catastrophe Theatre, which
abandoned the understatement the rest of the register runs on and read as a
different product.

Nothing iterates it. Every count, the register, the genre pages, the 404's
holdings list and the sitemap are all derived from `GENRES`, so a withheld genre
cannot leak into a number or a crawled page, and `build.js` never validates it.
Its `BLURBS` and `GENRE_PAGES` entries stay in `content.js` regardless, unused
and costing nothing, so that restoring it is a one-line splice rather than a
rewrite.

## Deployment

Static hosting, S3 + CloudFront. Pushes to `main` that touch `index.html`, `names.js`, `build.js` or `og.png` deploy themselves — [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs the build, uploads everything `dist/manifest.json` lists, and invalidates the distribution. Run it by hand from the Actions tab (`workflow_dispatch`) if you need to.

The build runs *before* the deploy role is assumed, so no AWS credentials are in the environment while it executes.

The manual equivalent:

```bash
node build.js
jq -r '.[] | [.key, .contentType, .cacheControl] | @tsv' dist/manifest.json |
while IFS=$'\t' read -r key ctype cache; do
  aws s3 cp "dist/$key" "s3://<BUCKET>/$key" --content-type "$ctype" --cache-control "$cache"
done
aws cloudfront create-invalidation --distribution-id <ID> --paths '/*'
```

Object keys are extensionless where the URL is (`funny-sprint-names`, not `funny-sprint-names.html`), which is why every upload sets `--content-type` explicitly — S3 would otherwise serve the register as `application/octet-stream` and the browser would download it. It also means **no CloudFront Function is needed**: there is no directory index to resolve, because there are no directories.

### Wiring up CI

The workflow authenticates with OIDC, so no AWS keys are stored in GitHub. One-time setup, replacing `<ACCOUNT_ID>`, `<DISTRIBUTION_ID>`, `<BUCKET>`, and the owner/repo ids in step 2:

**1. Register GitHub as an identity provider.** IAM → Identity providers → Add provider → OpenID Connect, URL `https://token.actions.githubusercontent.com`, audience `sts.amazonaws.com`. AWS pre-verifies this one, so there's no thumbprint to maintain.

**2. Create a role** for the provider, with this trust policy. The `sub` condition is what stops any other repo — or a branch other than `main` — from assuming it:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:<OWNER>@<OWNER_ID>/<REPO>@<REPO_ID>:ref:refs/heads/main"
      }
    }
  }]
}
```

**Note the `@<id>` suffixes — they are not optional.** GitHub issues the subject claim with immutable numeric identifiers appended to the owner and repository names, so that a renamed repo can't be impersonated by whoever claims the old name. The plain `repo:owner/name:ref:...` form you'll find in most tutorials never matches, and the failure is indistinguishable from a nonexistent role: `Not authorized to perform sts:AssumeRoleWithWebIdentity`, with nothing on the AWS side looking wrong. Every other claim (`repository`, `repository_owner`, `ref`) still uses plain names — only `sub` carries the ids. Fetch them with:

```bash
curl -s https://api.github.com/repos/<OWNER>/<REPO> | jq '{owner_id: .owner.id, repo_id: .id}'
```

To read the claim the token actually carries — worth doing if assume-role fails — add a step that decodes the payload of the token from `$ACTIONS_ID_TOKEN_REQUEST_URL` and prints `.sub`. Print selected claims only; the token itself is a bearer credential.

**3. Attach this permission policy.** Writes into one bucket and one invalidation — nothing else:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::<BUCKET>/*"
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
    }
  ]
}
```

The `Resource` was an explicit two-key allowlist before the register existed. It has to be a wildcard now that the set of objects is generated rather than fixed — the alternative is editing an IAM policy every time a page is added. The bucket serves nothing but this site, and the role still cannot read, list, or delete.

**4. Set the repo variables** under Settings → Secrets and variables → Actions → *Variables*. None of these are secret:

| Variable | Value |
|---|---|
| `AWS_ROLE_ARN` | the role from step 2 — **required** |
| `CLOUDFRONT_DISTRIBUTION_ID` | the distribution in front of the bucket — **required** |
| `S3_BUCKET` | the bucket name — **required** |
| `AWS_REGION` | optional, the bucket's region; defaults to `eu-central-1` |

The workflow fails fast naming the missing variable, rather than dying inside the AWS CLI. The bucket name is a variable rather than a default in the workflow deliberately: bucket names commonly embed the account id, and that keeps it out of a public repo.

### Notes for anyone recreating this setup

- **If the bucket is encrypted with SSE-KMS**, the role also needs `kms:GenerateDataKey` and `kms:Decrypt` on the key. Default SSE-S3 encryption needs nothing extra. The failure mode is `AccessDenied` on upload despite a correct S3 policy.
- **The ACM certificate must live in `us-east-1`.** CloudFront reads certs from N. Virginia only, regardless of where the bucket or distribution are. A cert in any other region won't even appear in the dropdown — the failure mode is a silently empty list, not an error.
- **`.dev` is HSTS-preloaded.** The whole TLD ships on the preload list in every major browser, so plaintext HTTP is refused outright. TLS isn't optional here, and there's no cleartext fallback to configure.
- **Keep the bucket private, use OAC.** Don't enable S3 static website hosting — that mode requires a public bucket and only speaks HTTP to the origin.
- **The bucket name is arbitrary.** It only has to match the domain when serving via S3 static website hosting behind a Route 53 alias. Fronted by CloudFront with OAC, the origin is referenced by its endpoint, so any name works.
- **Don't give the deploy job an `environment:` without changing the trust policy.** Referencing an environment rewrites the OIDC `sub` claim from `repo:…:ref:refs/heads/main` to `repo:…:environment:<name>`, and the role stops being assumable. If you want deployment gates, pin `sub` to the environment form instead and add a `"token.actions.githubusercontent.com:ref": "refs/heads/main"` condition to keep the branch restriction.
- **No SPA error-page rewrites needed.** Deep links are hash fragments, which never reach the server. Set `index.html` as the default root object and you're done.

## Roadmap

Phase 1 is deliberately static. A possible phase 2 introduces optional accounts, so teams can mark names as **used** and keep track of which ones they've already deployed into the wild — eventually a shared history of beautifully questionable sprint naming decisions.

Standing candidate: `Production Called → Production Calls Again → Production Has Your Number → Production Knows Where You Sleep` is an ordered sequence pretending to be four independent names. Genres whose names arrive in order, across consecutive sprints, would be a real feature.
