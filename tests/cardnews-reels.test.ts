import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reelsTiming, slideAtFrame, REELS_FPS } from '../src/cardnews/reels.ts';
import type { AnySlide } from '../src/cardnews/types.ts';

/** 타이밍은 slide.type만 본다 — 최소 픽스처로 충분하다 */
const s = (type: string) => ({ type }) as unknown as AnySlide;
const DECK7 = [
  s('m-cover'), s('m-call'), s('m-narrative'), s('m-data'),
  s('m-tensions'), s('m-plan'), s('m-cta'),
];

test('7장 macro 덱은 29초(870프레임)이다', () => {
  const t = reelsTiming(DECK7);
  assert.equal(REELS_FPS, 30);
  assert.deepEqual(t.frames, [90, 120, 150, 150, 150, 120, 90]);
  assert.deepEqual(t.offsets, [0, 90, 210, 360, 510, 660, 780]);
  assert.equal(t.totalFrames, 870);
});

test('seconds로 슬라이드별 노출 시간을 덮어쓴다', () => {
  const t = reelsTiming(DECK7, [2, 2, 2, 2, 2, 2, 2]);
  assert.deepEqual(t.frames, [60, 60, 60, 60, 60, 60, 60]);
  assert.equal(t.totalFrames, 420);
});

test('seconds 길이가 짧으면 나머지는 타입별 기본값을 쓴다', () => {
  const t = reelsTiming(DECK7, [2]);
  assert.equal(t.frames[0], 60);
  assert.equal(t.frames[1], 120); // m-call 기본 4초
  assert.equal(t.totalFrames, 870 - 90 + 60);
});

test('미등록 슬라이드 타입은 4초로 폴백한다', () => {
  const t = reelsTiming([s('cover')]); // research 테마 타입
  assert.deepEqual(t.frames, [120]);
});

test('slideAtFrame은 경계 프레임에서 정확히 넘어간다', () => {
  const t = reelsTiming(DECK7);
  assert.deepEqual(slideAtFrame(t, 0), { index: 0, local: 0 });
  assert.deepEqual(slideAtFrame(t, 89), { index: 0, local: 89 });
  assert.deepEqual(slideAtFrame(t, 90), { index: 1, local: 0 });
  assert.deepEqual(slideAtFrame(t, 869), { index: 6, local: 89 });
});

test('slideAtFrame은 범위를 벗어난 프레임을 clamp한다', () => {
  const t = reelsTiming(DECK7);
  assert.deepEqual(slideAtFrame(t, -5), { index: 0, local: 0 });
  assert.deepEqual(slideAtFrame(t, 99999), { index: 6, local: 89 });
});

test('빈 슬라이드 배열은 totalFrames 0이고 index -1을 준다', () => {
  const t = reelsTiming([]);
  assert.equal(t.totalFrames, 0);
  assert.deepEqual(slideAtFrame(t, 0), { index: -1, local: 0 });
});
