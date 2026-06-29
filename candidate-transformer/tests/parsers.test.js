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
