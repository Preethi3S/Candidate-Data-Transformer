class DeduplicationEngine {
  dedupe(records) {
    let duplicatesRemoved = 0;
    const dedupedRecords = records.map((record) => {
      const fields = { ...record.fields };

      Object.entries(fields).forEach(([fieldName, fieldValue]) => {
        if (!Array.isArray(fieldValue)) return;
        const seen = new Set();
        fields[fieldName] = fieldValue.filter((entry) => {
          const key = this.keyFor(fieldName, entry.value);
          if (seen.has(key)) {
            duplicatesRemoved += 1;
            return false;
          }
          seen.add(key);
          return true;
        });
      });

      return { ...record, fields };
    });

    return {
      records: dedupedRecords,
      summary: {
        duplicates_removed: duplicatesRemoved,
        strategy: "field-level normalized key deduplication"
      }
    };
  }

  keyFor(fieldName, value) {
    if (value === null || value === undefined) return `${fieldName}:empty`;
    if (typeof value === "object") {
      if (fieldName === "experience") {
        return `${fieldName}:${value.company || ""}:${value.title || ""}`.toLowerCase();
      }
      if (fieldName === "education") {
        return `${fieldName}:${value.institution || ""}:${value.degree || ""}`.toLowerCase();
      }
      return `${fieldName}:${JSON.stringify(value)}`.toLowerCase();
    }
    return `${fieldName}:${String(value).trim().toLowerCase()}`;
  }
}

module.exports = { DeduplicationEngine };
