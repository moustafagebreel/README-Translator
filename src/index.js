const core = require("@actions/core");
const fs = require("fs/promises");
const { execFileSync } = require("child_process");
const { readSourceFile, getLanguages, loadGlossary } = require("./utils");
const { translateReadme } = require("./translator");
const PROVIDERS_REQUIRING_KEY = new Set(["deepl", "openai", "gemini"]);

/** Run a git command and return trimmed output. */
function git(args) { return execFileSync("git", args, { encoding: "utf8" }).trim(); }

/** Commit generated files only when they differ, then push the current branch. */
function commitChanges(files, message) {
  git(["add", "--", ...files]);
  if (!git(["status", "--porcelain"])) return false;
  git(["config", "user.name", "github-actions[bot]"]);
  git(["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
  git(["commit", "-m", message]); git(["push"]); return true;
}

/** Execute the README Translator GitHub Action. */
async function run() {
  try {
    const targetLangs = getLanguages(core.getInput("target-langs", { required: true }));
    const provider = core.getInput("api-provider") || "deepl";
    const apiKey = core.getInput("api-key");
    const sourceFile = core.getInput("source-file") || "README.md";
    const dryRun = core.getBooleanInput("dry-run");
    if (!targetLangs.length) throw new Error("At least one target language is required.");
    if (!["deepl", "openai", "gemini", "ollama"].includes(provider)) throw new Error(`Unsupported provider: ${provider}`);
    if (PROVIDERS_REQUIRING_KEY.has(provider) && !apiKey) throw new Error(`api-key is required for ${provider}.`);
    const source = await readSourceFile(sourceFile);
    const glossary = await loadGlossary(core.getInput("glossary-file"));
    const outputFiles = [];
    for (const targetLang of targetLangs) {
      core.info(`Translating ${sourceFile} to ${targetLang} via ${provider}.`);
      const translated = await translateReadme({ content: source, targetLang, provider, apiKey, glossary });
      const output = sourceFile.replace(/\.md$/i, `.${targetLang}.md`);
      await fs.writeFile(output, translated, "utf8"); outputFiles.push(output);
    }
    if (dryRun) core.info("Dry run enabled: generated files were not committed.");
    else if (!commitChanges(outputFiles, core.getInput("commit-message") || "docs: update translations [skip ci]")) core.info("No translation changes to commit.");
    core.setOutput("translated-files", outputFiles.join(","));
  } catch (error) { core.setFailed(error instanceof Error ? error.message : String(error)); }
}
run();
