const { Readable } = require("stream");
const csv = require("csv-parser");

const requiredColumns = ["name", "email", "phone", "current_company", "title"];

class CSVParserService {
  async parse(buffer) {
    const text = buffer ? buffer.toString("utf8").trim() : "";
    if (!text) {
      return { rows: [], errors: [{ row: 0, message: "CSV file is empty" }] };
    }

    return new Promise((resolve) => {
      const rows = [];
      const errors = [];
      let headersChecked = false;

      Readable.from([text])
        .pipe(csv())
        .on("headers", (headers) => {
          headersChecked = true;
          const normalized = headers.map((header) => header.trim());
          const missing = requiredColumns.filter((column) => !normalized.includes(column));
          if (missing.length) {
            errors.push({ row: 0, message: `Missing required columns: ${missing.join(", ")}` });
          }
        })
        .on("data", (row) => {
          const rowNumber = rows.length + 1;
          const cleanRow = Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key.trim(), String(value || "").trim()])
          );
          if (!cleanRow.email && !cleanRow.phone) {
            errors.push({ row: rowNumber, message: "Row has neither email nor phone" });
          }
          rows.push(cleanRow);
        })
        .on("error", (error) => resolve({ rows, errors: [...errors, { row: 0, message: error.message }] }))
        .on("end", () => {
          if (!headersChecked) errors.push({ row: 0, message: "Unable to read CSV headers" });
          resolve({ rows, errors });
        });
    });
  }
}

module.exports = { CSVParserService, requiredColumns };
