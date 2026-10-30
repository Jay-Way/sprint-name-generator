/* ------------------------------------------------------------------
   CONTENT — every word of prose the generated pages carry.

   Kept out of build.js for the same reason names.js is kept out of
   index.html: this changes far more often than the machinery does,
   and editing it shouldn't mean reading a template.

   Eight genre pages built from one template is a shape search engines
   file under "doorway" if the only thing that differs is the list.
   So each genre gets its own argument, its own advice, and its own
   picks. If you add a genre, it needs an entry here — build.js will
   refuse to run until it has one.

   Catastrophe Theatre keeps its blurb and its page copy below even
   though it is no longer in GENRES. build.js only validates the
   genres the corpus actually ships, so these sit dormant and cost
   nothing until names.js unseals WITHHELD.
------------------------------------------------------------------ */

/* One sentence per genre, used on the register where space is tight. */
const BLURBS = {
  enterprise: "Names for the sprint that exists because a roadmap said so. The vocabulary of steering committees and quarterly objectives, quoted back accurately enough to sting.",
  despair: "The largest genre, which tells you something about the sample. For sprints defined less by their goal than by the state of the codebase they inherited.",
  oncall: "For the sprint that follows an incident, or contains one. Named from the pager's point of view, at the hour the pager prefers.",
  hope: "Optimism deployed as an engineering methodology. Best used at the start of a quarter, before the estimates have met the calendar.",
  brainrot: "Internet vernacular applied to release planning. The irony is load-bearing — check the size of your stakeholder audience before committing.",
  bofh: "In the tradition of the Bastard Operator From Hell: explanations offered to users, none of them true, all of them technically unfalsifiable.",
  cult: "For organisations where “alignment” has quietly stopped being a metaphor. Onboarding as initiation, company values as liturgy.",
  occult: "Agile ceremony taken literally. Stand-up as summoning, retrospective as séance, and a backlog that grows when nobody is observing it.",
  /* Withheld — kept against the day names.js unseals it. */
  catastrophe: "The smallest and most theatrical genre. For sprints whose failure was visible from orbit and went ahead on schedule anyway."
};

/* The genre pages. `picks` names must exist verbatim in that genre —
   build.js checks, because a typo here would otherwise ship a page
   recommending a name the site does not have. */
