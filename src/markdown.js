/** Protect Markdown fragments that must not be sent to a translation provider. */
function protectSpecialBlocks(content) {
  const protectedItems = [];
  const protect = (value) => {
    const token = `___PROTECTED_${protectedItems.length}___`;
    protectedItems.push(value);
    return token;
  };
  let output = protectFencedCode(content, protect);
  const patterns = [
    /<!--[\s\S]*?-->/g,
    /<[^>]+>/g,
    /!\[[^\]]*\]\([^\s)]+(?:\s+[^)]*)?\)/g,
    /\[[^\]]*\]\([^\s)]+(?:\s+[^)]*)?\)/g,
    /https?:\/\/[^\s<>)]+/g,
    /`[^`\n]+`/g
  ];
  for (const pattern of patterns) output = output.replace(pattern, protect);
  return { content: output, protectedItems };
}

/** Replace fenced sections, honoring fences longer than nested inner fences. */
function protectFencedCode(content, protect) {
  const lines = content.split(/(?<=\n)/);
  let fence = null;
  let buffer = [];
  const result = [];
  for (const line of lines) {
    const match = line.match(/^\s*(`{3,}|~{3,})/);
    if (!fence && match) { fence = match[1]; buffer = [line]; continue; }
    if (fence) {
      buffer.push(line);
      if (match && match[1][0] === fence[0] && match[1].length >= fence.length) {
        result.push(protect(buffer.join(""))); fence = null; buffer = [];
      }
    } else result.push(line);
  }
  return result.join("") + (buffer.length ? buffer.join("") : "");
}

/** Restore protected Markdown fragments in their original positions. */
function restoreSpecialBlocks(content, protectedItems) {
  return content.replace(/___PROTECTED_(\d+)___/g, (token, index) => protectedItems[Number(index)] ?? token);
}

module.exports = { protectSpecialBlocks, restoreSpecialBlocks };
