import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { acceptWorkspaceInvitation } from "@/lib/agency/team-service";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to accept the invitation." }, { status: 401 });
    }

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Invitation token is required." }, { status: 400 });
    }

    const result = await acceptWorkspaceInvitation({
      token,
      userId: user.id,
      userEmail: user.email,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to accept invitation" }, { status: 400 });
  }
}
