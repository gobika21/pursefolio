import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/users/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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
