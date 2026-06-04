import { useShellStore } from './store/shellStore';
import { getFeature } from './registry';
import { Gallery } from './shell/Gallery';
import { Stage } from './shell/Stage';

export default function App() {
  const featureId = useShellStore((s) => s.featureId);
  const variantId = useShellStore((s) => s.variantId);

  const feature = featureId ? getFeature(featureId) : undefined;
  const variant = feature ? (feature.variants.find((v) => v.id === variantId) ?? feature.variants[0]) : undefined;

  return (
    <div className="h-full w-full">
      {feature && variant ? <Stage feature={feature} variant={variant} /> : <Gallery />}
    </div>
  );
}
