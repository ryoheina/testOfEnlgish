import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { verifyPassword, createToken } from "@/lib/auth";
import { ensureDatabaseReady } from "@/lib/db-bootstrap";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request) || "unknown";
  const limit = rateLimit(`admin-login:${ip}`, 5, 900000);

  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: getRateLimitHeaders(limit) }
    );
  }

  try {
    await ensureDatabaseReady();

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = await createToken({
      id: admin.id,
      username: admin.username,
      name: admin.name,
    });

    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, username: admin.username, name: admin.name },
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 28800,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
