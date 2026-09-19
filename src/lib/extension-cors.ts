import { NextResponse } from "next/server";

export const EXTENSION_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function corsJson(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: EXTENSION_CORS,
  });
}

export function corsPreflight() {
  return new NextResponse(null, { status: 204, headers: EXTENSION_CORS });
}