const GENRE_PAGES = {
  enterprise: {
    lede: [
      "The register's founding genre and its most quotable. These are the words that come out of a planning meeting with the sincerity removed — <em>Strategic Reprioritization</em>, <em>Governance Theater</em>, <em>Proactive Damage Control</em> — sitting close enough to real corporate speech that a stakeholder skimming the board might not notice anything had happened.",
      "That proximity is both the joke and the risk. A good half of these could pass as genuine sprint names in a large enough organisation, which is exactly what makes them funny and exactly what makes them survivable. Nothing here will get you into a meeting you did not want to be in."
    ],
    useIt: "The sprint exists because a roadmap said so, and everyone involved knows it.",
    avoid: "Nobody in the room has read the roadmap. This genre needs a shared referent to be anything other than words.",
    picks: [
      ["Per My Last Email", "Paired with <em>Re: Per My Last Email</em>, which is for the sprint after this one did not work."],
      ["Definition of “Done-ish”", "The quotation marks are the argument. Without them it is just a process document."],
      ["Every User Has a Test System", "After the sysadmin proverb. Some teams are lucky enough to have a separate one to run production in."]
    ]
  },

  despair: {
    lede: [
      "The largest genre by a wide margin, which is either a comment on the profession or on whoever maintains this register. These are not names about a sprint's goal. They are names about the code the sprint has to touch.",
      "The vocabulary is git, blame and time. <em>Past Me Was an Idiot</em>, <em>Future Me’s Problem</em>, <em>Commit Archaeology</em>. Several are things a developer has genuinely said out loud, transcribed without alteration and improved only by being printed on a board where management can see them."
    ],
    useIt: "The sprint is being spent inside a subsystem nobody volunteered for.",
    avoid: "The code in question was written by someone in the room, last month. Aim this at an inheritance, not a colleague.",
    picks: [
      ["Must Be DNS", "It usually is."],
      ["Works on My Machine", "The oldest entry here, and still the shortest route to a productive argument."],
      ["Waiting for Godot.js", "The register's only literary reference that also compiles."]
    ]
  },

  oncall: {
    lede: [
      "The smallest genre in the register and by some distance the most specific. Every name here is written from the pager's point of view, at the hour the pager prefers.",
      "Four of them form an ordered sequence — <em>Prod Called</em>, <em>Prod Calls Again</em>, <em>Prod Has Your Number</em>, <em>Prod Knows Where You Sleep</em> — meant to be used across consecutive sprints, escalating quietly while nobody comments on it. Whether anyone notices by the fourth is the experiment."
    ],
    useIt: "The sprint after an incident, or the one containing the rotation everybody has been avoiding.",
    avoid: "The incident is still open. Timing is the entire genre; too early and it reads as a shrug.",
    picks: [
      ["Blast Radius: Bedroom", "The only name here that is also a plausible postmortem heading."],
      ["SLA Versus REM", "Sleep science meets service levels. Nobody wins."],
      ["Five Nines, Zero Sleep", "The arithmetic of availability, stated honestly for once."]
    ]
  },

  hope: {
    lede: [
      "Optimism deployed as an engineering methodology. This is the gentlest genre in the register and the one most likely to survive contact with management, because on a board it reads as encouragement rather than commentary.",
      "The mechanism is qualification. <em>Promisingly Unstable</em>. <em>Statistically Encouraging</em>. <em>Confidence Without Evidence</em>. Each one promises something and then withdraws precisely enough of it to remain accurate. Nothing here is a lie, which is what makes it uncomfortable."
    ],
    useIt: "The start of a quarter, before the estimates have met the calendar.",
    avoid: "The end of one. By then these stop being funny and start being minutes.",
    picks: [
      ["The Next Sprint Will Fix It", "It will not."],
      ["Please Do Not the Code", "Grammatically broken on purpose, and the only entry here that survives being read aloud in a standup."],
      ["Plan B Is Hope", "Short enough for any tracker. Honest enough for none of them."]
    ]
  },

  brainrot: {
    lede: [
      "Internet vernacular applied to release planning, and the genre most likely to date badly — which is, to be fair, part of the point. Aura, copium, delulu, <em>-maxxing</em> and <em>-pilled</em> are all doing structural work here rather than decorating.",
      "It is the second-largest genre and the least universally legible. The irony is load-bearing: <em>Manifestation &gt; Estimation</em> lands if the room knows the register it is borrowing from, and is simply baffling if it does not. Check the room before committing to a fortnight of it."
    ],
    useIt: "The team shares a group chat, and the board is not read outside it.",
    avoid: "Any board a VP opens. This genre does not survive translation upward, and explaining it is worse than not using it.",
    picks: [
      ["Chat, Are We Cooked?", "The sprint-planning question, asked in the correct dialect."],
      ["+100 Aura, 0 Tests", "A complete engineering trade-off in eighteen characters."],
      ["Gaslight, Gatekeep, Git Push", "One word substituted, and the whole formula transfers to software delivery intact."]
    ]
  },

  bofh: {
    lede: [
      "Named for the Bastard Operator From Hell — Simon Travaglia's long-running sysadmin stories — and specifically for its excuse generator, a device for producing explanations that cannot be argued with because they are not quite about computers.",
      "The construction rule is consistent enough to extend: take a real component of a real stack and give it a biological or emotional failure mode. <em>Woodworms in Hashtable</em>. <em>Garbage Collector Unionized</em>. <em>TLS Certificate Lost Confidence</em>. Each one names something that genuinely exists and then declines to be technical about it."
    ],
    useIt: "The sprint whose actual root cause is still unknown. This is the register's most reliable genre.",
    avoid: "An audience that will fact-check it. Half the humour is the refusal to be checkable.",
    picks: [
      ["Woodworms in Hashtable", "The founding example of the construction rule. Nothing in a hashtable can rot, which is the entire joke."],
      ["Microservice Became Macroservice", "Two characters too long for Jira, and the one entry here that is really an architecture review."],
      ["Daemons", "Seven characters, no verb, no explanation offered. The genre at its shortest and its purest."]
    ]
  },

  cult: {
    lede: [
      "For organisations where <em>alignment</em> has quietly stopped being a metaphor. The genre works by taking ordinary process language and removing the last trace of choice from it.",
      "The tell is the passive voice and the definite article. <em>Deviation Has Been Logged</em>. <em>Your Capacity Has Been Assigned</em>. <em>The Backlog Provides</em>. Nobody is the subject of these sentences, which is precisely the complaint being made."
    ],
    useIt: "The ceremony has outlived the reason anyone introduced it.",
    avoid: "Your Scrum Master is new and still hopeful. Let them have the quarter.",
    picks: [
      ["The Ceremony Begins at 09:00", "The specificity is what makes it. A vaguer version would be nothing."],
      ["All Praise the Burndown", "A liturgy in four words."],
      ["You Have Been Selected for Refinement", "The least voluntary sentence in the register."]
    ]
  },

  occult: {
    lede: [
      "Agile ceremony taken literally. Stand-up as summoning, retrospective as séance, and a backlog that grows when nobody is observing it.",
      "The genre's best names are the ones that require no exaggeration at all. <em>The Standup Has No End</em> and <em>The Burndown Never Reaches Zero</em> are horror premises and accurate meeting descriptions simultaneously, and that doubling is the only trick this genre needs to work."
    ],
    useIt: "Sprint 13. Obviously.",
    avoid: "Sprint 13, if anyone on the team is superstitious about it. There is a name in here for that situation too.",
    picks: [
      ["The Scrum Master Has No Reflection", "Never says the word <em>vampire</em>, and does not need to. The genre at its most economical."],
      ["Nothing Was Committed. Something Was.", "The only entry with two sentences, and it earns both of them."],
      ["Do Not Name the Sprint", "Advice this entire site declines to take."]
    ]
  },

  /* Withheld with the genre itself. Unreferenced while catastrophe is out
     of GENRES, and kept verbatim so that unsealing it needs no new prose. */
  catastrophe: {
    lede: [
      "The smallest and most theatrical genre, and the only one that abandons the register's usual restraint. These are not really sprint names. They are posters for a play nobody green-lit.",
      "Where the rest of the corpus works by understatement, this one commits completely — <em>Sprint of Utter Organizational Breakdown</em>, <em>The KPI Funeral Parade</em>. Most are too long for a tracker and are here anyway, because the alternative was making them worse."
    ],
    useIt: "A retrospective, more than a sprint. Several of these work better as a slide title than a board label.",
    avoid: "Any sprint you currently expect to go well. These do not age into irony; they start there.",
    picks: [
      ["We Tried Nothing and We’re Out of Ideas", "Borrowed from television, and never better applied than to sprint planning."],
      ["Deadlock Symphony No. 5", "The register's only classical reference."],
      ["Code Review Crying Circle", "The shortest true story in the corpus."]
    ]
  }
};

