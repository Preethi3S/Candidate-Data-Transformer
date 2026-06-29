const monthMap = {
  jan: "01", january: "01", feb: "02", february: "02", mar: "03", march: "03",
  apr: "04", april: "04", may: "05", jun: "06", june: "06", jul: "07", july: "07",
  aug: "08", august: "08", sep: "09", sept: "09", september: "09", oct: "10",
  october: "10", nov: "11", november: "11", dec: "12", december: "12"
};

class DateNormalizer {
  normalize(value) {
    if (!value) return null;
    const text = String(value).trim().toLowerCase();
    let match = text.match(/^([a-z]+)\s+(\d{4})$/);
    if (match && monthMap[match[1]]) return `${match[2]}-${monthMap[match[1]]}`;

    match = text.match(/^(\d{1,2})[/-](\d{4})$/);
    if (match) return `${match[2]}-${match[1].padStart(2, "0")}`;

    match = text.match(/^(\d{4})-(\d{1,2})$/);
    if (match) return `${match[1]}-${match[2].padStart(2, "0")}`;

    return null;
  }
}

module.exports = { DateNormalizer };
