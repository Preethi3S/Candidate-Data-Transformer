const pdfParse = require("pdf-parse");

const knownSkills = [
  "Core Java", "Java SE", "Java Programming", "Java", "ReactJS", "React", "NodeJS",
  "Node.js", "JavaScript", "MongoDB", "Express", "Python", "SQL", "Docker", "AWS"
];

const nameRejectPatterns = [
  /summary/i,
  /objective/i,
  /profile/i,
  /experience/i,
  /education/i,
  /skills?/i,
  /projects?/i,
  /certifications?/i,
  /achievements?/i,
  /contact/i,
  /engineer/i,
  /developer/i,
  /manager/i,
  /analyst/i,
  /architect/i,
  /consultant/i
];

const sectionDefinitions = [
  ["contact", /^(contact|contact information|personal details)$/i],
  ["summary", /^(professional summary|summary|profile|career objective|objective)$/i],
  ["skills", /^(skills|technical skills|core competencies|technologies)$/i],
  ["experience", /^(work experience|professional experience|experience|employment history)$/i],
  ["projects", /^(projects|academic projects|professional projects)$/i],
  ["education", /^(education|academic background|academics)$/i],
  ["certifications", /^(certifications|certificates)$/i],
  ["achievements", /^(achievements|awards)$/i]
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
    const sections = this.detectSections(lines);

    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null;
    const phone = text.match(/(?:\+?\d[\d\s().-]{8,}\d)/)?.[0] || null;
    const nameResult = this.extractName(lines, email, phone, sections);
    const INVALID_NAMES = [
  "professional summary",
  "summary",
  "profile",
  "objective",
  "skills",
  "technical skills",
  "experience",
  "education",
  "projects",
  "certifications",
  "achievements"
];

let name = nameResult.value;

if (
  name &&
  INVALID_NAMES.includes(
    name.toLowerCase().trim()
  )
) {
  name = null;
}
    const skills = this.extractSkills(sections);
    const education = this.extractEducation(sections.education?.lines || []);
    const experience = this.extractExperience(sections.experience?.lines || []);
    const years = this.extractYearsExperience(text);

    return { text, sections, name, rejectedName: nameResult.rejected, email, phone, skills, education, experience, years };
  }

  detectSections(lines) {
    const sections = { name: { heading: "Name", lines: [] } };
    let current = "name";

    lines.forEach((line) => {
      const inline = this.matchInlineSection(line);
      if (inline) {
        current = inline.section;
        sections[current] = sections[current] || { heading: inline.heading, lines: [] };
        if (inline.content) sections[current].lines.push(inline.content);
        return;
      }

      const section = this.matchSection(line);
      if (section) {
        current = section;
        sections[current] = sections[current] || { heading: line, lines: [] };
        return;
      }
      sections[current] = sections[current] || { heading: current, lines: [] };
      sections[current].lines.push(line);
    });

    return sections;
  }

  matchInlineSection(line) {
    const match = String(line || "").match(/^([A-Za-z ]{3,30})\s*:\s*(.+)$/);
    if (!match) return null;
    const section = this.matchSection(match[1]);
    return section ? { section, heading: match[1].trim(), content: match[2].trim() } : null;
  }

  matchSection(line) {
    const normalized = String(line || "").replace(/[:\-]+$/, "").trim();
    const found = sectionDefinitions.find(([, pattern]) => pattern.test(normalized));
    return found?.[0] || null;
  }

  extractName(lines, email, phone, sections = {}) {
  const INVALID_NAMES = new Set([
    "professional summary",
    "summary",
    "profile",
    "objective",
    "career objective",
    "skills",
    "technical skills",
    "experience",
    "work experience",
    "education",
    "projects",
    "certifications",
    "achievements",
    "contact",
    "contact information"
  ]);

  const emailLineIndex = email
    ? lines.findIndex((line) => line.includes(email))
    : -1;

  const phoneLineIndex = phone
    ? lines.findIndex((line) => line.includes(phone))
    : -1;

  const searchLines = this.nameSearchWindow(
    lines,
    emailLineIndex,
    sections
  );

  const scoredCandidates = searchLines
    .map(({ line, index }) => ({
      line: this.cleanNameLine(line),
      index
    }))
    .filter(({ line }) => {
      const lower = line.toLowerCase().trim();

      return (
        this.isLikelyName(line, email) &&
        !INVALID_NAMES.has(lower)
      );
    })
    .map(({ line, index }) => ({
      line,
      score: this.nameScore(
        line,
        index,
        emailLineIndex,
        phoneLineIndex
      )
    }))
    .sort((a, b) => b.score - a.score);

  const bestName = scoredCandidates[0]?.line || null;

  return {
    value: bestName,
    rejected: null
  };
}

  nameSearchWindow(lines, emailLineIndex, sections = {}) {
    if (emailLineIndex > 0) {
      const start = Math.max(0, emailLineIndex - 5);
      return lines
        .slice(start, emailLineIndex)
        .map((line, offset) => ({ line, index: start + offset }));
    }

    return (sections.name?.lines?.length ? sections.name.lines : lines.slice(0, 5))
      .slice(0, 5)
      .map((line, index) => ({ line, index }));
  }

  rejectedNameCandidate(searchLines) {
    const rejected = searchLines
      .map(({ line }) => this.cleanNameLine(line))
      .find((line) => line && (this.matchSection(line) || nameRejectPatterns.some((pattern) => pattern.test(line))));
    return rejected || null;
  }

  cleanNameLine(line) {
    return String(line || "")
      .replace(/[|,;].*$/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  isLikelyName(line, email) {
    if (!line || line.length > 60) return false;
    if (email && line.includes(email)) return false;
    if (/[0-9@:/\\]/.test(line)) return false;
    if (nameRejectPatterns.some((pattern) => pattern.test(line))) return false;

    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 4) return false;
    return words.every((word) => /^[A-Z][a-zA-Z.'-]*$/.test(word) || /^[A-Z]$/.test(word));
  }

  nameScore(line, index, emailLineIndex, phoneLineIndex = -1) {
    const words = line.split(/\s+/);
    let score = 0;
    if (index < 20) score += 20;
    if (words.every((word) => /^[A-Z][a-zA-Z.'-]*$/.test(word) || /^[A-Z]$/.test(word))) score += 25;
    if (!nameRejectPatterns.some((pattern) => pattern.test(line))) score += 25;
    if (emailLineIndex >= 0 && Math.abs(emailLineIndex - index) <= 3) score += 15;
    if (phoneLineIndex >= 0 && Math.abs(phoneLineIndex - index) <= 3) score += 15;
    if (words.length === 2) score += 8;
    if (words.some((word) => word.length === 1)) score += 2;
    if (line === line.toUpperCase()) score -= 10;
    return score;
  }

  extractSkills(sections) {
    const sectionText = [
      ...(sections.skills?.lines || []),
      ...(sections.projects?.lines || [])
    ].join("\n");
    if (!sectionText) return [];
    const lower = sectionText.toLowerCase();
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
      .filter((line) => /(engineer|developer|manager|analyst|architect|consultant).*(\sat\s|\s-\s)/i.test(line))
      .slice(0, 8)
      .map((line) => {
        const parts = line.split(/\s+(?:at|-)\s+/i);
        return {
          title: parts[0]?.trim() || null,
          company: parts[1]?.replace(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}.*$/i, "").replace(/\b(19|20)\d{2}.*$/, "").trim() || null,
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
