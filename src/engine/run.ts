import type { Scenario, StepText } from './types';
import { usePlaybackStore } from './playbackStore';

/** 스텝 텍스트 평가 — 함수면 실행 시점(언어 등 런타임 상태)에 풀어낸다 */
function resolveText(text: StepText): string {
  return typeof text === 'function' ? text() : text;
}

/**
 * abort 시 즉시 resolve되는 지연.
 * status === 'paused' 동안에는 카운트다운을 멈춰(일시정지) resume 시 남은 시간만 이어서 센다.
 * 50ms 폴링으로 일시정지/재개에 즉시 반응한다.
 */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    let remaining = ms;
    let last = Date.now();
    let timer: ReturnType<typeof setTimeout>;

    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };

    const tick = () => {
      if (signal.aborted) return resolve();
      const now = Date.now();
      const { status, speed } = usePlaybackStore.getState();
      const rate = speed > 0 ? speed : 1;
      // 일시정지 중에는 남은 시간을 줄이지 않는다. 그 외에는 speed 배수로 가속/감속.
      if (status !== 'paused') {
        remaining -= (now - last) * rate;
      }
      last = now;
      if (remaining <= 0) {
        signal.removeEventListener('abort', onAbort);
        return resolve();
      }
      // 실제 대기 = 가상 잔여시간 / speed. 50ms 폴링으로 일시정지·속도 변경에 즉시 반응.
      timer = setTimeout(tick, Math.min(50, Math.max(4, remaining / rate)));
    };

    signal.addEventListener('abort', onAbort, { once: true });
    tick();
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

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * 컨테이너 scrollTop을 dest까지 ms 동안 부드럽게 이동.
 * delay()와 동일하게 일시정지/속도/abort를 반영한다(가상 경과시간 기반).
 */
function scrollOver(el: HTMLElement, dest: number, ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const start = el.scrollTop;
    const dist = dest - start;
    if (Math.abs(dist) < 1 || ms <= 0) {
      el.scrollTop = dest;
      return resolve();
    }
    let elapsed = 0;
    let last = Date.now();
    let raf = 0;
    const onAbort = () => {
      cancelAnimationFrame(raf);
      resolve();
    };
    const frame = () => {
      if (signal.aborted) return resolve();
      const now = Date.now();
      const { status, speed } = usePlaybackStore.getState();
      const rate = speed > 0 ? speed : 1;
      if (status !== 'paused') elapsed += (now - last) * rate;
      last = now;
      const t = Math.min(1, elapsed / ms);
      el.scrollTop = start + dist * easeInOut(t);
      if (t >= 1) {
        signal.removeEventListener('abort', onAbort);
        return resolve();
      }
      raf = requestAnimationFrame(frame);
    };
    signal.addEventListener('abort', onAbort, { once: true });
    raf = requestAnimationFrame(frame);
  });
}

async function scrollContainer(
  target: string,
  opts: { to?: 'top' | 'bottom'; toId?: string; ms?: number },
  signal: AbortSignal,
) {
  const el = document.querySelector<HTMLElement>(`[data-demo-id="${target}"]`);
  if (!el) return;
  // 수동 검토 스크롤 중에는 auto-follow가 하단으로 끌어당기지 않도록 양보시킨다
  el.dataset.followPause = '1';
  const max = Math.max(0, el.scrollHeight - el.clientHeight);
  let dest = opts.to === 'top' ? 0 : max;
  if (opts.toId) {
    const child = el.querySelector<HTMLElement>(`[data-demo-id="${opts.toId}"]`);
    if (child) {
      const cRect = el.getBoundingClientRect();
      const tRect = child.getBoundingClientRect();
      dest = el.scrollTop + (tRect.top - cRect.top) - 12;
    }
  }
  dest = Math.max(0, Math.min(max, dest));
  await scrollOver(el, dest, opts.ms ?? 800, signal);
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
      case 'scroll':
        await scrollContainer(step.target, { to: step.to, toId: step.toId, ms: step.ms }, signal);
        break;
      case 'do':
        step.run();
        break;
    }
  }
}
