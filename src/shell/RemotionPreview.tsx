import { DemoPlayer } from './DemoPlayer';

/**
 * 앱 내 Remotion 미리보기 모달 — daily-quiz 영상을 재생/스크럽한다. 렌더/다운로드 없이
 * tr-content 안에서 최종 결과와 동일한 구도를 확인. 앱의 현재 언어 토글을 그대로 따른다.
 */
export function RemotionPreview({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full max-w-[1120px]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] font-semibold tracking-wide text-white/70">
            Remotion 미리보기 · daily-quiz (프레임 기반)
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 px-3 py-1 text-[13px] font-medium text-white transition-colors hover:bg-white/20"
          >
            닫기 ✕
          </button>
        </div>
        <div className="overflow-hidden rounded-xl ring-1 ring-white/15 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
          <DemoPlayer />
        </div>
        <p className="mt-2 text-center text-[11.5px] text-white/40">
          브라우저 실시간 재생 — 최종 mp4와 동일한 프레임 기반 타이밍. 스페이스바 재생/일시정지, 타임라인 드래그로 스크럽.
        </p>
      </div>
    </div>
  );
}
