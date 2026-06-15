import { motion } from 'framer-motion';
import { Layers, Hourglass } from 'lucide-react';
import type { CardNewsDeck, Lang } from '../../cardnews/types';
import { useShellStore } from '../../store/shellStore';

export function CardNewsGallery({ decks, lang }: { decks: CardNewsDeck[]; lang: Lang }) {
  const openCardnews = useShellStore((s) => s.openCardnews);

  if (decks.length === 0) {
    return (
      <div className="mt-12 flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] text-zinc-500">
        <Hourglass className="h-7 w-7" />
        <span className="text-sm font-medium">카드뉴스 준비 중</span>
        <span className="text-xs text-zinc-600">등록된 덱이 없습니다</span>
      </div>
    );
  }

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck, i) => (
        <motion.button key={deck.id} type="button" onClick={() => openCardnews(deck.id)}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] text-left transition-colors hover:border-violet-500/30">
          <div className="relative flex h-44 items-center justify-center overflow-hidden"
            style={{ background: 'radial-gradient(ellipse 90% 60% at 70% -10%,rgba(124,92,255,.28),transparent 60%),linear-gradient(160deg,#11132a,#0a0b14)' }}>
            <Layers className="h-9 w-9 text-violet-300/80 transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute bottom-3 right-3 rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-mono text-zinc-300">{deck.slides.length} cards · 1:1</span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <span className="text-[11px] font-medium text-violet-300">앵글 리포트 · {deck.date}</span>
            <h3 className="mt-1.5 text-[16px] font-semibold text-zinc-100">{deck.title[lang]}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">슬라이드 카드뉴스 — 넘겨보고 PNG·PDF로 내보내기</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
