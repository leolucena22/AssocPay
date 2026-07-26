import type { NextRequest } from "next/server";
import { comparePassword, generateToken } from "@/lib/auth/auth";
import { success } from "@/lib/api/success";
import { error } from "@/lib/api/error";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest): Promise<Response> {
  let body: { password?: unknown };

  try {
    body = await request.json();
  } catch {
    return error("Invalid request body", 400);
  }

  const { password } = body;

  if (typeof password !== "string" || password.trim() === "") {
    return error("Invalid credentials", 400);
  }

  try {
    const coordinator = await prisma.coordinator.findFirst({
      select: { id: true, password: true },
    });

    if (!coordinator) {
      return error("Invalid credentials", 400);
    }

    const valid = await comparePassword(password, coordinator.password);

    if (!valid) {
      return error("Invalid credentials", 400);
    }

    const token = generateToken(coordinator.id);

    return success({ token, coordinatorId: coordinator.id });
  } catch {
    return error("Internal server error", 500);
  }
}