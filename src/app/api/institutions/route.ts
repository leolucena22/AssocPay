import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthenticatedCoordinator } from "@/lib/auth/auth";
import { success } from "@/lib/api/success";
import { error } from "@/lib/api/error";
import { cache } from "@/lib/cache";
import prisma from "@/lib/prisma";

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_PREFIX = "institutions:list:";
const CACHE_TTL_SECONDS = 120; // 2 minutes
const MAX_LIMIT = 100;

// ─── Validation schemas ───────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(1, "name is required"),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(10),
  name: z.string().optional(),
});

// ─── POST /api/institutions ───────────────────────────────────────────────────

/**
 * POST /api/institutions
 *
 * Creates a new institution.
 * Requires coordinator authentication.
 *
 * Body: { name: string }
 * Returns: 201 { id, name, created_at }
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

  const { name } = parsed.data;

  try {
    const institution = await prisma.institution.create({
      data: { name: name.trim() },
      select: { id: true, name: true, createdAt: true },
    });

    cache.invalidate(CACHE_PREFIX);

    return success(
      {
        id: institution.id,
        name: institution.name,
        created_at: institution.createdAt,
      },
      201
    );
  } catch {
    return error("Internal server error", 500);
  }
}

// ─── GET /api/institutions ────────────────────────────────────────────────────

/**
 * GET /api/institutions
 *
 * Lists institutions with optional pagination and name filter.
 * Requires coordinator authentication.
 *
 * Query params:
 *   - page    (default: 1)
 *   - limit   (default: 10, max: 100)
 *   - name    (optional, partial/case-insensitive)
 *
 * Returns: 200 { data: Institution[], total, page, limit }
 */
export async function GET(request: NextRequest): Promise<Response> {
  const auth = await getAuthenticatedCoordinator(request);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);

  const parsed = listQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    name: searchParams.get("name") ?? undefined,
  });

  if (!parsed.success) {
    return error(parsed.error.issues[0].message, 400);
  }

  const { page, limit, name } = parsed.data;
  const cacheKey = `${CACHE_PREFIX}${page}:${limit}:${name ?? ""}`;

  const cached = cache.get<{ data: unknown[]; total: number; page: number; limit: number }>(cacheKey);
  if (cached) {
    return success(cached);
  }

  try {
    const where = name
      ? { name: { contains: name, mode: "insensitive" as const } }
      : {};

    const [institutions, total] = await prisma.$transaction([
      prisma.institution.findMany({
        where,
        select: { id: true, name: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.institution.count({ where }),
    ]);

    const data = institutions.map((i: { id: string; name: string; createdAt: Date }) => ({
      id: i.id,
      name: i.name,
      created_at: i.createdAt,
    }));

    const result = { data, total, page, limit };

    cache.set(cacheKey, result, CACHE_TTL_SECONDS);

    return success(result);
  } catch {
    return error("Internal server error", 500);
  }
}
