"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function NewExtensionForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    latestVersion: "1.0.0",
    filePath: "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/admin/extensions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) return setMsg(json.error);
    setMsg("Product published successfully.");
    setForm({
      name: "",
      slug: "",
      description: "",
      latestVersion: "1.0.0",
      filePath: "",
    });
    router.refresh();
  }
  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value });
  return (
    <form onSubmit={submit} className="card p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="label">Product name</span>
          <input
            className="input"
            value={form.name}
            onChange={set("name")}
            placeholder="CompX Asset Library"
            required
          />
        </label>
        <label>
          <span className="label">URL slug</span>
          <input
            className="input"
            value={form.slug}
            onChange={set("slug")}
            placeholder="compx-asset-library"
            required
          />
        </label>
        <label>
          <span className="label">Latest version</span>
          <input
            className="input"
            value={form.latestVersion}
            onChange={set("latestVersion")}
          />
        </label>
        <label>
          <span className="label">Storage file path</span>
          <input
            className="input"
            value={form.filePath}
            onChange={set("filePath")}
            placeholder="compx/v1.0.0.zip"
          />
        </label>
        <label className="md:col-span-2">
          <span className="label">Description</span>
          <textarea
            className="input min-h-24 py-3"
            value={form.description}
            onChange={set("description")}
            placeholder="Describe what this extension does…"
          />
        </label>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="muted text-xs">
          Upload the ZIP to the private extensions bucket first.
        </p>
        <button className="btn-primary">Publish extension</button>
      </div>
      {msg && <p className="mt-4 text-sm text-[#8ff0a9]">{msg}</p>}
    </form>
  );
}
