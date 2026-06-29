const { PhoneNormalizer } = require("../server/src/normalizers/phoneNormalizer");
const { SkillNormalizer } = require("../server/src/normalizers/skillNormalizer");
const { DateNormalizer } = require("../server/src/normalizers/dateNormalizer");
const { CountryNormalizer } = require("../server/src/normalizers/countryNormalizer");

test("normalizes local Indian phone numbers to E.164", () => {
  expect(new PhoneNormalizer().normalize("9876543210")).toBe("+919876543210");
  expect(new PhoneNormalizer().normalize("+91 98765 43210")).toBe("+919876543210");
  expect(new PhoneNormalizer().normalize("91-9876543210")).toBe("+919876543210");
});

test("canonicalizes skill aliases", () => {
  const normalizer = new SkillNormalizer();
  expect(normalizer.normalize("Core Java")).toBe("Java");
  expect(normalizer.normalize("reactjs")).toBe("React");
  expect(normalizer.normalize("nodejs")).toBe("Node.js");
});

test("normalizes common date formats to YYYY-MM", () => {
  const normalizer = new DateNormalizer();
  expect(normalizer.normalize("Jan 2023")).toBe("2023-01");
  expect(normalizer.normalize("01/2023")).toBe("2023-01");
  expect(normalizer.normalize("2023-1")).toBe("2023-01");
});

test("normalizes country aliases to ISO alpha-2", () => {
  const normalizer = new CountryNormalizer();
  expect(normalizer.normalize("India")).toBe("IN");
  expect(normalizer.normalize("IND")).toBe("IN");
  expect(normalizer.normalize("IN")).toBe("IN");
});
