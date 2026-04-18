/**
 * Next.js API proxy route — forwards detect requests to FastAPI backend.
 * This allows the frontend to call /api/detect directly when deployed.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const res = await fetch(`${BACKEND_URL}/api/detect`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { detail: "Backend connection failed. Ensure FastAPI is running on port 8000." },
      { status: 503 }
    );
  }
}
