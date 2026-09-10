import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCards, deleteCard } from "../data/store";
import { THEMES, THEME_KEYS } from "../themes/themes";
import {
  PlusIcon, CardStackIcon, EyeIcon, DownloadIcon, FileIcon, SearchIcon,
  UserCircleIcon, GridIcon, ListIcon, MoreVerticalIcon, PencilIcon,
  CopyIcon, ExternalLinkIcon, TrashIcon, SlidersIcon,
} from "../components/Icons";

const STATUS_META = {
  active: { label: "Active", dot: "bg-emerald-400", text: "text-emerald-400" },
  draft: { label: "Draft", dot: "bg-amber-400", text: "text-amber-400" },
  archived: { label: "Archived", dot: "bg-neutral-500", text: "text-neutral-400" },
};

const SETUP_CHECKS = [
  { key: "name", label: "Full Name" },
  { key: "photoUrl", label: "Profile Photo" },
  { key: "phone", label: "Phone Number" },
  { key: "address", label: "Office Location Pin on Google Maps" },
  { key: "businessName", label: "Business Name" },
];

function setupInfo(card) {
  const results = SETUP_CHECKS.map((c) => ({ ...c, ok: Boolean(card[c.key]) }));
  const filled = results.filter((r) => r.ok).length;
  const missing = results.find((r) => !r.ok);
  return { filled, total: results.length, pct: Math.round((filled / results.length) * 100), missing };
}

