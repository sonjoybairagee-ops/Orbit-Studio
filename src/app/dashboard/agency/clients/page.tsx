"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Building,
  Mail,
  Phone,
  FolderKanban,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { AgencyClient } from "@/types/agency";

export default function AgencyClientsPage() {
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // New Client Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
    status: "active",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/agency/clients");
      const data = await res.json();
      if (res.ok && data.clients) {
        setClients(data.clients);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/agency/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create client.");
      }

      setClients([data.client, ...clients]);
      setIsModalOpen(false);
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        notes: "",
        status: "active",
      });
    } catch (err: any) {
      setError(err.message || "Failed to add client.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyPortalLink(client: AgencyClient) {
    const portalUrl = `${window.location.origin}/portal/${client.portal_token}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(""), 2000);
  }

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#e7eee9] flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#3cff5f]" />
            <span>Client Management CRM</span>
          </h1>
          <p className="text-xs text-[#8da194] mt-0.5">
            Track client details, associated video projects, and generate private client portal review links.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-4 py-2.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#62776a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, company, or email..."
            className="w-full rounded-xl border border-[#213026] bg-[#080e0b] pl-10 pr-3 py-2 text-xs text-[#e7eee9] placeholder-[#62776a] focus:border-[#3cff5f] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["all", "active", "lead", "paused", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? "bg-[#3cff5f] text-[#050a08]"
                  : "text-[#8da194] hover:text-[#e7eee9] hover:bg-[#102a16]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-[#3cff5f] animate-spin mb-3" />
          <p className="text-xs text-[#8da194]">Loading workspace clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#213026] bg-[#0c1510]/50 p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] text-xl">
            👥
          </div>
          <h3 className="mt-3 text-sm font-bold text-[#e7eee9]">
            {searchQuery ? "No matching clients found" : "No clients added yet"}
          </h3>
          <p className="text-xs text-[#8da194] max-w-sm mx-auto mt-1">
            {searchQuery
              ? "Try adjusting your search query or status filter."
              : "Add your first client to associate them with video projects and share private review links."}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] px-4 py-2 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Client</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="rounded-2xl border border-[#213026] bg-[#0c1510] p-5 shadow-lg hover:border-[#3cff5f]/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#102a16] border border-[#2a5234] flex items-center justify-center text-[#3cff5f] font-black text-sm shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#e7eee9] leading-snug">
                        {client.name}
                      </h3>
                      {client.company && (
                        <p className="text-xs text-[#8da194] flex items-center gap-1 mt-0.5">
                          <Building className="h-3 w-3 text-[#62776a]" />
                          <span>{client.company}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      client.status === "active"
                        ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                        : "bg-[#1b202b] text-[#8da194] border border-[#213026]"
                    }`}
                  >
                    {client.status}
                  </span>
                </div>

                {/* Contact info list */}
                <div className="mt-4 space-y-1.5 text-xs text-[#8da194]">
                  {client.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-[#62776a] shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[#62776a] shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-3.5 w-3.5 text-[#62776a] shrink-0" />
                    <span className="text-[#e7eee9] font-medium">
                      {client.project_count || 0} Projects Assigned
                    </span>
                  </div>
                </div>

                {client.notes && (
                  <p className="mt-3 text-[11px] text-[#62776a] bg-[#080e0b] p-2 rounded-lg border border-[#1b2720] line-clamp-2">
                    {client.notes}
                  </p>
                )}
              </div>

              {/* Bottom Actions: Copy Portal Link & View */}
              <div className="pt-3 border-t border-[#1b2720] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => copyPortalLink(client)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#213026] bg-[#080e0b] hover:border-[#3cff5f]/50 text-xs font-semibold text-[#8da194] hover:text-[#3cff5f] transition-all cursor-pointer"
                  title="Copy client's private review portal URL"
                >
                  {copiedId === client.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#3cff5f]" />
                      <span className="text-[#3cff5f]">Portal Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Client Portal</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] text-[#62776a] font-mono">
                  Added {new Date(client.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-[#8da194] hover:text-[#e7eee9] p-1.5 rounded-lg hover:bg-[#102a16] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-black text-[#e7eee9] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#3cff5f]" />
              <span>Add New Client Profile</span>
            </h2>
            <p className="text-xs text-[#8da194] mt-1 mb-4">
              Enter client credentials to manage video projects and generate their review portal.
            </p>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#8da194] mb-1">
                  Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe, Sarah Jenkins"
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8da194] mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Acme Media Corp, RedBull UK"
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#8da194] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@brand.com"
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8da194] mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8da194] mb-1">
                  Internal Agency Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Specific client preferences, color grading guidelines, brand guidelines..."
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1b2720]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8da194] hover:text-[#e7eee9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3cff5f] text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Create Client</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

