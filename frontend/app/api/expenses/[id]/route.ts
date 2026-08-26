import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

async function proxy(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = request.method === "DELETE" ? undefined : await request.text();
    const authorization = request.headers.get("authorization");
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/expenses/${id}`,
      {
        method: request.method,
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(authorization ? { Authorization: authorization } : {}),
        },
        body,
      },
    );
    const result = response.status === 204 ? null : await response.json();

    return result === null
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to backend" },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const PUT = proxy;
export const DELETE = proxy;
