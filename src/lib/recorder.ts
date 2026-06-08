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
    const opts = { video: { frameRate: 30 }, audio: false, preferCurrentTab: true };
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
