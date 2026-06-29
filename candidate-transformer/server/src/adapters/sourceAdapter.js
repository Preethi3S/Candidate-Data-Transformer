class SourceAdapter {
  constructor({ sourceType, sourceName, priority, baseConfidence }) {
    this.sourceType = sourceType;
    this.sourceName = sourceName;
    this.priority = priority;
    this.baseConfidence = baseConfidence;
  }

  entry(field, value, method, confidence = this.baseConfidence, notes = "") {
    return {
      field,
      value,
      sourceType: this.sourceType,
      source: this.sourceName,
      priority: this.priority,
      method,
      confidence,
      notes,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { SourceAdapter };
