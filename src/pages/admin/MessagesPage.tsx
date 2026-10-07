import { useState, useEffect, useCallback } from "react";
import { Mail, MessageCircle, RefreshCw, ChevronLeft, ChevronRight, Phone, Building2, FileText, Calendar, Inbox } from "lucide-react";

interface Message {
  id: number;
  name: string;
  phone: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  type: "contact" | "quote";
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<"" | "contact" | "quote">("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Message | null>(null);
  const [error, setError] = useState("");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams({ page: String(page) });
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/get_messages.php?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(data.messages ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const formatDate = (s: string) =>
    new Date(s).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const typeBadge = (t: string) =>
    t === "quote"
      ? "bg-burgundy-50 text-burgundy-900 border border-burgundy-200"
      : "bg-blue-50 text-blue-700 border border-blue-200";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900" style={{ fontFamily: "Playfair Display, serif" }}>
            Messages
          </h1>
          <p className="text-charcoal-500 mt-1">
            {total} message{total !== 1 ? "s" : ""} received
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter tabs */}
          {(["", "contact", "quote"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                typeFilter === t
                  ? "bg-charcoal-900 text-white border-charcoal-900"
                  : "bg-white text-charcoal-600 border-cream-200 hover:border-charcoal-400"
              }`}
            >
              {t === "" ? "All" : t === "quote" ? "Quote Requests" : "Contact"}
            </button>
          ))}
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="p-2.5 bg-white border border-cream-200 rounded-xl hover:bg-cream-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-charcoal-600 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm">
          ⚠ {error}
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Message List */}
        <div className="lg:col-span-2 space-y-3">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-burgundy-900/20 border-t-burgundy-900 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-cream-200 p-12 flex flex-col items-center text-center gap-3">
              <Inbox className="w-10 h-10 text-charcoal-300" />
              <p className="text-charcoal-500 font-medium">No messages yet</p>
              <p className="text-charcoal-400 text-sm">Messages from the contact form and quote requests will appear here.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelected(msg)}
                className={`w-full text-left bg-white rounded-2xl border p-4 transition-all hover:shadow-md ${
                  selected?.id === msg.id
                    ? "border-burgundy-900 shadow-md"
                    : "border-cream-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-charcoal-900 text-sm truncate">{msg.name}</p>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBadge(msg.type)}`}>
                    {msg.type === "quote" ? "Quote" : "Contact"}
                  </span>
                </div>
                {msg.subject && (
                  <p className="text-xs text-charcoal-600 font-medium truncate mb-1">{msg.subject}</p>
                )}
                <p className="text-xs text-charcoal-400 truncate">{msg.message}</p>
                <p className="text-[10px] text-charcoal-300 mt-2">{formatDate(msg.created_at)}</p>
              </button>
            ))
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-cream-200 bg-white hover:bg-cream-50 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-charcoal-500">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-2 rounded-xl border border-cream-200 bg-white hover:bg-cream-50 disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-6 space-y-5 sticky top-6">
              {/* Type badge + date */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeBadge(selected.type)}`}>
                  {selected.type === "quote" ? "📋 Quote Request" : "✉️ Contact Message"}
                </span>
                <span className="text-xs text-charcoal-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(selected.created_at)}
                </span>
              </div>

              {/* Sender info */}
              <div className="border border-cream-100 rounded-xl divide-y divide-cream-100">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 bg-burgundy-50 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-burgundy-900" />
                  </div>
                  <div>
                    <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-semibold">Name</p>
                    <p className="text-sm font-semibold text-charcoal-900">{selected.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-semibold">Phone</p>
                    <a href={`tel:${selected.phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                      {selected.phone}
                    </a>
                  </div>
                </div>
                {selected.email && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-semibold">Email</p>
                      <a href={`mailto:${selected.email}`} className="text-sm font-medium text-blue-600 hover:underline">
                        {selected.email}
                      </a>
                    </div>
                  </div>
                )}
                {selected.company && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-semibold">Company</p>
                      <p className="text-sm font-medium text-charcoal-800">{selected.company}</p>
                    </div>
                  </div>
                )}
                {selected.subject && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-semibold">Subject</p>
                      <p className="text-sm font-medium text-charcoal-800">{selected.subject}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message body */}
              <div>
                <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-semibold mb-2">Message</p>
                <div className="bg-cream-50 rounded-xl px-4 py-4 text-sm text-charcoal-800 leading-relaxed whitespace-pre-wrap border border-cream-200">
                  {selected.message}
                </div>
              </div>

              {/* Quick reply actions */}
              <div className="flex gap-3 pt-1">
                {selected.phone && (
                  <a
                    href={`https://wa.me/${selected.phone.replace(/\D/g, "")}?text=Hello ${encodeURIComponent(selected.name)}, thank you for contacting MATERIA.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Reply
                  </a>
                )}
                {selected.email && (
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "Your Inquiry – MATERIA")}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email Reply
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-cream-200 h-80 flex flex-col items-center justify-center gap-3 text-charcoal-400">
              <Mail className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
