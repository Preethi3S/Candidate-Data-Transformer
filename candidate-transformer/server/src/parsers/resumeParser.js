const pdfParse = require("pdf-parse");

const knownSkills = [
  "Core Java", "Java SE", "Java Programming", "Java", "ReactJS", "React", "NodeJS",
  "Node.js", "JavaScript", "MongoDB", "Express", "Python", "SQL", "Docker", "AWS"
];

class ResumeParserService {
  async extractText(buffer) {
    if (!buffer || buffer.length === 0) return "";
    try {
      const parsed = await pdfParse(buffer);
      return parsed.text || "";
    } catch (error) {
      const fallback = buffer.toString("utf8");
      if (/[a-zA-Z0-9@]/.test(fallback)) return fallback;
      throw new Error(`Unable to parse resume PDF: ${error.message}`);
    }
  }

  async parse(buffer) {
    const text = await this.extractText(buffer);
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null;
    const phone = text.match(/(?:\+?\d[\d\s().-]{8,}\d)/)?.[0] || null;
    const name = this.extractName(lines, email);
    const skills = this.extractSkills(text);
    const education = this.extractEducation(lines);
    const experience = this.extractExperience(lines);
    const years = this.extractYearsExperience(text);

    return { text, name, email, phone, skills, education, experience, years };
  }

  extractName(lines, email) {
    const candidate = lines.find((line) => {
      if (email && line.includes(email)) return false;
      return /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/.test(line);
    });
    return candidate || null;
  }

  extractSkills(text) {
    const lower = text.toLowerCase();
    return knownSkills.filter((skill) => lower.includes(skill.toLowerCase()));
  }

  extractEducation(lines) {
    return lines
      .filter((line) => /(university|college|institute|b\.?tech|m\.?tech|bachelor|master|degree)/i.test(line))
      .slice(0, 5)
      .map((line) => ({
        institution: line.match(/(?:at|from)\s+(.+)$/i)?.[1] || line,
        degree: line.match(/(b\.?tech|m\.?tech|bachelor[^,]*|master[^,]*|degree[^,]*)/i)?.[0] || null,
        graduation_year: line.match(/\b(19|20)\d{2}\b/)?.[0] || null
      }));
  }

  extractExperience(lines) {
    return lines
      .filter((line) => /(engineer|developer|manager|analyst|architect|consultant).+( at | - )/i.test(line))
      .slice(0, 8)
      .map((line) => {
        const parts = line.split(/\s+(?:at|-)\s+/i);
        return {
          title: parts[0]?.trim() || null,
          company: parts[1]?.replace(/\b(19|20)\d{2}.*$/, "").trim() || null,
          start_date: line.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}\b/i)?.[0] || null,
          end_date: line.match(/\b(?:present|current|\d{4}-\d{2})\b/i)?.[0] || null
        };
      });
  }

  extractYearsExperience(text) {
    const match = text.match(/(\d{1,2})\+?\s+years?\s+(?:of\s+)?experience/i);
    return match ? Number(match[1]) : null;
  }
}

module.exports = { ResumeParserService, knownSkills };
