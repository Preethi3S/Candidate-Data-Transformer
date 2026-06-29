const request = require("supertest");
const app = require("../server/src/app");

test("health endpoint responds", async () => {
  const response = await request(app).get("/health");
  expect(response.status).toBe(200);
  expect(response.body.ok).toBe(true);
});

test("upload endpoint processes CSV and text resume fallback", async () => {
  const csv = "name,email,phone,current_company,title\nJohn Doe,john@gmail.com,9876543210,Google,SDE";
  const resume = "John Doe\njohn@gmail.com\nSkills: Core Java, ReactJS\nSoftware Engineer at Google Jan 2023 Present";

  const response = await request(app)
    .post("/api/upload")
    .attach("csvFile", Buffer.from(csv), "candidates.csv")
    .attach("resumeFile", Buffer.from(resume), "resume.txt");

  expect(response.status).toBe(201);
  expect(response.body.canonicalProfile.full_name).toBe("John Doe");
  expect(response.body.projectedProfile.candidate_name).toBe("John Doe");
});
