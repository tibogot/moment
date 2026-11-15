// Checks that nl.json and en.json have everything fr.json has.
//
// A key missing from Dutch or English is not an error anywhere else: the
// loader quietly falls back to French (lib/i18n/dictionaries.ts), so the page
// renders and nobody notices a French sentence on the English site. This is
// the check that does notice.
//
// Reports, per language: missing keys, keys French does not have, lists of a
// different length, and strings whose {placeholders} differ from the French.
//
// Usage: npm run i18n   (also part of npm run check)

import { readFileSync } from "node:fs";

const read = (lang) =>
  JSON.parse(
    readFileSync(
      new URL(`../lib/i18n/dictionaries/${lang}.json`, import.meta.url),
    ),
  );

const placeholders = (text) =>
  [...text.matchAll(/\{(\w+)\}/g)]
    .map((match) => match[1])
    .sort()
    .join(",");

function compare(reference, other, path, problems) {
  if (Array.isArray(reference)) {
    if (!Array.isArray(other)) return problems.push(`${path}: not a list`);
    // SEO keyword lists are written per language, not translated one for one.
    if (other.length !== reference.length && !path.endsWith(".keywords"))
      problems.push(
        `${path}: ${other.length} items, French has ${reference.length}`,
      );
    reference.forEach((item, index) => {
      if (index < other.length)
        compare(item, other[index], `${path}[${index}]`, problems);
    });
    return;
  }
  if (reference && typeof reference === "object") {
    if (!other || typeof other !== "object" || Array.isArray(other))
      return problems.push(`${path}: not an object`);
    for (const key of Object.keys(reference)) {
      const next = path ? `${path}.${key}` : key;
      if (!(key in other)) problems.push(`${next}: missing`);
      else compare(reference[key], other[key], next, problems);
    }
    for (const key of Object.keys(other))
      if (!(key in reference))
        problems.push(`${path ? `${path}.` : ""}${key}: not in French`);
    return;
  }
  if (typeof reference === "string") {
    if (typeof other !== "string")
      return problems.push(`${path}: not a string`);
    if (placeholders(reference) !== placeholders(other))
      problems.push(
        `${path}: placeholders {${placeholders(other)}}, French has {${placeholders(reference)}}`,
      );
  }
}

const fr = read("fr");
let failed = false;
for (const lang of ["nl", "en"]) {
  const problems = [];
  compare(fr, read(lang), "", problems);
  if (problems.length) {
    failed = true;
    console.error(`\n${lang}.json — ${problems.length} problem(s):`);
    for (const problem of problems) console.error(`  ${problem}`);
  }
}

if (failed) process.exit(1);
console.log("Dictionaries: nl and en match fr.");
