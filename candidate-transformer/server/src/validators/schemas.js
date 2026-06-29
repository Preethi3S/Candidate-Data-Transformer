const { z } = require("zod");

const provenanceSchema = z.object({
  field: z.string(),
  source: z.string(),
  method: z.string(),
  confidence: z.number().min(0).max(1),
  value: z.any().optional(),
  notes: z.string().optional(),
  timestamp: z.string()
});

const skillSchema = z.object({
  name: z.string(),
  confidence: z.number().min(0).max(1).default(0.6),
  sources: z.array(z.string()).default([])
});

const experienceSchema = z.object({
  company: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).default(0.6),
  sources: z.array(z.string()).default([])
});

const educationSchema = z.object({
  institution: z.string().nullable().optional(),
  degree: z.string().nullable().optional(),
  graduation_year: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).default(0.6),
  sources: z.array(z.string()).default([])
});

const candidateProfileSchema = z.object({
  candidate_id: z.string(),
  full_name: z.string().nullable(),
  emails: z.array(z.string().email()).default([]),
  phones: z.array(z.string()).default([]),
  location: z.object({
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional()
  }).default({}),
  links: z.object({
    linkedin: z.string().optional(),
    github: z.string().optional(),
    portfolio: z.string().optional(),
    other: z.array(z.string()).optional()
  }).default({}),
  headline: z.string().nullable(),
  years_experience: z.number().nullable(),
  skills: z.array(skillSchema).default([]),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  provenance: z.array(provenanceSchema).default([]),
  overall_confidence: z.number().min(0).max(1)
});

const projectionConfigSchema = z.object({
  fields: z.array(z.object({
    path: z.string().min(1),
    from: z.string().min(1),
    normalize: z.string().optional(),
    type: z.enum(["string", "number", "boolean", "array"]).optional()
  })).default([]),
  include_confidence: z.boolean().default(false),
  include_provenance: z.boolean().default(false),
  on_missing: z.enum(["null", "omit", "error"]).default("null")
});

function validateWithSchema(schema, payload) {
  const result = schema.safeParse(payload);
  return result.success
    ? { ok: true, data: result.data, errors: [] }
    : { ok: false, data: null, errors: result.error.issues };
}

module.exports = {
  candidateProfileSchema,
  projectionConfigSchema,
  validateWithSchema
};
