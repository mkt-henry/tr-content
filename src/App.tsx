import { useShellStore } from './store/shellStore';
import { getFeature } from './registry';
import { getDeck } from './cardnews/registry';
import { Gallery } from './shell/Gallery';
import { Stage } from './shell/Stage';
import { StudioLite } from './shell/StudioLite';
import { CardNewsViewer } from './shell/cardnews/CardNewsViewer';

export default function App() {
  const featureId = useShellStore((s) => s.featureId);
  const variantId = useShellStore((s) => s.variantId);
  const cardnewsId = useShellStore((s) => s.cardnewsId);
  const studioOpen = useShellStore((s) => s.studioOpen);

  const feature = featureId ? getFeature(featureId) : undefined;
  const variant = feature ? (feature.variants.find((v) => v.id === variantId) ?? feature.variants[0]) : undefined;
  const deck = cardnewsId ? getDeck(cardnewsId) : undefined;

  return (
    <div className="h-full w-full">
      {deck ? (
        <CardNewsViewer deck={deck} />
      ) : feature && variant ? (
        <Stage feature={feature} variant={variant} />
      ) : (
        <Gallery />
      )}

      {/* Studio는 기존 화면을 "덮는" 오버레이다. 아래 화면을 언마운트하면 보던 데모가 리셋되므로
          (검수 중 영상만 확인하고 돌아오는 흐름이 끊긴다) 그대로 마운트한 채 위에 얹는다.
          Studio는 별도 realm의 iframe이라 아래 앱의 전역 상태를 오염시키지 않는다. */}
      {studioOpen && (
        <div className="fixed inset-0 z-[200]">
          <StudioLite />
        </div>
      )}
    </div>
  );
}
