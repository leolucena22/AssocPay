import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthenticatedCoordinator } from "@/lib/auth/auth";
import { success } from "@/lib/api/success";
import { error } from "@/lib/api/error";
import { cache } from "@/lib/cache";
import prisma from "@/lib/prisma";

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_PREFIX = "institutions:list:";

// ─── Validation schemas ───────────────────────────────────────────────────────

const updateSchema = z.object({
  name: z.string().min(1, "name is required"),
});

// ─── GET /api/institutions/[id] ───────────────────────────────────────────────

/**
 * GET /api/institutions/:id
 *
 * Returns the detail of a single institution.
 * Requires coordinator authentication.
 *
 * Returns: 200 { id, name, created_at }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await getAuthenticatedCoordinator(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    const institution = await prisma.institution.findUnique({
      where: { id },
      select: { id: true, name: true, createdAt: true },
    });

    if (!institution) {
      return error("Institution not found", 404);
    }

    return success({
      id: institution.id,
      name: institution.name,
      created_at: institution.createdAt,
    });
  } catch {
    return error("Internal server error", 500);
  }
}

// ─── PATCH /api/institutions/[id] ─────────────────────────────────────────────

/**
 * PATCH /api/institutions/:id
 *
 * Updates the name of an institution.
 * Requires coordinator authentication.
 *
 * Body: { name: string }
 * Returns: 200 { id, name }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await getAuthenticatedCoordinator(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return error("Invalid request body", 400);
  }

  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  const { name } = parsed.data;

  try {
    const institution = await prisma.institution.update({
      where: { id },
      data: { name: name.trim() },
      select: { id: true, name: true },
    });

    cache.invalidate(CACHE_PREFIX);

    return success({ id: institution.id, name: institution.name });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return error("Institution not found", 404);
    }

    return error("Internal server error", 500);
  }
}

// ─── DELETE /api/institutions/[id] ────────────────────────────────────────────

/**
 * DELETE /api/institutions/:id
 *
 * Removes an institution.
 * Members linked to it are unlinked (institutionId = null) via onDelete: SetNull
 * in the Prisma schema — they are never deleted.
 * Requires coordinator authentication.
 *
 * Returns: 204 No Content
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await getAuthenticatedCoordinator(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    await prisma.institution.delete({ where: { id } });

    cache.invalidate(CACHE_PREFIX);

    return success(null, 204);
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return error("Institution not found", 404);
    }

    return error("Internal server error", 500);
  }
}
