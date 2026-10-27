# Records and Retention — the basement

Status: **planned, not started.** Supersedes nothing in `IDEAS.md`; the
escalation puzzle stays on ice and is kept clear of (see *Collisions*).

---

## The idea in one paragraph

The Sprint Designation Office has a basement. Nobody is told. It is reached
through doors that were always on the site, it is built from the same form
the visitor already knows, and it goes down. The deeper it goes the less the
form holds together: section numbers keep counting, revisions count
backwards, ink drains out of the page, corridors connect to themselves. Once,
roughly two-thirds of the way down, the visitor finds a drawer with their own
name on it, and it contains what they have been issued. Then the rooms empty,
the fields lose their contents, and at the bottom there is only ruled paper.
No puzzle, no reveal, no lore drop. The one consequence is that the form
upstairs remembers they went.

Reference points, in order of weight: **Control** (a federal bureau that is
larger inside than out, and treats that as an administrative matter), **the
Backrooms** (repetition with small errors, liminal emptiness), **SCP** (the
clinical register of a document describing something it should not). Not a
reference: ARGs with ciphers, countdowns, or a developer who went missing.

### Why this belongs on a sprint-name generator

It is the existing joke, followed downstairs. The site is already a
bureaucracy with no staff that keeps running because nobody can file the
procedure to stop it — SN-02 says so in writing. A building like that has
floors nobody visits. The basement does not change what the site *is*; it
shows how far the same premise goes.

### Rules the build must keep

1. **It never touches the tool.** No change to the generator's behaviour, its
   speed, its layout, or its first paint. A visitor who never finds the
   basement must not be able to tell it exists.
2. **Found, never advertised.** Not in the sitemap, `noindex, nofollow`, not
   in the documents index, no link a casual visitor would click by accident.
3. **Same form, decaying.** Every room is built from the lifted style block
   and the field chrome the visitor already knows. Decay is applied to that
   chrome, never replaced by a horror skin.
4. **Literally true where it makes claims about the site.** The SN-02 rule.
   The basement is fiction about the building, but anything it says about the
   *visitor's data* must be accurate. See *The drawer*.
5. **No reward, and no dead end that feels like a bug.** The bottom is an
   ending, presented as one.

---

## Shape

### Architecture: one entry page, rooms rendered from the hash

The deploy workflow uploads every object individually (`aws s3 cp` per key,
see `.github/workflows/deploy.yml`), so a few hundred static room pages would
add minutes to every deploy and every invalidation. Instead:

- **One generated page**, `/records-and-retention`, emitted by `build.js`
  through `shell()`, `unlisted: true`, `robotsMeta: "noindex, nofollow"`.
- **Rooms live in the hash**: `/records-and-retention#/b3/corridor-17`. Same
  convention as the generator's deep links, so the hash never reaches
  CloudFront, back/forward work, and a room can be linked to someone.
- **An inline script renders the room** from the hash before first paint. The
  page ships the B1 reception room in its markup, so with JS disabled, or on
  first load, there is no blank sheet and no layout shift.
