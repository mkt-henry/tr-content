import { useEffect, useRef, useState } from 'react';

const PREVIEW_SIZE = Math.min(560, Math.floor(0.62 * 860));
import { ChevronLeft, ChevronRight, ArrowLeft, Download, FileDown, Images } from 'lucide-react';
import type { CardNewsDeck } from '../../cardnews/types';
import { toLang } from '../../cardnews/lang';
import { useShellStore } from '../../store/shellStore';
import { getProject } from '../../registry';
import { Slide, ScaledSlide } from './Slide';
import { exportSlidePng, exportAllPng, exportPdf } from './export';

export function CardNewsViewer({ deck }: { deck: CardNewsDeck }) {
  const back = useShellStore((s) => s.backToGallery);
  const projectLang = useShellStore((s) => s.projectLang);
  const setProjectLang = useShellStore((s) => s.setProjectLang);
  const project = getProject(deck.project);
  const langs = project?.languages ?? [{ id: 'ko', label: '한국어', flag: '🇰🇷' }, { id: 'en', label: 'English', flag: '🇺🇸' }];
  const lang = toLang(projectLang[deck.project]);
  const accent = deck.accent ?? '#7c5cff';
  const total = deck.slides.length;

  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  /** 내보내기용 1080px 원본 노드 refs */
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

  const prev = () => setI((v) => (v - 1 + total) % total);
  const next = () => setI((v) => (v + 1) % total);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') useShellStore.getState().backToGallery();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); }
    catch (err) { console.error('[cardnews:export]', err); }
    finally { setBusy(false); }
  };
  const nodes = () => exportRefs.current.filter(Boolean) as HTMLElement[];

  return (
    <div className="grain relative flex h-full w-full flex-col items-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(124,92,255,0.14), transparent 60%), linear-gradient(180deg,#0c0a12,#08070b)' }}>

      {/* 상단 바 */}
      <div className="flex w-full items-center justify-between px-6 py-4">
        <button onClick={back} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/25">
          <ArrowLeft className="h-4 w-4" /> 갤러리
        </button>
        <span className="text-sm font-medium text-zinc-300">{deck.title[lang]}</span>
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {langs.map((l) => (
            <button key={l.id} onClick={() => setProjectLang(deck.project, l.id)}
              className={`rounded-lg px-2.5 py-1.5 text-[12px] font-medium ${l.id === lang ? 'bg-violet-500/20 text-violet-200' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {l.flag} {l.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 슬라이드 + 좌우 네비 */}
      <div className="flex flex-1 items-center justify-center gap-5">
        <button onClick={prev} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-zinc-200 hover:bg-white/[0.14]"><ChevronLeft className="h-7 w-7" /></button>
        <ScaledSlide slide={deck.slides[i]} lang={lang} index={i} total={total} accent={accent} display={PREVIEW_SIZE} />
        <button onClick={next} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-zinc-200 hover:bg-white/[0.14]"><ChevronRight className="h-7 w-7" /></button>
      </div>

      {/* 하단 컨트롤 */}
      <div className="flex w-full items-center justify-center gap-3 px-6 py-5">
        <span className="font-mono text-[12px] tabular-nums text-zinc-500">{i + 1} / {total}</span>
        <button disabled={busy} onClick={() => run(() => exportSlidePng(nodes()[i], deck.id, lang, i))}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/25 disabled:opacity-50">
          <Download className="h-4 w-4" /> 이 슬라이드 PNG
        </button>
        <button disabled={busy} onClick={() => run(() => exportAllPng(nodes(), deck.id, lang))}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/25 disabled:opacity-50">
          <Images className="h-4 w-4" /> 전체 PNG
        </button>
        <button disabled={busy} onClick={() => run(() => exportPdf(nodes(), deck.id, lang))}
          className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-200 hover:bg-violet-500/20 disabled:opacity-50">
          <FileDown className="h-4 w-4" /> PDF
        </button>
      </div>

      {/* 내보내기용 1080px 원본(화면 밖) */}
      <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden>
        {deck.slides.map((s, idx) => (
          <Slide key={idx} ref={(el) => { exportRefs.current[idx] = el; }} slide={s} lang={lang} index={idx} total={total} accent={accent} />
        ))}
      </div>
    </div>
  );
}
