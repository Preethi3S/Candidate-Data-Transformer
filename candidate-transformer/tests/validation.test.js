const { candidateProfileSchema, projectionConfigSchema, validateWithSchema } = require("../server/src/validators/schemas");

test("validates canonical profile shape", () => {
  const result = validateWithSchema(candidateProfileSchema, {
    candidate_id: "abc",
    full_name: "John Doe",
    emails: ["john@gmail.com"],
    phones: ["+919876543210"],
    location: {},
    links: {},
    headline: null,
    years_experience: null,
    skills: [],
    experience: [],
    education: [],
    provenance: [],
    overall_confidence: 0.9
  });
  expect(result.ok).toBe(true);
});

test("rejects invalid projection config gracefully", () => {
  const result = validateWithSchema(projectionConfigSchema, { fields: [{ path: "", from: "" }] });
  expect(result.ok).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
});
