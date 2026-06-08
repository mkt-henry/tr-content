import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { FeatureDefinition, DemoVariant } from '../registry/types';
import { useShellStore } from '../store/shellStore';
import { usePlayback } from '../engine/usePlayback';
import { usePlaybackStore } from '../engine/playbackStore';
import { Background } from './Background';
import { BrowserChrome } from './BrowserChrome';
import { ControlBar } from './ControlBar';
import { FakeCursor } from './FakeCursor';
import { toggleFullscreen } from '../lib/fullscreen';
import { cn } from '../lib/cn';

/** 시연 무대: 배경 → 디바이스/브라우저 프레임 → 데모 → 컨트롤 바 → 가짜 커서 */
export function Stage({ feature, variant }: { feature: FeatureDefinition; variant: DemoVariant }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { device, phoneFrame, browserChrome } = useShellStore();
  const projectLang = useShellStore((s) => s.projectLang);
  const { play, stop } = usePlayback();
  const status = usePlaybackStore((s) => s.status);
  // 언어 전환도 변형 전환처럼 정지+리셋 트리거 (문자열 객체라 JSON으로 비교)
  const langKey = JSON.stringify(projectLang);

  const handlePlay = useCallback(() => {
    void play(variant.scenario, feature.resetState);
  }, [play, variant, feature]);

  const handleReset = useCallback(() => {
    stop();
    feature.resetState();
  }, [stop, feature]);

  // 변형/디바이스/언어 전환 시 정지 + 리셋
  useEffect(() => {
    stop();
    feature.resetState();
  }, [variant.id, device, langKey, stop, feature]);

  // 키보드 단축키 (입력 필드 포커스 시 무시)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable) return;
      const shell = useShellStore.getState();
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (usePlaybackStore.getState().status === 'playing') stop();
          else handlePlay();
          break;
        case 'r':
        case 'R':
          handleReset();
          break;
        case 'f':
        case 'F':
          if (stageRef.current) toggleFullscreen(stageRef.current);
          break;
        case 'd':
        case 'D':
          shell.toggleDevice();
          break;
        case 'b':
        case 'B':
          shell.toggleBrowserChrome();
          break;
        case 'p':
        case 'P':
          if (shell.device === 'mobile') shell.togglePhoneFrame();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePlay, handleReset, stop]);

  // 재생 중 사용자가 데모를 직접 조작하면 자동 재생 중단 → 그 상태 그대로 수동 전환
  const intervene = useCallback(() => {
    if (usePlaybackStore.getState().status === 'playing') stop();
  }, [stop]);

  const Comp = device === 'mobile' && feature.Mobile ? feature.Mobile : feature.Desktop;
  const url = variant.url ?? 'treasurer.co.kr/demo';

  return (
    <div ref={stageRef} className="relative h-full w-full overflow-hidden bg-ink-950">
      <Background bg={variant.background} />

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {device === 'desktop' ? (
          <motion.div
            key={`desktop-${variant.id}`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col overflow-hidden rounded-2xl bg-[#131216] ring-1 ring-white/10 shadow-[0_50px_140px_-20px_rgba(0,0,0,0.85)]"
            style={{ width: 'min(88vw, 138vh)', aspectRatio: '16 / 9.8' }}
            onPointerDownCapture={intervene}
          >
            {browserChrome && <BrowserChrome url={url} device="desktop" />}
            <div className="relative min-h-0 flex-1">
              <Comp device="desktop" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`mobile-${variant.id}-${phoneFrame}`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative',
              phoneFrame &&
                'rounded-[3rem] bg-[#0c0b0e] p-[10px] ring-1 ring-white/15 shadow-[0_50px_140px_-20px_rgba(0,0,0,0.85)]',
            )}
            onPointerDownCapture={intervene}
          >
            {phoneFrame && (
              <div className="absolute left-1/2 top-[22px] z-30 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/[0.06]" />
            )}
            <div
              className={cn(
                'relative flex flex-col overflow-hidden bg-[#131216]',
                phoneFrame
                  ? 'rounded-[2.45rem]'
                  : 'rounded-2xl ring-1 ring-white/10 shadow-[0_50px_140px_-20px_rgba(0,0,0,0.85)]',
              )}
              style={{ height: 'min(82vh, 780px)', aspectRatio: '9 / 19.2' }}
            >
              {/* 모바일은 네이티브 앱 화면이므로 주소창(BrowserChrome) 비표시 */}
              <div className="relative min-h-0 flex-1">
                <Comp device="mobile" />
              </div>
              {phoneFrame && (
                <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-white/30" />
              )}
            </div>
          </motion.div>
        )}
      </div>

      <ControlBar
        feature={feature}
        variant={variant}
        status={status}
        onPlay={handlePlay}
        onStop={stop}
        onReset={handleReset}
        onFullscreen={() => stageRef.current && toggleFullscreen(stageRef.current)}
      />

      <FakeCursor />
    </div>
  );
}
