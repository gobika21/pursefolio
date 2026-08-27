import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const body = await request.text();
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/users/me/budgets`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(authorization ? { Authorization: authorization } : {}),
        },
        body,
      },
    );
    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to backend" },
      { status: 502 },
    );
  }
}