- **Deterministic.** A small seeded PRNG (mulberry32 or similar), keyed by the
  room path plus one build-time constant. The same address is always the same
  room: the property the 404 already advertises ("The same address will
  always be issued the same designation"). Rooms can therefore be shared,
  revisited, and discussed.

Cost: one page, one more object in `manifest.json`, no change to the workflow.

### The graph

Thirteen levels, **B1 to B13**. Every room has 2–4 exits drawn from:

| Exit | Behaviour |
|---|---|
| Stairs down | Usually depth + 1. From B4 onward, sometimes the same depth with a different room id: "Stairs down" from B4 arrives at B4. |
| Stairs up | Usually depth − 1. Occasionally depth + 1. Never commented on. |
| Corridor | Same depth. Corridors may connect to themselves (`Corridor between B3 and B3`). |
| Filing room / drawer | A dead end at the same depth with content in it. One exit back. |
| Lift | Out of order on every floor. The notice changes with depth. |

**Guarantee:** from every room, some sequence of exits reaches B13. `build.js`
enforces this by walking the graph breadth-first from B1 with the shipped seed
and throwing if B13 is unreachable or if any room is a hard dead end without
a way back. This is the same kind of invariant the build already holds for
the documents index — the joke only works if it is accurate.

Target: reaching B13 should take a determined visitor 10–20 minutes, not an
hour. The labyrinth should feel endless, not be tedious.

### Decay by depth (idea 3)

A single CSS custom property, `--depth` (0 at B1, 1 at B13), set on `.sheet`
by the room script. Everything below keys off it; nothing is a separate
stylesheet.

| Depth | What changes |
|---|---|
| B1–B3 | Nothing visible. The form is intact. Section labels read `05 / …`, `06 / …` — the numbering simply continues from the front desk's `04 / Team register`. |
| B4–B6 | Section numbers jump (`07`, `11`, `19`, `31`). The seal reads Rev. 3, then Rev. 2. The ruled-paper grid begins drifting a pixel per level. The genre accent desaturates toward `--ink-3`. |
| B7–B9 | Field heads keep their labels but their readouts go blank. Rules misalign with their content. Rev. 0, then Rev. −1. Committee-log lines appear with no committee. |
| B10–B12 | Fields are labels only. Copy thins to single sentences, then fragments. The masthead wordmark loses its `<em>` colour entirely. |
| B13 | See *The bottom*. |

All motion (grid drift, any flicker) must respect `prefers-reduced-motion`
with a static equivalent, the way `runCommittee()` already does. No jump
scares, no sound, no autoplay. Unease comes from wrongness, not from the
page doing something at the visitor.

Dark mode gets the same decay through the same tokens; check both themes at
every band.

### Content: fragments, not pages

Rooms are assembled from fragments in a new `RECORDS` export in
`content.js`, next to `MEMO`. Writing them is the real work of this project,
and the generator is only as good as they are.

- **Room names** per depth band: *Withdrawn Forms*, *Minutes, Unread*,
  *Revisions Not Adopted*, *Corridor between B3 and B3*, *Overflow Storage
  (Overflow)*, *Retention Pending Review Pending Review*.
- **Notices** pinned to walls: lift notices, fire-drill instructions for a
  building with no occupants, a rota with one name repeated, a memo about
  memos.
- **Drawer contents**: forms that were never issued, designations struck
  through for reasons given in full, a Rev. 2 of a document that never had a
  Rev. 1.
- **Committee log lines without a committee**, reusing the `.cline` style:
  `01  Convening…`, then nothing.

Rough budget: around 60 fragments across the bands, each in the house voice.
`build.js` validates the shape of `RECORDS` the way it already validates
`GENRE_PAGES`, so a missing band fails the build rather than rendering an
empty room.

Voice note: the basement is *not* scarier writing. It is the same dry
administrative register, applied to things that should not be
administrable. The Office is never alarmed. That is the frightening part.

---

## The drawer (idea 4)

Somewhere in B7–B9 — fixed by the seed, reachable but not on the shortest
path — is a filing room with one labelled drawer:

> **Minutes — Visitor, current**
> Retained on the Office's behalf. The Office holds no copy.

Opened, it lists what *this browser* has been issued, read from
`sng.seen.v1`, grouped by genre, with the opening date from `sng.record.v1`.
Under it:

> The Office does not keep your minutes. Somebody down here does.

If the visitor has no minutes, the drawer is empty and says so:

> This drawer has been prepared. It is empty. It is not expecting to stay
> that way.

**Why this is honest, and how to keep it so.** The list is the visitor's own
`localStorage`, read by a script running in their own browser. Nothing is
fetched, nothing is sent; SN-02 stays literally true. The room's source must
say exactly that, in a comment a curious visitor will find:

```html
<!-- This drawer is your own localStorage, read in your own browser by the
     script below. Nothing about you has left it. Look. -->
```

The unease lands for the visitor who does not look; the visitor who does
finds the truth in the source, which is how the rest of the site already
works. Do **not** read `sng.registry.v1` here: a team register is shared, and
showing a team's adoptions as "your minutes" would be inaccurate.

---

## The bottom (idea 6)

The last three levels empty out deliberately:

- **B11:** rooms with field heads and no fields.
- **B12:** a single line per room — *This room has not been filed.* — and one
  exit, down.
- **B13:** the masthead, the ruled paper, and nothing else. No exits, no copy,
  no footer. The grid continues further than the content would need. The back
  button works; nothing on the page suggests using it.

### The mark

Reaching B13 writes `sng.retention.v1` (a date). From then on the seal on
the front-desk form gains one line, appended by script exactly the way
`Currently unstaffed` already is:

> Retained · B13

Nothing else changes. The visitor knows; no one else would notice. *Shred
the minutes* removes the mark along with everything else.

---

## Entrances (idea 1)

The Records and Retention department already signs the source comment at the
top of `index.html`, marked *(unstaffed)*. All entrances are optional;
building any one of them is enough to ship.

1. **The source comment.** Under the signature, a line in the same voice:
   *Records and Retention is on the lower ground floor, and below it.* No
   link, only a path a developer will try: `/records-and-retention`.
2. **After hours.** When `officeShift()` returns `night` or `weekend`, the
   seal's `Currently unstaffed` line becomes a link to the basement. The
   building is only open when nobody is in it.
3. **Form SN-03.** The 404 gains a short final section: the search of the
   holdings "was carried out on receipt" — so who carried it out? A *Service
   stairs* link at the foot of the sheet. (`404.html` is hand-written and
   passes through the build untouched; edit it directly.)

---

## Collisions to keep clear of

- **`ESCALATION` and the act VI label "Consult the forbidden archive"** are
  load-bearing for the parked puzzle. Do not link the basement from the
  escalation ladder. If the puzzle ever ships, the archive can be a room
  down here, which is a later decision.
- **The documents index** (`DOCUMENTS` in `content.js`) is load-bearing too,
  and `build.js` validates every link in it. The basement gets no row.
- **Rev. 5** is reserved in the `IDEAS.md` backlog for clearance. The basement
  counts revisions *down* from 4, never up, so it does not use Rev. 5.
- **The seal's fourth line** is where IDEAS' Stage 4 puts `Clearance: SN-07`.
  If both ever exist, they stack: unstaffed, retained, clearance.
- **`404.html`'s copy of the style block** is the one place design is
  duplicated. Basement CSS must live in `build.js` (the generated-pages-only
  block, or a basement-only block), never in `index.html`'s `<style>`, so the
  404 copy does not drift further.

---

## Build order

Each phase ships on its own and leaves the site coherent.

1. **Skeleton.** `/records-and-retention` page, hash router, seeded PRNG,
   B1–B4 with placeholder fragments, the reachability check in `build.js`,
   entrance 1 (the source comment). Validate: the build throws on a broken
   graph; rooms are stable across reloads; no change to the front-desk form.
2. **Decay.** `--depth` and the B1–B12 bands, reduced-motion paths, both
   themes.
3. **Content.** `RECORDS` in `content.js`, all bands, with build-time shape
   validation. The bulk of the effort.
4. **The drawer.** Including the honest source comment and the empty-drawer
   variant.
5. **The bottom and the mark.** B11–B13, `sng.retention.v1`, the seal line,
   shredding takes it.
6. **More entrances.** After-hours link, then Form SN-03's service stairs.

---

## Open questions

- **Thirteen levels** is a number chosen for being slightly wrong. Fewer
  would be quicker to write; more would dilute the fragments.
- **Should rooms ever change over time** (e.g. by `officeShift()`, or at
  03:00 as the IDEAS backlog suggests)? It would break the "same address,
  same room" rule, which might be the point, or might be the one rule the
  basement should never break.
- **Share-ability.** Room links are stable, so people will pass around "go to
  B7/drawer-3". That is probably good. It means the drawer must stay at the
  same address for every build that keeps the seed, so changing the seed is a
  breaking change and should be treated as one.
