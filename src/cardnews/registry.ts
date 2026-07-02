import type { CardNewsDeck } from './types';
import { lintDeck } from './budget';

/** src/cardnews/<project>/<slug>/deck.ts 자동 수집 */
const modules = import.meta.glob('./*/*/deck.ts', { eager: true }) as Record<
  string,
  { default: CardNewsDeck }
>;

const decksByProject = new Map<string, CardNewsDeck[]>();
const allDecks: CardNewsDeck[] = [];

for (const mod of Object.values(modules)) {
  const deck = mod.default;
  if (!deck) continue;
  allDecks.push(deck);
  const list = decksByProject.get(deck.project) ?? [];
  list.push(deck);
  decksByProject.set(deck.project, list);
  if (import.meta.env.DEV) {
    for (const w of lintDeck(deck)) console.warn(`[cardnews:${deck.id}] ${w}`);
  }
}

/** date 내림차순(최신순). 동일 날짜는 id 역순으로 안정 정렬 */
function byDateDesc(a: CardNewsDeck, b: CardNewsDeck): number {
  return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
}

for (const list of decksByProject.values()) list.sort(byDateDesc);
allDecks.sort(byDateDesc);

export function getDecksByProject(projectId: string): CardNewsDeck[] {
  return decksByProject.get(projectId) ?? [];
}
export function getDeck(id: string): CardNewsDeck | undefined {
  return allDecks.find((d) => d.id === id);
}
export function hasCardnews(projectId: string): boolean {
  return (decksByProject.get(projectId)?.length ?? 0) > 0;
}
