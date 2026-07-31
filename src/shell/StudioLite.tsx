import { useShellStore } from '../store/shellStore';
import { studioEmbedSrc } from '../../remotion/studio';
import type { Lang } from '../demos/findle/_shared/i18n';

/**
 * 인앱 Remotion Studio — iframe realm 격리.
 * 별도 JS realm(dev :3010 / prod /studio 번들)의 Studio를 임베드하므로, 프레임 결정론 DemoVideo가
 * 부모 앱의 전역 store(shell/playback/데모 상태)를 절대 오염시키지 않는다. 진입 시 현재 보던
 * 데모/언어로 딥링크한다. 데모 목록·언어 전환·스크럽은 iframe 안 Studio가 제공한다.
 */
export function StudioLite() {
  const closeStudio = useShellStore((s) => s.closeStudio);
  const featureId = useShellStore((s) => s.featureId);
  const lang = (useShellStore((s) => s.projectLang.findle) ?? 'ko') as Lang;

  const src = studioEmbedSrc(featureId, lang);

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
          href={src}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-[12px] font-medium text-white/40 transition-colors hover:text-white/70"
          title="새 탭에서 열기"
        >
          새 탭 ↗
        </a>
      </div>
      <iframe title="Remotion Studio" src={src} className="min-h-0 flex-1 border-0" allow="fullscreen" />
    </div>
  );
}
