const { protectSpecialBlocks, restoreSpecialBlocks } = require("../src/markdown");

describe("Markdown protection", () => {
  test("protects fenced code blocks", () => {
    const value = "Before\n```js\nconst word = 'keep';\n```\nAfter"; const result = protectSpecialBlocks(value);
    expect(result.content).toContain("___PROTECTED_0___"); expect(result.protectedItems[0]).toContain("const word");
  });
  test("protects inline code", () => {
    expect(protectSpecialBlocks("Use `npm test`.").protectedItems).toContain("`npm test`");
  });
  test("protects URLs", () => expect(protectSpecialBlocks("Visit https://example.com/path.").protectedItems[0]).toBe("https://example.com/path."));
  test("restores protected parts in original order", () => {
    const source = "`first` and `second`"; const result = protectSpecialBlocks(source);
    expect(restoreSpecialBlocks(result.content, result.protectedItems)).toBe(source);
  });
  test("handles nested fences when the outer fence is longer", () => {
    const source = "````md\n```js\ncode\n```\n````"; const result = protectSpecialBlocks(source);
    expect(restoreSpecialBlocks(result.content, result.protectedItems)).toBe(source);
  });
});
