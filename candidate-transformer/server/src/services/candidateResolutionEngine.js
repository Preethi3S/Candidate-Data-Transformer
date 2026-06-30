const { PhoneNormalizer } = require("../normalizers/phoneNormalizer");

class CandidateResolutionEngine {
  constructor(phoneNormalizer = new PhoneNormalizer()) {
    this.phoneNormalizer = phoneNormalizer;
  }

  resolve(records) {
    const csvRecords = records.filter((record) => record.sourceType === "CSV");
    if (csvRecords.length <= 1) {
      return { records, identity: { identity_match_score: csvRecords.length ? 100 : 0, method: "single_or_no_csv_candidate" } };
    }

    const anchorRecords = records.filter((record) => record.sourceType !== "CSV");
    const anchor = this.identity(anchorRecords);
    const scored = csvRecords.map((record) => ({ record, ...this.score(record, anchor) })).sort((a, b) => b.score - a.score);
    const winner = scored[0];
    const selectedCsvRecords = winner.score >= 60 ? [winner.record] : csvRecords;

    return {
      records: [...records.filter((record) => record.sourceType !== "CSV"), ...selectedCsvRecords],
      identity: {
        identity_match_score: Math.round(winner.score),
        method: winner.method,
        selected_csv_row: winner.record.rowNumber,
        candidates_evaluated: csvRecords.length
      }
    };
  }

  identity(records) {
    return records.reduce((acc, record) => {
      const fields = record.fields;
      (fields.emails || []).forEach((entry) => acc.emails.add(String(entry.value).toLowerCase()));
      (fields.phones || []).forEach((entry) => {
        const normalized = this.phoneNormalizer.normalize(entry.value);
        if (normalized) acc.phones.add(normalized);
      });
      (fields.links || []).forEach((entry) => {
        if (entry.value?.linkedin) acc.linkedin.add(entry.value.linkedin.toLowerCase());
        if (entry.value?.github) acc.github.add(entry.value.github.toLowerCase());
      });
      if (fields.full_name?.value) acc.names.push(fields.full_name.value);
      return acc;
    }, { emails: new Set(), phones: new Set(), linkedin: new Set(), github: new Set(), names: [] });
  }

  score(record, anchor) {
    const fields = record.fields;
    const emails = (fields.emails || []).map((entry) => String(entry.value).toLowerCase());
    if (emails.some((email) => anchor.emails.has(email))) return { score: 100, method: "email" };

    const phones = (fields.phones || []).map((entry) => this.phoneNormalizer.normalize(entry.value)).filter(Boolean);
    if (phones.some((phone) => anchor.phones.has(phone))) return { score: 95, method: "phone" };

    const links = (fields.links || []).map((entry) => entry.value || {});
    if (links.some((link) => link.linkedin && anchor.linkedin.has(link.linkedin.toLowerCase()))) return { score: 90, method: "linkedin_url" };
    if (links.some((link) => link.github && anchor.github.has(link.github.toLowerCase()))) return { score: 85, method: "github_url" };

    const name = fields.full_name?.value;
    const nameScore = Math.max(0, ...anchor.names.map((anchorName) => this.nameSimilarity(name, anchorName)));
    return { score: Math.round(60 + nameScore * 20), method: "name_similarity" };
  }

  nameSimilarity(a, b) {
    if (!a || !b) return 0;
    const distance = this.levenshtein(a.toLowerCase(), b.toLowerCase());
    return 1 - distance / Math.max(a.length, b.length, 1);
  }

  levenshtein(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
    for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
    for (let i = 1; i <= a.length; i += 1) {
      for (let j = 1; j <= b.length; j += 1) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return dp[a.length][b.length];
  }
}

module.exports = { CandidateResolutionEngine };
