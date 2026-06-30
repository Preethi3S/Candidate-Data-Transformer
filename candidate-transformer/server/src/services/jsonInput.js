function parseJsonInput(file, rawText) {
  if (file?.buffer) return JSON.parse(file.buffer.toString("utf8"));
  if (rawText && String(rawText).trim()) return JSON.parse(String(rawText));
  return null;
}

module.exports = { parseJsonInput };
