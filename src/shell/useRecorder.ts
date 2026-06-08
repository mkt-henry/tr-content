import { useCallback, useRef, useState } from 'react';
import { cropToAspect, downloadBlob, pickMimeType, recordingSupported, requestDisplayStream } from '../lib/recorder';
import { enterFullscreen, exitFullscreen } from '../lib/fullscreen';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RecordOpts {
  /** 전체화면 대상 (스테이지 루트) */
  stageEl: HTMLElement | null;
  /** 저장 파일명 (확장자 포함) */
  filename: string;
  /** 녹화할 재생 시퀀스 — 완료 시 resolve (Stage의 handlePlay 재사용) */
  runSequence: () => Promise<void>;
  /** 출력 가로 픽셀 (예: 1080 또는 1920) */
  targetWidth: number;
  /** 출력 세로 픽셀 (예: 1920 또는 1080) */
  targetHeight: number;
  /** 녹화 시작 전 카운트다운 숫자 (기본 3) */
  countdownFrom?: number;
}

/**
 * getDisplayMedia + MediaRecorder 녹화 라이프사이클.
 * recordSequence: 스트림 요청 → 전체화면 → 카운트다운(녹화 전, 영상 미포함)
 *   → 녹화 시작 → runSequence 대기 → 정지 → webm 다운로드 → 정리.
 */
export function useRecorder() {
  const supported = recordingSupported();
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const busyRef = useRef(false);

  const recordSequence = useCallback(
    async ({ stageEl, filename, runSequence, targetWidth, targetHeight, countdownFrom = 3 }: RecordOpts) => {
      if (busyRef.current || !supported) return;
      const stream = await requestDisplayStream();
      if (!stream) return; // 사용자가 취소/거부 → 조용히 종료

      busyRef.current = true;
      setRecording(true);
      const mime = pickMimeType();
      const chunks: Blob[] = [];
      let crop: { stream: MediaStream; stop: () => void } | null = null;
      try {
        if (stageEl) await enterFullscreen(stageEl);

        // 캡처를 목표 비율로 크롭 — video 메타데이터가 카운트다운 동안 준비됨
        crop = cropToAspect(stream, targetWidth, targetHeight);

        // 카운트다운 — 녹화 시작 전이라 영상에 포함되지 않음
        for (let n = countdownFrom; n >= 1; n--) {
          setCountdown(n);
          await sleep(700);
        }
        setCountdown(null);

        const rec = new MediaRecorder(crop.stream, { mimeType: mime });
        rec.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        const stopped = new Promise<void>((resolve) => {
          rec.onstop = () => resolve();
        });
        rec.start();

        await runSequence();

        if (rec.state !== 'inactive') rec.stop();
        await stopped;
        downloadBlob(new Blob(chunks, { type: mime }), filename);
      } finally {
        crop?.stop();
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setCountdown(null);
        exitFullscreen();
        busyRef.current = false;
      }
    },
    [supported],
  );

  return { recording, countdown, supported, recordSequence };
}
