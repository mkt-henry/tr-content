/**
 * 카메라 줌 지오메트리 — 엔진(가짜 커서)과 Camera 컴포넌트가 공유한다.
 *
 * 핵심: 줌은 대상 요소의 중심을 transform-origin으로 두고 scale만 적용한다(translate 없음).
 * 따라서 대상 중심은 줌 배율과 무관하게 "본래(scale 1) 화면 위치"에 고정된다.
 * 커서는 이 본래 위치를 가리키면 어떤 줌 상태에서도 대상에 정확히 맞는다.
 */

/** Camera 레이어 식별용 data 속성 (querySelector 마커) */
export const CAMERA_LAYER_ATTR = 'data-camera-layer';

/** 활성 줌 배율 — Camera와 엔진(가짜 커서)이 공유한다 */
export const CAMERA_ZOOM = 1.6;

/**
 * 요소 el의 중심을 layer(카메라 레이어) 로컬 좌표로 계산한다.
 * offsetLeft/Top(레이아웃 좌표) 누적이라 현재 transform(scale)에 영향받지 않는다.
 * 중간 스크롤 컨테이너의 scroll은 보정한다.
 */
export function localCenter(el: HTMLElement, layer: HTMLElement): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== layer) {
    x += node.offsetLeft;
    y += node.offsetTop;
    const op = node.offsetParent as HTMLElement | null;
    let a: HTMLElement | null = node.parentElement;
    while (a && a !== op && a !== layer) {
      x -= a.scrollLeft;
      y -= a.scrollTop;
      a = a.parentElement;
    }
    node = op;
  }
  return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
}

/**
 * 요소의 좌상단·크기를 root(조상) 로컬 좌표로 계산한다 — offset 체인 기반이라
 * CSS transform(Remotion 프리뷰 축소 scale, 카메라 zoom)에 영향받지 않는다.
 * root는 el의 offsetParent 체인 상의 조상이어야 한다(보통 컴포지션 루트 div).
 * position:fixed 오버레이가 축소된 컴포지션 래퍼 기준으로 배치될 때, 그 래퍼 원본 좌표계와
 * 일치하는 값을 준다 → 프리뷰 배율과 무관하게 정렬 유지.
 */
export function localRect(
  el: HTMLElement,
  root: HTMLElement,
): { left: number; top: number; width: number; height: number } {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    const op = node.offsetParent as HTMLElement | null;
    let a: HTMLElement | null = node.parentElement;
    while (a && a !== op && a !== root) {
      x -= a.scrollLeft;
      y -= a.scrollTop;
      a = a.parentElement;
    }
    node = op;
  }
  return { left: x, top: y, width: el.offsetWidth, height: el.offsetHeight };
}

/**
 * 요소의 "본래(scale 1) 뷰포트 중심"을 구한다 — 현재 카메라 줌 상태와 무관.
 * 카메라 레이어가 없으면(줌 비대상) null.
 *
 * 카메라 레이어는 부모(transform 없는 컨테이너)를 꽉 채우므로,
 * 레이어 본래 좌상단 = 부모 content 좌상단 = 부모 getBoundingClientRect(부모는 변형되지 않음).
 */
export function cameraNaturalCenter(el: HTMLElement): { x: number; y: number } | null {
  const layer = el.closest<HTMLElement>(`[${CAMERA_LAYER_ATTR}]`);
  const parent = layer?.parentElement;
  if (!layer || !parent) return null;
  const pr = parent.getBoundingClientRect();
  const c = localCenter(el, layer);
  return { x: pr.left + c.x, y: pr.top + c.y };
}

/**
 * el의 중심이 "origin을 transform-origin으로 scale=zoom 줌인"한 상태에서 갖는 화면 좌표.
 * 줌 원점(origin)을 한 곳에 고정한 채 가짜 커서를 다른 요소(el)로 정확히 보낼 때 쓴다
 * — 화면(카메라)은 정지시키고 커서만 움직이는 연출용. 카메라 레이어 없으면 null.
 *
 * 변환: screen_local(P) = O + (P - O)·zoom (O=origin 중심, layer-local). 줌이 settle된
 * 정지 구간에서 정확하고, scale 애니메이션 중에는 약간의 과도 오차가 있으나 곧 수렴한다.
 */
export function cameraZoomedCenter(
  el: HTMLElement,
  origin: HTMLElement,
  zoom: number,
): { x: number; y: number } | null {
  const layer = el.closest<HTMLElement>(`[${CAMERA_LAYER_ATTR}]`);
  const parent = layer?.parentElement;
  if (!layer || !parent) return null;
  const pr = parent.getBoundingClientRect();
  const e = localCenter(el, layer);
  const o = localCenter(origin, layer);
  return { x: pr.left + o.x + (e.x - o.x) * zoom, y: pr.top + o.y + (e.y - o.y) * zoom };
}
