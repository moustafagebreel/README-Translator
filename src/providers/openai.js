const OpenAI = require("openai");
const LANGUAGE_NAMES = { ar: "Arabic", fr: "French", es: "Spanish", de: "German", tr: "Turkish", ru: "Russian" };

/** Translate text with OpenAI while preserving Markdown placeholders. */
async function translate(text, targetLang, apiKey) {
  const language = LANGUAGE_NAMES[targetLang] || targetLang;
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini", temperature: 0.2,
    messages: [{ role: "system", content: `You are a professional translator. Translate the following Markdown to ${language}. Keep ALL markdown syntax intact. Do NOT translate placeholders like ___PROTECTED_0___. Keep technical terms in English when appropriate. Return ONLY translated text.` }, { role: "user", content: text }]
  });
  return response.choices[0]?.message?.content?.trim() || "";
}
module.exports = { translate };
