/**
 * Returns a standardised error response.
 *
 * @example
 * return error("Invalid credentials", 400);
 * return error("Unauthorized", 401);
 * return error("Forbidden", 403);
 * return error("Coordinator not found", 404);
 * return error("Internal server error", 500);
 */
export function error(message: string, status: number): Response {
  return new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
