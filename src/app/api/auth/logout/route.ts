import { success } from "@/lib/api/success";

/**
 * POST /api/auth/logout
 *
 * JWT is stateless — invalidation happens client-side by discarding the token.
 * Returns 204 No Content.
 */
export async function POST(): Promise<Response> {
  return success(null, 204);
}
