const request = require("supertest");
const app = require("../server/src/app");

const accuracyPipeline = [
  "Source Upload",
  "Source Validation",
  "Source Parsing",
  "Candidate Identity Resolution",
  "Resume Section Detection",
  "Field Extraction",
  "Field Validation",
  "Normalization",
  "Deduplication",
  "Conflict Resolution",
  "Missing Data Backfill",
  "Confidence Assignment",
  "Canonical Profile Generation",
  "Projection Layer",
  "Final Output"
];

async function createSession(email = `user-${Date.now()}@example.com`) {
  const response = await request(app)
    .post("/api/auth/signup")
    .send({ name: "Recruiter User", email, password: "password123" });
  return response.body.token;
}

test("health endpoint responds", async () => {
  const response = await request(app).get("/health");
  expect(response.status).toBe(200);
  expect(response.body.ok).toBe(true);
});

test("signup, signin, me, and logout flow works", async () => {
  const email = `auth-${Date.now()}@example.com`;
  const signup = await request(app)
    .post("/api/auth/signup")
    .send({ name: "Asha Recruiter", email, password: "password123" });

  expect(signup.status).toBe(201);
  expect(signup.body.user.email).toBe(email);
  expect(signup.body.token).toBeTruthy();

  const signin = await request(app)
    .post("/api/auth/signin")
    .send({ email, password: "password123" });

  expect(signin.status).toBe(200);
  expect(signin.body.token).toBeTruthy();

  const me = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${signin.body.token}`);

  expect(me.status).toBe(200);
  expect(me.body.user.email).toBe(email);

  const logout = await request(app)
    .post("/api/auth/logout")
    .set("Authorization", `Bearer ${signin.body.token}`);

  expect(logout.status).toBe(200);
  expect(logout.body.ok).toBe(true);
});

test("profile APIs reject anonymous requests", async () => {
  const response = await request(app).get("/api/profiles");
  expect(response.status).toBe(401);
});

test("upload endpoint processes CSV and text resume fallback", async () => {
  const token = await createSession();
  const csv = "name,email,phone,current_company,title\nJohn Doe,john@gmail.com,9876543210,Google,SDE";
  const resume = "John Doe\njohn@gmail.com\nSkills: Core Java, ReactJS\nSoftware Engineer at Google Jan 2023 Present";

  const response = await request(app)
    .post("/api/upload")
    .set("Authorization", `Bearer ${token}`)
    .attach("csvFile", Buffer.from(csv), "candidates.csv")
    .attach("resumeFile", Buffer.from(resume), "resume.txt");

  expect(response.status).toBe(201);
  expect(response.body.canonicalProfile.full_name).toBe("John Doe");
  expect(response.body.canonicalProfile.identity_match_score).toBe(100);
  expect(response.body.projectedProfile.candidate_name).toBe("John Doe");
  expect(response.body.pipeline).toEqual(accuracyPipeline);
  expect(response.body.detectedSources.map((source) => source.type)).toEqual(expect.arrayContaining(["CSV", "Resume"]));
  expect(response.body.sourceValidation).toEqual(expect.arrayContaining([
    expect.objectContaining({ source: "CSV", status: "valid_source" }),
    expect.objectContaining({ source: "Resume", status: "valid_source" })
  ]));
  expect(response.body.deduplication.strategy).toBe("field-level normalized key deduplication");
});

test("upload endpoint selects the correct CSV row by resume email", async () => {
  const token = await createSession(`identity-${Date.now()}@example.com`);
  const csv = [
    "name,email,phone,current_company,title",
    "Preethi One,preethi1@gmail.com,9876543211,TCS,SDE",
    "Preethi Two,preethi2@gmail.com,9876543212,Infosys,Engineer",
    "Preethi Three,preethi3@gmail.com,9876543213,Wipro,Developer"
  ].join("\n");
  const resume = [
    "Preethi Two",
    "Email: preethi2@gmail.com",
    "Skills: Java, React"
  ].join("\n");

  const response = await request(app)
    .post("/api/upload")
    .set("Authorization", `Bearer ${token}`)
    .attach("csvFile", Buffer.from(csv), "candidates.csv")
    .attach("resumeFile", Buffer.from(resume), "resume.txt");

  expect(response.status).toBe(201);
  expect(response.body.identity).toMatchObject({
    identity_match_score: 100,
    method: "email",
    selected_csv_row: 2,
    candidates_evaluated: 3
  });
  expect(response.body.canonicalProfile.emails).toContain("preethi2@gmail.com");
});

test("invalid resume name is rejected before merge and backfilled from CSV", async () => {
  const token = await createSession(`backfill-${Date.now()}@example.com`);
  const csv = "name,email,phone,current_company,title\nPreethi S,preethi.s@gmail.com,9876543210,TCS,Software Engineer";
  const resume = [
    "Professional Summary",
    "preethi.s@gmail.com",
    "Technical Skills: Java, React"
  ].join("\n");

  const response = await request(app)
    .post("/api/upload")
    .set("Authorization", `Bearer ${token}`)
    .attach("csvFile", Buffer.from(csv), "candidates.csv")
    .attach("resumeFile", Buffer.from(resume), "resume.txt");

  expect(response.status).toBe(201);
  expect(response.body.canonicalProfile.full_name).toBe("Preethi S");
  expect(response.body.canonicalProfile.backfills).toEqual(expect.arrayContaining([
    expect.objectContaining({ field: "full_name", source: "CSV", reason: "Backfilled from next available source" })
  ]));
  expect(response.body.validation.errors).toEqual(expect.arrayContaining([
    expect.objectContaining({ source: "Resume", code: "INVALID_NAME" })
  ]));
});

test("upload endpoint reports invalid JSON sources without crashing", async () => {
  const token = await createSession(`invalid-json-${Date.now()}@example.com`);

  const response = await request(app)
    .post("/api/upload")
    .set("Authorization", `Bearer ${token}`)
    .field("atsJson", "{bad json");

  expect(response.status).toBe(201);
  expect(response.body.sourceValidation).toEqual(expect.arrayContaining([
    expect.objectContaining({ source: "ATS", status: "invalid_source" })
  ]));
  expect(response.body.validation.errors).toEqual(expect.arrayContaining([
    expect.objectContaining({ source: "ATS", status: "invalid_source" })
  ]));
});

test("demo endpoint processes sample data with premium insights", async () => {
  const token = await createSession(`demo-${Date.now()}@example.com`);

  const response = await request(app)
    .post("/api/demo/process")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(201);
  expect(response.body.canonicalProfile.full_name).toBeTruthy();
  expect(response.body.premium.auditTrail).toHaveLength(15);
  expect(response.body.premium.auditTrail.map((entry) => entry.step)).toEqual(accuracyPipeline);
  expect(response.body.premium.insights.recommended_action).toBeTruthy();
});
