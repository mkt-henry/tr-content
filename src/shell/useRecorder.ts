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
  /** 캔버스 맞춤 방식 — 'cover'(중앙 크롭) 또는 'contain'(여백 포함). 기본 'cover' */
  fit?: 'cover' | 'contain';
  /** contain 여백 채움 색 (기본 검정) */
  background?: string;
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
    async ({ stageEl, filename, runSequence, targetWidth, targetHeight, fit, background, countdownFrom = 3 }: RecordOpts) => {
      if (busyRef.current || !supported) return;

      // 전체화면과 화면 캡처는 같은 클릭 제스처(user activation)에서 요청해야 둘 다 허용된다.
      // getDisplayMedia를 먼저 await하면 제스처가 소비돼 이후 requestFullscreen이 조용히 실패하고,
      // 그러면 녹화가 낮은 "창" 높이로 잡혀 폰 프레임이 좁아지며 콘텐츠가 잘린다.
      // → 전체화면을 먼저 (동기적으로) 호출하고, getDisplayMedia도 같은 틱에 호출한 뒤 둘 다 await한다.
      const fsPromise = stageEl ? enterFullscreen(stageEl) : Promise.resolve();
      const stream = await requestDisplayStream();
      if (!stream) {
        exitFullscreen(); // 사용자가 취소/거부 → 진입한 전체화면 원복 후 조용히 종료
        return;
      }

      busyRef.current = true;
      setRecording(true);
      const mime = pickMimeType();
      const chunks: Blob[] = [];
      let crop: { stream: MediaStream; stop: () => void } | null = null;
      try {
        await fsPromise; // 전체화면 전환 완료 대기 — 폰이 전체화면 높이로 안정된 뒤 캡처

        // 캡처를 목표 비율로 크롭 — video 메타데이터가 카운트다운 동안 준비됨
        crop = cropToAspect(stream, targetWidth, targetHeight, { fit, background });

        // 카운트다운 — 녹화 시작 전이라 영상에 포함되지 않음
        for (let n = countdownFrom; n >= 1; n--) {
          setCountdown(n);
          await sleep(700);
        }
        setCountdown(null);

        // 비트레이트를 해상도·프레임레이트에 맞춰 넉넉히 지정한다.
        // 미지정 시 브라우저 기본값(~2.5Mbps)으로 텍스트·UI가 뭉개진다.
        // 대략 0.15 bit/pixel·frame 기준 → 1080×1920@60 ≈ 18Mbps.
        const bitsPerPixel = 0.15;
        const fps = 60;
        const videoBitsPerSecond = Math.round(targetWidth * targetHeight * fps * bitsPerPixel);
        const rec = new MediaRecorder(crop.stream, { mimeType: mime, videoBitsPerSecond });
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
