/** 브라우저가 화면 캡처 + MediaRecorder를 지원하는가 */
export function recordingSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function' &&
    typeof MediaRecorder !== 'undefined'
  );
}

/** 화면/탭 캡처 스트림 요청 — 사용자가 취소/거부하면 null */
export async function requestDisplayStream(): Promise<MediaStream | null> {
  try {
    // preferCurrentTab은 Chromium 전용으로 lib.dom 타입에 없다.
    // 객체 리터럴이 아닌 변수로 전달하면 초과 프로퍼티 검사를 피하면서 구조적으로 호환된다.
    // 소스 해상도를 최대한 크게(ideal) 요청해 캔버스 크롭 시 업스케일(뿌옇게)을 피한다.
    const opts = {
      video: {
        frameRate: { ideal: 60, max: 60 },
        width: { ideal: 2560 },
        height: { ideal: 1440 },
      },
      audio: false,
      preferCurrentTab: true,
    };
    return await navigator.mediaDevices.getDisplayMedia(opts);
  } catch {
    return null;
  }
}

/** 지원되는 webm 코덱 선택 (vp9 → vp8 → webm) */
export function pickMimeType(): string {
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? 'video/webm';
}

/** Blob을 파일로 다운로드 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 캡처 스트림을 목표 비율 캔버스로 변환해 새 스트림으로 반환한다.
 * - fit 'cover'(기본): 목표 비율로 중앙 크롭 — 캔버스를 꽉 채우되 가장자리를 잘라낸다.
 * - fit 'contain': 소스 전체를 목표 비율 안에 맞춰 넣고 남는 영역은 background로 채운다(레터박스/여백).
 * stop()으로 rAF·video를 정리한다(원본 source 트랙 정지는 호출자가 담당).
 */
export function cropToAspect(
  source: MediaStream,
  targetW: number,
  targetH: number,
  opts: { fit?: 'cover' | 'contain'; background?: string } = {},
): { stream: MediaStream; stop: () => void } {
  const fit = opts.fit ?? 'cover';
  const background = opts.background ?? '#000000';
  const video = document.createElement('video');
  video.srcObject = source;
  video.muted = true;
  video.playsInline = true;
  void video.play();

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 리샘플링 시 선명도 유지 — 기본값('low')은 축소/확대에서 뭉개진다.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }
  const targetAspect = targetW / targetH;

  let raf = 0;
  const draw = () => {
    raf = requestAnimationFrame(draw);
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!ctx || vw === 0 || vh === 0) return; // 메타데이터 미수신 프레임 스킵
    const srcAspect = vw / vh;

    if (fit === 'contain') {
      // 소스 전체를 캔버스 안에 맞춰 넣고(축소), 남는 여백은 background로 채운다
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, targetW, targetH);
      let dw: number;
      let dh: number;
      if (srcAspect > targetAspect) {
        // 소스가 더 넓음 → 너비 맞추고 상하 여백
        dw = targetW;
        dh = dw / srcAspect;
      } else {
        // 소스가 더 좁음 → 높이 맞추고 좌우 여백
        dh = targetH;
        dw = dh * srcAspect;
      }
      const dx = (targetW - dw) / 2;
      const dy = (targetH - dh) / 2;
      ctx.drawImage(video, 0, 0, vw, vh, dx, dy, dw, dh);
      return;
    }

    // cover: 목표 비율로 중앙 크롭
    let sw: number;
    let sh: number;
    let sx: number;
    let sy: number;
    if (srcAspect > targetAspect) {
      // 소스가 더 넓음 → 높이 맞추고 좌우 크롭
      sh = vh;
      sw = sh * targetAspect;
      sx = (vw - sw) / 2;
      sy = 0;
    } else {
      // 소스가 더 좁음 → 너비 맞추고 상하 크롭
      sw = vw;
      sh = sw / targetAspect;
      sx = 0;
      sy = (vh - sh) / 2;
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);
  };
  raf = requestAnimationFrame(draw);

  const stream = canvas.captureStream(60);
  const stop = () => {
    cancelAnimationFrame(raf);
    video.pause();
    video.srcObject = null;
  };
  return { stream, stop };
}
