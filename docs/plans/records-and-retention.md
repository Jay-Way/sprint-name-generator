# Records and Retention — the basement

Status: **all six phases built** (generator, building inspection, source-comment
entrance; decay and weekend view). Texts for B1–B12 and the weekend signed off on
29 Oct 2026. Open: B1–B12 (`RECORDS_OPEN = 12`) and the bottom, B13. Supersedes nothing in `IDEAS.md`;
the escalation puzzle stays on ice and is kept clear of (see *Collisions*).

## Decisions (27 Oct 2026)

| Question | Decision |
|---|---|
| URL | `/records-and-retention` |
| Depth | 13 levels, with occasional dead ends (always with a way back) |
| Decay | Subtle: the visitor should notice around B6 that it has been going on for a while |
| Texts | Claude drafts, the owner signs off or rewrites. Drafts live in `RECORDS` in `content.js`, marked as such |
| Klaus | In, as a place: *Office of K.* on B2, fixed address `#/b2/office-k`. Referred to on notices at every depth, **never seen**. No puzzle attached |
| B13 | Empty for now. A twist or an onward link may come later; nothing is built for it yet |
| Entrances | All three: source comment, after-hours seal, Form SN-03's service stairs |
| Time | Rooms never change with the time of day. A distinct **weekend** view is wanted (see below) |
| The drawer | Now the visitor's **personnel file**, fixed at `#/b8/personnel`; shows the visitor's issued names and the record's opening date |

### The weekend

