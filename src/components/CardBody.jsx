import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { THEMES, THEME_KEYS } from "../themes/themes";
import { downloadVCard } from "../utils/vcard";
// import { bumpDownloadCount } from "../data/store";
import {
  PhoneIcon, WhatsAppIcon, MailIcon, PinIcon, StarIcon,
  InstagramIcon, FacebookIcon, LinkedInIcon, GlobeIcon, DownloadIcon,
  ShareIcon, VerifiedIcon, EyeIcon, ExternalLinkIcon, ArrowRightIcon,
  RupeeIcon, CameraIcon, FileIcon, LinkIcon, ShieldIcon,
} from "./Icons";

export const CUSTOM_FIELD_ICONS = [
  { value: "link", label: "Link", Icon: LinkIcon },
  { value: "upi", label: "UPI / Payment", Icon: RupeeIcon },
  { value: "gallery", label: "Photo gallery", Icon: CameraIcon },
  { value: "file", label: "Document / catalog", Icon: FileIcon },
  { value: "phone", label: "Phone", Icon: PhoneIcon },
  { value: "whatsapp", label: "WhatsApp", Icon: WhatsAppIcon },
  { value: "mail", label: "Email", Icon: MailIcon },
  { value: "map", label: "Map", Icon: PinIcon },
];

