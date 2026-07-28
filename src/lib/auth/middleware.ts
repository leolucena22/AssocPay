import { error } from "@/lib/api/error";
import { getTokenFromRequest, verifyToken } from "./jwt";
import prisma from "@/lib/prisma";
import type { CoordinatorPublic } from "./types";

/**
 * Authenticates the incoming request by:
 * 1. Extracting the Bearer token from the Authorization header.
 * 2. Verifying the JWT signature and expiry.
 * 3. Looking up the coordinator in the database.
 *
 * Returns the authenticated coordinator on success, or a Response on failure.
 *
 * Usage in any protected route:
 * ```ts
 * const result = await getAuthenticatedCoordinator(request);
 * if (result instanceof Response) return result;
 * // result is now CoordinatorPublic
 * ```
 */
export async function getAuthenticatedCoordinator(
  request: Request
): Promise<CoordinatorPublic | Response> {
  const token = getTokenFromRequest(request);

  if (!token) {
    return error("Unauthorized", 401);
  }

  let coordinatorId: string;

  try {
    const payload = verifyToken(token);
    coordinatorId = payload.coordinatorId;
  } catch {
    return error("Unauthorized", 401);
  }

  try {
    const coordinator = await prisma.coordinator.findUnique({
      where: { id: coordinatorId },
      select: { id: true, createdAt: true },
    });

    if (!coordinator) {
      return error("Coordinator not found", 404);
    }

    return coordinator;
  } catch {
    return error("Internal server error", 500);
  }
}
