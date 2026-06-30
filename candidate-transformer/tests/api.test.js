const request = require("supertest");
const app = require("../server/src/app");

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
  expect(response.body.projectedProfile.candidate_name).toBe("John Doe");
});
