import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthenticatedCoordinator } from "@/lib/auth/auth";
import { success } from "@/lib/api/success";
import { error } from "@/lib/api/error";
import { cache } from "@/lib/cache";
import prisma from "@/lib/prisma";

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_PREFIX = "members:list:";
const CACHE_DETAIL_PREFIX = "members:detail:";
const CACHE_TTL_SECONDS = 120; // 2 minutes

// ─── Validation schemas ───────────────────────────────────────────────────────

const updateSchema = z
  .object({
    name: z.string().min(1, "name must not be empty").optional(),
    type: z.enum(["Regular", "Fee"]).optional(),
    active: z.boolean().optional(),
    institution_id: z
      .string()
      .uuid("institution_id must be a valid UUID")
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at least one field must be provided",
  });

// ─── GET /api/members/[id] ────────────────────────────────────────────────────

/**
 * GET /api/members/:id
 *
 * Returns the detail of a single member.
 * Requires coordinator authentication.
 *
 * Returns: 200 { id, name, type, active, institution_id, created_at }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await getAuthenticatedCoordinator(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  const cacheKey = `${CACHE_DETAIL_PREFIX}${id}`;

  const cached = cache.get<{
    id: string;
    name: string;
    type: string;
    active: boolean;
    institution_id: string | null;
    created_at: Date;
  }>(cacheKey);

  if (cached) {
    return success(cached);
  }

  try {
    const member = await prisma.member.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
        active: true,
        institutionId: true,
        createdAt: true,
      },
    });

    if (!member) {
      return error("Member not found", 404);
    }

    const data = {
      id: member.id,
      name: member.name,
      type: member.type,
      active: member.active,
      institution_id: member.institutionId,
      created_at: member.createdAt,
    };

    cache.set(cacheKey, data, CACHE_TTL_SECONDS);

    return success(data);
  } catch {
    return error("Internal server error", 500);
  }
}

// ─── PATCH /api/members/[id] ──────────────────────────────────────────────────

/**
 * PATCH /api/members/:id
 *
 * Partially updates a member.
 * All fields are optional.
 * Requires coordinator authentication.
 *
 * Body: { name?, type?, active?, institution_id? }
 * Returns: 200 { id, name, type, active, institution_id }
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

  const { name, type, active, institution_id } = parsed.data;

  try {
    const member = await prisma.member.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(active !== undefined ? { active } : {}),
        ...(institution_id !== undefined ? { institutionId: institution_id } : {}),
      },
      select: {
        id: true,
        name: true,
        type: true,
        active: true,
        institutionId: true,
      },
    });

    cache.invalidate(CACHE_PREFIX);
    cache.invalidate(CACHE_DETAIL_PREFIX);

    return success({
      id: member.id,
      name: member.name,
      type: member.type,
      active: member.active,
      institution_id: member.institutionId,
    });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return error("Member not found", 404);
    }

    return error("Internal server error", 500);
  }
}

// ─── DELETE /api/members/[id] ─────────────────────────────────────────────────

/**
 * DELETE /api/members/:id
 *
 * Removes a member.
 * Payments are cascade-deleted via onDelete: Cascade in the Prisma schema.
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
    await prisma.member.delete({ where: { id } });

    cache.invalidate(CACHE_PREFIX);
    cache.invalidate(CACHE_DETAIL_PREFIX);

    return success(null, 204);
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return error("Member not found", 404);
    }

    return error("Internal server error", 500);
  }
}
