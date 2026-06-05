import type { Scenario, StepText } from './types';
import { usePlaybackStore } from './playbackStore';

/** 스텝 텍스트 평가 — 함수면 실행 시점(언어 등 런타임 상태)에 풀어낸다 */
function resolveText(text: StepText): string {
  return typeof text === 'function' ? text() : text;
}

/** abort 시 즉시 resolve되는 지연 */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        resolve();
      },
      { once: true },
    );
  });
}

function jitter(base: number) {
  return base * (0.6 + Math.random() * 0.8);
}

async function moveCursorTo(target: string, signal: AbortSignal, ms = 650) {
  const el = document.querySelector(`[data-demo-id="${target}"]`);
  if (!el) return;
  // 스크롤 컨테이너 아래에 숨은 타깃을 끌어올린다 — 이미 보이면 no-op
  el.scrollIntoView({ block: 'nearest' });
  const r = el.getBoundingClientRect();
  usePlaybackStore.getState().setCursor({
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
    visible: true,
  });
  await delay(ms, signal);
}

async function clickPulse(signal: AbortSignal) {
  const { setCursor } = usePlaybackStore.getState();
  setCursor({ pressed: true });
  await delay(160, signal);
  setCursor({ pressed: false });
  await delay(120, signal);
}

/** 시나리오 스텝을 순차 실행한다. 모든 상태 변화는 데모 store action을 통해서만 일어난다. */
export async function runScenario(scenario: Scenario, signal: AbortSignal): Promise<void> {
  for (const step of scenario.steps) {
    if (signal.aborted) return;
    switch (step.kind) {
      case 'wait':
        await delay(step.ms, signal);
        break;
      case 'cursor':
        await moveCursorTo(step.target, signal, step.ms);
        break;
      case 'click':
        await moveCursorTo(step.target, signal);
        await clickPulse(signal);
        if (signal.aborted) return;
        step.run?.();
        break;
      case 'type': {
        if (step.target) {
          await moveCursorTo(step.target, signal);
          await clickPulse(signal);
        }
        const interval = 1000 / (step.cps ?? 16);
        let acc = '';
        for (const ch of resolveText(step.text)) {
          if (signal.aborted) return;
          acc += ch;
          step.set(acc);
          await delay(jitter(interval), signal);
        }
        break;
      }
      case 'stream': {
        const text = resolveText(step.text);
        const interval = 1000 / (step.cps ?? 40);
        let i = 0;
        while (i < text.length) {
          if (signal.aborted) return;
          const size = 2 + Math.floor(Math.random() * 3);
          const chunk = text.slice(i, i + size);
          i += size;
          step.append(chunk);
          await delay(interval * chunk.length, signal);
        }
        break;
      }
      case 'do':
        step.run();
        break;
    }
  }
}
