import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/index.js";
import User from "../models/User.js";

/**
 * Issue JWT for authenticated user
 */
export function issueUserToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email || null,
      walletAddress: user.walletAddress || null,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Email + password login
 */
export async function loginWithEmailPassword({ email, password, role }) {
  if (!email || !password || !role) {
    const err = new Error("email, password and role required");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findOne({
    email: String(email).toLowerCase().trim(),
    role,
  }).exec();

  if (!user || !user.isActive) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  if (!user.passwordHash) {
    const err = new Error("Password login not enabled for this account");
    err.statusCode = 403;
    throw err;
  }

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  if (!user.verified) {
    const err = new Error("Account not verified");
    err.statusCode = 403;
    throw err;
  }

  return {
    user,
    token: issueUserToken(user),
  };
}

/**
 * Seed demo users (idempotent)
 * Intended for local / demo / hackathon environments
 */
export async function seedDemoUsers() {
  const demos = [
    { name: "Citizen Demo", email: "citizen@demo.com", password: "demo1234", role: "citizen" },
    { name: "Registrar Demo", email: "registrar@demo.com", password: "demo1234", role: "registrar" },
    { name: "Court Demo", email: "court@demo.com", password: "demo1234", role: "court" },
    { name: "Admin Demo", email: "admin@demo.com", password: "demo1234", role: "admin" },
  ];

  const results = [];

  for (const d of demos) {
    const email = d.email.toLowerCase().trim();

    const existing = await User.findOne({
      email,
      role: d.role,
    }).exec();

    if (existing) {
      results.push({
        email: existing.email,
        role: existing.role,
        created: false,
      });
      continue;
    }

    const passwordHash = await bcrypt.hash(d.password, 10);

    const user = await User.create({
      name: d.name,
      email,
      role: d.role,
      passwordHash,
      verified: true,   // demo users are pre-verified
      isActive: true,
    });

    results.push({
      email: user.email,
      role: user.role,
      created: true,
    });
  }

  return {
    ok: true,
    users: results,
  };
}