function waLink(number, name) {
  const digits = (number || "").replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(`Hi ${name || ""}, found your card —`)}`;
}

const SOCIALS = [
  { key: "instagram", Icon: InstagramIcon, label: "Instagram" },
  { key: "facebook", Icon: FacebookIcon, label: "Facebook" },
  { key: "linkedin", Icon: LinkedInIcon, label: "LinkedIn" },
  { key: "website", Icon: GlobeIcon, label: "Website" },
  { key: "reviews", Icon: StarIcon, label: "Reviews", urlKey: "reviewsUrl" },
];

/**
 * Renders the full card. `interactive` controls whether links/buttons/scroll
 * behave live (public page) or are inert (the admin's live preview panel).
 */
export default function CardBody({ card, shareUrl, interactive = true, onThemeChange, refs = {} }) {
  const theme = THEMES[card.theme] || THEMES.indigo;
  const f = card.fields || {};
  const stats = card.socialStats || {};
  const appearance = card.appearance || {};
  const qrCanvasWrapRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const activeSocials = SOCIALS.filter((s) => f[s.key] && card[s.urlKey || s.key]);
  const activeSpecs = (card.specializations || []).filter((s) => s.title.trim());
  const activeCustomFields = (card.customFields || []).filter((cf) => cf.enabled && cf.label.trim());
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.address || "")}`;

  const handleShare = async () => {
    if (!interactive || !shareUrl) return;
    if (navigator.share) {
      try { await navigator.share({ title: card.name, url: shareUrl }); return; } catch { /* cancelled */ }
    }
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadPng = () => {
    if (!interactive) return;
    const canvas = qrCanvasWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${(card.slug || "card")}-qr.png`;
    a.click();
  };

  return (
    <div
      ref={refs.top}
      style={{ "--accent": theme.accent, "--accent-strong": theme.accentStrong }}
      className="bg-[#0b0e14] text-neutral-100 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white/10 flex items-center justify-center text-xs font-semibold">
          {card.photoUrl ? <img src={card.photoUrl} alt="" className="w-full h-full object-cover" /> : (card.name || "?").charAt(0)}
        </div>
        {card.openNow ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Open Now
          </span>
        ) : <span />}
        <button onClick={handleShare} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 hover:bg-white/10 transition">
          <ShareIcon width={15} height={15} />
        </button>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Theme switcher */}
        <div ref={refs.theme} className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-[10px] tracking-wide text-neutral-500 font-medium shrink-0 flex items-center gap-1 pr-1">THEME</span>
          {THEME_KEYS.map((key) => {
            const t = THEMES[key];
            const active = card.theme === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onThemeChange && onThemeChange(key)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                  active ? "bg-white/[0.08] border-white/20 text-white" : "border-white/10 text-neutral-400 hover:border-white/20"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: t.swatch }} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Profile card */}
        <div className="rounded-3xl bg-white/[0.04] border border-white/[0.08] p-5">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              {card.photoUrl ? (
                <img src={card.photoUrl} alt={card.name} className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-serif bg-white/[0.06] border border-white/10">
                  {(card.name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              {card.openNow && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0b0e14]" />
              )}
            </div>
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-semibold leading-tight truncate">{card.name || "Your name"}</h1>
                {card.verified && (
                  <span className="text-[var(--accent)] shrink-0"><VerifiedIcon /></span>
                )}
              </div>
              {f.designation && card.designation && (
                <p className="text-sm text-[var(--accent)] mt-0.5">{card.designation}</p>
              )}
              {f.businessName && card.businessName && (
                <p className="text-sm text-neutral-400">{card.businessName}</p>
              )}
              {card.categoryTag && (
                <span className="inline-block mt-2 text-[11px] px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300">
                  {card.categoryTag}
                </span>
              )}
              {appearance.googleReviewsBadge && stats.reviews && (
                <span className="inline-flex items-center gap-1 mt-2 ml-2 text-[11px] px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300">
                  <StarIcon width={11} height={11} /> {stats.reviews}
                </span>
              )}
            </div>
          </div>

          {(f.hours && card.hours) || appearance.viewCounter ? (
            <div ref={refs.insights} className="flex items-center flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-white/[0.06] text-xs text-neutral-400">
              {f.hours && card.hours && <span>{card.hours}</span>}
              {appearance.viewCounter && (
                <span className="flex items-center gap-1 ml-auto"><EyeIcon width={13} height={13} /> {(card.views || 0).toLocaleString()} card views</span>
              )}
            </div>
          ) : null}
        </div>

        {/* Save contact */}
        <button
          onClick={() => { if (interactive) { downloadVCard(card); } }}
          className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm font-semibold text-white transition hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
        >
          Save Contact to Phone <ArrowRightIcon width={16} height={16} />
        </button>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          {f.whatsapp && card.whatsapp && (
            <QuickAction interactive={interactive} href={waLink(card.whatsapp, card.name)} Icon={WhatsAppIcon} label="WhatsApp" />
          )}
          {f.phone && card.phone && (
            <QuickAction interactive={interactive} href={`tel:${card.phone}`} Icon={PhoneIcon} label="Call" />
          )}
          {f.email && card.email && (
            <QuickAction interactive={interactive} href={`mailto:${card.email}`} Icon={MailIcon} label="Email" />
          )}
          {f.directions && card.address && (
            <QuickAction interactive={interactive} href={mapsUrl} Icon={PinIcon} label="Directions" />
          )}
        </div>

        {/* QR / exchange card */}
        {appearance.offlineScanQr && (
          <div ref={refs.exchange} className="rounded-3xl bg-white/[0.04] border border-white/[0.08] p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold flex items-center gap-1.5">Instant Scan &amp; Exchange</p>
                <p className="text-xs text-neutral-500 mt-0.5">Scan to save this card instantly</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-white/[0.06] border border-white/10 text-neutral-400 shrink-0">vCard 4.0</span>
            </div>

            <div className="flex justify-center">
              <div ref={qrCanvasWrapRef} className="relative w-[168px] h-[168px] flex items-center justify-center rounded-2xl border-2" style={{ borderColor: theme.accent }}>
                <ScanCorners color={theme.accent} />
                <div className="bg-white p-2.5 rounded-lg">
                  <QRCodeCanvas value={shareUrl || "https://example.com"} size={128} fgColor="#0b0e14" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button onClick={handleDownloadPng} className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium bg-white/[0.06] border border-white/10 hover:bg-white/10 transition">
                <DownloadIcon width={14} height={14} /> Download PNG
              </button>
              <button onClick={handleShare} className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium bg-white/[0.06] border border-white/10 hover:bg-white/10 transition">
                <ShareIcon width={14} height={14} /> {copied ? "Copied!" : "Share Card Link"}
              </button>
            </div>
          </div>
        )}

        {/* Custom fields & links */}
        {activeCustomFields.length > 0 && (
          <div className="space-y-2">
            {activeCustomFields.map((cf) => {
              const Icon = CUSTOM_FIELD_ICONS.find((o) => o.value === cf.icon)?.Icon || LinkIcon;
              const isDownload = cf.icon === "file";
              const href =
                cf.icon === "phone" ? `tel:${cf.value}` :
                cf.icon === "whatsapp" ? waLink(cf.value, card.name) :
                cf.icon === "mail" ? `mailto:${cf.value}` :
                cf.icon === "map" ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cf.value)}` :
                cf.icon === "upi" ? `upi://pay?pa=${encodeURIComponent(cf.value)}` :
                cf.value;
              return (
                <a
                  key={cf.id}
                  href={interactive ? href : undefined}
                  target={cf.icon === "upi" || cf.icon === "phone" || cf.icon === "whatsapp" || cf.icon === "mail" ? undefined : "_blank"}
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] px-4 py-3.5 hover:bg-white/[0.07] transition"
                >
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${theme.accent}22`, color: theme.accent }}>
                    <Icon width={16} height={16} />
                  </span>
                  <span className="text-sm font-medium flex-1 min-w-0 truncate">{cf.label}</span>
                  {isDownload ? (
                    <DownloadIcon width={15} height={15} className="text-neutral-500 shrink-0" />
                  ) : (
                    <ExternalLinkIcon width={13} height={13} className="text-neutral-500 shrink-0" />
                  )}
                </a>
              );
            })}
          </div>
        )}

        {/* Specializations */}
        {f.specializations && activeSpecs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h2 className="text-sm font-semibold">Core Specializations</h2>
              {card.businessName && <span className="text-[11px] text-neutral-500">{card.businessName}</span>}
            </div>
            <div className="space-y-2">
              {activeSpecs.map((s, i) => (
                <div key={i} className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4 flex items-start gap-3">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{ background: `${theme.accent}22`, color: theme.accent }}
                  >
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{s.title}</p>
                    {s.description && <p className="text-xs text-neutral-400 mt-0.5">{s.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified profiles */}
        {activeSocials.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-2.5 px-1">Online Profiles</h2>
            <div className="grid grid-cols-2 gap-2">
              {activeSocials.map(({ key, Icon, label, urlKey }) => (
                <a
                  key={key}
                  href={interactive ? card[urlKey || key] : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3.5 flex items-center gap-2.5 hover:bg-white/[0.07] transition"
                >
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${theme.accent}22`, color: theme.accent }}>
                    <Icon width={15} height={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{label}</p>
                    {stats[key] && <p className="text-[11px] text-neutral-500 truncate">{stats[key]}</p>}
                  </div>
                  <ExternalLinkIcon width={13} height={13} className="text-neutral-500 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Address */}
        {f.address && card.address && (
          <div className="rounded-3xl bg-white/[0.04] border border-white/[0.08] p-5">
            <div className="flex items-center gap-2 mb-2">
              <PinIcon width={15} height={15} className="text-[var(--accent)]" />
              <h2 className="text-sm font-semibold">Find Us</h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed whitespace-pre-line">{card.address}</p>
            {f.directions && (
              <a
                href={interactive ? mapsUrl : undefined}
                target="_blank"
                rel="noreferrer"
                className="mt-3 rounded-xl overflow-hidden block border border-white/10 relative"
              >
                <MapSketch color={theme.accent} />
                <span className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-black/60 backdrop-blur rounded-lg py-1.5">
                  Navigate via Google Maps <ArrowRightIcon width={12} height={12} />
                </span>
              </a>
            )}
          </div>
        )}

        {appearance.footerTag && (
          <p className="text-center text-[11px] text-neutral-600 pt-1 flex items-center justify-center gap-1">
            <ShieldIcon width={11} height={11} /> Executive Digital Card by AASHA-SM Tech
          </p>
        )}
      </div>
    </div>
  );
}

