import { useState } from "react";
import { Play, ArrowRight, Headphones, MonitorPlay } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const usePlayer = () => {
  const [item, setItem] = useState(null);
  const player = (
    <Dialog open={!!item} onOpenChange={(o) => { if (!o) setItem(null); }}>
      <DialogContent data-testid="media-player-dialog" className="w-[calc(100%-2rem)] max-w-3xl p-3 sm:p-4 rounded-3xl">
        <DialogTitle className="px-1 font-serif text-lg">{item?.title}</DialogTitle>
        {item && (
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
            <iframe data-testid="media-player-iframe" title={item.title} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen
              src={`https://www.youtube-nocookie.com/embed/${item.youtube_id}?autoplay=1&rel=0`} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
  return { play: setItem, player };
};

const Head = ({ title, icon: Icon, onAll, testid }) => (
  <div className="flex items-center justify-between gap-3">
    <h2 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-3">{Icon && <span className="h-10 w-10 rounded-full bg-eq-soft grid place-items-center"><Icon className="h-5 w-5 text-eq-dark" /></span>}{title}</h2>
    {onAll && <button data-testid={testid} onClick={onAll} className="text-sm text-eq hover:text-eq-dark inline-flex items-center gap-1">View All <ArrowRight className="h-4 w-4" /></button>}
  </div>
);

export const CalmShorts = ({ items, play, onAll, limit = 5 }) => (
  <section data-testid="calm-shorts-section" className="rounded-[2rem] bg-white border border-eq/10 p-5 sm:p-7">
    <Head title="Calm Shorts" onAll={onAll} testid="calm-shorts-view-all" />
    <div className="mt-5 flex md:grid md:grid-cols-5 gap-3 overflow-x-auto pb-1 snap-x">
      {items.slice(0, limit).map((m) => (
        <button key={m.id} data-testid={`short-${m.id}`} onClick={() => play(m)} className="group relative shrink-0 w-36 md:w-auto aspect-[4/5] rounded-2xl overflow-hidden snap-start">
          <img src={thumb(m.youtube_id)} alt={m.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
          <span className="absolute left-2.5 right-2.5 bottom-2.5 text-left">
            <span className="block text-white text-xs font-semibold leading-tight line-clamp-2">{m.title}</span>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-black/50 text-white text-[11px] px-2 py-0.5"><Play className="h-3 w-3 fill-white" />{m.duration || "Short"}</span>
          </span>
        </button>
      ))}
    </div>
  </section>
);

const ListCard = ({ title, icon, items, play, onAll, limit, testid }) => (
  <section data-testid={testid} className="rounded-[2rem] bg-white border border-eq/10 p-5 sm:p-7">
    <Head title={title} icon={icon} onAll={onAll} testid={`${testid}-view-all`} />
    <div className="mt-4 divide-y divide-slate-100">
      {items.slice(0, limit).map((m) => (
        <button key={m.id} data-testid={`media-row-${m.id}`} onClick={() => play(m)} className="group w-full py-3 flex items-center gap-4 text-left">
          <img src={thumb(m.youtube_id)} alt={m.title} className="h-16 w-24 shrink-0 rounded-xl object-cover" />
          <span className="flex-1 min-w-0"><span className="block font-semibold text-slate-800 truncate">{m.title}</span><span className="text-sm text-slate-500">{m.duration}</span></span>
          <span className="h-9 w-9 shrink-0 rounded-full bg-eq-soft grid place-items-center group-hover:bg-eq transition-colors"><Play className="h-4 w-4 text-eq-dark group-hover:text-white fill-current" /></span>
        </button>
      ))}
    </div>
  </section>
);

export const AudioVideo = ({ media, play, onAll, limit = 2 }) => (
  <div className="grid lg:grid-cols-2 gap-6">
    <ListCard title="Audiobooks" icon={Headphones} items={media.filter((m) => m.kind === "audiobook")} play={play} onAll={onAll} limit={limit} testid="audiobooks-section" />
    <ListCard title="Videos" icon={MonitorPlay} items={media.filter((m) => m.kind === "video")} play={play} onAll={onAll} limit={limit} testid="videos-section" />
  </div>
);
