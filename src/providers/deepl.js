const deepl = require("deepl-node");
const LANGUAGE_MAP = { ar: "ar", fr: "fr", es: "es", de: "de", tr: "tr", ru: "ru" };
const MAX_ATTEMPTS = 3;

/** Translate text with DeepL, retrying rate-limited requests. */
async function translate(text, targetLang, apiKey) {
  const target = LANGUAGE_MAP[targetLang];
  if (!target) throw new Error(`DeepL does not support language: ${targetLang}`);
  const client = new deepl.Translator(apiKey);
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try { return (await client.translateText(text, null, target)).text; }
    catch (error) {
      if (attempt === MAX_ATTEMPTS || !(error.isRateLimitReached || error.statusCode === 429)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}
module.exports = { translate };