function QuickAction({ href, Icon, label, interactive }) {
  return (
    <a
      href={interactive ? href : undefined}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="rounded-2xl bg-white/[0.04] border border-white/[0.08] py-3.5 flex flex-col items-center gap-1.5 hover:bg-white/[0.08] transition"
    >
      <Icon width={17} height={17} className="text-[var(--accent)]" />
      <span className="text-[10.5px] text-neutral-300">{label}</span>
    </a>
  );
}

function ScanCorners({ color }) {
  const corner = "absolute w-4 h-4 border-2";
  return (
    <>
      <span className={`${corner} top-1.5 left-1.5 border-r-0 border-b-0 rounded-tl-md`} style={{ borderColor: color }} />
      <span className={`${corner} top-1.5 right-1.5 border-l-0 border-b-0 rounded-tr-md`} style={{ borderColor: color }} />
      <span className={`${corner} bottom-1.5 left-1.5 border-r-0 border-t-0 rounded-bl-md`} style={{ borderColor: color }} />
      <span className={`${corner} bottom-1.5 right-1.5 border-l-0 border-t-0 rounded-br-md`} style={{ borderColor: color }} />
    </>
  );
}

function MapSketch({ color }) {
  return (
    <svg viewBox="0 0 320 110" className="w-full h-[90px] block" style={{ background: "#12161f" }}>
      <path d="M0 70 Q 60 40 120 60 T 240 50 T 320 65" stroke="#2a3040" strokeWidth="6" fill="none" />
      <path d="M0 30 Q 90 55 160 30 T 320 25" stroke="#232838" strokeWidth="4" fill="none" />
      <circle cx="160" cy="55" r="7" fill={color} />
      <circle cx="160" cy="55" r="13" fill={color} opacity="0.25" />
    </svg>
  );
}