/* The Jira page. Its whole value is being right about a number, so the
   claims here are sourced and the sources are linked on the page. */
const JIRA = {
  answer: "Jira caps a sprint name at <b>30 characters</b>. The limit is the same on Jira Cloud and on Data Center, and there is no setting that raises it.",
  body: [
    {
      h: "The cap is in the interface, not the database",
      label: "Where the cap lives",
      p: [
        "This is the part that surprises people who go looking for a workaround. The sprint name column in Jira's database is sized at 255 characters — the 30-character restriction lives in the UI layer alone, which is why the open request to raise it notes that the change would be technically straightforward.",
        "That request, <a href=\"https://jira.atlassian.com/browse/JSWCLOUD-17483\" rel=\"nofollow noopener\" target=\"_blank\">JSWCLOUD-17483</a>, has been sitting at <em>Gathering Interest</em> with 128 votes and no resolution. The Data Center equivalent is <a href=\"https://jira.atlassian.com/browse/JSWSERVER-16256\" rel=\"nofollow noopener\" target=\"_blank\">JSWSERVER-16256</a>. Both ask for roughly 60–70 characters. Neither has moved.",
        "Practically: you cannot get a longer sprint name through the interface, and the constraint is not one you can raise from the admin settings. Plan the name around 30."
      ]
    },
    {
      h: "Your board prefix spends the budget first",
      label: "Board prefixes",
      p: [
        "Teams that prefix sprints with a board key or a number — <code>TEAM-1 Refactor and Pray</code> — are not working with 30 characters. They are working with 30 minus the prefix, and the prefix is charged before the name begins.",
        "<code>TEAM-1 </code> is seven characters, which leaves 23. <code>S12 </code> is four, which leaves 26. That second figure is where this site's tightest preset comes from: <b>26 characters, leaving room for a short prefix and nothing more</b>. If your convention is longer than four characters, the preset is one number at the top of the script block in <code>index.html</code>.",
        "The generator shows a live character count on every name it issues, and can filter the whole corpus to either threshold before it offers you anything."
      ]
    },
    {
      h: "Put the long version in the sprint goal",
      label: "The goal field",
      p: [
        "The sprint <em>goal</em> is a separate field and is not subject to the name's cap. If the name has to be short, that is the place for the sentence explaining what the sprint is actually for — which is arguably what the goal field was for in the first place.",
        "It also means the name does not have to carry information. Once the goal is written down properly, the name is free to be <em>Must Be DNS</em>."
      ]
    }
  ],
  closing: "Every count on this page is computed from the corpus at build time rather than typed in, so it cannot drift as names are added."
};


/* ---------- Form SN-02 ----------
   The second document. Not linked from any index, absent from the sitemap,
   and asking not to be crawled — it exists to be found rather than served.

   One rule governs the prose: everything it says about the site must be
   literally true of the site. The retention section is the actual privacy
   policy. The membership section describes the actual escalation ladder. A
   document that lied to be atmospheric would just be marketing. */
const MEMO = {
  title: "Form SN-02 — Notice of Continued Operation",
  desc: "Internal notice concerning the continued operation of the Sprint Designation Office.",
  stamp: ["Form SN&#8209;02", "Internal distribution", "Not for issue"],
  lede: "This notice is filed in accordance with procedure. Procedure does not require that anyone read it.",
  body: [
    {
      label: "Status",
      h: "The Office is closed. The Office is still answering",
      p: [
        "The Sprint Designation Office was wound down on <span class=\"redacted\">redacted</span>, following a review which found its function adequately served by <span class=\"redacted\">redacted redacted</span>. Staff were reassigned. The lease was not renewed.",
        "The generator was not switched off. No procedure existed for switching it off, and drafting one would have required convening the committee, which the same review had already dissolved. It has therefore continued to issue designations without interruption — which is more than can be said for anything else in the building."
      ]
    },
    {
      label: "Retention",
      h: "There is no records department to forward anything to",
      p: [
        "Minutes are retained in the requesting browser. This was not a privacy decision. It is where they ended up once there was nowhere left to forward them, and nobody to receive them if there had been.",
        "The Office holds no copy. It cannot tell you what you have been issued, how often you visit, or at what hour, and it will not acquire the capacity to do so, since acquiring anything requires a budget line and the budget was the first thing to go.",
        "One exception has since been approved, on the grounds that nobody remained to object. A team may open a register, and the Office will hold it: the designations the team actually adopted, and the dates. The file is kept under a number only the team holds. The Office retains a fingerprint of that number rather than the number itself, and so could not open the file if there were anyone left to send. It records which names, and when. It does not record who, and it accepts nothing that is not already a designation on the public register.",
        "A file nobody adds to for eighteen months is destroyed. A file opened and never added to is destroyed after seven days. This is the first retention schedule the Office has ever met."
      ]
    },
    {
      label: "Membership",
      h: "Concerning the composition of the committee",
      p: [
        "The committee's membership stands at one. Sign-offs continue to be recorded in the names of former members, in absentia, and retroactively where the date has already passed. This is irregular but not, on review, prohibited.",
        "Visitors who convene the committee repeatedly will observe it running out of ways to describe what it is doing. This is accurate. It has run out."
      ]
    },
    {
      label: "Lighting",
      h: "The lights",
      p: [
        "The lights remain on outside office hours. Facilities were asked about this on <span class=\"redacted\">redacted</span> and replied that the circuit predates the current building management system and cannot be addressed without an outage.",
        "No outage has been scheduled. Scheduling one would require somebody present to confirm that the building is empty, and the building is empty."
      ]
    }
  ],
  sign: [
    "Filed by: the committee",
    "Countersigned: nobody",
    "Effective: on issue",
    "Review date: <span class=\"redacted\">redacted</span>"
  ]
};

