import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Download, FileDown, Images, FileText, Copy, Check, X, ZoomIn, Film } from 'lucide-react';
import type { CardNewsDeck, Lang, Slide as ResearchSlideData, MacroSlide as MacroSlideData } from '../../cardnews/types';
import { getVariants } from '../../cardnews/types';
import { toLang } from '../../cardnews/lang';
import { useShellStore } from '../../store/shellStore';
import { getProject } from '../../registry';
import { Slide } from './Slide';
import { MacroSlide } from './MacroSlide';
import { ReelsFrame } from './ReelsFrame';
import { reelsTiming, REELS_FPS } from '../../cardnews/reels';
import { reelsStudioUrl } from '../../../remotion/studio';
import { exportSlidePng, exportAllPng, exportPdf } from './export';

export function CardNewsViewer({ deck }: { deck: CardNewsDeck }) {
  const back = useShellStore((s) => s.backToGallery);
  const projectLang = useShellStore((s) => s.projectLang);
  const setProjectLang = useShellStore((s) => s.setProjectLang);
  const project = getProject(deck.project);
  const langs = project?.languages ?? [{ id: 'ko', label: '한국어', flag: '🇰🇷' }, { id: 'en', label: 'English', flag: '🇺🇸' }];
  const isMacro = deck.theme === 'macro';
  // 언어 미설정 시 기본값: macro(영어 슬라이드)는 'en', research는 'ko'. 캡션·제목이 슬라이드 언어와 어긋나지 않게.
  const lang: Lang = projectLang[deck.project] ? toLang(projectLang[deck.project]) : (isMacro ? 'en' : 'ko');
  const accent = deck.accent ?? '#c2a35a';
  const brand = project?.name ?? deck.project;

  // 플랫폼 variant(링크드인/트위터 등). 단일 덱은 라벨 없는 단일 variant로 정규화됨
  const variants = getVariants(deck);
  const [vi, setVi] = useState(0);
  const variant = variants[vi];
  const multi = variants.length > 1;

  // 릴스 variant — 카드 대신 9:16 프레임을 자동 전환으로 재생한다.
  // getVariants(deck)는 매 렌더마다 새 객체를 만든다 → variant 자체를 의존성에 쓰면 안 된다.
  // slides는 덱 모듈의 const를 참조하므로 identity가 안정적이다.
  const isReels = variant.kind === 'reels';
  const timing = useMemo(
    () => (isReels ? reelsTiming(variant.slides, variant.seconds) : null),
    [isReels, variant.slides, variant.seconds],
  );

  const totalFrames = timing?.totalFrames ?? 0;

  /* 프리뷰 프레임 클럭.
     @remotion/player를 임베드해봤으나 autoPlay·ref.play() 모두 재생이 시작되지 않아(프레임 0 고정)
     자체 클럭으로 돌린다. mp4는 Remotion CLI가 렌더하므로 산출물 품질과는 무관하고,
     프리뷰와 렌더가 같은 reelsTiming + ReelsFrame을 쓰므로 타이밍 파리티는 유지된다.
     의존성은 원시값(totalFrames)이어야 한다 — getVariants(deck)가 매 렌더 새 객체를 만들기 때문에
     variant를 의존성에 쓰면 effect가 매 렌더 재실행되며 프레임이 0으로 되돌아간다. */
  const [rf, setRf] = useState(0);
  useEffect(() => {
    if (!isReels || totalFrames === 0) return;
    setRf(0);
    const id = window.setInterval(() => setRf((v) => (v + 1) % totalFrames), 1000 / REELS_FPS);
    return () => window.clearInterval(id);
  }, [isReels, totalFrames]);

  const W = variant.width;
  const H = variant.height;
  const dims = { width: W, height: H };
  const total = variant.slides.length;
  // 언어별 본문(LangText)이면 현재 언어로 전환, 단일 문자열이면 그대로
  const rawCaption = variant.caption;
  const caption = typeof rawCaption === 'string' ? rawCaption : rawCaption?.[lang];
  const fileLang = isMacro ? 'en' : lang;
  const exportId = multi ? `${deck.id}-${variant.id}` : deck.id;
  const captionTitle = multi ? `${variant.label} 본문` : (W > H ? 'X(트위터) 본문' : '링크드인 본문');

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
  const [zoomed, setZoomed] = useState(false);

  // 확대 시 뷰포트에 맞춘 스케일 (가로 16:9 X 버전에서 특히 크게 보임)
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const zoomScale = Math.min((vp.w * 0.94) / W, (vp.h * 0.9) / H);

  const selectVariant = (idx: number) => { setVi(idx); setI(0); };

  const copyCaption = async () => {
    if (!caption) return;
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) { console.error('[cardnews:copy]', err); }
  };
  /** 릴스 mp4 렌더 명령 — 덱 id를 넣어주므로 덱이 늘어도 수정이 필요 없다 */
  const [cmdCopied, setCmdCopied] = useState(false);
  const renderCmd = `npx remotion render remotion/index.ts reels-${deck.id} remotion-out/${deck.id}-reels.mp4 --concurrency=4`;
  const copyRenderCmd = async () => {
    try {
      await navigator.clipboard.writeText(renderCmd);
      setCmdCopied(true);
      setTimeout(() => setCmdCopied(false), 1600);
    } catch (err) { console.error('[cardnews:copy]', err); }
  };

  /** 내보내기용 원본 노드 refs */
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

  const prev = () => setI((v) => (v - 1 + total) % total);
  const next = () => setI((v) => (v + 1) % total);

  // 키보드 네비 — total이 variant 전환으로 바뀌면 재바인딩
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { if (!isReels) setI((v) => (v - 1 + total) % total); }
      else if (e.key === 'ArrowRight') { if (!isReels) setI((v) => (v + 1) % total); }
      else if (e.key === 'Escape') { if (zoomed) setZoomed(false); else useShellStore.getState().backToGallery(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total, zoomed, isReels]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); }
    catch (err) { console.error('[cardnews:export]', err); }
    finally { setBusy(false); }
  };
  // variant 슬라이드 수만큼만 — 이전 variant의 잔여 ref 제외
  const nodes = () => exportRefs.current.slice(0, total).filter(Boolean) as HTMLElement[];

  // 화면 표시 스케일 — 정사각/세로/가로 모두 박스 안에 맞춤
  const scale = Math.min(560 / W, 720 / H);
  const dispW = Math.round(W * scale);
  const dispH = Math.round(H * scale);

  const renderCard = (s: typeof variant.slides[number], idx: number, refCb?: (el: HTMLDivElement | null) => void) =>
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
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1"
          title={isMacro ? '슬라이드는 영어 고정 · 토글은 게시 본문·제목 언어' : undefined}>
          {langs.map((l) => (
            <button key={l.id} onClick={() => setProjectLang(deck.project, l.id)}
              className={`rounded-lg px-2.5 py-1.5 text-[12px] font-medium ${l.id === lang ? 'bg-violet-500/20 text-violet-200' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {l.flag} {l.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 플랫폼 토글 (멀티 variant일 때만) */}
      {multi && (
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {variants.map((v, idx) => (
            <button key={v.id} onClick={() => selectVariant(idx)}
              className={`rounded-lg px-4 py-1.5 text-[12px] font-medium ${idx === vi ? 'bg-violet-500/20 text-violet-200' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {v.label}
            </button>
          ))}
        </div>
      )}

      {/* 슬라이드 + 좌우 네비 */}
      <div className="flex flex-1 items-center justify-center gap-5">
        {isReels && timing && totalFrames > 0 ? (
          <div style={{ width: dispW, height: dispH, overflow: 'hidden', borderRadius: 16, boxShadow: '0 24px 70px rgba(0,0,0,.55)' }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: W, height: H }}>
              <ReelsFrame slides={variant.slides} timing={timing} frame={rf} meta={macroMeta} />
            </div>
          </div>
        ) : (
          <>
            <button onClick={prev} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-zinc-200 hover:bg-white/[0.14]"><ChevronLeft className="h-7 w-7" /></button>
            <button type="button" onClick={() => setZoomed(true)} title="클릭하면 확대"
              className="group relative block cursor-zoom-in"
              style={{ width: dispW, height: dispH, overflow: 'hidden', borderRadius: isMacro ? 16 : 6, boxShadow: '0 24px 70px rgba(0,0,0,.55)' }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: W, height: H }}>
                {renderCard(variant.slides[i], i)}
              </div>
              <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                <ZoomIn className="h-5 w-5" />
              </span>
            </button>
            <button onClick={next} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-zinc-200 hover:bg-white/[0.14]"><ChevronRight className="h-7 w-7" /></button>
          </>
        )}
      </div>

      {/* 하단 컨트롤 */}
      <div className="flex w-full items-center justify-center gap-3 px-6 py-5">
        {!isReels && (
          <>
            <span className="font-mono text-[12px] tabular-nums text-zinc-500">{i + 1} / {total}</span>
            <button disabled={busy} onClick={() => run(() => exportSlidePng(nodes()[i], exportId, fileLang, i, dims))}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/25 disabled:opacity-50">
              <Download className="h-4 w-4" /> 이 슬라이드 PNG
            </button>
            <button disabled={busy} onClick={() => run(() => exportAllPng(nodes(), exportId, fileLang, dims))}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/25 disabled:opacity-50">
              <Images className="h-4 w-4" /> 전체 PNG (ZIP)
            </button>
            <button disabled={busy} onClick={() => run(() => exportPdf(nodes(), exportId, fileLang, dims))}
              className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-200 hover:bg-violet-500/20 disabled:opacity-50">
              <FileDown className="h-4 w-4" /> PDF
            </button>
          </>
        )}
        {isReels && totalFrames > 0 && (
          <>
            <span className="font-mono text-[12px] tabular-nums text-zinc-500">
              {(totalFrames / REELS_FPS).toFixed(1)}s · {W}×{H} · {REELS_FPS}fps
            </span>
            {/* Studio의 Render 버튼으로 브라우저에서 바로 mp4 다운로드 (dev는 npm run studio 필요) */}
            <a href={reelsStudioUrl(deck.id)} target="_blank" rel="noreferrer"
              title="Remotion Studio에서 Render 버튼으로 mp4를 바로 다운로드 (dev: npm run studio 실행 필요)"
              className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-200 hover:bg-violet-500/20">
              <Film className="h-4 w-4" /> Studio에서 열기
            </a>
            <button onClick={copyRenderCmd}
              title="CLI로 렌더 — 검증된 안정 경로. remotion-out/에 저장된다"
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${cmdCopied ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 text-zinc-300 hover:border-white/25'}`}>
              {cmdCopied ? <><Check className="h-4 w-4" /> 복사됨</> : <><FileDown className="h-4 w-4" /> CLI 렌더 명령 복사</>}
            </button>
          </>
        )}
        {caption && (
          <button onClick={() => setShowCaption((v) => !v)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${showCaption ? 'border-white/30 bg-white/[0.06] text-zinc-100' : 'border-white/10 text-zinc-300 hover:border-white/25'}`}>
            <FileText className="h-4 w-4" /> 게시 본문
          </button>
        )}
      </div>

      {/* 게시 본문 패널 — 확인 + 복사 */}
      {caption && showCaption && (
        <div className="absolute right-4 top-20 bottom-24 z-20 flex w-[400px] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0c0e13]/95 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-medium text-zinc-200">{captionTitle}</span>
            <div className="flex items-center gap-2">
              <button onClick={copyCaption}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium ${copied ? 'bg-emerald-500/20 text-emerald-300' : 'bg-violet-500/20 text-violet-200 hover:bg-violet-500/30'}`}>
                {copied ? <><Check className="h-3.5 w-3.5" /> 복사됨</> : <><Copy className="h-3.5 w-3.5" /> 복사</>}
              </button>
              <button onClick={() => setShowCaption(false)} className="rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"><X className="h-4 w-4" /></button>
            </div>
          </div>
          <pre className="flex-1 overflow-auto whitespace-pre-wrap px-4 py-3 text-[13px] leading-relaxed text-zinc-300" style={{ fontFamily: 'inherit' }}>{caption}</pre>
        </div>
      )}

      {/* 확대 오버레이 — 뷰포트에 꽉 차게. 아무 곳 클릭 또는 ESC로 닫기 */}
      {zoomed && (
        <div onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 backdrop-blur-sm">
          <div style={{ width: Math.round(W * zoomScale), height: Math.round(H * zoomScale), overflow: 'hidden', borderRadius: isMacro ? 16 : 6, boxShadow: '0 30px 90px rgba(0,0,0,.6)' }}>
            <div style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top left', width: W, height: H }}>
              {renderCard(variant.slides[i], i)}
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setZoomed(false); }}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-zinc-200 hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* 내보내기용 원본(화면 밖) — variant 전환 시 해당 슬라이드로 재렌더.
          릴스는 PNG/PDF 대상이 아니라 렌더하지 않는다(슬라이드 7장 상시 마운트 비용 회피) */}
      {!isReels && (
        <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden>
          {variant.slides.map((s, idx) => (
            <div key={`${variant.id}-${idx}`}>{renderCard(s, idx, (el) => { exportRefs.current[idx] = el; })}</div>
          ))}
        </div>
      )}
    </div>
  );
}
