const countries = {
  india: "IN",
  ind: "IN",
  in: "IN",
  "united states": "US",
  usa: "US",
  us: "US",
  "united kingdom": "GB",
  uk: "GB",
  gb: "GB"
};

class CountryNormalizer {
  normalize(value) {
    if (!value) return undefined;
    return countries[String(value).trim().toLowerCase()] || String(value).trim().toUpperCase();
  }
}

module.exports = { CountryNormalizer };
