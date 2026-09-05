import { NextResponse } from "next/server";
import { GET as checkGet, POST as checkPost, OPTIONS as checkOptions } from "../update-check/route";

export const dynamic = "force-dynamic";

export const GET = checkGet;
export const POST = checkPost;
export const OPTIONS = checkOptions;
