/**
 * 재생 중 자동 스크롤 추적.
 *
 * 일부 데모는 자동 재생 중 콘텐츠가 아래로 계속 늘어난다(스트리밍 카드, 누적 리스트 등).
 * 이런 패널에 `demo-scroll-follow` 클래스를 붙이면, 재생 동안 새 콘텐츠를 따라
 * 하단에 고정해 화면 밖으로 사라지지 않게 한다.
 *
 * 수동 모드(재생 종료 후)에서는 동작하지 않으므로 자유 탐색을 방해하지 않는다.
 * 사용자가 재생 중 직접 스크롤하면 Stage가 재생을 멈추므로(intervene) 충돌하지 않는다.
 */

/** 하단 근처 판정 임계값(px) — 이 이내면 계속 추적한다 */
const NEAR_BOTTOM = 60;

/** abort될 때까지 `.demo-scroll-follow` 컨테이너를 하단에 고정한다 */
export function startAutoFollow(signal: AbortSignal): void {
  if (typeof window === 'undefined' || signal.aborted) return;

  // 새 재생 시작 시 이전 실행에서 남은 수동 스크롤 양보 플래그를 초기화
  document
    .querySelectorAll<HTMLElement>('.demo-scroll-follow[data-follow-pause]')
    .forEach((el) => delete el.dataset.followPause);

  // 컨테이너별 "추적 중" 여부 — 기본 true(시작 시 하단 근처로 간주)
  const following = new WeakMap<HTMLElement, boolean>();
  let raf = 0;

  const tick = () => {
    if (signal.aborted) return;
    const els = document.querySelectorAll<HTMLElement>('.demo-scroll-follow');
    els.forEach((el) => {
      // 시나리오의 수동 검토 스크롤 중에는 추적을 양보한다
      if (el.dataset.followPause === '1') return;
      const overflow = el.scrollHeight - el.clientHeight;
      if (overflow <= 4) {
        // 콘텐츠가 화면에 다 들어오면 추적 대기 상태로 리셋
        following.set(el, true);
        return;
      }
      const wasFollowing = following.get(el) ?? true;
      if (wasFollowing) el.scrollTop = el.scrollHeight;
      const gap = el.scrollHeight - el.clientHeight - el.scrollTop;
      following.set(el, gap <= NEAR_BOTTOM);
    });
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  signal.addEventListener('abort', () => cancelAnimationFrame(raf), { once: true });
}
