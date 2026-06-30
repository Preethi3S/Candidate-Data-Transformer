const { CSVParserService } = require("../server/src/parsers/csvParser");
const { ResumeParserService } = require("../server/src/parsers/resumeParser");

test("parses recruiter CSV rows", async () => {
  const csv = "name,email,phone,current_company,title\nJohn Doe,john@gmail.com,9876543210,Google,SDE";
  const result = await new CSVParserService().parse(Buffer.from(csv));
  expect(result.errors).toHaveLength(0);
  expect(result.rows[0]).toMatchObject({ name: "John Doe", email: "john@gmail.com", current_company: "Google" });
});

test("reports invalid CSV columns without throwing", async () => {
  const result = await new CSVParserService().parse(Buffer.from("name,email\nJohn,john@example.com"));
  expect(result.errors[0].message).toContain("Missing required columns");
});

test("extracts deterministic resume facts from text fallback", async () => {
  const resume = [
    "John Doe",
    "john@gmail.com | +91 98765 43210",
    "5 years of experience",
    "Skills: Core Java, ReactJS, NodeJS",
    "Software Engineer at Google Jan 2023 Present",
    "B.Tech from Delhi University 2020"
  ].join("\n");
  const result = await new ResumeParserService().parse(Buffer.from(resume));
  expect(result.name).toBe("John Doe");
  expect(result.email).toBe("john@gmail.com");
  expect(result.skills).toEqual(expect.arrayContaining(["Core Java", "ReactJS", "NodeJS"]));
  expect(result.years).toBe(5);
});

test("detects resume sections before extracting fields", async () => {
  const resume = [
    "PREETHI S",
    "preethi.s@gmail.com | +91 98765 43210",
    "Professional Summary",
    "Software Engineer with Java experience",
    "Technical Skills",
    "Core Java, ReactJS, NodeJS",
    "Experience",
    "Software Engineer at TCS Jan 2024 Present",
    "Education",
    "B.Tech from Anna University 2023"
  ].join("\n");
  const result = await new ResumeParserService().parse(Buffer.from(resume));
  expect(result.name).toBe("PREETHI S");
  expect(Object.keys(result.sections)).toEqual(expect.arrayContaining(["name", "summary", "skills", "experience", "education"]));
  expect(result.skills).toEqual(expect.arrayContaining(["Core Java", "ReactJS", "NodeJS"]));
  expect(result.experience[0]).toMatchObject({ title: "Software Engineer", company: "TCS" });
  expect(result.education[0].degree).toContain("B.Tech");
});

test("does not extract skills from random summary paragraphs", async () => {
  const resume = [
    "John Doe",
    "john@gmail.com",
    "Professional Summary",
    "Software Engineer who has worked with Java and React in production"
  ].join("\n");
  const result = await new ResumeParserService().parse(Buffer.from(resume));
  expect(result.skills).toEqual([]);
});

test("does not extract resume section headers as candidate names", async () => {
  const resume = [
    "Professional Summary",
    "Software Engineer",
    "preethi.s@gmail.com | +91 98765 43210",
    "Skills: Java, React, Node.js",
    "Software Engineer at TCS"
  ].join("\n");
  const result = await new ResumeParserService().parse(Buffer.from(resume));
  expect(result.name).toBeNull();
});

test("extracts name from lines above email and ignores later section headers", async () => {
  const resume = [
    "Preethi S",
    "Bengaluru, India",
    "preethi.s@gmail.com",
    "Professional Summary",
    "Software Engineer",
    "Technical Skills",
    "Java, React"
  ].join("\n");
  const result = await new ResumeParserService().parse(Buffer.from(resume));
  expect(result.name).toBe("Preethi S");
});
