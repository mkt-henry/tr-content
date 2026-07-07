import { useShellStore } from './store/shellStore';
import { getFeature } from './registry';
import { getDeck } from './cardnews/registry';
import { Gallery } from './shell/Gallery';
import { Stage } from './shell/Stage';
import { StudioView } from './shell/StudioView';
import { CardNewsViewer } from './shell/cardnews/CardNewsViewer';

export default function App() {
  const featureId = useShellStore((s) => s.featureId);
  const variantId = useShellStore((s) => s.variantId);
  const cardnewsId = useShellStore((s) => s.cardnewsId);
  const studioUrl = useShellStore((s) => s.studioUrl);

  const feature = featureId ? getFeature(featureId) : undefined;
  const variant = feature ? (feature.variants.find((v) => v.id === variantId) ?? feature.variants[0]) : undefined;
  const deck = cardnewsId ? getDeck(cardnewsId) : undefined;

  // Studio 오버레이 — 최상위. 닫으면 아래의 갤러리/데모 화면이 그대로 유지된다.
  if (studioUrl) {
    return (
      <div className="h-full w-full">
        <StudioView url={studioUrl} />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {deck ? (
        <CardNewsViewer deck={deck} />
      ) : feature && variant ? (
        <Stage feature={feature} variant={variant} />
      ) : (
        <Gallery />
      )}
    </div>
  );
}
