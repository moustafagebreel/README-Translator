const fs = require("fs/promises");

/** Read UTF-8 source text from disk. */
async function readSourceFile(filePath) { return fs.readFile(filePath, "utf8"); }

/** Convert comma-separated language input to normalized, unique codes. */
function getLanguages(input) { return [...new Set(input.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean))]; }

/** Apply exact glossary replacements after machine translation. */
function applyGlossary(text, glossary = {}) {
  return Object.entries(glossary).reduce((result, [source, target]) => result.split(source).join(target), text);
}

/** Load a JSON glossary and validate that it is an object. */
async function loadGlossary(filePath) {
  if (!filePath) return {};
  const data = JSON.parse(await fs.readFile(filePath, "utf8"));
  if (!data || Array.isArray(data) || typeof data !== "object") throw new Error("Glossary must be a JSON object.");
  return data;
}

module.exports = { readSourceFile, getLanguages, applyGlossary, loadGlossary };
