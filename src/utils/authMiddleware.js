import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function authenticate(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return { error: "Unauthorized - No token provided", status: 401 };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      return { error: "Unauthorized - Invalid token", status: 401 };
    }

    return { userId: decoded.id };
  } catch (error) {
    return { error: "Authentication error", status: 500 };
  }
}
