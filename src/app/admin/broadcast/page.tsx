import { createAdminClient } from "@/lib/supabase/admin";
import { BroadcastForm } from "@/components/BroadcastForm";

export default async function BroadcastPage() {
  const s = createAdminClient();

  const { data: plans } = await s.from("plans").select("id, name");

  return (
    <div>
      <p className="eyebrow">Marketing & Updates</p>
      <h1 className="mt-2 text-3xl font-black">Broadcast Email</h1>
      <p className="muted mt-2">
        Send mass emails to your customers safely. Emails are chunked to prevent rate-limiting and timeouts.
      </p>
      
      <div className="mt-8">
        <BroadcastForm plans={plans ?? []} />
      </div>
    </div>
  );
}