function initials(name) {
  return (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

export default function Dashboard() {
  const [cards, setCards] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const load = () => getAllCards().then(setCards);
  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete the card for "${name}"? This can't be undone.`)) return;
    await deleteCard(id);
    setMenuOpenId(null);
    load();
  };

  const copyLink = (slug, id) => {
    const url = `${window.location.origin}/card/${slug}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExport = () => {
    if (!cards || cards.length === 0) return;
    const rows = [
      ["Name", "Business", "Slug", "Status", "Theme", "Total Views", "vCard Downloads"],
      ...cards.map((c) => [c.name, c.businessName, c.slug, c.status, THEMES[c.theme]?.label || c.theme, c.views || 0, c.downloads || 0]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "aasha-sm-vcard-registry.csv";
    a.click();
  };

  const industries = useMemo(() => {
    if (!cards) return [];
    const map = new Map();
    cards.forEach((c) => {
      const key = c.industry?.trim() || "General";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [cards]);

  const statusCounts = useMemo(() => {
    const counts = { all: cards?.length || 0, active: 0, draft: 0, archived: 0 };
    cards?.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return counts;
  }, [cards]);

  const filtered = useMemo(() => {
    if (!cards) return [];
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      if (q) {
        const hay = `${c.name} ${c.businessName} ${c.phone} ${c.slug}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (industryFilter !== "all" && (c.industry?.trim() || "General") !== industryFilter) return false;
      if (themeFilter !== "all" && c.theme !== themeFilter) return false;
      return true;
    });
  }, [cards, query, statusFilter, industryFilter, themeFilter]);

  const totalViews = useMemo(() => cards?.reduce((s, c) => s + (c.views || 0), 0) || 0, [cards]);
  const totalDownloads = useMemo(() => cards?.reduce((s, c) => s + (c.downloads || 0), 0) || 0, [cards]);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-neutral-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#0b0e14]/95 backdrop-blur">
        <div className="px-5 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center text-indigo-300">
              <CardStackIcon width={18} height={18} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">AASHA-SM Technologies</p>
              <p className="text-[10px] tracking-wide text-neutral-500 font-medium">DIGITAL VISITING CARDS</p>
            </div>
          </div>

          <div className="flex-1 max-w-md relative hidden sm:block">
            <SearchIcon width={15} height={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cards, domains, slugs…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/40 transition"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Link to="/new" className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg text-white bg-indigo-500 hover:bg-indigo-400 transition">
              <PlusIcon width={15} height={15} /> New Card
            </Link>
            <span className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-neutral-400">
              <UserCircleIcon width={18} height={18} />
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r border-white/[0.07] px-4 py-5 space-y-5 hidden md:block">
          <div>
            <p className="text-sm font-semibold text-neutral-100">AASHA-SM Workspace</p>
            <p className="text-xs text-neutral-500 mt-0.5">Enterprise Tier</p>
          </div>
          <Link
            to="/new"
            className="flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg py-2 border border-white/15 text-neutral-200 hover:bg-white/[0.06] transition"
          >
            <PlusIcon width={14} height={14} /> Create Card
          </Link>
          <nav>
            <span className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-400/25 text-indigo-200 text-sm font-medium">
              <CardStackIcon width={15} height={15} />
              Cards Management
              <span className="ml-auto text-[11px] font-semibold bg-white/10 px-2 py-0.5 rounded-full">{cards?.length ?? 0}</span>
            </span>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 px-5 sm:px-7 py-7 space-y-6">
          {cards === null && <p className="text-sm text-neutral-500">Loading…</p>}

          {cards !== null && (
            <>
              {/* Heading */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-semibold text-white">Client Visiting Cards Directory</h1>
                    <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-white/[0.06] border border-white/10 text-neutral-400">v2.4 Active</span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">Centralized provisioning, real-time analytics, and contactless lead capture</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExport}
                    disabled={cards.length === 0}
                    className="flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg bg-white/[0.05] border border-white/10 hover:bg-white/10 transition text-neutral-200 disabled:opacity-40"
                  >
                    <DownloadIcon width={15} height={15} /> Export vCard Registry
                  </button>
                  <button className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center hover:bg-white/10 transition text-neutral-300">
                    <FileIcon width={15} height={15} />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid sm:grid-cols-3 gap-4">
                <StatCard label="TOTAL CARDS" value={cards.length} sub="Active" subClass="text-neutral-500" icon={<CardStackIcon width={19} height={19} />} tint="indigo" />
                <StatCard label="TOTAL VIEWS" value={totalViews.toLocaleString()} sub="All time" subClass="text-neutral-500" icon={<EyeIcon width={19} height={19} />} tint="amber" />
                <StatCard label="VCARD DOWNLOADS" value={totalDownloads.toLocaleString()} sub="Direct saves" subClass="text-emerald-400" icon={<DownloadIcon width={19} height={19} />} tint="emerald" />
              </div>

              {/* Search & filters */}
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[220px] relative">
                    <SearchIcon width={15} height={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by client name, business name, phone, or slug…"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/40 transition"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-lg p-1 text-xs shrink-0">
                    <Pill active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>All ({statusCounts.all})</Pill>
                    <Pill active={statusFilter === "active"} onClick={() => setStatusFilter("active")}>Active ({statusCounts.active})</Pill>
                    <Pill active={statusFilter === "draft"} onClick={() => setStatusFilter("draft")}>Drafts ({statusCounts.draft})</Pill>
                    <Pill active={statusFilter === "archived"} onClick={() => setStatusFilter("archived")}>Archived ({statusCounts.archived})</Pill>
                  </div>
                  <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-lg p-1 shrink-0">
                    <button onClick={() => setViewMode("grid")} className={`w-7 h-7 rounded-md flex items-center justify-center transition ${viewMode === "grid" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300"}`}>
                      <GridIcon width={14} height={14} />
                    </button>
                    <button onClick={() => setViewMode("list")} className={`w-7 h-7 rounded-md flex items-center justify-center transition ${viewMode === "list" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-neutral-300"}`}>
                      <ListIcon width={14} height={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-neutral-500 shrink-0">Industry:</span>
                  <Pill active={industryFilter === "all"} onClick={() => setIndustryFilter("all")}>All ({cards.length})</Pill>
                  {industries.map(([name, count]) => (
                    <Pill key={name} active={industryFilter === name} onClick={() => setIndustryFilter(name)}>{name} ({count})</Pill>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-neutral-500 shrink-0">Theme:</span>
                  <Pill active={themeFilter === "all"} onClick={() => setThemeFilter("all")}>All Themes</Pill>
                  {THEME_KEYS.map((key) => (
                    <Pill key={key} active={themeFilter === key} onClick={() => setThemeFilter(key)}>
                      <span className="w-2 h-2 rounded-full inline-block mr-1.5 align-middle" style={{ background: THEMES[key].swatch }} />
                      {THEMES[key].label}
                    </Pill>
                  ))}
                </div>
              </div>

              {/* Empty state */}
              {cards.length === 0 && (
                <div className="text-center py-20 border border-dashed border-white/15 rounded-2xl bg-white/[0.02]">
                  <p className="text-lg font-semibold text-neutral-100">No cards yet</p>
                  <p className="text-sm text-neutral-500 mt-1 mb-5">Provision your first client's digital visiting card.</p>
                  <Link to="/new" className="inline-flex items-center gap-1.5 bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-400 transition">
                    <PlusIcon width={14} height={14} /> New card
                  </Link>
                </div>
              )}

              {/* Grid / list */}
              {cards.length > 0 && viewMode === "grid" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((c) => (
                    <CardTile
                      key={c.id}
                      card={c}
                      copied={copiedId === c.id}
                      onCopy={() => copyLink(c.slug, c.id)}
                      menuOpen={menuOpenId === c.id}
                      onToggleMenu={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                      onDelete={() => handleDelete(c.id, c.name)}
                    />
                  ))}
                  <Link
                    to="/new"
                    className="flex flex-col items-center justify-center text-center gap-2.5 rounded-2xl border-2 border-dashed border-white/15 hover:border-indigo-400/40 hover:bg-white/[0.02] transition py-10 px-4"
                  >
                    <span className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-neutral-300">
                      <PlusIcon width={18} height={18} />
                    </span>
                    <span className="text-[15px] font-semibold text-neutral-100">+ Create New Card</span>
                    <span className="text-xs text-neutral-500 max-w-[220px]">Provision a new contactless digital visiting card profile</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 transition">
                      <PlusIcon width={14} height={14} /> Create Card
                    </span>
                  </Link>
                </div>
              )}

              {cards.length > 0 && viewMode === "list" && (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
                  {filtered.map((c) => (
                    <CardRow
                      key={c.id}
                      card={c}
                      copied={copiedId === c.id}
                      onCopy={() => copyLink(c.slug, c.id)}
                      onDelete={() => handleDelete(c.id, c.name)}
                    />
                  ))}
                  {filtered.length === 0 && <p className="text-sm text-neutral-500 text-center py-10">No cards match these filters.</p>}
                </div>
              )}

              {cards.length > 0 && filtered.length === 0 && viewMode === "grid" && (
                <p className="text-sm text-neutral-500 text-center -mt-3">No cards match these filters.</p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
        active ? "bg-white/10 text-white" : "text-neutral-400 hover:text-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}

const TINTS = {
  indigo: "bg-indigo-500/15 text-indigo-300",
  amber: "bg-amber-500/15 text-amber-300",
  emerald: "bg-emerald-500/15 text-emerald-300",
};

function StatCard({ label, value, sub, subClass, icon, tint }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-[11px] tracking-wide text-neutral-500 font-medium mb-2">{label}</p>
        <p className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-white">{value}</span>
          <span className={`text-sm font-medium ${subClass}`}>{sub}</span>
        </p>
      </div>
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${TINTS[tint]}`}>{icon}</span>
    </div>
  );
}

function CardTile({ card: c, copied, onCopy, menuOpen, onToggleMenu, onDelete }) {
  const theme = THEMES[c.theme] || THEMES.indigo;
  const status = STATUS_META[c.status] || STATUS_META.active;
  const isDraft = c.status === "draft";
  const setup = isDraft ? setupInfo(c) : null;

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full" style={{ background: `${theme.accent}1f`, color: theme.accent }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} /> {theme.label}
        </span>
        <span className={`flex items-center gap-1.5 text-[11px] font-medium ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} /> {isDraft ? "Setup Incomplete" : status.label}
        </span>
      </div>

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-xl border-2 flex items-center justify-center text-sm font-semibold shrink-0" style={{ borderColor: theme.accent, color: theme.accent }}>
          {initials(c.name)}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-white truncate">{c.name || "Unnamed"}</p>
          {c.businessName && <p className="text-xs font-medium truncate" style={{ color: theme.accent }}>{c.businessName}</p>}
          {c.designation && <p className="text-xs text-neutral-500 truncate">{c.designation}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2">
        <span className="flex-1 min-w-0 truncate text-xs text-neutral-400 font-mono">aasha.sm/card/{c.slug || "…"}</span>
        <button type="button" onClick={onCopy} className="text-neutral-500 hover:text-neutral-200 transition shrink-0">
          {copied ? <span className="text-[10px] text-emerald-400 font-medium">Copied</span> : <CopyIcon width={13} height={13} />}
        </button>
      </div>

      {!isDraft ? (
        <>
          <div className="flex items-center justify-around text-center">
            <div>
              <p className="text-[11px] text-neutral-500">Total Views</p>
              <p className="text-sm font-semibold text-white mt-0.5">{(c.views || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] text-neutral-500">vCard Downloads</p>
              <p className="text-sm font-semibold text-emerald-400 mt-0.5">{(c.downloads || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/card/${c.slug}`}
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg py-2 bg-indigo-200 text-indigo-950 hover:bg-indigo-100 transition"
            >
              <ExternalLinkIcon width={14} height={14} /> Open Live
            </Link>
            <Link to={`/edit/${c.id}`} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/10 transition text-neutral-300">
              <PencilIcon width={15} height={15} />
            </Link>
            <div className="relative shrink-0">
              <button type="button" onClick={onToggleMenu} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/10 transition text-neutral-300">
                <MoreVerticalIcon width={16} height={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 bottom-11 z-10 w-36 bg-neutral-900 border border-white/10 rounded-lg shadow-xl overflow-hidden">
                  <button type="button" onClick={onDelete} className="w-full flex items-center gap-2 text-left text-sm text-red-400 px-3 py-2 hover:bg-white/[0.06] transition">
                    <TrashIcon width={14} height={14} /> Delete card
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-amber-300">Profile Setup: {setup.filled} of {setup.total} fields</span>
              <span className="text-neutral-400">{setup.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400" style={{ width: `${setup.pct}%` }} />
            </div>
            {setup.missing && <p className="text-xs text-neutral-500 mt-1.5">Missing: {setup.missing.label}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/edit/${c.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-neutral-900 hover:brightness-105 transition"
            >
              <SlidersIcon width={14} height={14} /> Complete Onboarding
            </Link>
            <button type="button" onClick={onDelete} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition text-red-400">
              <TrashIcon width={15} height={15} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CardRow({ card: c, copied, onCopy, onDelete }) {
  const theme = THEMES[c.theme] || THEMES.indigo;
  const status = STATUS_META[c.status] || STATUS_META.active;
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition">
      <div className="w-9 h-9 rounded-lg border-2 flex items-center justify-center text-xs font-semibold shrink-0" style={{ borderColor: theme.accent, color: theme.accent }}>
        {initials(c.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">{c.name || "Unnamed"}</p>
        <p className="text-xs text-neutral-500 truncate">{c.businessName || "—"} · aasha.sm/card/{c.slug || "…"}</p>
      </div>
      <span className={`hidden sm:flex items-center gap-1.5 text-[11px] font-medium shrink-0 ${status.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} /> {status.label}
      </span>
      <span className="hidden md:block text-xs text-neutral-500 w-20 text-right shrink-0">{(c.views || 0).toLocaleString()} views</span>
      <span className="hidden md:block text-xs text-emerald-400 w-24 text-right shrink-0">{(c.downloads || 0).toLocaleString()} saves</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <button type="button" onClick={onCopy} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/10 transition text-neutral-400">
          {copied ? <span className="text-[9px] text-emerald-400 font-medium">✓</span> : <CopyIcon width={13} height={13} />}
        </button>
        <Link to={`/card/${c.slug}`} target="_blank" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/10 transition text-neutral-400">
          <ExternalLinkIcon width={13} height={13} />
        </Link>
        <Link to={`/edit/${c.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/10 transition text-neutral-400">
          <PencilIcon width={13} height={13} />
        </Link>
        <button type="button" onClick={onDelete} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] border border-white/10 hover:bg-red-500/10 hover:text-red-400 transition text-neutral-400">
          <TrashIcon width={13} height={13} />
        </button>
      </div>
    </div>
  );
}
