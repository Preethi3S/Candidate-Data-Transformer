export const defaultProjectionConfig = {
  fields: [
    {
      path: "candidate_name",
      from: "full_name"
    },
    {
      path: "primary_email",
      from: "emails[0]"
    },
    {
      path: "phone",
      from: "phones[0]",
      normalize: "E164"
    },
    {
      path: "current_title",
      from: "headline"
    },
    {
      path: "skills",
      from: "skills",
      type: "array"
    }
  ],
  include_confidence: true,
  include_provenance: true,
  on_missing: "null"
};

