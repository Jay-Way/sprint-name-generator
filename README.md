# Sprint Name Generator

A fast, static, slightly unhinged source of genuinely funny sprint names for software teams.

Because naming a sprint should not produce another round of *"Synergy & Innovation"*, *"Customer Centricity"*, or whatever corporate compliance accidentally generated this morning.

**Less "Corporate Agile Excellence". More "Woodworms in Hashtable".**

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
- **Copy button** for pasting straight into your tracker
- **Genre-tinted UI** — each genre stamps in its own ink
- Escalating button labels, for the persistent

No backend, no accounts, no tracking, no network requests after page load. Nothing you do here leaves your browser.

## Character limits

Jira caps sprint names at **30 characters**. Teams that prefix their sprints (`TEAM-1 Refactor and Pray`) spend part of that budget before the name begins, so the tightest preset leaves room for one.

| Preset | Names available |
|---|--:|
| No limit | 447 |
| ≤ 30 — Jira's actual cap | 417 |
| ≤ 26 — room for a short prefix | 372 |

Your choice persists between visits. When a filtered pool runs dry but longer names remain unissued, the main button becomes **Raise the limit** and steps out one notch — it won't silently strand you with nothing to press.

If your prefix is longer than four characters, adjust the tightest preset in `LIMITS` at the top of the script block in `index.html`. It's one number.

## Genres

| Genre | Names | ≤ 30 | ≤ 26 |
|---|--:|--:|--:|
| Developer Despair | 93 | 90 | 88 |
| Gen Z Brainrot | 76 | 73 | 62 |
| Enterprise Sarcasm | 71 | 71 | 67 |
| BOFH Excuses | 60 | 52 | 44 |
| Hope Driven Dev | 46 | 46 | 42 |
| Occult Scrum | 35 | 28 | 21 |
| Corporate Cult | 28 | 25 | 18 |
| On-Call Horror | 23 | 22 | 22 |
| Catastrophe Theatre | 15 | 10 | 8 |
| **Total** | **447** | **417** | **372** |

## Project structure

```
index.html   app — markup, styles, generator logic (~600 lines, no dependencies)
names.js     the corpus — one array per genre
```

That's the whole thing. No build step, no framework, no package.json. Open `index.html` in a browser and it works.

The corpus is deliberately a separate file: names change far more often than code, and editing them shouldn't mean touching the app.

## Adding names

Append to the relevant array in `names.js`:

```js
{ id:"oncall", label:"On-Call Horror", accent:"#33307A", names:[
  "Three AM Deployment",
  "Production Knows Where You Sleep",
  "Your name here"
]},
```

House rules, so the corpus stays coherent:

- **Title Case, with small words lowercase** — `Woodworms in Hashtable`, not `Woodworms In Hashtable`
- **Acronyms and identifiers keep their casing** — `Must Be DNS`, `node_modules Reached Critical Density`
- **Typographic apostrophes** (`’`, not `'`) — they're set at display size and it shows
- **Under ~42 characters.** Longer still renders, at the smallest tier, but it stops being a sprint name and starts being a sentence
- **No duplicates across genres.** A name belongs to exactly one

The bar for inclusion: a name earns its place by being either **technically specific** (`Woodworms in Hashtable`) or **tonally deranged** (`The Scrum Master Has No Reflection`). Merely mild office humour is the failure mode this project exists to escape.

### Adding a genre

Add an object with a unique `id`, a `label`, and an `accent` — an institutional ink distinct from the nine already in use. The UI picks it up automatically; the accent tints the whole page when that genre is selected.

## Deployment

Static hosting, S3 + CloudFront. Pushes to `main` that touch `index.html` or `names.js` deploy themselves — [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) uploads the two files and invalidates the distribution. Run it by hand from the Actions tab (`workflow_dispatch`) if you need to.

The manual equivalent:

```bash
aws s3 cp index.html s3://<BUCKET>/index.html \
  --content-type 'text/html; charset=utf-8' --cache-control 'public, max-age=300'
aws s3 cp names.js s3://<BUCKET>/names.js \
  --content-type 'text/javascript; charset=utf-8' --cache-control 'public, max-age=300'
aws cloudfront create-invalidation --distribution-id <ID> --paths '/*'
```

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

**3. Attach this permission policy.** Two objects and one invalidation — nothing else:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": [
        "arn:aws:s3:::<BUCKET>/index.html",
        "arn:aws:s3:::<BUCKET>/names.js"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
    }
  ]
}
```

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
