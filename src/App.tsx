import { useShellStore } from './store/shellStore';
import { getFeature } from './registry';
import { getDeck } from './cardnews/registry';
import { Gallery } from './shell/Gallery';
import { Stage } from './shell/Stage';
import { CardNewsViewer } from './shell/cardnews/CardNewsViewer';

export default function App() {
  const featureId = useShellStore((s) => s.featureId);
  const variantId = useShellStore((s) => s.variantId);
  const cardnewsId = useShellStore((s) => s.cardnewsId);

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
    </div>
  );
}
