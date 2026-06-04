import type { DemoBackground } from '../registry/types';

/** 데모별 배경 레이어. 그라디언트(기본) 또는 이미지. */
export function Background({ bg }: { bg: DemoBackground }) {
  if (bg.kind === 'image') {
    return (
      <div className="grain absolute inset-0">
        <img src={bg.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
        {bg.overlay && <div className="absolute inset-0" style={{ background: bg.overlay }} />}
        <Vignette />
      </div>
    );
  }
  return (
    <div className="grain absolute inset-0 transition-[background] duration-700" style={{ background: bg.css }}>
      {bg.blobs?.map((c, i) => (
        <div key={i} className={c} />
      ))}
      <Vignette />
    </div>
  );
}

function Vignette() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 42%, transparent 55%, rgba(0,0,0,0.55) 100%)' }}
    />
  );
}
