/** Shape of the JWT payload issued on login. */
export interface JwtPayload {
  coordinatorId: string;
}

/** Safe public representation of a Coordinator (password excluded). */
export interface CoordinatorPublic {
  id: string;
  createdAt: Date;
}