On Saturdays and Sundays (`officeShift() === "weekend"`, the visitor's own
clock) the basement is visibly the same building with the lights off:
the same rooms at the same addresses, but a dimmer sheet, and notices
swapped for weekend ones where a weekend notice exists (*"The building is
closed for the weekend. The basement is not part of the building."*). The
hour of day changes nothing. Belongs in phase 2 (styling) and phase 3
(the weekend notices).

## Revision (29 Oct 2026)

A review found the real weakness of phase 1: it was a random generator with
a good voice. Every room was funny on its own and interchangeable with every
other; nothing developed, nothing recurred, and B4 knew no more than B1.
What was taken from it, and what was not:

**Taken**

- **The governing rule:** the building does not become more hostile on the
  way down. It becomes *more familiar with the visitor*. Nobody is in charge,
  nothing is malicious, nothing is explained, and every inexplicable event has
  been properly filed.
- **A thesis per band** (see *Content*), compressed from the review's five
  phases into our thirteen levels. The empty B13 becomes the end of that
  progression — records without referents — rather than a stop.
- **Mundane rooms at every depth**, about one in five. A toner cupboard on B11
  is the most suspicious room in the building.
- **Three threads as the spine**, carried on the landings because every level
  is entered by its landing: the engineer at the lift, the visitor's
  administrative status, and Klaus.
- **The drawer becomes the personnel file**, so it belongs to the status
  thread instead of being a one-off.
- **"Welcome back."** at reception for a visitor who has been deep.
- **The Department of Answers**, fixed on B11.
- **Rooms written as name + text pairs**, instead of a tag system. Corridors
  and notices stay freely combined; there chance does no harm.
- Most of the proposed fragments.

**Not taken**

- **Levels past 13** (the review went to B41). Thirteen was decided; the
  progression fits.
- **"Your replacement has been requested."** Too good to waste, and it is an
  ending, which is to say a twist. **Parked as the candidate for B13** if B13
  ever gets one.
- **Rule notices that threaten** ("Do not acknowledge personnel who have not
  acknowledged you first"). That is the Backrooms rule-list trope, and it
  makes the building hostile, against the governing rule. Where the idea was
  good it was defused: *"This floor is undergoing an inventory. You have been
  counted."*
- **Several state flags** (`visitedKlaus`, `engineerStatus`,
  `visitorStatus`). The engineer and the status follow from depth alone. The
  only state is the deepest level reached; each further flag erodes "same
  address, same room".

---

## The idea in one paragraph

The Sprint Designation Office has a basement. Nobody is told. It is reached
through doors that were always on the site, it is built from the same form
the visitor already knows, and it goes down. The deeper it goes the less the
form holds together: section numbers keep counting, revisions count
backwards, ink drains out of the page, corridors connect to themselves. And
the Office, which began by asking the visitor to sign in, gradually starts
treating them as staff: their pass is extended, a desk is allocated, their
probation concludes. On B8 their personnel file is waiting, and it contains
what they have been issued. Their resignation is received, and rejected for
insufficient staffing. At the bottom there is only ruled paper. No puzzle,
no reveal, no lore drop. The consequences are small: the form upstairs
remembers they went, and reception says *Welcome back.*

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

0. **Familiar, never hostile. Never explained.** The governing rule from the
   revision. Every line in `RECORDS` answers to it.
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

Thirteen levels, **B1 to B13**. `RECORDS_OPEN` in `build.js` says how many
are built; the landing below the last one is *Access Closed* until its band
of fragments exists. Every room has 2–4 exits drawn from:

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

Measured with the phase 1 generator over 500 seeds and all 13 levels: no
traps, a shortest route of ~32 rooms, and a simulated visitor who takes
anything marked "down" 70% of the time and otherwise wanders needs a median
of ~185 rooms. Pressing "Stairs down" repeatedly reaches B4 and stops
working there, by design: from B4 the landing's stairs increasingly arrive
back on the same level, never next to the real service stairs. The knob is
`fakeDown` in `rLevel()`.

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

### Content: threads, bands, and filler

All prose is `RECORDS` in `content.js`. Writing it is the real work of this
project; the generator is only as good as it is.

**The threads** are the spine. They live on the landings, one line per level
from B1 to B12, so every visitor reads them in order:

| Thread | Where | Arc |
|---|---|---|
| The engineer | the lift exit, which is always out of order | called (B2) → arrived (B4) → *still here* (B5) → requests assistance, declined, contract extended, reassigned, included in the inventory → *still here* again (B12) |
| The visitor's status | the landing notice | sign in (B1) → pass extended (B4) → desk allocated (B6) → probation concluded (B7) → personnel file opened (B8) → review completed (B10) → resignation received (B11) → rejected for insufficient staffing (B12) |
| Klaus | corridor notices, every band | the rota (B1–B3) → approves without being consulted (B4–B6) → inspects with no inspector present (B7–B9) → is notified of your arrival; this is not a warning (B10–B12). His office is ordinary: half a cup of tea, *Back shortly. Please do not wait.* He never appears |

**The bands** each have a thesis. Transitions are soft; the mundane pool runs
through all of them.

| Levels | Thesis | Typical line |
|---|---|---|
| B1–B3 | **Neglect.** Recognisably an office; procedures circular, nobody minds | *The suggestion box has been sealed following a suggestion.* |
| B4–B6 | **Contradiction.** Documents refer to themselves; the absent have not left | *Attendance is mandatory. Attendance has been recorded on your behalf.* |
| B7–B9 | **Autonomy.** The Office no longer needs anyone to operate | *The department has been dissolved. Please direct all enquiries to the department.* |
| B10–B12 | **Policy over reality.** Space, time and identity are matters of office policy | *Your departure has been recorded. Your continued presence is not considered a discrepancy.* |
| B13 | **Records without referents.** Nothing | — |

**Filler**, drawn per room from the room's own seed: landing and corridor
descriptions and corridor notices per band, filing rooms as name + text
pairs, and the mundane pool (six rooms, three notices) at about one in five.

**Fixed rooms**, at the same address for everyone: *Office of K.*
(`#/b2/office-k`), the personnel file (`#/b8/personnel`), *Department of
Answers* (`#/b11/answers`). Declared in `RECORDS.fixed` with the corridor
they open off; the generator places them and the building inspection proves
them reachable.

Voice note: the basement is *not* scarier writing. It is the same dry
administrative register, applied to things that should not be
administrable. The Office is never alarmed. That is the frightening part.

---

## The personnel file (idea 4)

On B8, at `#/b8/personnel`, off one of the corridors and never on the
shortest path, is *Personnel — Visitor (Provisional)*: a cabinet with one
drawer, labelled with today's date, holding a single file. The landing of the
same level has just announced *Your personnel file has been opened. It was
already open.*

Opened, it lists what *this browser* has been issued, read from
`sng.seen.v1`, grouped by genre, with the opening date from `sng.record.v1`.
Under it:

> The Office does not keep your minutes. Somebody down here does.

If the visitor has no minutes, the drawer is empty and says so:

> The file has been prepared. It is empty. It is not expecting to stay
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

B10–B12 keep their rooms and their text; what empties out there is the form
itself, through the decay bands (readouts blank, then fields reduced to their
labels). The threads end on the B12 landing: the engineer is still here, and
the visitor's resignation has been rejected.

- **B13:** the masthead, the ruled paper, and nothing else. No exits, no copy,
  no footer, no lift. The grid continues further than the content would need.
  The back button works; nothing on the page suggests using it.

B13 is empty *for now*. The candidates for what it becomes are in *Endings
under consideration* below.

### The mark

`sng.retention.v1` holds the deepest level this browser has reached and the
date. It is the only state the basement keeps, and it drives two things:

- **Reception says *Welcome back.*** in place of the sign-in notice, for a
  visitor whose deepest level is B7 or below (deep enough to have been
  treated as staff). The line is `RECORDS.welcomeBack`.
- **Reaching B13** adds one line to the seal on the front-desk form, appended
  by script exactly the way `Currently unstaffed` already is:

  > Retained · B13

Nothing else changes. The visitor knows; no one else would notice. *Shred
the minutes* removes it along with everything else.

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
2. **Decay.** Done (29 Oct). `--depth` and `data-band` on `<html>`: grid
   offset and accent fade by depth; blank readouts, offset field heads,
   creeping grid and committee-log lines from B7; no numbers and no rules
   from B10. Weekend: dimmed sheet, a reception line, weekend notices in
   place of the mundane ones; the building inspection fails if the weekend
   would change a single door. Reduced motion stops the creep.
3. **Content.** Done (29 Oct). All of `RECORDS` signed off; B1–B12 open.
   `build.js` audits `RECORDS` before generating anything: every thread line
   for every open level, every band list non-empty, fixed rooms on a real
   level and corridor, no markup, no straight apostrophes. The building
   inspection also proves every fixed room on an open level is reachable.
4. **The personnel file.** Done (29 Oct). `personnelFile()` in the page
   script reads `sng.seen.v1` and `sng.record.v1`, read-only; the page
   source carries the comment saying so. Rendered as an extra *File* field
   on `#/b8/personnel`; the summary line is a draft.
5. **The bottom and the mark.** Done (29 Oct). B13 renders as the masthead
   on bare ruled paper (no seal, no footer, a heading for screen readers
   only). `sng.retention.v1` keeps `{ deepest, at }`; reception says
   *Welcome back.* from a deepest of B7; the form's seal reads *Retained ·
   B13* once the bottom has been reached; *Shred the minutes* removes it.
   B13 is reachable by typing its address, which a curious developer will
   do. That is accepted: the address is the reward for reading the source.
   Also fixed: false stairs could arrive at corridor 0, which the landing
   links to as well, giving the trick away. The building inspection now
   fails any room with two doors to the same place.
6. **More entrances.** Done (29 Oct). Out of hours, the seal's *Currently
   unstaffed* / *Closed until Monday* line links to the basement. Form SN-03
   lists *Search carried out by: Records and Retention* among its signatures
   and has *Service stairs* in its footer. Both new lines are drafts.

---

## Eras (29 Oct 2026)

Decided after phase 2, and replacing "subtle" below B6: the descent goes
through older and older editions of the same form, as Portal 2 goes down
through Aperture's decades. Revisions already count backwards, so the
paperwork follows them. CSS only, system Courier and Georgia, no images.

| Levels | Edition | Look |
|---|---|---|
| B1–B3 | Rev. 4 | Today's form |
| B4–B6 | Rev. 3 | Continuous stationery: perforated margins, typewriter copy, blue misregistration; scales with depth, barely there at B4 |
| B7–B9 | Rev. 1–0 | Spirit duplicator: violet bled ink, yellowed paper, a water stain, one part of the form come loose |
| B10–B12 | Rev. −1 to −4 | Before the Office: ledger stripes, clerk's serif, brown ink, a torn foot, sections slipped or faded |

Which part has come loose and where the water got in are drawn from the
room's seed, last, so a room is broken the same way on every visit and
nothing drawn before them moved.

## Specials (29 Oct 2026)

Rooms that do something, judged against what made the personnel file work:
it is about the visitor, it is true, it is unexpected, it explains nothing.
Built, texts in draft:

| Room | Where | What it does |
|---|---|---|
| Ticket machine | B1 reception | *Take a number* issues a seven-digit number, kept in `sng.ticket.v1` and shredded with the minutes. *Now serving: 0.* Reserved as the set-up for B13 |
| Departmental Records | `#/b3/department` | Reads this browser's copy of the team register (never the network): file number and the team's adoptions. Only the first eight characters of the token are ever shown |
| Time and Attendance | `#/b5/timecard` | Clocked in at the first room of this visit (session storage); time on premises ticks live. Out of hours: recorded as overtime |
| Committee Room | `#/b6/committee` | The form's own committee session, with `PROCEDURE` lifted from `index.html` by `build.js`, ending in the form's empty result: *No designation issued* |
| The Long Corridor | `#/b7/long` | A passage from one corridor to the next, three and a half screens long, with its notice posted halfway |

| Security Desk | `#/b1/badge` | A visitor badge printed from what the browser tells every site anyway: time zone (as a city), language, system, display, battery where offered. The visitor may give a name; otherwise a staff number. Only name, number and time of issue are kept (`sng.badge.v1`, shredded with the minutes). No IP address: that would need a server, would make SN-02 and the footer untrue, and is the threatening gesture the basement is built to avoid |

Two rooms with something impossible about them, recorded flatly:

| Room | Where | What it does |
|---|---|---|
| Office with a Window | `#/b10/window` | A window on B10 showing the sky as it is outside now, by the visitor's clock: night, dawn, day or dusk. The one room that changes with the time of day, by decision |
| Storage (External) | `#/b12/meadow` | The door opens on a meadow. No form, no masthead: an overexposed field, an office chair, a door frame standing in the grass, one line, and the way back. Drawn as inline SVG (`MEADOW_SVG` in `build.js`); a painted image may replace it |

Special rooms are exempt from the per-room flaws, which would otherwise fade
or tilt the very thing the room is for.

## Endings under consideration (29 Oct 2026)

Nothing here is decided or built. Three candidates, which can be combined.

### A. The visitor is Klaus (the owner's idea)

The visitor has been Klaus all along, and does not remember. Nothing says
so. At the bottom, wherever the site would show the visitor's name, it
shows *Klaus* instead — whatever name they gave, or the staff number they
were issued — and goes on doing so after they climb back up.

**It is already seeded, mostly by accident**, which is what makes it work:

| Already in the building | Read again |
|---|---|
| *Approved by Klaus* on designations issued by the form upstairs | The visitor has been approving their own designations |
| The cleaning rota: Klaus, every day | Nobody else works here |
| *Klaus has approved the revised procedure. Klaus has not been consulted.* | He does not remember approving it |
| *Klaus has been notified of your arrival. This is not a warning.* | He notified himself |
| *Weekend cover: Klaus.* | The visitor, there on a weekend |
| Office of K.: half a cup of tea, *Back shortly. Please do not wait.* | He did come back |
| The status thread: visitor → staff → resignation refused | It was never a visit |
| *Your personnel file has been opened. It was already open.* | Yes |
| *Incident MORT-23554 should not be repeated.* (Department of Answers) | The thing he cannot remember. Never explained |

**The forgetting already exists, and the visitor operates it.** *Shred the
minutes* wipes the record, the retention mark and the badge. After a shred,
the visitor is a visitor again and the building lets them sign in as if for
the first time. The building does not have to make Klaus forget; the form
has a button for it, labelled in plain sight. That is the loop.

Where the name would change:

- the badge on the Security Desk (`sng.badge.v1`): the name line reads *Klaus*
- reception: *Welcome back, Klaus.*
- the personnel file on B8: *Personnel — Klaus*
- upstairs, *Approved by* on every designation: always *Klaus*, no longer
  drawn from `SIGNATORIES`
- Office of K. on a later visit: the cup washed and turned over, the note gone

**How it stays inside rule 0.** No line ever says "you are Klaus". There is
no reveal screen, no explanation, no backstory for MORT-23554. The name
simply changes, without comment, in the places where a name is shown. A
visitor who notices understands; one who does not has still been renamed.

**Risks.** It is the most explanation-shaped ending of the three — the kind
of twist the review warned against — so the restraint above is the whole
design. It also meets the parked puzzle in `IDEAS.md`, whose countersignature
answer is *Klaus*: if the visitor is Klaus, signing as Klaus is not forgery.
That fits, but the two should be designed together if the puzzle comes back.

### B. Your number is called

B13 stays bare ruled paper, longer than the screen. At the very end of it,
one line: *Now serving: 9 703 998.* — the number from the ticket machine at
reception. A visitor who never took one reads *Now serving: 0.* No exit.
It closes the thread that began at B1, and resolves nothing.

### C. The newest edition

Every level down has been an older edition of the form. B13 breaks the
pattern: a pristine form, cleaner and newer than the one at the front desk,
every field correctly filled in, signed at the foot. The descent ends not
in the oldest paperwork but in the next revision.

**Collision:** `IDEAS.md` reserves *Rev. 5* for the clearance puzzle. Either
the two are the same document — clearance and the bottom both make the
visitor staff — or this edition carries no number (*Rev. —*) or calls
itself final (*Rev. 4, Final*).

### Combinations

- **A + C:** the newest edition, signed at the foot *Approved by Klaus* —
  the first place the visitor sees the name where theirs should be. From
  then on, A everywhere.
- **A + B:** *Now serving: 9 703 998. Klaus, please.*
- *Your replacement has been requested.*, the review's line, is retired if A
  is chosen: Klaus has no replacement, which is the point.

## Open questions

- **Share-ability.** Room links are stable, so people will pass around "go to
  B8/personnel". That is probably good. It means fixed rooms must stay at the
  same address for every build that keeps the seed, so changing the seed is a
  breaking change and should be treated as one.
- **B13.** Empty for now; see *Endings under consideration*.
