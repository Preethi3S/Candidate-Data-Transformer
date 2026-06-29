class ConflictResolver {
  resolve(field, entries) {
    const candidates = entries.filter((entry) => entry && entry.value !== null && entry.value !== undefined && entry.value !== "");
    if (!candidates.length) {
      return { winner: null, reason: "No non-empty value available", candidates: [] };
    }

    const sorted = [...candidates].sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      if (b.priority !== a.priority) return b.priority - a.priority;
      return String(a.value).length - String(b.value).length;
    });

    const winner = sorted[0];
    const hasConflict = new Set(candidates.map((entry) => JSON.stringify(entry.value))).size > 1;
    let reason = "Only non-empty value";
    if (candidates.length > 1) {
      const higherConfidence = sorted[0].confidence > sorted[1].confidence;
      const higherPriority = sorted[0].confidence === sorted[1].confidence && sorted[0].priority > sorted[1].priority;
      reason = higherConfidence ? "Higher source confidence" : higherPriority ? "Higher source priority" : "Stable deterministic tie-break";
    }

    return {
      field,
      winner: winner.value,
      winnerSource: winner.sourceType,
      reason,
      candidates: candidates.map((entry) => ({
        value: entry.value,
        source: entry.sourceType,
        confidence: entry.confidence,
        priority: entry.priority
      })),
      conflict: hasConflict
    };
  }
}

module.exports = { ConflictResolver };
