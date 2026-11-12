import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Download, FileText, Printer } from "lucide-react";
import { api } from "@/lib/api";
import { AppHeader } from "@/components/Shell";

const slug = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const text = (c) => (Array.isArray(c) ? c.map(text).join("") : typeof c === "string" ? c : c?.props ? text(c.props.children) : "");

const MD = {
  h1: ({ children }) => <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">{children}</h1>,
  h2: ({ children }) => <h2 id={slug(text(children))} className="mt-12 pt-6 border-t border-eq/10 font-serif text-3xl font-bold text-slate-900 scroll-mt-24 print:break-before-page">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 font-serif text-xl font-bold text-eq-dark">{children}</h3>,
  p: ({ children }) => <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{children}</p>,
  ul: ({ children }) => <ul className="mt-3 space-y-1.5 list-disc pl-5 text-[15px] text-slate-700 marker:text-eq">{children}</ul>,
  ol: ({ children }) => <ol className="mt-2 space-y-1 list-decimal pl-5 text-[15px] text-slate-700 marker:text-eq">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
  code: ({ children }) => <code className="rounded bg-eq-soft px-1.5 py-0.5 text-[12px] font-mono text-eq-dark">{children}</code>,
  hr: () => <hr className="my-10 border-eq/15" />,
  table: ({ children }) => <div className="mt-4 overflow-x-auto rounded-2xl border border-eq/10 print:overflow-visible"><table className="w-full text-sm">{children}</table></div>,
  thead: ({ children }) => <thead className="bg-eq-soft/60 text-left text-[12px] uppercase tracking-wider text-eq-dark">{children}</thead>,
  th: ({ children }) => <th className="px-4 py-2.5 font-semibold align-top">{children}</th>,
  td: ({ children }) => <td className="px-4 py-2.5 align-top text-slate-700 border-t border-eq/10">{children}</td>,
};

export default function ProductDoc() {
  const [doc, setDoc] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    api.get("/admin/product-doc").then((r) => setDoc(r.data)).catch(() => setErr(true));
  }, []);
  const toc = doc ? [...doc.markdown.matchAll(/^## (.+)$/gm)].map((m) => m[1]).filter((t) => t !== "Contents") : [];
  const md = doc ? doc.markdown.replace(/## Contents\n[\s\S]*?\n\n## /, "## ") : "";
  const downloadMd = () => {
    const url = URL.createObjectURL(new Blob([doc.markdown], { type: "text/markdown" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "EquiMind_Product_Document.md" });
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div data-testid="product-doc-page" className="min-h-screen">
      <div className="print:hidden contents"><AppHeader /></div>
      <div className="print:hidden sticky top-16 z-20 bg-eq-bg border-b border-eq/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center gap-2">
          <Link to="/admin" data-testid="product-doc-back" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Admin</Link>
          <span className="mx-2 h-4 w-px bg-eq/20" />
          <FileText className="h-4 w-4 text-eq" /><span className="text-sm font-semibold text-slate-800 truncate">EquiMind Product Document</span>
          <div className="ml-auto flex gap-2">
            <button data-testid="product-doc-print" disabled={!doc} onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full bg-eq text-white px-4 py-1.5 text-xs font-semibold hover:bg-eq-dark disabled:opacity-40"><Printer className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Save as</span> PDF</button>
            <button data-testid="product-doc-md" disabled={!doc} onClick={downloadMd} className="inline-flex items-center gap-1.5 rounded-full border border-eq/30 px-4 py-1.5 text-xs font-semibold text-eq-dark hover:bg-eq-soft disabled:opacity-40"><Download className="h-3.5 w-3.5" /> .md</button>
          </div>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 grid lg:grid-cols-[220px_1fr] gap-10 print:block print:p-0">
        <nav data-testid="product-doc-toc" className="hidden lg:block print:hidden">
          <div className="sticky top-36 space-y-1 text-sm max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
            <p className="font-mono text-[11px] uppercase tracking-widest text-eq mb-2">Contents</p>
            {toc.map((t) => <a key={t} href={`#${slug(t)}`} className="block rounded-lg px-2 py-1 text-slate-600 hover:bg-white hover:text-slate-900">{t}</a>)}
          </div>
        </nav>
        <article data-testid="product-doc-body" className="min-w-0 rounded-3xl bg-white border border-eq/10 p-6 sm:p-10 print:border-0 print:p-0 print:rounded-none">
          {err && <p data-testid="product-doc-error" className="text-sm text-slate-600">Couldn't load the document. Please refresh the page.</p>}
          {!doc && !err && <div className="h-96 animate-pulse rounded-2xl bg-eq-soft/40" />}
          {doc && <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>{md}</ReactMarkdown>}
        </article>
      </main>
    </div>
  );
}