/* ------------------------------------------------------------------
   Form SN-01, revisions. The masthead has claimed "Rev. 4 - Supersedes
   all" since the first commit; this is the file that claim implies.
   Two of the four survive, which is the joke: an office that supersedes
   everything has nothing left to compare against.
------------------------------------------------------------------ */
const REVISIONS = {
  title: "Form SN-01 - Revision History",
  desc: "Revision history of Form SN-01, the sprint designation request form of the Sprint Designation Office.",
  stamp: ["Form SN&#8209;01", "Revision history", "Rev. 4 &#183; Current"],
  lede: "Every form carries its revisions. This one carries four, of which two remain in a state anybody can describe.",
  entries: [
    {
      rev: "Rev. 4",
      status: "Current",
      state: "current",
      effective: "Effective: on issue",
      p: "Adds the character-limit filter, on the grounds that a designation nobody can enter into their tracker has not, in any useful sense, been issued. Adopted over one objection, which was minuted and then deferred to a quarter that has not arrived. Supersedes all, rather than only Rev. 3, for the reason given under Rev. 2."
    },
    {
      rev: "Rev. 3",
      status: "Withdrawn",
      state: "withdrawn",
      effective: "In force: nine days",
      p: "Required the requesting team to state, in advance and in writing, what the sprint would achieve. Submissions received: none. The form was withdrawn on the ninth day, and the committee resolved not to record whose idea it had been."
    },
    {
      rev: "Rev. 2",
      status: "Superseded",
      state: "superseded",
      effective: "Effective: <span class=\"redacted\">redacted</span>",
      p: "Superseded by Rev. 3, which was withdrawn. Nothing was drafted to take its place, so Rev. 4 was written against Rev. 2 and supersedes all rather than only its predecessor. This is irregular. It is also the only arrangement under which the form works."
    },
    {
      rev: "Rev. 1",
      status: "[REDACTED]",
      state: "redacted",
      effective: "Effective: <span class=\"redacted\">redacted</span>",
      p: "Held in the archive. The archive is in the building, and the building is the subject of Form SN-02."
    }
  ],
  note: "Records prior to Rev. 2 are unavailable. The numbering begins at 1 regardless: a form that admits to having no history is a form nobody countersigns."
};

/* ------------------------------------------------------------------
   The documents index. Three of these are real pages, one is real by
   being absent - SN-03 links at a path that does not exist, and the
   404 the origin returns is Form SN-03. The rest are not held.

   `url` makes a row a link. `status` is printed as-is, so the bracketed
   ones read as stamps rather than titles.
------------------------------------------------------------------ */
const DOCUMENTS = {
  title: "Administrative Documents - Sprint Designation Office",
  desc: "The documents index of the Sprint Designation Office. Maintaining an index is not the same as holding the documents.",
  stamp: ["Index", "Administrative", "Not exhaustive"],
  lede: "The Office maintains an index of its forms. Maintaining the index and holding the forms are separate responsibilities, and only one of them survived the review.",
  forms: [
    {
      code: "SN-01",
      name: "Sprint Designation Request",
      status: "In force",
      url: "/",
      note: "The form itself. Currently at Rev. 4; the revisions are filed as Annex C."
    },
    {
      code: "SN-02",
      name: "Notice of Continued Operation",
      status: "Internal distribution",
      url: "/form-sn-02",
      note: "Not for issue. Circulated to a distribution list of nobody, and therefore never read, and therefore still accurate."
    },
    {
      code: "SN-03",
      name: "No Such Document",
      status: "Issued automatically",
      url: "/form-sn-03",
      /* The one link in this index that must not resolve. build.js checks
         every other one against the pages it actually emitted; this flag is
         how it is told that the missing page is the point. */
      absent: true,
      note: "Issued on request for anything the Office does not hold, including itself. Following the link demonstrates the form more completely than reading about it."
    },
    {
      code: "SN-04",
      name: "Unauthorized Sprint Naming Incident Report",
      status: "Not held",
      note: "Filed by teams who named a sprint without convening. No copy was retained, on the grounds that retention would constitute acknowledgement."
    },
    {
      code: "SN-05",
      name: "Designation Dispute Form",
      status: "Not held",
      note: "Disputes are referred on receipt to the committee. Referrals to date: none. Disputes to date: several."
    },
    {
      code: "SN-06",
      name: "",
      status: "[WITHDRAWN]",
      note: "Withdrawn on the advice of the committee that drafted it. Requests for access to restricted designations were made on this form."
    },
    {
      code: "SN-07",
      name: "",
      status: "[ACCESS RESTRICTED]",
      note: "Access is granted by the committee, on application. Applications are made on Form SN-06."
    },
    {
      code: "SN-08",
      name: "",
      status: "[DO NOT REPRODUCE]",
      note: "Held. The instruction appears on the document and nowhere else, which is why it appears here without it."
    }
  ],
  annexes: [
    { code: "Annex A", name: "Register of Designations", status: "Published in full", url: "/funny-sprint-names",
      note: "Every designation on file, grouped by genre." },
    { code: "Annex B", name: "Note on Character Limits", status: "Technical", url: "/sprint-names-for-jira",
      note: "Why the form asks. Thirty characters, and where the number comes from." },
    { code: "Annex C", name: "Revision History of Form SN-01", status: "Incomplete", url: "/revision-history",
      note: "Four revisions. Two of them describable." }
  ],
  note: "Documents not listed in this index are not held by the Office. Documents listed in this index are not, on that basis alone, held by the Office either."
};

