/* ------------------------------------------------------------------
   ESLINT — correctness only.

   The rule set is eslint's own `recommended`: the rules that catch
   mistakes, none that argue about style. This office has enough
   opinions already, and a linter that reformats is a linter people
   turn off.

   Three files, three environments, because the JS here is not one
   program. build.js and content.js are Node. names.js is a plain
   <script> the browser loads, and build.js eval()s — it declares a
   global on purpose, which is the one thing `recommended` would
   otherwise complain about.

   .mjs, not .js: there is no package.json, so Node reads a bare .js
   as CommonJS and `export default` below would be a syntax error.

   Not covered: the app itself, which lives in an inline <script> in
   index.html. Linting that needs eslint-plugin-html.
------------------------------------------------------------------ */

import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/", "node_modules/"] },

  /* The build machinery. CommonJS, Node globals. */
  {
    files: ["build.js", "content.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: globals.node
    },
    rules: js.configs.recommended.rules
  },

  /* The corpus. A classic script that defines GENRES for whoever
     loads it — index.html by <script src>, build.js by eval — and
     WITHHELD, which nothing loads yet, against the day something
     splices it in. Neither is referenced inside the file, and that is
     the point, so no-unused-vars is told to expect exactly those two
     names and no other. */
  {
    files: ["names.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: globals.browser
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { varsIgnorePattern: "^(GENRES|WITHHELD)$" }]
    }
  }
];
