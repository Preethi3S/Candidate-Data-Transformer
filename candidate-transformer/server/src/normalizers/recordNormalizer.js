const { PhoneNormalizer } = require("./phoneNormalizer");
const { CountryNormalizer } = require("./countryNormalizer");
const { SkillNormalizer } = require("./skillNormalizer");
const { DateNormalizer } = require("./dateNormalizer");

class RecordNormalizer {
  constructor() {
    this.phoneNormalizer = new PhoneNormalizer();
    this.countryNormalizer = new CountryNormalizer();
    this.skillNormalizer = new SkillNormalizer();
    this.dateNormalizer = new DateNormalizer();
  }

  normalize(record) {
    const normalized = typeof structuredClone === "function"
      ? structuredClone(record)
      : JSON.parse(JSON.stringify(record));

    normalized.fields.phones = (normalized.fields.phones || [])
      .map((entry) => ({ ...entry, value: this.phoneNormalizer.normalize(entry.value), notes: `Original: ${entry.value}` }))
      .filter((entry) => entry.value);

    if (normalized.fields.location?.value?.country) {
      normalized.fields.location.value.country = this.countryNormalizer.normalize(normalized.fields.location.value.country);
    }

    normalized.fields.skills = (normalized.fields.skills || [])
      .map((entry) => ({
        ...entry,
        raw: entry.value,
        value: this.skillNormalizer.normalize(entry.value),
        notes: entry.value === this.skillNormalizer.normalize(entry.value) ? entry.notes : `Canonicalized from ${entry.value}`
      }))
      .filter((entry) => entry.value);

    normalized.fields.experience = (normalized.fields.experience || []).map((entry) => ({
      ...entry,
      value: {
        ...entry.value,
        start_date: this.dateNormalizer.normalize(entry.value.start_date) || entry.value.start_date || null,
        end_date: this.dateNormalizer.normalize(entry.value.end_date) || entry.value.end_date || null
      }
    }));

    return normalized;
  }
}

module.exports = { RecordNormalizer };
