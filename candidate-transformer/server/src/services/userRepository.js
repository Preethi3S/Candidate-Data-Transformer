const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const { isMongoConnected } = require("../config/db");

const userMemoryStore = new Map();

class UserRepository {
  async create({ name, email, passwordHash, passwordSalt }) {
    const normalizedEmail = email.toLowerCase();
    const existing = await this.findByEmail(normalizedEmail);
    if (existing) {
      const error = new Error("Email is already registered");
      error.status = 409;
      throw error;
    }

    const user = {
      user_id: uuidv4(),
      name,
      email: normalizedEmail,
      password_hash: passwordHash,
      password_salt: passwordSalt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isMongoConnected()) {
      await User.create(user);
    }

    userMemoryStore.set(normalizedEmail, user);
    return user;
  }

  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase();
    if (isMongoConnected()) {
      const doc = await User.findOne({ email: normalizedEmail }).lean();
      if (doc) return doc;
    }
    return userMemoryStore.get(normalizedEmail) || null;
  }

  toPublicUser(user) {
    return {
      user_id: user.user_id,
      name: user.name,
      email: user.email
    };
  }
}

module.exports = { UserRepository, userMemoryStore };
