import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { AuthResponse, AuthUser } from "../types";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-secret-change-me";
const JWT_EXPIRES_IN = "7d";

export class AuthError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
    this.name = "AuthError";
  }
}

function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as AuthUser["role"],
    phone: user.phone,
  };
}

function issueToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Registers a new customer account. Admin accounts are seeded directly
 * (see prisma/seed.ts) rather than self-registered, to avoid an open
 * "become an admin" endpoint.
 */
export async function registerCustomer(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthError("An account with this email already exists.", 409);
  }
  if (input.password.length < 8) {
    throw new AuthError("Password must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase().trim(),
      passwordHash,
      phone: input.phone,
      role: "CUSTOMER",
    },
  });

  return { token: issueToken(user.id, user.role), user: toAuthUser(user) };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    throw new AuthError("Invalid email or password.", 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AuthError("Invalid email or password.", 401);
  }

  return { token: issueToken(user.id, user.role), user: toAuthUser(user) };
}

export interface JwtPayload {
  sub: string;
  role: string;
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    throw new AuthError("Invalid or expired session. Please log in again.", 401);
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toAuthUser(user) : null;
}

/**
 * Returns the order history for a logged-in customer.
 */
export async function getCustomerOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { title: true } } } } },
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    createdAt: o.createdAt,
    items: o.items.map((i) => ({ title: i.product.title, quantity: i.quantity })),
  }));
}
