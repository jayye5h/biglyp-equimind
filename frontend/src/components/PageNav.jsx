import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BiglypLogo } from "@/components/BiglypLogo";

/** Slim navigation strip on every page except the Biglyp home page: "Previous page" + "Back to home page". */
export const PageNav = () => {
  const { pathname } = useLocation();
  const nav = useNavigate();
  // New page → start at the top (keeps this strip visible); in-page #anchors are left alone
  useEffect(() => { if (!window.location.hash) window.scrollTo(0, 0); }, [pathname]);
  if (pathname === "/") return null;
  // react-router stores the history index; idx 0 means this tab was opened directly on this page
  const canGoBack = (window.history.state?.idx ?? 0) > 0;
  const back = () => (canGoBack ? nav(-1) : nav("/"));
  const btn = "h-8 px-3 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-colors";
  return (
    <div data-testid="page-nav" className="print:hidden relative z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className={`${pathname === "/dashboard" ? "max-w-7xl" : "max-w-6xl"} mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3`}>
        <BiglypLogo size="sm" testid="page-nav-home" />
        <button type="button" data-testid="page-nav-previous" onClick={back} className={`${btn} text-slate-700 border border-slate-200 hover:bg-slate-100`}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      </div>
    </div>
  );
};
