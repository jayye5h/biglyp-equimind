import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Heart, Flower2, Sailboat, Sunrise, LogOut, UserCog } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme, useBrand, ALL_PALETTES } from "@/lib/theme";
import { BRANDS } from "@/lib/brand";
import { NotificationBell } from "@/components/NotificationBell";
import { ContactDialog } from "@/components/ContactDialog";

export const ThemeToggle = () => {
  const { theme, setTheme, palettes: PALETTES } = useTheme();
  return (
    <div data-testid="theme-toggle" role="radiogroup" aria-label="Colour theme" className="flex items-center gap-1 rounded-full bg-white/80 border border-slate-200 p-1">
      {Object.entries(PALETTES).map(([k, p]) => (
        <button key={k} data-testid={`theme-toggle-${k}`} role="radio" aria-checked={theme === k} title={p.label} onClick={() => setTheme(k)}
          className={`h-7 w-7 rounded-full grid place-items-center transition-shadow ${theme === k ? "ring-2 ring-slate-800" : "hover:ring-2 hover:ring-slate-300"}`}>
          <span className="h-4 w-4 rounded-full" style={{ background: p.p }} />
        </button>
      ))}
    </div>
  );
};

const BRAND_ICONS = { equimind: Heart, mindmellow: Flower2, mindedge: Sailboat, focusedge: Sunrise };

/* Product switcher; new products appear automatically once added to BRANDS. */
export const ProductTabs = ({ target = "home" }) => {
  const B = useBrand();
  return (
    <div data-testid="product-tabs-bar" className="border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
      <nav role="tablist" aria-label="Products" className="max-w-6xl mx-auto px-4 sm:px-8 h-12 flex items-center gap-1 overflow-x-auto">
        <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400 mr-3">Biglyp products</span>
        {Object.values(BRANDS).map((b) => {
          const Icon = BRAND_ICONS[b.key] || Heart;
          const c = ALL_PALETTES[b.palettes[0]].p;
          const on = b.key === B.key;
          return (
            <Link key={b.key} to={b[target]} role="tab" aria-selected={on} data-testid={`product-tab-${b.key}`} ref={on ? (el) => el?.scrollIntoView({ block: "nearest", inline: "nearest" }) : undefined}
              className={`relative h-12 px-3 inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${on ? "text-slate-900" : "text-slate-500 hover:text-slate-800"}`}>
              <span className="h-6 w-6 rounded-lg grid place-items-center transition-transform duration-200 hover:scale-110" style={{ background: c }}><Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.4} /></span>
              {b.name}
              {on && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full" style={{ background: c }} />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export const Logo = ({ to, small }) => {
  const B = useBrand();
  const Icon = BRAND_ICONS[B.key] || Heart;
  return (
  <Link to={to || B.home} data-testid="brand-logo-link" className="flex items-center gap-2.5 group">
    <span className={`${small ? "h-9 w-9" : "h-11 w-11"} rounded-2xl bg-eq grid place-items-center shadow-sm transition-transform duration-300 group-hover:rotate-[-6deg]`}>
      <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
    </span>
    <span className="leading-none">
      <span data-testid="brand-name" className={`font-serif ${small ? "text-xl" : "text-2xl"} font-semibold text-eq`}>{B.name}</span>
      <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500 mt-1">by Biglyp</span>
    </span>
  </Link>
  );
};

export const AppHeader = ({ children }) => {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [contact, setContact] = useState(false);
  const B = useBrand();
  const out = async () => {
    await logout();
    nav(B.home);
  };
  return (
    <header className="sticky top-0 z-30 bg-eq-bg/80 backdrop-blur-xl border-b border-eq/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Logo small to={user?.role === "admin" ? "/admin" : user?.role === "counsellor" ? "/counsellor" : "/dashboard"} />
        <div className="flex items-center gap-1 sm:gap-3">
          <div className="hidden sm:block"><ThemeToggle /></div>
          {children}
          {user && <NotificationBell />}
          {user && (
            <button data-testid="contact-details-btn" onClick={() => setContact(true)} title="Contact details" aria-label="Contact details" className="h-9 w-9 rounded-full hover:bg-white grid place-items-center text-slate-700">
              <UserCog className="h-5 w-5" />
            </button>
          )}
          <span data-testid="header-user-name" className="hidden sm:block text-sm text-slate-600">{user?.name}</span>
          <button data-testid="logout-button" onClick={out} className="h-9 px-3 rounded-full border border-eq/20 text-sm text-slate-700 hover:bg-white hover:text-slate-900 transition-colors flex items-center gap-1.5">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
      <ContactDialog open={contact} onOpenChange={setContact} />
    </header>
  );
};

export const SafetyStrip = ({ testid = "safety-strip" }) => (
  <div data-testid={testid} className="rounded-2xl border border-[#f07167]/30 bg-[#fff0ee] px-5 py-4 text-sm text-slate-800">
    <span className="font-semibold text-[#c2410c]">If you feel unsafe right now:</span> call Tele-MANAS{" "}
    <a href="tel:14416" className="font-mono font-semibold underline decoration-[#f07167]/50">14416</a> or{" "}
    <a href="tel:18008914416" className="font-mono font-semibold underline decoration-[#f07167]/50">1800-891-4416</a> (24/7, free, confidential), or{" "}
    <a href="tel:112" className="font-mono font-semibold underline decoration-[#f07167]/50">112</a> in an emergency.
  </div>
);
