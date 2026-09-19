const { chunkText, generateLangLinks } = require("../src/translator");
const { applyGlossary } = require("../src/utils");

describe("translator helpers", () => {
  test("chunkText splits paragraphs", () => expect(chunkText("one\n\ntwo\n\nthree", 8)).toEqual(["one\n\ntwo", "three"]));
  test("generateLangLinks creates language paths", () => {
    const links = generateLangLinks("ar"); expect(links).toContain("README.fr.md"); expect(links).toContain("**AR**");
  });
  test("applyGlossary replaces terms", () => expect(applyGlossary("GitHub Action", { GitHub: "غيتهاب" })).toBe("غيتهاب Action"));
});
