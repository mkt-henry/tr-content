import { useEffect, useState } from 'react';
import { useShellStore } from '../store/shellStore';
import { REMOTION_STUDIO_URL, studioEmbedSrc } from '../../remotion/studio';
import type { Lang } from '../demos/findle/_shared/i18n';

/**
 * 인앱 Remotion Studio — iframe realm 격리.
 * 별도 JS realm(dev :3010 / prod /studio 번들)의 Studio를 임베드하므로, 프레임 결정론 DemoVideo가
 * 부모 앱의 전역 store(shell/playback/데모 상태)를 절대 오염시키지 않는다. 진입 시 현재 보던
 * 데모/언어로 딥링크한다. 데모 목록·언어 전환·스크럽은 iframe 안 Studio가 제공한다.
 *
 * dev에서는 Studio가 별도 프로세스(`npm run studio`)라 앱만 켜면 iframe이 브라우저 오류 화면이 된다.
 * 그 상태를 감지해 무엇을 해야 하는지 안내한다 (prod는 정적 번들이라 항상 있다).
 */
export function StudioLite() {
  const closeStudio = useShellStore((s) => s.closeStudio);
  const featureId = useShellStore((s) => s.featureId);
  const lang = (useShellStore((s) => s.projectLang.findle) ?? 'ko') as Lang;

  const src = studioEmbedSrc(featureId, lang);

  // dev 전용: Studio 서버 생존 확인. no-cors라 응답 내용은 못 읽지만 연결 자체는 판별된다.
  const [devServerUp, setDevServerUp] = useState<boolean | null>(import.meta.env.DEV ? null : true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let alive = true;
    fetch(REMOTION_STUDIO_URL, { mode: 'no-cors' })
      .then(() => alive && setDevServerUp(true))
      .catch(() => alive && setDevServerUp(false));
    return () => {
      alive = false;
    };
  }, [retry]);

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

      {devServerUp === false ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-8">
          <div className="max-w-md">
            <h2 className="text-[17px] font-semibold text-white">영상 서버가 꺼져 있어요</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-white/60">
              로컬에서는 영상 화면이 별도 서버로 돌아갑니다. 터미널을 하나 더 열어 아래를 실행한 뒤
              이 화면을 다시 열어주세요.
            </p>
            <code className="mt-4 block rounded-lg bg-black/50 px-4 py-3 font-mono text-[13px] text-brass-300 ring-1 ring-white/10">
              npm run studio
            </code>
            <button
              onClick={() => {
                setDevServerUp(null);
                setRetry((n) => n + 1);
              }}
              className="mt-4 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
            >
              다시 시도
            </button>
          </div>
        </div>
      ) : devServerUp === null ? (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <span className="text-[13px] text-white/40">영상 서버 확인 중…</span>
        </div>
      ) : (
        <iframe title="Remotion Studio" src={src} className="min-h-0 flex-1 border-0" allow="fullscreen" />
      )}
    </div>
  );
}
