import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCardBySlug, bumpViewCount } from "../data/store";
import CardBody from "../components/CardBody";
import { CardStackIcon, ExchangeIcon, BarChartIcon, PaletteIcon } from "../components/Icons";

const TABS = [
  { key: "top", label: "Card", Icon: CardStackIcon },
  { key: "exchange", label: "Exchange", Icon: ExchangeIcon },
  { key: "insights", label: "Insights", Icon: BarChartIcon },
  { key: "theme", label: "Theme", Icon: PaletteIcon },
];

export default function PublicCard() {
  const { slug } = useParams();
  const [card, setCard] = useState(undefined); // undefined = loading, null = not found
  const [themeOverride, setThemeOverride] = useState(null);
  const [tab, setTab] = useState("top");

  const sectionRefs = {
    top: useRef(null),
    exchange: useRef(null),
    insights: useRef(null),
    theme: useRef(null),
  };

  useEffect(() => {
    let active = true;
    getCardBySlug(slug).then((c) => {
      if (!active) return;
      setCard(c);
      if (c) bumpViewCount(slug);
    });
    return () => { active = false; };
  }, [slug]);

  if (card === undefined) {
    return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-sm text-neutral-500">Loading card…</div>;
  }

  if (card === null) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-neutral-100 flex flex-col items-center justify-center gap-3 text-center px-6">
        <p className="text-2xl font-semibold">This card doesn't exist</p>
        <p className="text-sm text-neutral-500">Check the link, or ask the business for their QR code again.</p>
        <Link to="/" className="text-sm underline text-neutral-400 mt-2">Back to dashboard</Link>
      </div>
    );
  }

  const shown = { ...card, theme: themeOverride || card.theme };
  const url = typeof window !== "undefined" ? window.location.href : "";

  const goTo = (key) => {
    setTab(key);
    sectionRefs[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen relative">
        <div className="flex-1 overflow-y-auto pb-24">
          <CardBody
            card={shown}
            shareUrl={url}
            interactive
            onThemeChange={setThemeOverride}
            refs={sectionRefs}
          />
        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-white/[0.08] bg-[#0b0e14]/95 backdrop-blur no-print">
          <div className="grid grid-cols-4">
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => goTo(key)}
                className={`flex flex-col items-center gap-1 py-3 text-[10.5px] font-medium transition ${
                  tab === key ? "text-[#818cf8]" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <Icon width={18} height={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
