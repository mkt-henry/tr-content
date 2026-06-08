export function toggleFullscreen(el: HTMLElement) {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void el.requestFullscreen();
  }
}

/** 전체화면 진입 (이미 전체화면이면 no-op). 거부/미지원은 무시하고 진행한다. */
export async function enterFullscreen(el: HTMLElement): Promise<void> {
  if (document.fullscreenElement) return;
  try {
    await el.requestFullscreen();
  } catch {
    /* 사용자가 거부했거나 미지원 — 녹화는 계속 진행 */
  }
}

/** 전체화면 해제 (전체화면이 아니면 no-op) */
export function exitFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen();
}
