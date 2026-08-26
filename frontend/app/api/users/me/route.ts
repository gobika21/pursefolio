import { NextResponse } from "next/server";

async function proxy(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const body = request.method === "GET" ? undefined : await request.text();
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/users/me`, {
      method: request.method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body,
    });
    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to backend" },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const PATCH = proxy;
