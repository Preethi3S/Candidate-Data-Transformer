class ConflictResolver {
  resolve(field, entries) {
    const candidates = entries.filter((entry) => entry && entry.value !== null && entry.value !== undefined && entry.value !== "");
    if (!candidates.length) {
      return { winner: null, reason: "No non-empty value available", candidates: [] };
    }

    const grouped = this.groupByValue(candidates);
    const sorted = [...grouped].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.frequency !== a.frequency) return b.frequency - a.frequency;
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return String(a.value).length - String(b.value).length;
    });

    const winner = sorted[0];
    const hasConflict = new Set(candidates.map((entry) => JSON.stringify(entry.value))).size > 1;
    let reason = "Only non-empty value";
    if (grouped.length > 1) {
      const second = sorted[1];
      if (winner.priority > second.priority) reason = "Higher source priority";
      else if (winner.frequency > second.frequency) reason = "Higher source agreement frequency";
      else if (winner.confidence > second.confidence) reason = "Higher source confidence";
      else reason = "Stable deterministic tie-break";
    }

    return {
      field,
      winner: winner.value,
      winnerSource: winner.sources[0],
      reason,
      candidates: candidates.map((entry) => ({
        value: entry.value,
        source: entry.sourceType,
        confidence: entry.confidence,
        priority: entry.priority,
        frequency: grouped.find((group) => group.key === this.valueKey(entry.value))?.frequency || 1
      })),
      conflict: hasConflict
    };
  }

  groupByValue(candidates) {
    const grouped = new Map();
    candidates.forEach((entry) => {
      const key = this.valueKey(entry.value);
      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, {
          key,
          value: entry.value,
          frequency: 1,
          confidence: entry.confidence,
          priority: entry.priority,
          sources: [entry.sourceType]
        });
        return;
      }
      existing.frequency += 1;
      existing.confidence = Math.max(existing.confidence, entry.confidence);
      existing.priority = Math.max(existing.priority, entry.priority);
      if (!existing.sources.includes(entry.sourceType)) existing.sources.push(entry.sourceType);
    });
    return Array.from(grouped.values());
  }

  valueKey(value) {
    if (typeof value === "string") return value.trim().toLowerCase().replace(/\s+/g, " ");
    return JSON.stringify(value);
  }
}

module.exports = { ConflictResolver };
