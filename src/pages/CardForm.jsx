import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { blankCard, blankCustomField, getCardById, saveCard, slugify, isSlugTaken, cardIdBadge } from "../data/store";
import { fileToResizedDataUrl } from "../utils/image";
import { THEMES, THEME_KEYS } from "../themes/themes";
import {
  Field, TextInput, TextArea, Section, Checkbox, FileInput,
  TabButton, SegmentedControl, CustomFieldRow, AppearanceCard,
} from "../components/FormBits";
import {
  IdBadgeIcon, ContactCardIcon, LinkIcon, PlusIcon, PaletteIcon,
  BarChartIcon, ScanCornerIcon, StarIcon, ShieldIcon,
  SmartphoneIcon, MonitorIcon, CopyIcon, PencilIcon,
} from "../components/Icons";
import CardBody, { CUSTOM_FIELD_ICONS } from "../components/CardBody";

const TABS = [
  { key: "identity", label: "Identity & Brand" },
  { key: "contact", label: "Contact Information" },
  { key: "custom", label: "Custom Fields" },
  { key: "appearance", label: "Appearance & Modules" },
];

function relativeTime(ts) {
  if (!ts) return null;
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
  const h = Math.round(m / 60);
  return `${h} hour${h === 1 ? "" : "s"} ago`;
}

