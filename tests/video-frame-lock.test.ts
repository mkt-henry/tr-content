import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline, computeFrameState } from '../remotion/timeline.ts';
import { CAMERA_ZOOM } from '../src/lib/cameraGeom.ts';
import type { Scenario } from '../src/engine/types.ts';

/**
 * 영상 프레임 결정론의 핵심: 카메라/커서가 "프레임 F"만으로 정해져야 한다.
 * 그러려면 computeFrameState가 각 프레임에서 (이전 값, 바뀐 프레임, 도착 프레임)을 함께 줘야 한다.
 * 이 값들이 어긋나면 미리보기와 렌더 결과가 다시 갈라진다.
 */

const FPS = 30;

// click 스텝 한 개 = 이동 650ms + 누름 160ms + 놓음 120ms
const MOVE = Math.round((650 / 1000) * FPS); // 20
const PRESS = Math.round((160 / 1000) * FPS); // 5
const RELEASE = Math.round((120 / 1000) * FPS); // 4

const scenario: Scenario = {
  id: 'test',
  steps: [
    { kind: 'click', target: 'a', zoom: true },
    { kind: 'click', target: 'b', zoom: true, zoomScale: 2 },
    { kind: 'wait', ms: 1000 },
    { kind: 'scroll', target: 'list', to: 'bottom', ms: 500 },
  ],
};

const at = (frame: number) => computeFrameState(frame, buildTimeline(scenario, FPS));

test('첫 클릭: 출발점이 없고 이동 구간이 프레임으로 고정된다', () => {
  const s = at(0);
  assert.equal(s.cursorTarget, 'a');
  assert.equal(s.cursorPrevTarget, undefined); // 직전 타깃 없음 → 화면 기본 위치에서 출발
  assert.equal(s.cursorSinceFrame, 0);
  assert.equal(s.cursorMoveEnd, MOVE);
});

test('두 번째 클릭: 이전 타깃과 출발 프레임이 이어진다', () => {
  const step2Start = MOVE + PRESS + RELEASE;
  const s = at(step2Start + 3);
  assert.equal(s.cursorTarget, 'b');
  assert.equal(s.cursorPrevTarget, 'a');
  assert.equal(s.cursorSinceFrame, step2Start);
  assert.equal(s.cursorMoveEnd, step2Start + MOVE);
});

test('줌 배율 보간의 시작값은 직전 실효 배율이다', () => {
  // 첫 줌인: 줌 없음(1) → CAMERA_ZOOM
  const first = at(1);
  assert.equal(first.spotlightId, 'a');
  assert.equal(first.spotlightScale, CAMERA_ZOOM);
  assert.equal(first.spotlightPrevScale, 1);
  assert.equal(first.spotlightPrevId, null);
  assert.equal(first.spotlightSinceFrame, 0);

  // 두 번째 줌: CAMERA_ZOOM → 2 (원점도 a에서 b로 옮겨간다)
  const step2Start = MOVE + PRESS + RELEASE;
  const second = at(step2Start + 1);
  assert.equal(second.spotlightId, 'b');
  assert.equal(second.spotlightScale, 2);
  assert.equal(second.spotlightPrevId, 'a');
  assert.equal(second.spotlightPrevScale, CAMERA_ZOOM);
  assert.equal(second.spotlightSinceFrame, step2Start);
});

test('스크롤 스텝은 줌을 풀고, 그 프레임이 기준점이 된다', () => {
  const scrollStart = 2 * (MOVE + PRESS + RELEASE) + FPS; // 클릭 2개 + wait 1000ms
  const s = at(scrollStart + 2);
  assert.equal(s.spotlightId, null); // keepZoom이 아니므로 해제
  assert.equal(s.spotlightPrevId, 'b');
  assert.equal(s.spotlightPrevScale, 2); // 2배에서 1배로 풀린다
  assert.equal(s.spotlightSinceFrame, scrollStart);
});

test('클릭 펄스는 누름 구간에서만 기준 프레임을 준다', () => {
  const pulseStart = MOVE;
  assert.equal(at(pulseStart - 1).pulseSinceFrame, null);
  assert.equal(at(pulseStart).pulseSinceFrame, pulseStart);
  assert.equal(at(pulseStart).pressed, true);
  assert.equal(at(pulseStart + PRESS).pulseSinceFrame, null);
  assert.equal(at(pulseStart + PRESS).pressed, false);
});

test('같은 프레임을 몇 번 계산해도 같은 값이 나온다 (렌더 순서 무관)', () => {
  const a = at(200);
  const b = at(200);
  const pick = (s: ReturnType<typeof at>) => ({
    cursorTarget: s.cursorTarget,
    cursorPrevTarget: s.cursorPrevTarget,
    cursorSinceFrame: s.cursorSinceFrame,
    cursorMoveEnd: s.cursorMoveEnd,
    spotlightId: s.spotlightId,
    spotlightScale: s.spotlightScale,
    spotlightPrevId: s.spotlightPrevId,
    spotlightPrevScale: s.spotlightPrevScale,
    spotlightSinceFrame: s.spotlightSinceFrame,
    pulseSinceFrame: s.pulseSinceFrame,
    scrolls: s.scrolls,
  });
  assert.deepEqual(pick(a), pick(b));
});
