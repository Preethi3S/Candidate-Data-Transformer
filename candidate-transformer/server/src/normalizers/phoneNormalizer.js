class PhoneNormalizer {
  normalize(value, defaultCountryCode = "91") {
    if (!value) return null;
    const digits = String(value).replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
    if (!digits) return null;
    if (digits.startsWith("+")) return `+${digits.slice(1).replace(/^0+/, "")}`;
    const withoutLeadingZeros = digits.replace(/^0+/, "");
    if (withoutLeadingZeros.length === 10) return `+${defaultCountryCode}${withoutLeadingZeros}`;
    if (withoutLeadingZeros.length === 12 && withoutLeadingZeros.startsWith(defaultCountryCode)) {
      return `+${withoutLeadingZeros}`;
    }
    if (withoutLeadingZeros.length > 10) return `+${withoutLeadingZeros}`;
    return null;
  }
}

module.exports = { PhoneNormalizer };
