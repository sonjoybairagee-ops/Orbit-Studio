export default function Loading() {
  return (
    <div className="shell grid min-h-[60vh] place-items-center py-16">
      <div className="flex items-center gap-3">
        <span className="live-dot" />
        <span className="muted text-sm font-semibold">Loading…</span>
      </div>
    </div>
  );
}
