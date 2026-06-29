const { ConflictResolver } = require("../server/src/mergers/conflictResolver");
const { MergeEngine } = require("../server/src/mergers/mergeEngine");
const { ConfidenceEngine } = require("../server/src/confidence/confidenceEngine");
const { ProjectionEngine } = require("../server/src/projection/projectionEngine");

function entry(field, value, sourceType, confidence, priority) {
  return {
    field,
    value,
    sourceType,
    source: `${sourceType}.source`,
    method: "test",
    confidence,
    priority,
    timestamp: new Date().toISOString()
  };
}

test("resolves conflicts by confidence before source priority", () => {
  const resolver = new ConflictResolver();
  const resolution = resolver.resolve("full_name", [
    entry("full_name", "John Doe", "CSV", 0.95, 3),
    entry("full_name", "Johnathan Doe", "Resume", 0.8, 2)
  ]);
  expect(resolution.winner).toBe("John Doe");
  expect(resolution.reason).toBe("Higher source confidence");
});

test("merge engine unions and deduplicates multi-value fields", () => {
  const records = [
    {
      fields: {
        full_name: entry("full_name", "John Doe", "CSV", 0.95, 3),
        headline: null,
        years_experience: null,
        emails: [entry("emails", "john@gmail.com", "CSV", 0.95, 3)],
        phones: [entry("phones", "+919876543210", "CSV", 0.95, 3)],
        skills: [entry("skills", "Java", "CSV", 0.95, 3)],
        experience: [entry("experience", { company: "Google", title: "SDE" }, "CSV", 0.95, 3)],
        education: []
      }
    },
    {
      fields: {
        full_name: entry("full_name", "John Doe", "Resume", 0.8, 2),
        headline: null,
        years_experience: null,
        emails: [entry("emails", "john@gmail.com", "Resume", 0.9, 2)],
        phones: [],
        skills: [entry("skills", "Java", "Resume", 0.8, 2)],
        experience: [entry("experience", { company: "Google", title: "SDE", start_date: "2023-01" }, "Resume", 0.65, 2)],
        education: []
      }
    }
  ];
  const { profile } = new MergeEngine().merge(records);
  expect(profile.emails).toEqual(["john@gmail.com"]);
  expect(profile.skills).toHaveLength(1);
  expect(profile.experience[0].start_date).toBe("2023-01");
});

test("confidence engine returns weighted overall score", () => {
  const profile = {
    full_name: "John Doe",
    emails: ["john@gmail.com"],
    phones: ["+919876543210"],
    skills: [{ name: "Java", confidence: 0.9 }],
    experience: [{ company: "Google", title: "SDE", confidence: 0.7 }],
    provenance: [
      { field: "full_name", confidence: 0.95 },
      { field: "emails", confidence: 0.95 },
      { field: "phones", confidence: 0.95 }
    ]
  };
  expect(new ConfidenceEngine().score(profile).overall_confidence).toBeGreaterThan(0.8);
});

test("projection engine renames fields and includes metadata", () => {
  const profile = {
    full_name: "John Doe",
    emails: ["john@gmail.com"],
    phones: ["9876543210"],
    skills: [],
    experience: [],
    provenance: [{ field: "full_name", confidence: 0.95 }],
    overall_confidence: 0.91
  };
  const result = new ProjectionEngine().project(profile, {
    fields: [
      { path: "candidate_name", from: "full_name" },
      { path: "phone", from: "phones[0]", normalize: "E164" }
    ],
    include_confidence: true,
    include_provenance: true,
    on_missing: "null"
  });
  expect(result.output.candidate_name).toBe("John Doe");
  expect(result.output.phone).toBe("+919876543210");
  expect(result.output._confidence.overall).toBe(0.91);
});

test("projection engine supports missing value error strategy", () => {
  const result = new ProjectionEngine().project({ emails: [], provenance: [] }, {
    fields: [{ path: "email", from: "emails[0]" }],
    on_missing: "error"
  });
  expect(result.errors[0].message).toBe("Missing required field");
});
