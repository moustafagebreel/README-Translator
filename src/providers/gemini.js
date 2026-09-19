const { GoogleGenAI } = require("@google/genai");
const LANGUAGE_NAMES = { ar: "Arabic", fr: "French", es: "Spanish", de: "German", tr: "Turkish", ru: "Russian" };
const DEFAULT_MODEL = "gemini-2.5-flash";

/** Translate Markdown with Gemini while preserving protected placeholders. */
async function translate(text, targetLang, apiKey) {
  const language = LANGUAGE_NAMES[targetLang] || targetLang;
  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    contents: text,
    config: {
      temperature: 0.2,
      systemInstruction: `You are a professional translator. Translate the following Markdown to ${language}. Keep ALL markdown syntax intact. Do NOT translate placeholders like ___PROTECTED_0___. Keep technical terms in English when appropriate. Return ONLY translated text.`
    }
  });
  return response.text?.trim() || "";
}
module.exports = { translate };