export default function CardForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [card, setCard] = useState(blankCard());
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [loaded, setLoaded] = useState(!isEdit);
  const [tab, setTab] = useState("identity");
  const [previewMode, setPreviewMode] = useState("mobile");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [, setTick] = useState(0);
  const [editingSlug, setEditingSlug] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const autosaveTimer = useRef(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (isEdit) {
      getCardById(id).then((c) => {
        if (c) { setCard(c); setLastSavedAt(c.updatedAt || null); }
        setSlugTouched(true);
        setLoaded(true);
      });
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (!slugTouched) {
      const base = card.businessName || card.name;
      if (base) setCard((c) => ({ ...c, slug: slugify(base) }));
    }
  }, [card.name, card.businessName, slugTouched]);

  // Quiet autosave: keeps the "Autosaved Xm ago" indicator honest without
  // requiring the person to hit Save while they're still filling things in.
  useEffect(() => {
    if (!loaded || !dirtyRef.current) return;
    if (!card.name.trim()) return;
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      const slug = slugify(card.slug || card.name);
      if (!slug || (await isSlugTaken(slug, card.id))) return;
      const saved = await saveCard({ ...card, slug });
      setCard((c) => (c.id ? c : { ...c, id: saved.id, createdAt: saved.createdAt }));
      setLastSavedAt(Date.now());
    }, 1200);
    return () => clearTimeout(autosaveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const touch = (updater) => { dirtyRef.current = true; setCard(updater); };
  const set = (key, value) => touch((c) => ({ ...c, [key]: value }));
  const setField = (key, value) => touch((c) => ({ ...c, fields: { ...c.fields, [key]: value } }));
  const setAppearance = (key, value) => touch((c) => ({ ...c, appearance: { ...c.appearance, [key]: value } }));

  const addCustomField = () => touch((c) => ({ ...c, customFields: [...c.customFields, blankCustomField()] }));
  const updateCustomField = (updated) => touch((c) => ({
    ...c, customFields: c.customFields.map((cf) => (cf.id === updated.id ? updated : cf)),
  }));
  const deleteCustomField = (fieldId) => touch((c) => ({ ...c, customFields: c.customFields.filter((cf) => cf.id !== fieldId) }));

  const handleImage = async (key, file) => {
    if (!file) return;
    const dataUrl = await fileToResizedDataUrl(file, key === "logoUrl" ? 300 : 480);
    set(key, dataUrl);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!card.name.trim()) { setTab("identity"); return; }
    const slug = slugify(card.slug || card.name);
    if (!slug) { setSlugError("Slug can't be empty."); return; }
    if (await isSlugTaken(slug, card.id)) {
      setSlugError("That link is already used by another card. Try something more specific.");
      return;
    }
    setSlugError("");
    setSaving(true);
    const saved = await saveCard({ ...card, slug });
    setSaving(false);
    setLastSavedAt(Date.now());
    navigate(`/edit/${saved.id}`, { replace: true });
  };

  if (!loaded) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-sm text-neutral-500">Loading…</div>;

  const previewUrl = card.slug ? `${window.location.origin}/card/${card.slug}` : "";
  const displayUrl = card.slug ? `aasha.sm/card/${card.slug}` : "aasha.sm/card/…";

  const copyUrl = () => {
    if (!previewUrl) return;
    navigator.clipboard?.writeText(previewUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-neutral-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#0b0e14]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-200 transition shrink-0">&larr; Back</Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-semibold text-neutral-100 truncate">
                  {card.name ? `${card.name} - Digital Card` : "New card"}
                </h1>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-neutral-400 shrink-0">
                  #{cardIdBadge(card.id)}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {lastSavedAt ? `Autosaved ${relativeTime(lastSavedAt)}` : "Not saved yet"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 pr-1">
              {THEME_KEYS.map((key) => {
                const t = THEMES[key];
                const active = card.theme === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set("theme", key)}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium border transition ${
                      active ? "bg-white/[0.08] border-white/20 text-white" : "border-white/10 text-neutral-500 hover:border-white/20"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: t.swatch }} />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <a
              href={previewUrl || undefined}
              target="_blank"
              rel="noreferrer"
              className={`text-sm font-medium px-3.5 py-2 rounded-lg border border-white/10 text-neutral-200 hover:bg-white/[0.06] transition ${!previewUrl ? "pointer-events-none opacity-40" : ""}`}
            >
              Full Preview
            </a>
            <button
              onClick={handleSave}
              disabled={saving || !card.name.trim()}
              className="text-sm font-medium px-4 py-2 rounded-lg text-white transition disabled:opacity-40 bg-indigo-500 hover:bg-indigo-400"
            >
              {saving ? "Saving…" : "Save & Publish"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-5 flex items-center gap-6 overflow-x-auto no-scrollbar border-t border-white/[0.05]">
          {TABS.map((t, i) => (
            <TabButton key={t.key} index={i + 1} label={t.label} active={tab === t.key} onClick={() => setTab(t.key)} />
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8 grid lg:grid-cols-[1fr_400px] gap-6 items-start">
        <form onSubmit={handleSave} className="space-y-5 min-w-0">

          {tab === "identity" && (
            <Section
              title="Identity"
              subtitle="Shown at the top of every card. Establishes primary executive credibility."
              icon={<IdBadgeIcon width={18} height={18} />}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name">
                  <TextInput value={card.name} onChange={(e) => set("name", e.target.value)} placeholder="Rahul Sharma" required />
                </Field>
                <Field label="Designation" optional on={card.fields.designation} onToggle={(v) => setField("designation", v)}>
                  <TextInput value={card.designation} onChange={(e) => set("designation", e.target.value)} placeholder="Owner & Head Artisan" />
                </Field>
                <Field label="Business / shop name" optional on={card.fields.businessName} onToggle={(v) => setField("businessName", v)}>
                  <TextInput value={card.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Rahul Gold & Diamond Studio" />
                </Field>
                <Field label="Category tag">
                  <TextInput value={card.categoryTag} onChange={(e) => set("categoryTag", e.target.value)} placeholder="Fine Jewellery & Solitaires" />
                </Field>
                <Field label="Tagline" optional on={card.fields.tagline} onToggle={(v) => setField("tagline", v)}>
                  <TextInput value={card.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="25 years of trusted royal craftsmanship" />
                </Field>
                <Field label="Working hours" optional on={card.fields.hours} onToggle={(v) => setField("hours", v)}>
                  <TextInput value={card.hours} onChange={(e) => set("hours", e.target.value)} placeholder="Mon - Sat: 10:30 AM - 8:30 PM" />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Profile photo" optional on={card.fields.photo} onToggle={(v) => setField("photo", v)}>
                  <FileInput file={card.photoUrl && "executive-portrait.webp"} onChange={(f) => handleImage("photoUrl", f)} />
                </Field>
                <Field label="Business logo" optional on={card.fields.logo} onToggle={(v) => setField("logo", v)}>
                  <FileInput file={card.logoUrl && "business-mark.svg"} onChange={(f) => handleImage("logoUrl", f)} />
                </Field>
              </div>
              <div className="flex items-center gap-6 pt-1">
                <Checkbox checked={card.verified} onChange={(v) => set("verified", v)} label="Verified cardholder badge" />
                <Checkbox checked={card.openNow} onChange={(v) => set("openNow", v)} label="Currently open status indicator" />
              </div>
            </Section>
          )}

          {tab === "contact" && (
            <Section
              title="Contact information"
              subtitle="Configure direct contact triggers for Call, WhatsApp, Email and Maps navigation."
              icon={<ContactCardIcon width={18} height={18} />}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Phone number" optional on={card.fields.phone} onToggle={(v) => setField("phone", v)}>
                  <TextInput value={card.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
                </Field>
                <Field label="WhatsApp number" optional on={card.fields.whatsapp} onToggle={(v) => setField("whatsapp", v)}>
                  <TextInput value={card.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+91 98765 43210" />
                </Field>
              </div>
              <Field label="Email" optional on={card.fields.email} onToggle={(v) => setField("email", v)}>
                <TextInput type="email" value={card.email} onChange={(e) => set("email", e.target.value)} placeholder="rahul@goldshop.in" />
              </Field>
              <Field label="Address" optional on={card.fields.address} onToggle={(v) => setField("address", v)}>
                <TextArea rows={3} value={card.address} onChange={(e) => set("address", e.target.value)} placeholder="Shop 12, Sadar Bazaar, Central Market Square, Itarsi, MP - 461111" />
              </Field>
              <Field
                label="Show 'Get Directions' button"
                optional
                on={card.fields.directions}
                onToggle={(v) => setField("directions", v)}
                hint="Opens Google Maps instantly using the precise store location above."
              >
                <span />
              </Field>
            </Section>
          )}

          {tab === "custom" && (
            <Section
              title="Custom fields & links"
              subtitle="Reorder, add UPI payment handles, catalog downloads, or social networks."
              action={
                <button
                  type="button"
                  onClick={addCustomField}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/10 transition"
                >
                  <PlusIcon width={14} height={14} /> Add Custom Field
                </button>
              }
            >
              {card.customFields.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">No custom fields yet — add a UPI handle, catalog, or gallery link.</p>
              ) : (
                <div className="space-y-2">
                  {card.customFields.map((cf) => (
                    <CustomFieldRow
                      key={cf.id}
                      field={cf}
                      iconOptions={CUSTOM_FIELD_ICONS}
                      onChange={updateCustomField}
                      onDelete={() => deleteCustomField(cf.id)}
                    />
                  ))}
                </div>
              )}
            </Section>
          )}

          {tab === "appearance" && (
            <>
              <Section
                title="Appearance & modules"
                subtitle="Fine-tune functional widgets and interactive modules visible on the client card."
                icon={<PaletteIcon width={18} height={18} />}
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  <AppearanceCard
                    icon={<BarChartIcon width={17} height={17} />}
                    title="Card view counter"
                    description="Public view tally on card"
                    checked={card.appearance.viewCounter}
                    onChange={(v) => setAppearance("viewCounter", v)}
                  />
                  <AppearanceCard
                    icon={<ScanCornerIcon width={17} height={17} />}
                    title="Offline scan QR block"
                    description="Direct phone camera sync"
                    checked={card.appearance.offlineScanQr}
                    onChange={(v) => setAppearance("offlineScanQr", v)}
                  />
                  <AppearanceCard
                    icon={<StarIcon width={17} height={17} />}
                    title="Google reviews badge"
                    description="4.9 Star Trust badge"
                    checked={card.appearance.googleReviewsBadge}
                    onChange={(v) => setAppearance("googleReviewsBadge", v)}
                  />
                  <AppearanceCard
                    icon={<ShieldIcon width={17} height={17} />}
                    title="AASHA-SM footer tag"
                    description="Official verified platform"
                    checked={card.appearance.footerTag}
                    onChange={(v) => setAppearance("footerTag", v)}
                  />
                </div>
              </Section>

              <Section title="Theme" subtitle="Sets the accent color and gradient used across the card.">
                <div className="grid sm:grid-cols-3 gap-3">
                  {THEME_KEYS.map((key) => {
                    const t = THEMES[key];
                    const active = card.theme === key;
                    return (
                      <button type="button" key={key} onClick={() => set("theme", key)}
                        className={`text-left rounded-xl border p-3 transition ${active ? "border-indigo-400 ring-2 ring-indigo-400/20 bg-white/[0.04]" : "border-white/10 hover:border-white/20"}`}>
                        <span className="w-6 h-6 rounded-full block mb-2" style={{ background: t.swatch }} />
                        <p className="text-xs font-medium text-neutral-100">{t.label}</p>
                        <p className="text-[11px] text-neutral-500">{t.tagline}</p>
                      </button>
                    );
                  })}
                </div>
              </Section>
            </>
          )}
        </form>

        {/* Live preview */}
        <div className="lg:sticky lg:top-28 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-neutral-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live Interactive Preview
            </p>
            <SegmentedControl
              value={previewMode}
              onChange={setPreviewMode}
              options={[
                { value: "mobile", label: "Mobile", icon: <SmartphoneIcon width={13} height={13} /> },
                { value: "desktop", label: "Desktop", icon: <MonitorIcon width={13} height={13} /> },
              ]}
            />
          </div>

          <div className="flex justify-center">
            {previewMode === "mobile" ? (
              <div className="w-[300px] rounded-[2.5rem] border-[6px] border-neutral-800 bg-neutral-800 shadow-2xl">
                <div className="flex justify-center py-1.5">
                  <div className="w-16 h-1.5 rounded-full bg-neutral-600" />
                </div>
                <div className="rounded-[1.9rem] overflow-hidden max-h-[640px] overflow-y-auto no-scrollbar">
                  <CardBody card={card} shareUrl={previewUrl} interactive={false} onThemeChange={(key) => set("theme", key)} />
                </div>
              </div>
            ) : (
              <div className="w-full rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                </div>
                <div className="max-w-[380px] mx-auto max-h-[640px] overflow-y-auto no-scrollbar">
                  <CardBody card={card} shareUrl={previewUrl} interactive={false} onThemeChange={(key) => set("theme", key)} />
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5">
            <LinkIcon width={14} height={14} className="text-neutral-500 shrink-0" />
            {editingSlug ? (
              <input
                autoFocus
                value={card.slug}
                onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }}
                onBlur={() => setEditingSlug(false)}
                className="flex-1 min-w-0 bg-transparent text-xs text-neutral-200 focus:outline-none"
              />
            ) : (
              <span className="flex-1 min-w-0 truncate text-xs text-neutral-400">{displayUrl}</span>
            )}
            <button type="button" onClick={() => setEditingSlug((v) => !v)} className="text-neutral-500 hover:text-neutral-200 transition shrink-0">
              <PencilIcon width={13} height={13} />
            </button>
            <button
              type="button"
              onClick={copyUrl}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/10 transition shrink-0"
            >
              <CopyIcon width={13} height={13} /> {copiedUrl ? "Copied!" : "Copy Card URL"}
            </button>
          </div>
          {slugError && <p className="text-xs text-red-400 mt-1.5">{slugError}</p>}
        </div>
      </main>
    </div>
  );
}
