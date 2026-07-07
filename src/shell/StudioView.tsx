import { useShellStore } from '../store/shellStore';

/**
 * tr-content 안에서 Remotion Studio를 iframe으로 띄우는 화면.
 * 상단 바의 "← 목록으로"로 이전 화면(갤러리 또는 데모)으로 돌아간다 — 한 탭 안에서 왕복.
 * Studio(:3000)는 X-Frame-Options/CSP가 없어 임베드 가능.
 */
export function StudioView({ url }: { url: string }) {
  const closeStudio = useShellStore((s) => s.closeStudio);
  return (
    <div className="flex h-full w-full flex-col bg-ink-950">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-ink-900 px-4 py-2.5">
        <button
          onClick={closeStudio}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
        >
          ← 목록으로
        </button>
        <span className="text-[13px] font-medium text-white/60">Remotion Studio</span>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-[12px] font-medium text-white/40 transition-colors hover:text-white/70"
          title="새 탭에서 열기"
        >
          새 탭 ↗
        </a>
      </div>
      <iframe
        title="Remotion Studio"
        src={url}
        className="min-h-0 flex-1 border-0"
        allow="fullscreen"
      />
    </div>
  );
}
