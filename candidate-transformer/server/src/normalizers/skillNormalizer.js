const skillMap = {
  "core java": "Java",
  "java se": "Java",
  "java programming": "Java",
  reactjs: "React",
  react: "React",
  nodejs: "Node.js",
  "node.js": "Node.js",
  node: "Node.js",
  javascript: "JavaScript",
  js: "JavaScript",
  mongodb: "MongoDB",
  mongo: "MongoDB",
  expressjs: "Express.js",
  express: "Express.js",
  python: "Python",
  sql: "SQL",
  docker: "Docker",
  kubernetes: "Kubernetes",
  aws: "AWS"
};

class SkillNormalizer {
  normalize(value) {
    if (!value) return null;
    const key = String(value).trim().toLowerCase();
    return skillMap[key] || key.replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

module.exports = { SkillNormalizer, skillMap };
