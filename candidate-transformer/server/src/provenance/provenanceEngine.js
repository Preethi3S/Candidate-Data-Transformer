class ProvenanceEngine {
  fromEntry(entry) {
    return {
      field: entry.field,
      source: entry.source,
      method: entry.method,
      confidence: entry.confidence,
      value: entry.value,
      original_value: entry.original_value,
      notes: entry.notes || undefined,
      timestamp: entry.timestamp || new Date().toISOString()
    };
  }

  collect(records) {
    const entries = [];
    records.forEach((record) => {
      Object.values(record.fields).forEach((fieldValue) => {
        if (!fieldValue) return;
        if (Array.isArray(fieldValue)) {
          fieldValue.forEach((entry) => entries.push(this.fromEntry(entry)));
        } else {
          entries.push(this.fromEntry(fieldValue));
        }
      });
    });
    return entries;
  }
}

module.exports = { ProvenanceEngine };
