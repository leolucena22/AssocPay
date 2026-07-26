import jwt from "jsonwebtoken";
import type { JwtPayload } from "./types";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";

/**
 * Signs a new JWT for the given coordinator.
 */
export function generateToken(coordinatorId: string): string {
  return jwt.sign({ coordinatorId } satisfies JwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verifies a JWT and returns the decoded payload.
 * Throws a JsonWebTokenError or TokenExpiredError on failure.
 */
export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded === "object" &&
    decoded !== null &&
    "coordinatorId" in decoded &&
    typeof (decoded as JwtPayload).coordinatorId === "string"
  ) {
    return decoded as JwtPayload;
  }

  throw new jwt.JsonWebTokenError("Invalid token payload");
}

/**
 * Extracts the Bearer token from the Authorization header.
 * Returns null if the header is absent or malformed.
 */
export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}
