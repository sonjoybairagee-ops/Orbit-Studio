import { createAdminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";
import { getNewLicenseEmailHtml } from "@/lib/emails/licenseTemplates";

export interface OrbitFlowClaim {
  id: string;
  full_name: string;
  email: string;
  social_share_url?: string | null;
  status: "pending" | "approved" | "rejected";
  license_key?: string | null;
  license_id?: string | null;
  notes?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  approved_at?: string | null;
  updated_at?: string;
}

export const ORBIT_FLOW_PLAN_ID = "868e1562-6284-4300-840b-6d9ddb0090d6";

export function generateCXKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 4 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
  return `CX-${part()}-${part()}-${part()}-${part()}`;
}

async function getDefaultAdminId(adminClient: any): Promise<string> {
  const { data } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();
  return data?.id || "59defdd5-24d0-45ea-8335-3ba9fc1120a6";
}

/**
 * Save a new Orbit Flow claim or return existing status
 */
export async function saveOrbitFlowClaim(entry: {
  fullName: string;
  email: string;
  socialShareUrl?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{
  ok: boolean;
  claimId?: string;
  alreadyApproved?: boolean;
  alreadyPending?: boolean;
  error?: string;
}> {
  const adminClient = createAdminClient();
  const normalizedEmail = entry.email.trim().toLowerCase();
  const fullName = entry.fullName.trim();

  const payload = {
    full_name: fullName,
    email: normalizedEmail,
    social_share_url: entry.socialShareUrl?.trim() || null,
    status: "pending" as const,
    ip_address: entry.ipAddress || null,
    user_agent: entry.userAgent || null,
    updated_at: new Date().toISOString(),
  };

  try {
    // 1. Try orbit_flow_claims table
    const { data: existing, error: selectErr } = await adminClient
      .from("orbit_flow_claims")
      .select("id, status, license_key")
      .ilike("email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (!selectErr) {
      if (existing?.id) {
        if (existing.status === "approved") {
          return {
            ok: false,
            alreadyApproved: true,
            claimId: existing.id,
            error: "An Orbit Flow license has already been approved for this email! Sign in to your dashboard to view and copy your license key.",
          };
        }
        if (existing.status === "pending") {
          return {
            ok: true,
            alreadyPending: true,
            claimId: existing.id,
          };
        }
        // If rejected, update to pending to allow re-evaluation
        const { error: updateErr } = await adminClient
          .from("orbit_flow_claims")
          .update(payload)
          .eq("id", existing.id);

        if (!updateErr) return { ok: true, claimId: existing.id };
        return { ok: false, error: updateErr.message };
      }

      // Insert new claim
      const { data: inserted, error: insertErr } = await adminClient
        .from("orbit_flow_claims")
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (!insertErr && inserted?.id) {
        return { ok: true, claimId: inserted.id };
      }
      return { ok: false, error: insertErr?.message || "Failed to record claim" };
    }

    // 2. Fallback to admin_logs if table does not exist
    if (
      selectErr &&
      (selectErr.code === "42P01" ||
        selectErr.message?.includes("schema cache") ||
        selectErr.message?.includes("relation"))
    ) {
      // Check if entry already exists in admin_logs
      const { data: existingLogs } = await adminClient
        .from("admin_logs")
        .select("id, details")
        .eq("action", "orbit_flow_claim")
        .eq("target_id", normalizedEmail)
        .limit(1);

      if (existingLogs && existingLogs.length > 0) {
        const details = existingLogs[0].details || {};
        if (details.status === "approved") {
          return {
            ok: false,
            alreadyApproved: true,
            claimId: details.id || existingLogs[0].id,
            error: "An Orbit Flow license has already been approved for this email! Sign in to your dashboard to view and copy your license key.",
          };
        }
        if (details.status === "pending") {
          return {
            ok: true,
            alreadyPending: true,
            claimId: details.id || existingLogs[0].id,
          };
        }

        // Update rejected back to pending
        const adminId = await getDefaultAdminId(adminClient);
        await adminClient
          .from("admin_logs")
          .update({
            details: {
              ...details,
              ...payload,
            },
          })
          .eq("id", existingLogs[0].id);

        return { ok: true, claimId: details.id || existingLogs[0].id };
      }

      // Insert new fallback record in admin_logs
      const adminId = await getDefaultAdminId(adminClient);
      const fallbackId = `of_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const logPayload = {
        admin_id: adminId,
        action: "orbit_flow_claim",
        target_id: normalizedEmail,
        details: {
          id: fallbackId,
          ...payload,
          created_at: new Date().toISOString(),
        },
      };

      const { error: logErr } = await adminClient.from("admin_logs").insert(logPayload);
      if (logErr) {
        console.error("[ORBIT-FLOW-CLAIM] Fallback insert failed:", logErr);
        return { ok: false, error: logErr.message };
      }
      return { ok: true, claimId: fallbackId };
    }

    return { ok: false, error: selectErr?.message || "Failed to query claims" };
  } catch (err: any) {
    console.error("[ORBIT-FLOW-CLAIM] Error saving claim:", err);
    return { ok: false, error: err?.message || "Unexpected error while saving claim" };
  }
}

/**
 * Retrieve all Orbit Flow claims
 */
export async function getAllOrbitFlowClaims(): Promise<OrbitFlowClaim[]> {
  const adminClient = createAdminClient();

  try {
    // 1. Try reading from orbit_flow_claims table
    const { data: claims, error } = await adminClient
      .from("orbit_flow_claims")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && claims) {
      return claims.map((c: any) => ({
        id: c.id,
        full_name: c.full_name || "Community Member",
        email: (c.email || "").toLowerCase(),
        social_share_url: c.social_share_url || null,
        status: c.status || "pending",
        license_key: c.license_key || null,
        license_id: c.license_id || null,
        notes: c.notes || null,
        ip_address: c.ip_address || null,
        user_agent: c.user_agent || null,
        approved_at: c.approved_at || null,
        created_at: c.created_at,
        updated_at: c.updated_at,
      }));
    }

    // 2. Fallback to admin_logs
    const { data: logs, error: logsErr } = await adminClient
      .from("admin_logs")
      .select("id, details, created_at, target_id")
      .eq("action", "orbit_flow_claim")
      .order("created_at", { ascending: false });

    if (logsErr || !logs) {
      console.error("[ORBIT-FLOW-CLAIM] Failed to read admin_logs fallback:", logsErr);
      return [];
    }

    const emailMap = new Map<string, OrbitFlowClaim>();
    for (const log of logs) {
      const details = log.details || {};
      const email = (details.email || log.target_id || "").toLowerCase();
      if (!email || emailMap.has(email)) continue;

      emailMap.set(email, {
        id: details.id || log.id,
        full_name: details.full_name || "Community Member",
        email,
        social_share_url: details.social_share_url || null,
        status: details.status || "pending",
        license_key: details.license_key || null,
        license_id: details.license_id || null,
        notes: details.notes || null,
        ip_address: details.ip_address || null,
        user_agent: details.user_agent || null,
        approved_at: details.approved_at || null,
        created_at: details.created_at || log.created_at,
        updated_at: details.updated_at || log.created_at,
      });
    }

    return Array.from(emailMap.values());
  } catch (err) {
    console.error("[ORBIT-FLOW-CLAIM] Error fetching claims:", err);
    return [];
  }
}

/**
 * Approve an Orbit Flow claim and issue an active license
 */
export async function approveOrbitFlowClaim(
  id: string,
  email: string,
  adminUser?: { id: string; email?: string | null } | null
): Promise<{ ok: boolean; licenseKey?: string; error?: string }> {
  const adminClient = createAdminClient();
  const normalizedEmail = (email || "").trim().toLowerCase();

  try {
    // 1. Resolve Plan for Orbit Flow
    const { data: planRecord } = await adminClient
      .from("plans")
      .select("id, name, max_devices")
      .eq("slug", "orbit-flow")
      .maybeSingle();

    const planId = planRecord?.id || ORBIT_FLOW_PLAN_ID;
    const maxDevices = planRecord?.max_devices ?? 1;

    // 2. Check if a profile exists for this email
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    // 3. Check if user already has an active license for orbit-flow
    let targetKey: string | null = null;
    let targetLicenseId: string | null = null;

    const { data: existingLic } = await adminClient
      .from("licenses")
      .select("id, key")
      .eq("plan_id", planId)
      .ilike("legacy_email", normalizedEmail)
      .eq("status", "active")
      .maybeSingle();

    if (existingLic?.key) {
      targetKey = existingLic.key;
      targetLicenseId = existingLic.id;
      // If profile exists now but user_id was null, bind it
      if (profile?.id) {
        await adminClient
          .from("licenses")
          .update({ user_id: profile.id })
          .eq("id", existingLic.id);
      }
    } else {
      // 4. Generate new CX Key and insert into licenses
      targetKey = generateCXKey();
      const { data: newLic, error: licErr } = await adminClient
        .from("licenses")
        .insert({
          user_id: profile?.id ?? null,
          plan_id: planId,
          key: targetKey,
          status: "active",
          license_type: "nfr",
          max_devices: maxDevices,
          grace_days: 7,
          legacy_email: normalizedEmail,
          notes: "orbit-flow-claim",
        })
        .select("id, key")
        .single();

      if (licErr || !newLic) {
        console.error("[ORBIT-FLOW-CLAIM] Failed to issue license:", licErr);
        return { ok: false, error: licErr?.message || "Failed to generate license record" };
      }
      targetLicenseId = newLic.id;
    }

    if (!targetKey) {
      return { ok: false, error: "Failed to generate or retrieve license key" };
    }

    const approvedAt = new Date().toISOString();

    // 5. Update claim record in orbit_flow_claims
    const { error: updateClaimErr } = await adminClient
      .from("orbit_flow_claims")
      .update({
        status: "approved",
        license_key: targetKey,
        license_id: targetLicenseId,
        approved_at: approvedAt,
        updated_at: approvedAt,
      })
      .ilike("email", normalizedEmail);

    // Also update fallback in admin_logs if present
    const { data: logs } = await adminClient
      .from("admin_logs")
      .select("id, details")
      .eq("action", "orbit_flow_claim")
      .eq("target_id", normalizedEmail)
      .limit(1);

    if (logs && logs.length > 0) {
      const mergedDetails = {
        ...(logs[0].details || {}),
        status: "approved",
        license_key: targetKey,
        license_id: targetLicenseId,
        approved_at: approvedAt,
        updated_at: approvedAt,
      };
      await adminClient
        .from("admin_logs")
        .update({ details: mergedDetails })
        .eq("id", logs[0].id);
    }

    // 6. Send approval email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const fromEmail = process.env.EMAIL_FROM || "CompX Orbit <hello@compxorbit.com>";
        const html = getNewLicenseEmailHtml({
          customerName: normalizedEmail.split("@")[0],
          extensionName: "Orbit Flow (v2.5.0)",
          licenseKey: targetKey,
          maxDevices: maxDevices,
        });

        await resend.emails.send({
          from: fromEmail,
          to: [normalizedEmail],
          subject: "⚡ Your Orbit Flow License Has Been Approved! — CompX Orbit",
          html,
        });
      } catch (emailErr) {
        console.error("[ORBIT-FLOW-CLAIM] Failed to send approval email:", emailErr);
      }
    }

    return { ok: true, licenseKey: targetKey };
  } catch (err: any) {
    console.error("[ORBIT-FLOW-CLAIM] Error approving claim:", err);
    return { ok: false, error: err?.message || "Failed to approve claim" };
  }
}

/**
 * Reject an Orbit Flow claim
 */
export async function rejectOrbitFlowClaim(
  id: string,
  email: string,
  notes?: string
): Promise<{ ok: boolean; error?: string }> {
  const adminClient = createAdminClient();
  const normalizedEmail = (email || "").trim().toLowerCase();
  const updatedAt = new Date().toISOString();

  try {
    // 1. Try orbit_flow_claims
    const { error: updateErr } = await adminClient
      .from("orbit_flow_claims")
      .update({
        status: "rejected",
        notes: notes || null,
        updated_at: updatedAt,
      })
      .ilike("email", normalizedEmail);

    // 2. Also update admin_logs fallback
    const { data: logs } = await adminClient
      .from("admin_logs")
      .select("id, details")
      .eq("action", "orbit_flow_claim")
      .eq("target_id", normalizedEmail)
      .limit(1);

    if (logs && logs.length > 0) {
      const mergedDetails = {
        ...(logs[0].details || {}),
        status: "rejected",
        notes: notes || null,
        updated_at: updatedAt,
      };
      await adminClient
        .from("admin_logs")
        .update({ details: mergedDetails })
        .eq("id", logs[0].id);
    }

    return { ok: true };
  } catch (err: any) {
    console.error("[ORBIT-FLOW-CLAIM] Error rejecting claim:", err);
    return { ok: false, error: err?.message || "Failed to reject claim" };
  }
}
