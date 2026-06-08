import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { FeatureDefinition, DemoVariant } from '../registry/types';
import { useShellStore } from '../store/shellStore';
import { usePlayback } from '../engine/usePlayback';
import { usePlaybackStore } from '../engine/playbackStore';
import { Background } from './Background';
import { BrowserChrome } from './BrowserChrome';
import { ControlBar } from './ControlBar';
import { FakeCursor } from './FakeCursor';
import { toggleFullscreen } from '../lib/fullscreen';
import { useRecorder } from './useRecorder';
import { cn } from '../lib/cn';
import { getProjectIdOfFeature, getProject } from '../registry';
import { getBranding } from '../branding';
import { BrandOverlay } from './BrandOverlay';

/** 시연 무대: 배경 → 디바이스/브라우저 프레임 → 데모 → 컨트롤 바 → 가짜 커서 */
export function Stage({ feature, variant }: { feature: FeatureDefinition; variant: DemoVariant }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { device: rawDevice, phoneFrame, browserChrome } = useShellStore();
  const projectLang = useShellStore((s) => s.projectLang);
  const { play, stop } = usePlayback();
  const status = usePlaybackStore((s) => s.status);
  const includeBranding = useShellStore((s) => s.includeBranding);
  const projectId = getProjectIdOfFeature(feature.id);
  const branding = getBranding(projectId);
  const mobileOnly = !!(projectId && getProject(projectId)?.mobileOnly);
  const device = mobileOnly ? 'mobile' : rawDevice;
  const { recording, countdown, supported: canRecord, recordSequence } = useRecorder();
  const lang = projectId ? projectLang[projectId] : undefined;
  const recFilename = [projectId, variant.id, lang].filter(Boolean).join('-') + '.webm';

  // 인트로/아웃트로 시퀀스 상태
  const [seqPhase, setSeqPhase] = useState<'intro' | 'outro' | null>(null);
  const phaseResolve = useRef<(() => void) | null>(null);
  const runningRef = useRef(false);
  const runIdRef = useRef(0);

  /** seqPhase를 설정하고 BrandOverlay onDone에서 resolve되는 Promise */
  const phase = useCallback(
    (p: 'intro' | 'outro') =>
      new Promise<void>((resolve) => {
        phaseResolve.current = resolve;
        setSeqPhase(p);
      }),
    [],
  );

  const onPhaseDone = useCallback(() => {
    setSeqPhase(null);
    const r = phaseResolve.current;
    phaseResolve.current = null;
    r?.();
  }, []);

  /** 진행 중 시퀀스 취소 — pending phase resolver 정리 + 오버레이 제거 */
  const cancelSequence = useCallback(() => {
    runIdRef.current++;          // 진행 중 체인 무효화 (stale continuation 차단)
    runningRef.current = false;
    if (phaseResolve.current) {
      const r = phaseResolve.current;
      phaseResolve.current = null;
      r();
    }
    setSeqPhase(null);
  }, []);
  // 언어 전환도 변형 전환처럼 정지+리셋 트리거 (문자열 객체라 JSON으로 비교)
  const langKey = JSON.stringify(projectLang);

  const handlePlay = useCallback(async () => {
    if (runningRef.current) return; // 시퀀스 진행 중 재진입 방지
    runningRef.current = true;
    const myId = ++runIdRef.current; // 이 체인의 세대
    const useBranding = includeBranding && !!branding;
    try {
      if (useBranding && branding) {
        await phase('intro');
        if (runIdRef.current !== myId) return; // 취소/재시작됨
      }
      await play(variant.scenario, feature.resetState);
      if (runIdRef.current !== myId) return; // 데모 중 취소됨
      if (useBranding && branding) {
        await phase('outro');
      }
    } finally {
      if (runIdRef.current === myId) runningRef.current = false; // 내 세대일 때만 해제
    }
  }, [play, variant, feature, includeBranding, branding, phase]);

  const handleStop = useCallback(() => {
    cancelSequence();
    stop();
  }, [cancelSequence, stop]);

  const handleReset = useCallback(() => {
    cancelSequence();
    stop();
    feature.resetState();
  }, [cancelSequence, stop, feature]);

  const handleRecord = useCallback(() => {
    if (runningRef.current) return; // 진행 중 시퀀스가 있으면 빈 녹화 방지
    void recordSequence({
      stageEl: stageRef.current,
      filename: recFilename,
      runSequence: () => handlePlay(),
    });
  }, [recordSequence, recFilename, handlePlay]);

  // 변형/디바이스/언어 전환 시 정지 + 리셋
  useEffect(() => {
    cancelSequence();
    stop();
    feature.resetState();
  }, [variant.id, device, langKey, cancelSequence, stop, feature]);

  // 키보드 단축키 (입력 필드 포커스 시 무시)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable) return;
      const shell = useShellStore.getState();
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (runningRef.current || usePlaybackStore.getState().status === 'playing') handleStop();
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
          if (!mobileOnly) shell.toggleDevice();
          break;
        case 'b':
        case 'B':
          shell.toggleBrowserChrome();
          break;
        case 'p':
        case 'P':
          if (mobileOnly || shell.device === 'mobile') shell.togglePhoneFrame();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePlay, handleReset, handleStop, mobileOnly]);

  // 언마운트 시 진행 중 시퀀스 정리
  useEffect(() => () => cancelSequence(), [cancelSequence]);

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

      {!recording && (
        <ControlBar
          feature={feature}
          variant={variant}
          status={status}
          onPlay={handlePlay}
          onStop={handleStop}
          onReset={handleReset}
          onFullscreen={() => stageRef.current && toggleFullscreen(stageRef.current)}
          onRecord={handleRecord}
          canRecord={canRecord}
        />
      )}

      <AnimatePresence>
        {seqPhase && branding && (
          <BrandOverlay
            key={seqPhase}
            Phase={seqPhase === 'intro' ? branding.Intro : branding.Outro}
            durationMs={seqPhase === 'intro' ? branding.introMs : branding.outroMs}
            onDone={onPhaseDone}
            portrait={device === 'mobile'}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            key="rec-countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/70"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[120px] font-bold tabular-nums text-white"
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <FakeCursor />
    </div>
  );
}
