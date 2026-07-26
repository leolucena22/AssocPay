import type { NextRequest } from "next/server";
import { getAuthenticatedCoordinator } from "@/lib/auth/auth";
import { success } from "@/lib/api/success";

/**
 * GET /api/auth/me
 *
 * Returns the authenticated coordinator's public data (id + createdAt).
 * Password is never returned.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const result = await getAuthenticatedCoordinator(request);

  if (result instanceof Response) return result;

  return success(result);
}
