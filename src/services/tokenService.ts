import jwt from "jsonwebtoken";
import { env } from "../env";

export function signAccessToken(userId: string) {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN,
  });
}
