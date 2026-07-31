import type { CardNewsDeck } from '../src/cardnews/types';
import excessFear from '../src/cardnews/alphalenz/stock-excessfear-2026-07-27/deck';

/**
 * 릴스 렌더 대상 덱 단일 출처.
 * webpack 번들러는 Vite 전용 import.meta.glob(cardnews/registry)을 못 쓰므로 덱을 직접 import한다.
 * 릴스를 추가하려면 이 배열에 한 줄. (findleCompositions.ts와 동일 관례)
 */
export const REELS_DECKS: CardNewsDeck[] = [excessFear];

export function getReelsDeck(id: string): CardNewsDeck {
  const deck = REELS_DECKS.find((d) => d.id === id);
  if (!deck) throw new Error(`[cardnews:reels] 등록되지 않은 덱: ${id}`);
  return deck;
}
