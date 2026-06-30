const { z } = require("zod");
const { UserRepository } = require("../services/userRepository");
const { PasswordService } = require("../services/passwordService");
const { TokenService } = require("../services/tokenService");

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const signinSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

const users = new UserRepository();
const passwords = new PasswordService();
const tokens = new TokenService();

function issueSession(user) {
  const publicUser = users.toPublicUser(user);
  return {
    user: publicUser,
    token: tokens.sign({ sub: user.user_id, email: user.email, name: user.name })
  };
}

async function signup(req, res, next) {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

    const password = passwords.hash(parsed.data.password);
    const user = await users.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: password.hash,
      passwordSalt: password.salt
    });

    return res.status(201).json(issueSession(user));
  } catch (error) {
    return next(error);
  }
}

async function signin(req, res, next) {
  try {
    const parsed = signinSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

    const user = await users.findByEmail(parsed.data.email);
    const valid = user && passwords.verify(parsed.data.password, user.password_salt, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    return res.json(issueSession(user));
  } catch (error) {
    return next(error);
  }
}

function me(req, res) {
  return res.json({ user: req.user });
}

function logout(req, res) {
  return res.json({ ok: true });
}

module.exports = { signup, signin, me, logout };
