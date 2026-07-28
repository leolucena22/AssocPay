import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthenticatedCoordinator } from "@/lib/auth/auth";
import { success } from "@/lib/api/success";
import { error } from "@/lib/api/error";
import { cache } from "@/lib/cache";
import prisma from "@/lib/prisma";

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_PREFIX = "members:list:";
const CACHE_TTL_SECONDS = 120; // 2 minutes
const MAX_LIMIT = 100;

// ─── Validation schemas ───────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(1, "name is required"),
  type: z.enum(["Regular", "Fee"], { error: "type must be Regular or Fee" }),
  active: z.boolean({ error: "active is required" }),
  institution_id: z.string().uuid("institution_id must be a valid UUID").nullable().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(10),
  name: z.string().optional(),
  type: z.enum(["Regular", "Fee"]).optional(),
  active: z
    .string()
    .transform((v) => {
      if (v === "true") return true;
      if (v === "false") return false;
      return undefined;
    })
    .pipe(z.boolean().optional())
    .optional(),
  institution_id: z.string().uuid().optional(),
});

// ─── POST /api/members ────────────────────────────────────────────────────────

/**
 * POST /api/members
 *
 * Creates a new member.
 * Requires coordinator authentication.
 *
 * Body: { name, type, active, institution_id? }
 * Returns: 201 { id, name, type, active, institution_id, created_at }
 */
export async function POST(request: NextRequest): Promise<Response> {
  const auth = await getAuthenticatedCoordinator(request);
  if (auth instanceof Response) return auth;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return error("Invalid request body", 400);
  }

  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  const { name, type, active, institution_id } = parsed.data;

  try {
    const member = await prisma.member.create({
      data: {
        name: name.trim(),
        type,
        active,
        institutionId: institution_id ?? null,
      },
      select: {
        id: true,
        name: true,
        type: true,
        active: true,
        institutionId: true,
        createdAt: true,
      },
    });

    cache.invalidate(CACHE_PREFIX);

    return success(
      {
        id: member.id,
        name: member.name,
        type: member.type,
        active: member.active,
        institution_id: member.institutionId,
        created_at: member.createdAt,
      },
      201
    );
  } catch {
    return error("Internal server error", 500);
  }
}

// ─── GET /api/members ─────────────────────────────────────────────────────────

/**
 * GET /api/members
 *
 * Lists members with optional pagination and filters.
 * Requires coordinator authentication.
 *
 * Query params:
 *   - page           (default: 1)
 *   - limit          (default: 10, max: 100)
 *   - name           (optional, partial/case-insensitive)
 *   - type           (optional, Regular | Fee)
 *   - active         (optional, true | false)
 *   - institution_id (optional, exact match)
 *
 * Returns: 200 { data: Member[], total, page, limit }
 */
export async function GET(request: NextRequest): Promise<Response> {
  const auth = await getAuthenticatedCoordinator(request);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);

  const parsed = listQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    name: searchParams.get("name") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    active: searchParams.get("active") ?? undefined,
    institution_id: searchParams.get("institution_id") ?? undefined,
  });

  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  const { page, limit, name, type, active, institution_id } = parsed.data;

  const cacheKey = `${CACHE_PREFIX}${page}:${limit}:${name ?? ""}:${type ?? ""}:${active ?? ""}:${institution_id ?? ""}`;

  const cached = cache.get<{ data: unknown[]; total: number; page: number; limit: number }>(cacheKey);
  if (cached) {
    return success(cached);
  }

  try {
    const where = {
      ...(name ? { name: { contains: name, mode: "insensitive" as const } } : {}),
      ...(type ? { type } : {}),
      ...(active !== undefined ? { active } : {}),
      ...(institution_id ? { institutionId: institution_id } : {}),
    };

    const [members, total] = await prisma.$transaction([
      prisma.member.findMany({
        where,
        select: {
          id: true,
          name: true,
          type: true,
          active: true,
          institutionId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.member.count({ where }),
    ]);

    const data = members.map(
      (m: {
        id: string;
        name: string;
        type: string;
        active: boolean;
        institutionId: string | null;
        createdAt: Date;
      }) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        active: m.active,
        institution_id: m.institutionId,
        created_at: m.createdAt,
      })
    );

    const result = { data, total, page, limit };

    cache.set(cacheKey, result, CACHE_TTL_SECONDS);

    return success(result);
  } catch {
    return error("Internal server error", 500);
  }
}
