const crypto = require("crypto");

function base64Url(input) {
  return Buffer.from(input).toString("base64url");
}

class TokenService {
  constructor(secret = process.env.AUTH_SECRET || "candidate-transformer-local-secret") {
    this.secret = secret;
  }

  sign(payload, expiresInSeconds = 60 * 60 * 8) {
    const header = { alg: "HS256", typ: "JWT" };
    const body = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds
    };
    const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(body))}`;
    const signature = crypto.createHmac("sha256", this.secret).update(unsigned).digest("base64url");
    return `${unsigned}.${signature}`;
  }

  verify(token) {
    if (!token) return null;
    const [encodedHeader, encodedBody, signature] = token.split(".");
    if (!encodedHeader || !encodedBody || !signature) return null;

    const unsigned = `${encodedHeader}.${encodedBody}`;
    const expected = crypto.createHmac("sha256", this.secret).update(unsigned).digest("base64url");
    if (signature.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

    const payload = JSON.parse(Buffer.from(encodedBody, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  }
}

module.exports = { TokenService };