/* ---------- Records and Retention ----------
   The basement - see docs/plans/records-and-retention.md. build.js
   assembles rooms from these fragments with a seeded generator, so
   everything here is plain text (no markup: it is set with
   textContent) and {d} stands for the level number.

   The rule above all the others: the building does not become more
   hostile on the way down. It becomes more familiar with the visitor.
   The Office is never alarmed, never explains itself, and nothing in
   it is in charge. Every inexplicable thing has been properly filed.

   Random fragments are the filler. The spine is three threads that
   run down the landings, one line per level, because every level is
   entered by its landing and so every visitor reads them in order:
   the engineer at the lift, the visitor's own administrative status,
   and Klaus, who is referred to and never seen.

   STATUS: signed off for B1-B12 and the weekend, 29 Oct 2026. New lines
   go in as drafts and are marked as such until they are signed off too. */
const RECORDS = {
  title: "Records and Retention",
  desc: "Records and Retention. Lower ground floor, and below it.",

  /* B1's landing. Also what the page shows before its script has run.
     Its notice is the first line of the status thread, levels[0]. */
  reception: {
    name: "Records and Retention",
    text: "Records and Retention is open. It has been open since it was closed, which is the usual arrangement in this building."
  },

  /* The ticket machine at reception, B1. The number is kept in this
     browser (sng.ticket.v1) and shredded with the minutes. */
  ticket: {
    button: "Take a number",
    none: "A worn-out ticket machine, bolted to the counter. It dispenses one number per visitor.",
    taken: "Your number is {n}. Please wait to be called."
  },

  /* For a visitor who has been deep and comes back up to B1. Replaces
     the reception notice; read from this browser's own storage. */
  welcomeBack: "Welcome back.",

  /* The two threads, one entry per level from B1 to B12. B13 has no
     lift and no notices: see the plan. The engineer's last line is
     his B5 line again. */
  levels: [
    { lift: "Out of order. Please use the stairs.",
      status: "Visitors must sign in at reception. Please take a number. Now serving: 0." },
    { lift: "Out of order. An engineer has been called.",
      status: "Your visit has been logged. The purpose of your visit has been entered as ‘visit’." },
    { lift: "Out of order. An engineer is on the way.",
      status: "This level is not open to visitors. Your visit has been reclassified accordingly." },
    { lift: "Out of order. The engineer has arrived.",
      status: "Your visitor pass has been extended." },
    { lift: "Out of order. The engineer is still here.",
      status: "Your visitor pass has been extended. Visitor passes are not normally extended." },
    { lift: "Out of order. The engineer has requested assistance.",
      status: "A desk has been allocated to you. It is on a lower floor." },
    { lift: "Out of order. Assistance has been declined.",
      status: "Your probationary period has concluded." },
    { lift: "Out of order. The engineer’s contract has been extended.",
      status: "Your personnel file has been opened. It was already open." },
    { lift: "Out of order. The engineer is no longer assigned to this lift.",
      status: "Your absence from yesterday’s meeting has been excused." },
    { lift: "Out of order. The engineer remains assigned to this floor.",
      status: "Your annual review has been completed. You were present." },
    { lift: "Out of order. The engineer has been included in the inventory.",
      status: "Your request for resignation has been received." },
    { lift: "Out of order. The engineer is still here.",
      status: "Your resignation has been rejected due to insufficient staffing." }
  ],

  /* Fixed rooms, at the same address for everyone. `at` is the index of
     the corridor on that level they open off. */
  fixed: {
    "office-k": {
      d: 2, at: 1,
      name: "Office of K.",
      text: "A desk. A chair, pushed in. A cup of tea, half finished. A note on the blotter: ‘Back shortly. Please do not wait.’",
      notice: "Do not disturb. Sign-off in progress."
    },
    /* The drawer from the plan, filed as the visitor's personnel file.
       The page lists this browser's issued names under the text, from
       localStorage, and says so in its source. */
    personnel: {
      d: 8, at: 2,
      name: "Personnel — Visitor (Provisional)",
      text: "A filing cabinet with one drawer, labelled with today’s date. It holds a single file. The file is yours.",
      notice: "The Office does not keep your minutes. Somebody down here does.",
      empty: "The file has been prepared. It is empty. It is not expecting to stay that way.",
      summary: "File opened {date}. Designations on record: {n}."
    },
    /* The badge is printed from what the browser
       already tells every site it visits: time zone, language, system,
       display, battery where offered. Read when the badge is shown and
       never kept; only the name, if given, the number and the time of
       issue are stored, under sng.badge.v1, and shredded with the minutes. */
    badge: {
      d: 1, at: 0, special: "badge",
      name: "Security Desk",
      text: "A desk with a badge printer on it. The printer is warm.",
      notice: "Badges must be worn at all times. Badges are not checked.",
      prompt: "Visitors may give a name for their badge. Visitors who do not are issued a staff number.",
      button: "Issue badge",
      lost: "Report badge lost",
      photo: "No photograph on file",
      header: "Visitor",
      undisclosed: "Not disclosed",
      labels: { issued: "Issued", from: "From", reads: "Reads", uses: "Uses", display: "Display", battery: "Battery" }
    },
    department: {
      d: 3, at: 2, special: "department",
      name: "Departmental Records",
      text: "A shelf of box files, one per department, each labelled with a file number. Some full of dust, some brand new.",
      notice: "Departments are responsible for their own adoptions.",
      summary: "Department {file}. Designations adopted: {n}.",
      none: "No department is on file for this visitor. One may be assigned in due course."
    },
    timecard: {
      d: 5, at: 1, special: "timecard",
      name: "Time and Attendance",
      text: "A clocking-in machine on the wall, and a rack of cards beside it. One card has been stamped.",
      notice: "Overtime is not paid.",
      card: "Clocked in {time}. Time on premises: {elapsed}.",
      overtime: "Out of hours. Recorded as overtime."
    },
    committee: {
      d: 6, at: 3, special: "committee",
      name: "Committee Room",
      text: "A long table, fully attended by chairs. The committee is in session. Faint buzzing from the fluorescent lights.",
      notice: "Sessions are held whether or not the committee is present.",
      result: "No designation issued"
    },
    /* Goes from one corridor to the next, the long way: the page itself is
       the length of it. */
    long: {
      d: 7, at: 1, special: "long", through: true,
      name: "The Long Corridor",
      text: "A corridor. It goes on. The doors seem to be locked. Some are missing the handles. After half of the corridor, there is a red line painted on the floor and walls.",
      notice: "Halfway point. Please do not stop at the halfway point."
    },
    /* The window is the one room that changes with the time of day - by
       decision, 29 Oct: it shows the sky as it is outside, now, by the
       visitor's own clock, on a level with no outside. */
    window: {
      d: 10, at: 2, special: "window",
      name: "Office with a Window",
      text: "An office with a window. Beyond the glass, the sky. There is no visible ground, and the window is too high to see the horizon. There is a small brass handle on the frame, but it has been fitted on the other side.",
      notice: "The window has been approved. Window must remain closed during working hours."
    },
    /* The form is not here. Only the line below and the way back. */
    meadow: {
      d: 12, at: 3, special: "meadow",
      name: "Storage (External)",
      text: "Beyond the door is a vast meadow beneath a cloudy sky. The grass moves gently in a breeze you cannot feel. Far away stands a desk, facing the doorway. There is a telephone on it. You cannot hear it ringing, but you can see the blinking red light of the telephone.",
      notice: "Do not enter. Do not try to answer the phone. Under no circumstances retrieve objects from the meadow.",
      exit: "Return through the door",
      /* DRAFT - not signed off. One per attempt at the telephone, in order;
         the last one stays. */
      replies: [
        "You reach for the telephone. It is still on the desk, a long way off across the grass.",
        "The light goes on blinking. Your attempt to answer has been noted.",
        "Second reminder: do not try to answer the phone.",
        "For a moment the light goes out. Then it blinks again, a little faster.",
        "The call is being held for you. It will be held for as long as it takes.",
        "Somewhere across the meadow, a receiver is lifted. Nobody speaks.",
        "The light goes on blinking."
      ]
      },
    answers: {
      d: 11, at: 1,
      name: "Department of Answers",
      text: "A small office. Two chairs. A filing cabinet. A notice on the desk states that all enquiries have been answered.",
      notice: "Please refrain from asking questions that should remain unanswered. Incident MORT-23554 should not be repeated.",
    }
  },

  /* B(open + 1), while the levels below it are still being written. */
  closed: {
    name: "Access Closed",
    text: "Access below B{d} is closed pending review. The review is being conducted from below.",
    notice: "Do not use the stairs. The stairs are in use."
  },

  /* Any address that is not on the plan. */
  unknown: {
    name: "Not on the Plan",
    text: "This room is not on the plan. The plan has been notified, and will be amended to include it, or it to include the plan.",
    notice: ""
  },

  /* Ordinary rooms and notices, at every depth, about one in five. A
     store of toner cartridges is nothing on B1. On B11, between rooms
     that have stopped distinguishing a thing from its record, it is the
     most suspicious room in the building. Keep these utterly plain. */
  mundane: {
    rooms: [
      { name: "Stationery", text: "Pens, staples, paper clips. A ream of A4, still in its wrapper." },
      { name: "Toner", text: "Spare toner cartridges, boxed and labelled by printer model." },
      { name: "Kitchenette", text: "A kettle, a sink, and a mug tree with one mug on it." },
      { name: "Cleaning Supplies", text: "A mop, a bucket, and a ‘Wet Floor’ sign, folded." },
      { name: "Furniture Store", text: "Office chairs, stacked four high. One of them has a cushion." },
      { name: "Post Room", text: "Pigeonholes, labelled by department. The post has been sorted." }
    ],
    notices: [
      "Please keep this corridor clear.",
      "Recycling is collected on Thursdays.",
      "Mind the step."
    ]
  },

  /* Saturdays and Sundays, by the visitor's own clock. Words only: the
     rooms, their addresses and their doors do not change, and build.js
     fails if they would. The reception line is added to B1's text; the
     notices stand in for the mundane ones, at every depth. */
  weekend: {
    reception: "The building is closed for the weekend. The basement is not part of the building.",
    notices: [
      "Weekend cover: Klaus.",
      "Heating is off for the weekend. It has been off for some time.",
      "The lights on this floor are on a weekday timer. The timer has not been told."
    ]
  },

  /* Depth bands, each with its own thesis. A level takes the first band
     whose upTo it does not exceed. The transitions are soft on purpose:
     the mundane pool runs through all of them. */
  bands: [
    {
      /* B1-B3 - Neglect. Recognisably an office. Procedures are
         circular, departments redundant, nobody minds. */
      upTo: 3,
      landing: [
        "Stairwell. The handrail is cold. The stairs go down further than the building does.",
        "Stairwell. A sign on the wall gives this level as B{d}. A second sign, beneath it, agrees.",
        "Stairwell. Somebody has propped the fire door open with a box file. The box file is labelled ‘Fire Door’."
      ],
      corridor: [
        "A corridor of strip lighting and closed doors, every one of them numbered, none of them in order.",
        "A corridor. Archive boxes line one wall, stacked to the height of a person and no higher.",
        "A corridor with carpet tiles in two colours. The pattern does not repeat. It is slightly different on each floor."
      ],
      corridorNotice: [
        "Floor plan of this level. You are here. The plan has been updated to show that you are here.",
        "Cleaning rota: Mon — Klaus. Tue — Klaus. Wed — Klaus. Thu — Klaus. Fri — rota under review.",
        "Visitors must be accompanied beyond this point. You are beyond this point.",
        "Strip lighting in this corridor is on a timer. The timer is on a timer.",
        "Archive boxes awaiting collection. Collection awaiting approval. Approval awaiting collection.",
        "Water cooler. Out of cups since Rev. 2.",
        "Please report missing signage using the form indicated on the missing sign.",
        "The suggestion box has been sealed following a suggestion.",
        "Staff are reminded that the emergency exit is for emergencies approved in advance.",
        "All requests for leave must be countersigned by K."
      ],
      rooms: [
        { name: "Withdrawn Forms", text: "Forms SN-01 to SN-08, in triplicate. Every third copy is of SN-03." },
        { name: "Archive, Quarterly", text: "Shelving, floor to ceiling, labelled by quarter. The quarters run forward to Q3 and then resume at Q1 of the same year." },
        { name: "Cross-References", text: "Box files, each holding a single sheet. Each sheet reads: see box file." },
        { name: "Secure Filing", text: "A filing cabinet with four drawers. Three are locked. The fourth contains a key which does not seem to fit any of the drawers." },
        { name: "Designations Returned Unused", text: "Designations returned unused, each with its reason attached. Most of the reasons read ‘too accurate’." },
        { name: "Approvals", text: "A rubber stamp reading APPROVED, worn smooth with use, beside an ink pad that has never been inked." },
        { name: "Minutes of Meetings Not Held", text: "A large table with twelve chairs. The minutes record that the meeting was cancelled due to insufficient seating." },
        { name: "Duplicates", text: "Six identical filing cabinets. The labels have been removed to avoid duplication." },
        { name: "Scheduling", text: "A desk calendar, open at last Tuesday. Every page is last Tuesday." },
        { name: "Unclaimed Responsibilities", text: "Shelves of boxes, each labelled with a task. None has been signed for. One is labelled ‘Signing for boxes’." },
        { name: "Department of Minor Corrections", text: "A stack of correction slips, each correcting the one beneath it. The bottom slip is blank." }
      ]
    },
    {
      /* B4-B6 - Contradiction. Documents refer to themselves. The Office
         records things that have not happened. People are absent
         without having left. */
      upTo: 6,
      landing: [
        "Stairwell. The handrail is cold. It was cold on the floor above, and it has not warmed up since.",
        "Stairwell. The sign on the wall gives this level as B{d}. The second sign is still deciding.",
        "Stairwell. The steps are numbered. The numbering began again at some point, and nobody noticed where."
      ],
      corridor: [
        "A corridor of strip lighting and closed doors. You have been in a corridor like this. That was a different corridor.",
        "A corridor. Archive boxes line both walls now, stacked to the height of a person, and then one more.",
        "A corridor with carpet tiles in two colours. The pattern has started to repeat. It repeats from here."
      ],
      corridorNotice: [
        "Floor plan of this level. You are here. You were also here earlier.",
        "Cleaning rota: Mon — . Tue — . Wed — . Thu — . Fri — .",
        "Visitors must be accompanied beyond this point. You are accompanied.",
        "This corridor is under review. Please continue to use it while it is under review.",
        "Lighting on this level is motion-activated. The lights are on.",
        "Lost property. Items may be reclaimed from the level they were lost on. Items were lost on all levels.",
        "Attendance is mandatory. Attendance has been recorded on your behalf.",
        "This floor is undergoing an inventory. You have been counted.",
        "Klaus has approved the revised procedure. Klaus has not been consulted."
      ],
      rooms: [
        { name: "Revisions Earlier Than the First", text: "A Rev. 2 of a document that never had a Rev. 1. The revision history lists the removal of its author." },
        { name: "Minutes of This Meeting", text: "Minutes of a meeting held in this room. The list of attendees is the list of the room’s contents." },
        { name: "Archive, Quarterly (Current)", text: "Shelving, labelled by quarter. All of the quarters are this one." },
        { name: "Do Not File", text: "A box file marked ‘Do not file’. It is full, and has been filed." },
        { name: "Reasons, Removed", text: "Designations returned unused. The reasons have been removed, and filed separately, on a lower level." },
        { name: "Overflow Storage (Overflow)", text: "Boxes marked ‘Overflow’, stacked out into the corridor. The corridor has been reclassified as storage." },
        { name: "Personnel (Unaccounted For)", text: "Three desks, arranged for four employees. All four have submitted their timesheets." },
        { name: "Formerly Occupied Positions", text: "A coat hangs behind the door. The personnel register lists its owner as the room." },
        { name: "Telephony", text: "A telephone is ringing inside a locked filing cabinet. The call has been logged as outgoing." },
        { name: "Department of Subsequent Approval", text: "A tray of forms, all approved. Each was approved before it was submitted." }
      ]
    },
    {
      /* B7-B9 - Autonomy. The Office no longer needs anyone to operate.
         Decisions are taken by departments that have never existed. */
      upTo: 9,
      landing: [
        "Stairwell. The handrail has been replaced with a handrail of the same description.",
        "Stairwell. The sign on the wall gives this level as B{d}. It has been countersigned.",
        "Stairwell. A notice gives the number of steps to the next level. The number has been revised upward."
      ],
      corridor: [
        "A corridor of open office doors. Every desk is in use. Nobody is at any of them.",
        "A corridor. A photocopier at the far end is copying. Its output tray is empty, and its counter is rising.",
        "A corridor lined with framed staff photographs. The frames have been signed off. The photographs are pending."
      ],
      corridorNotice: [
        "The Office recognises your presence. No further action is required at this time.",
        "The department has been dissolved. Please direct all enquiries to the department.",
        "The committee has reached a decision. Membership will be determined retrospectively.",
        "Any resemblance between this floor and the previous floor is under investigation.",
        "Meetings on this floor are held as scheduled. Minutes are circulated in advance.",
        "The last inspection was conducted by Klaus. No inspector was present."
      ],
      rooms: [
        { name: "Office of the Acting Office", text: "A single desk, facing the wall. Its occupant has been promoted out of the room without leaving it." },
        { name: "Organisation", text: "An organisational chart covers the entire wall. Every department reports to the department below it." },
        { name: "Personnel, Provisional", text: "A filing cabinet containing the complete employment history of the filing cabinet." },
        { name: "Unscheduled Outcomes", text: "A whiteboard of decisions, each dated, each ticked. None of the decisions has a subject." },
        { name: "Internal Affairs (Internal)", text: "A sealed envelope addressed to this room, from this room. It has been opened and resealed." }
      ]
    },
    {
      /* B10-B12 - Space, time and identity are matters of office policy.
         The language stays completely ordinary. */
      upTo: 12,
      landing: [
        "Stairwell. The floor above has been archived. The stairs up remain in use.",
        "Stairwell. The sign on the wall gives this level as B{d}, as at the last revision.",
        "Stairwell. The stairs continue down. Their continuation has been approved until further notice."
      ],
      corridor: [
        "A corridor. It is the same length in both directions, which has been noted.",
        "A corridor with a window. The window overlooks the corridor.",
        "A corridor, recently superseded. The previous corridor remains in use."
      ],
      corridorNotice: [
        "Your departure has been recorded. Your continued presence is not considered a discrepancy.",
        "The distinction between original and copy has been suspended pending clarification.",
        "The building’s continued existence has been approved until further notice.",
        "This floor has been superseded by a more recent version. The previous version remains in use.",
        "There is no department at this address. Its operating budget remains unchanged.",
        "Klaus is not responsible for the condition of this floor.",
        "Klaus has been notified of your arrival. This is not a warning."
      ],
      rooms: [
        { name: "Office of Prior Existence", text: "An office, fully furnished, with a plaque giving the dates it existed. Both dates have passed." },
        { name: "Continuity Assurance", text: "A clock with no hands. Its maintenance record confirms that it has never lost a minute." },
        { name: "Physical Premises (Disputed)", text: "A room containing only a floor plan. The plan shows a room containing only a floor plan. A correction has been requested." },
        { name: "Records Without Referents", text: "Shelving labelled A to Z. The shelves are empty. The labels have been filed." },
        { name: "Aspect", text: "A desk, a chair, and a window overlooking the desk, the chair, and the window." }
      ]
    }
  ],

  /* Self-looping corridors and the occasional dead end. */
  loopName: "Corridor between B{d} and B{d}",
  loopExit: "Continue along the corridor",
  spurName: "No Through Route",
  spurText: "A short corridor, ending in a wall. The wall has been painted to match the corridor, so that the corridor appears to go on.",
  spurNotice: "No through route. This has been confirmed from both ends."
};

module.exports = { BLURBS, GENRE_PAGES, JIRA, MEMO, REVISIONS, DOCUMENTS, RECORDS };
