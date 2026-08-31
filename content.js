/* ------------------------------------------------------------------
   CONTENT — every word of prose the generated pages carry.

   Kept out of build.js for the same reason names.js is kept out of
   index.html: this changes far more often than the machinery does,
   and editing it shouldn't mean reading a template.

   Nine genre pages built from one template is a shape search engines
   file under "doorway" if the only thing that differs is the list.
   So each genre gets its own argument, its own advice, and its own
   picks. If you add a genre, it needs an entry here — build.js will
   refuse to run until it has one.
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
      ["Backward Compatibility Theater", "Exactly at Jira's 30-character cap — fitting or unbearable, depending on the week."],
      ["Every User Has a Test System", "After the sysadmin proverb. Some teams are lucky enough to have a separate one to run production in."]
    ]
  },

  despair: {
    lede: [
      "The largest genre by a wide margin, which is either a comment on the profession or on whoever maintains this register. These are not names about a sprint's goal. They are names about the code the sprint has to touch.",
      "The vocabulary is git, blame and time. <em>Past Me Was an Idiot</em>, <em>Future Me's Problem</em>, <em>Commit Archaeology</em>. Several are things a developer has genuinely said out loud, transcribed without alteration and improved only by being printed on a board where management can see them."
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
      "The smallest of the working genres and by some distance the most specific. Every name here is written from the pager's point of view, at the hour the pager prefers.",
      "Four of them form an ordered sequence — <em>Production Called</em>, <em>Production Calls Again</em>, <em>Production Has Your Number</em>, <em>Production Knows Where You Sleep</em> — meant to be used across consecutive sprints, escalating quietly while nobody comments on it. Whether anyone notices by the fourth is the experiment."
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
      "The mechanism is qualification. <em>Almost Certain</em>. <em>Statistically Encouraging</em>. <em>Confidence Without Evidence</em>. Each one promises something and then withdraws precisely enough of it to remain accurate. Nothing here is a lie, which is what makes it uncomfortable."
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
      ["Source: Jira", "A citation that settles nothing."]
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
      ["Woodworms in Hashtable", "The founding example, and the one the project uses to explain its bar for inclusion."],
      ["node_modules Reached Critical Density", "Too long for Jira, correct in every other respect."],
      ["CSS Became Load-Bearing", "Not an excuse so much as a diagnosis."]
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
      ["The Scrum Master Has No Reflection", "The register's own benchmark for what counts as tonally deranged."],
      ["Nothing Was Committed. Something Was.", "The only entry with two sentences, and it earns both of them."],
      ["Do Not Name the Sprint", "Advice this entire site declines to take."]
    ]
  },

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

module.exports = { BLURBS, GENRE_PAGES, JIRA };
