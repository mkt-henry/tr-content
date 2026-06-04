export function toggleFullscreen(el: HTMLElement) {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void el.requestFullscreen();
  }
}
