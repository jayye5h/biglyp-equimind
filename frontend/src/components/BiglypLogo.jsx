import { Link } from "react-router-dom";

/** Biglyp wordmark (public/biglyp-logo.png) with the "Wellbeing" tagline; links to the Biglyp home page. */
export const BiglypLogo = ({ size = "md", testid = "biglyp-logo-link" }) => {
  const h = size === "sm" ? "h-6" : "h-9";
  return (
    <Link to="/" data-testid={testid} aria-label="Biglyp Wellbeing — home" className="inline-flex flex-col items-start leading-none group">
      <img src="/biglyp-logo.png" alt="biglyp" draggable={false} className={`${h} w-auto select-none`} />
      <span data-testid="biglyp-logo-sub" className={`${size === "sm" ? "text-[9px] mt-0.5" : "text-[11px] mt-1"} font-semibold uppercase tracking-[0.32em] text-[#1f2a6b] group-hover:text-[#1d3fc4] transition-colors`}>Wellbeing</span>
    </Link>
  );
};
