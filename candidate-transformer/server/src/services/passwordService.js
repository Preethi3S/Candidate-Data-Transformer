const crypto = require("crypto");

const iterations = 120000;
const keyLength = 64;
const digest = "sha512";

class PasswordService {
  hash(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    return {
      salt,
      hash: crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex")
    };
  }

  verify(password, salt, expectedHash) {
    const actualHash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(actualHash, "hex"), Buffer.from(expectedHash, "hex"));
  }
}

module.exports = { PasswordService };
