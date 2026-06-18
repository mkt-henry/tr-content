import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Download, FileDown, Images, FileText, Copy, Check, X } from 'lucide-react';
import type { CardNewsDeck, Slide as ResearchSlideData, MacroSlide as MacroSlideData } from '../../cardnews/types';
import { toLang } from '../../cardnews/lang';
import { useShellStore } from '../../store/shellStore';
import { getProject } from '../../registry';
import { Slide } from './Slide';
import { MacroSlide } from './MacroSlide';
import { exportSlidePng, exportAllPng, exportPdf } from './export';

export function CardNewsViewer({ deck }: { deck: CardNewsDeck }) {
  const back = useShellStore((s) => s.backToGallery);
  const projectLang = useShellStore((s) => s.projectLang);
  const setProjectLang = useShellStore((s) => s.setProjectLang);
  const project = getProject(deck.project);
  const langs = project?.languages ?? [{ id: 'ko', label: '한국어', flag: '🇰🇷' }, { id: 'en', label: 'English', flag: '🇺🇸' }];
  const lang = toLang(projectLang[deck.project]);
  const accent = deck.accent ?? '#c2a35a';
  const total = deck.slides.length;
  const brand = project?.name ?? deck.project;

  const isMacro = deck.theme === 'macro';
  const W = deck.width ?? 1080;
  const H = deck.height ?? 1080;
  const dims = { width: W, height: H };
  const fileLang = isMacro ? 'en' : lang;

  // research 테마 메타(리포트 번호 + 월/년)
  const [yy, mm, dd] = deck.date.split('-');
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const meta = mm && dd ? `NO. ${mm}${dd} · ${MONTHS[+mm - 1]} ${yy}` : deck.date;
  const macroMeta = deck.date.replace(/-/g, '·');
  const source = deck.source ? deck.source.replace(/^https?:\/\//, '').split('/')[0] : undefined;

  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCaption = async () => {
    if (!deck.caption) return;
    try {
      await navigator.clipboard.writeText(deck.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) { console.error('[cardnews:copy]', err); }
  };
  /** 내보내기용 원본 노드 refs */
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

  // 화면 표시 스케일 — 정사각/세로 모두 박스 안에 맞춤
  const scale = Math.min(560 / W, 720 / H);
  const dispW = Math.round(W * scale);
  const dispH = Math.round(H * scale);

  const renderCard = (s: CardNewsDeck['slides'][number], idx: number, refCb?: (el: HTMLDivElement | null) => void) =>
    isMacro
      ? <MacroSlide ref={refCb} slide={s as MacroSlideData} meta={macroMeta} />
      : <Slide ref={refCb} slide={s as ResearchSlideData} lang={lang} index={idx} total={total} accent={accent} brand={brand} meta={meta} source={source} />;

  return (
    <div className="grain relative flex h-full w-full flex-col items-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(124,92,255,0.14), transparent 60%), linear-gradient(180deg,#0c0a12,#08070b)' }}>

      {/* 상단 바 */}
      <div className="flex w-full items-center justify-between px-6 py-4">
        <button onClick={back} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/25">
          <ArrowLeft className="h-4 w-4" /> 갤러리
        </button>
        <span className="text-sm font-medium text-zinc-300">{deck.title[lang]}</span>
        {isMacro ? (
          <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[12px] font-medium text-zinc-400">🇺🇸 EN</span>
        ) : (
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {langs.map((l) => (
              <button key={l.id} onClick={() => setProjectLang(deck.project, l.id)}
                className={`rounded-lg px-2.5 py-1.5 text-[12px] font-medium ${l.id === lang ? 'bg-violet-500/20 text-violet-200' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {l.flag} {l.id.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 슬라이드 + 좌우 네비 */}
      <div className="flex flex-1 items-center justify-center gap-5">
        <button onClick={prev} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-zinc-200 hover:bg-white/[0.14]"><ChevronLeft className="h-7 w-7" /></button>
        <div style={{ width: dispW, height: dispH, overflow: 'hidden', borderRadius: isMacro ? 16 : 6, boxShadow: '0 24px 70px rgba(0,0,0,.55)' }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: W, height: H }}>
            {renderCard(deck.slides[i], i)}
          </div>
        </div>
        <button onClick={next} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-zinc-200 hover:bg-white/[0.14]"><ChevronRight className="h-7 w-7" /></button>
      </div>

      {/* 하단 컨트롤 */}
      <div className="flex w-full items-center justify-center gap-3 px-6 py-5">
        <span className="font-mono text-[12px] tabular-nums text-zinc-500">{i + 1} / {total}</span>
        <button disabled={busy} onClick={() => run(() => exportSlidePng(nodes()[i], deck.id, fileLang, i, dims))}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/25 disabled:opacity-50">
          <Download className="h-4 w-4" /> 이 슬라이드 PNG
        </button>
        <button disabled={busy} onClick={() => run(() => exportAllPng(nodes(), deck.id, fileLang, dims))}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/25 disabled:opacity-50">
          <Images className="h-4 w-4" /> 전체 PNG
        </button>
        <button disabled={busy} onClick={() => run(() => exportPdf(nodes(), deck.id, fileLang, dims))}
          className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-200 hover:bg-violet-500/20 disabled:opacity-50">
          <FileDown className="h-4 w-4" /> PDF
        </button>
        {deck.caption && (
          <button onClick={() => setShowCaption((v) => !v)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${showCaption ? 'border-white/30 bg-white/[0.06] text-zinc-100' : 'border-white/10 text-zinc-300 hover:border-white/25'}`}>
            <FileText className="h-4 w-4" /> 게시 본문
          </button>
        )}
      </div>

      {/* 게시 본문 패널 — 확인 + 복사 */}
      {deck.caption && showCaption && (
        <div className="absolute right-4 top-20 bottom-24 z-20 flex w-[400px] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0c0e13]/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-medium text-zinc-200">링크드인 본문</span>
            <div className="flex items-center gap-2">
              <button onClick={copyCaption}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium ${copied ? 'bg-emerald-500/20 text-emerald-300' : 'bg-violet-500/20 text-violet-200 hover:bg-violet-500/30'}`}>
                {copied ? <><Check className="h-3.5 w-3.5" /> 복사됨</> : <><Copy className="h-3.5 w-3.5" /> 복사</>}
              </button>
              <button onClick={() => setShowCaption(false)} className="rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"><X className="h-4 w-4" /></button>
            </div>
          </div>
          <pre className="flex-1 overflow-auto whitespace-pre-wrap px-4 py-3 text-[13px] leading-relaxed text-zinc-300" style={{ fontFamily: 'inherit' }}>{deck.caption}</pre>
        </div>
      )}

      {/* 내보내기용 원본(화면 밖) */}
      <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden>
        {deck.slides.map((s, idx) => (
          <div key={idx}>{renderCard(s, idx, (el) => { exportRefs.current[idx] = el; })}</div>
        ))}
      </div>
    </div>
  );
}
