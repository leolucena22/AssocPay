/**
 * Returns a standardised success response.
 *
 * @example
 * return success(user);          // 200
 * return success(null, 204);     // 204 No Content
 * return success(data, 201);     // 201 Created
 */
export function success(data: unknown, status = 200): Response {
  const body =
    status === 204
      ? null
      : JSON.stringify({ success: true, data });

  return new Response(body, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
