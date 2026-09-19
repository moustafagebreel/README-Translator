const { protectSpecialBlocks, restoreSpecialBlocks } = require("./markdown");
const { applyGlossary } = require("./utils");
const providers = { deepl: require("./providers/deepl"), openai: require("./providers/openai"), ollama: require("./providers/ollama") };
const LANGUAGES = ["ar", "fr", "es", "de", "tr", "ru"];
const DELAY_MS = 250;

/** Split text at paragraph boundaries without exceeding the requested size where possible. */
function chunkText(text, maxChars = 4000) {
  const paragraphs = text.split("\n\n"); const chunks = []; let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > maxChars) { chunks.push(current); current = paragraph; }
    else current += (current ? "\n\n" : "") + paragraph;
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Generate a portable language navigation line for a translated README. */
function generateLangLinks(currentLang) {
  const links = ["[English](README.md)", ...LANGUAGES.map((lang) => lang === currentLang ? `**${lang.toUpperCase()}**` : `[${lang.toUpperCase()}](README.${lang}.md)` )];
  return `> ${links.join(" | ")}`;
}

/** Translate a README, preserving non-translatable Markdown and adding metadata. */
async function translateReadme({ content, targetLang, provider, apiKey, glossary = {} }) {
  if (!providers[provider]) throw new Error(`Unsupported provider: ${provider}`);
  const protectedContent = protectSpecialBlocks(content);
  const chunks = chunkText(protectedContent.content);
  const translated = [];
  for (let index = 0; index < chunks.length; index += 1) {
    translated.push(await providers[provider].translate(chunks[index], targetLang, apiKey));
    if (index < chunks.length - 1) await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }
  const restored = restoreSpecialBlocks(translated.join("\n\n"), protectedContent.protectedItems);
  return `<!-- auto-generated -->\n${generateLangLinks(targetLang)}\n\n${applyGlossary(restored, glossary)}\n`;
}
module.exports = { chunkText, generateLangLinks, translateReadme };
