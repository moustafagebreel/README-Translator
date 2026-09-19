const LANGUAGE_NAMES = { ar: "Arabic", fr: "French", es: "Spanish", de: "German", tr: "Turkish", ru: "Russian" };

/** Translate text through a local Ollama server. */
async function translate(text, targetLang) {
  const language = LANGUAGE_NAMES[targetLang] || targetLang;
  const endpoint = process.env.OLLAMA_ENDPOINT || "http://localhost:11434/api/generate";
  const model = process.env.OLLAMA_MODEL || "llama3.1";
  const prompt = `You are a professional translator. Translate the following Markdown to ${language}. Keep ALL markdown syntax intact. Do NOT translate placeholders like ___PROTECTED_0___. Keep technical terms in English when appropriate. Return ONLY translated text.\n\n${text}`;
  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, prompt, stream: false }) });
  if (!response.ok) throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
  return (await response.json()).response?.trim() || "";
}
module.exports = { translate };
