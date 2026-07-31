import type { AnySlide, CardNewsDeck } from '../../types';

/* AlphaLenz · Agent Library 쇼케이스 (2026-07-02) — macro 테마.
   LinkedIn 4:5 9장 · Instagram 4:5 9장. 릴스는 만들지 않는다 — 9장 쇼케이스라 영상으로 35초를 넘고,
   앵글 리포트가 아니라 릴스 타이밍 테이블에 없는 슬라이드 타입(m-libcover·m-category 등)을 쓴다.
   슬라이드 카피는 영어(macro 테마 규칙) · 게시 본문(caption)은 한/영 토글.
   실기능 앵커(실제 데모 기반): Alpha Chat · Strategy Screen · Chart Drawing · Multi-Agent Orchestrator · Data Pipeline.
   나머지 에이전트는 도메인 확장(투자 리서치 워크플로 전반). */

const captionEn = `Most "AI for investing" is one chatbot doing everything — and hallucinating when it matters most.

AlphaLenz took a different path: a library of 25 specialized agents, each built for one job and each citing its sources.

The six categories:
🔎 Research & Q&A — Alpha Chat, Filing Digest, Earnings Recap, Transcript Miner, Research Digest
📊 Screening & Discovery — Strategy Screen, Factor Screen, Peer Compare, Theme Scanner
🧮 Valuation & Modeling — DCF Model, Comps Builder, Scenario Model, Reverse DCF
📈 Technical & Signals — Chart Drawing, Pattern Scan, Momentum Signal, Breakout Alert
🛰️ Monitoring & Alerts — Portfolio Watch, News Sentinel, Risk Radar, Event Tracker
🛡️ Trust Layer — Multi-Agent Orchestrator, Data Pipeline, Fact Check, Citation Guard

Why a library beats a single model:
• Specialists outperform a generalist on narrow, high-stakes tasks
• Agents cross-check each other to cut hallucination
• Every answer is traced back to a primary source

This isn't one more platform to live in. It's a library of specialized agents that plugs into the tools and workflows you already use — bringing AX to any environment.

Pick the job. The right agent runs it.

Explore the full library → alpha-lenz.com

Not investment advice. For research & informational purposes.

#AIinFinance #InvestmentResearch #FinTech #AIAgents #AlphaLenz`;

const captionKo = `'투자용 AI' 대부분은 챗봇 하나가 모든 걸 하려다, 정작 중요한 순간에 환각을 낸다.

AlphaLenz는 다른 길을 택했다 — 각각 하나의 일에 특화되고, 근거를 인용하는 25개 전문 에이전트의 라이브러리.

6개 카테고리:
🔎 리서치·Q&A — Alpha Chat, Filing Digest, Earnings Recap, Transcript Miner, Research Digest
📊 스크리닝·발굴 — Strategy Screen, Factor Screen, Peer Compare, Theme Scanner
🧮 밸류에이션·모델링 — DCF Model, Comps Builder, Scenario Model, Reverse DCF
📈 기술적·시그널 — Chart Drawing, Pattern Scan, Momentum Signal, Breakout Alert
🛰️ 모니터링·알림 — Portfolio Watch, News Sentinel, Risk Radar, Event Tracker
🛡️ 신뢰 계층 — Multi-Agent Orchestrator, Data Pipeline, Fact Check, Citation Guard

왜 단일 모델보다 라이브러리인가:
• 좁고 중요한 작업일수록 범용 1개보다 전문가가 낫다
• 에이전트끼리 교차 검증해 환각을 줄인다
• 모든 답변은 1차 출처까지 추적된다

모든 걸 한 플랫폼에 몰아넣지 않는다. 이미 쓰는 도구·워크플로에 꽂히는 전문 에이전트의 라이브러리 — 어떤 환경에서도 AX를 만든다.

일을 고르면, 맞는 에이전트가 실행한다.

전체 라이브러리 → alpha-lenz.com

투자 자문이 아닙니다. 리서치·정보 제공 목적입니다.

#AIinFinance #투자리서치 #핀테크 #AI에이전트 #AlphaLenz`;

/* 인스타그램 전용 — 링크 미작동 매체. 첫 2줄에 결론까지, URL 대신 프로필 링크, 해시태그 15~20개. */
const igCaptionKo = `'투자용 AI' 대부분은 챗봇 하나가 모든 걸 하려다 환각을 낸다.
우리는 다르게 만들었다 — 카테고리별로 특화된, 검증을 통과한 에이전트 25개.

6개 카테고리 · 25개 에이전트
• 리서치 — 리포트·공시를 근거까지 추적해 읽는다
• 마켓 분석 — 차트·스크리닝·시그널 탐지
• 콘텐츠 — 리포트를 발행 가능한 형태로
• 모니터링 — 뉴스·리스크·이벤트 실시간 감시
• 포트폴리오 — 구성과 노출을 자동 점검
• 트러스트 레이어 — 모든 주장에 출처를 붙인다

핵심은 마지막 레이어다. 멀티 에이전트 오케스트레이터, 데이터 파이프라인, 팩트 체크, 인용 가드가 나머지를 신뢰할 수 있게 만든다. 인용 없는 답변은 나가지 않는다.

플랫폼 하나를 더 쓰라는 게 아니다. 이미 쓰는 워크플로 안으로 들어가는 에이전트 라이브러리다.

자세한 내용은 프로필 링크에서 👆

투자 자문이 아닙니다. 리서치·정보 제공 목적입니다.

#AI에이전트 #AIinFinance #투자리서치 #핀테크 #금융AI #퀀트 #주식투자 #해외주식 #투자공부 #데이터분석 #멀티에이전트 #LLM #자동화 #리서치 #AlphaLenz #알파렌즈 #FinTech #AIagents`;

const igCaptionEn = `Most "AI for investing" is one chatbot doing everything — and hallucinating when it matters.
We built it differently: 25 specialized agents, each verified.

6 CATEGORIES · 25 AGENTS
• Research — reports and filings read back to the source
• Market analysis — charts, screening, signal detection
• Content — research turned into publishable form
• Monitoring — news, risk, and events in real time
• Portfolio — construction and exposure checked automatically
• Trust layer — every claim carries a citation

That last layer is the point. A multi-agent orchestrator, a verified data pipeline, fact check, and a citation guard are what make the rest safe to rely on. No answer ships without a citation.

This is not one more platform to live in — it is a library of specialists that comes to the workflow you already use.

More via the link in bio 👆

Not investment advice. For research & informational purposes.

#aiagents #aiinfinance #fintech #investmentresearch #quant #stocks #investing #dataanalysis #multiagent #llm #automation #research #financialai #marketanalysis #AlphaLenz`;

/** 링크드인·인스타가 공유하는 9장 */
const slides: AnySlide[] = [
  { type: 'm-libcover',
    kicker: 'LIVE IN PRODUCTION · FINANCIAL AI AGENTS',
    title: 'Financial AX,\nnow in real workflows.',
    subtitle: 'AI agents for research, market analysis, content generation, and workflow automation.',
    stats: [
      { value: '25', label: 'FINANCE AGENTS' },
      { value: '7', label: 'LIVE PARTNERS' },
      { value: 'Cited', label: 'SOURCE-BASED OUTPUTS' },
    ] },

  { type: 'm-library',
    idx: 'THE LIBRARY',
    title: 'The full desk,\nstaffed by agents',
    subtitle: 'From first question to final check — a specialist agent for every step of the process.',
    groups: [
      { name: 'RESEARCH & Q&A', agents: ['Alpha Chat', 'Filing Digest', 'Earnings Recap', 'Transcript Miner', 'Research Digest'] },
      { name: 'SCREENING & DISCOVERY', agents: ['Strategy Screen', 'Factor Screen', 'Peer Compare', 'Theme Scanner'] },
      { name: 'VALUATION & MODELING', agents: ['DCF Model', 'Comps Builder', 'Scenario Model', 'Reverse DCF'] },
      { name: 'TECHNICAL & SIGNALS', agents: ['Chart Drawing', 'Pattern Scan', 'Momentum Signal', 'Breakout Alert'] },
      { name: 'MONITORING & ALERTS', agents: ['Portfolio Watch', 'News Sentinel', 'Risk Radar', 'Event Tracker'] },
      { name: 'TRUST LAYER', agents: ['Multi-Agent Orchestrator', 'Data Pipeline', 'Fact Check', 'Citation Guard'] },
    ] },

  { type: 'm-category',
    idx: '01 / RESEARCH & Q&A',
    category: 'Ask. Get\nthe answer.',
    tagline: 'Turn filings, transcripts, and news into answers you can act on — every one backed by data.',
    agents: [
      { name: 'Alpha Chat', desc: 'Ask anything on a ticker — data-backed answers with charts.' },
      { name: 'Filing Digest', desc: '10-K / 10-Q and disclosures distilled to what moves the stock.' },
      { name: 'Earnings Recap', desc: 'Quarter results in seconds: beats, misses, guidance shifts.' },
      { name: 'Transcript Miner', desc: 'Earnings-call transcripts mined for tone and hidden signals.' },
      { name: 'Research Digest', desc: 'Sell-side notes and news synthesized into one clean brief.' },
    ] },

  { type: 'm-category',
    idx: '02 / SCREENING & DISCOVERY',
    category: 'Find the\nnext name.',
    tagline: 'Cut a universe of thousands down to the handful that fit your thesis — in one pass.',
    agents: [
      { name: 'Strategy Screen', desc: 'Six proven strategies filter the market instantly.' },
      { name: 'Factor Screen', desc: 'Rank the universe by value, quality, and momentum.' },
      { name: 'Peer Compare', desc: 'Line a name up against its true comparables.' },
      { name: 'Theme Scanner', desc: 'Surface the names riding an emerging theme early.' },
    ] },

  { type: 'm-category',
    idx: '03 / VALUATION & MODELING',
    category: 'Put a\nnumber on it.',
    tagline: 'Build the valuation work an analyst spends hours on — in seconds, with every assumption exposed.',
    agents: [
      { name: 'DCF Model', desc: 'Build a discounted-cash-flow fair value in seconds.' },
      { name: 'Comps Builder', desc: 'Relative valuation from a live, editable comp set.' },
      { name: 'Scenario Model', desc: 'Bull / base / bear outcomes with sensitivities.' },
      { name: 'Reverse DCF', desc: 'Back out the growth the current price already implies.' },
    ] },

  { type: 'm-category',
    idx: '04 / TECHNICAL & SIGNALS',
    category: 'Read the\nchart.',
    tagline: 'Let AI mark the levels and setups that matter, so you spot the move before it happens.',
    agents: [
      { name: 'Chart Drawing', desc: 'Auto-draws support, resistance, trendlines, and patterns.' },
      { name: 'Pattern Scan', desc: 'Detects classic setups across your whole watchlist.' },
      { name: 'Momentum Signal', desc: 'Flags trend strength and likely inflection points.' },
      { name: 'Breakout Alert', desc: 'Watches key levels and pings you in real time.' },
    ] },

  { type: 'm-category',
    idx: '05 / MONITORING & ALERTS',
    category: 'Never miss\na move.',
    tagline: 'Your positions, watched around the clock — filtered to only what actually changes the thesis.',
    agents: [
      { name: 'Portfolio Watch', desc: 'Tracks your book and flags exactly what changed.' },
      { name: 'News Sentinel', desc: 'Real-time news filtered to the positions that matter.' },
      { name: 'Risk Radar', desc: 'Surfaces concentration, drawdown, and correlation risk.' },
      { name: 'Event Tracker', desc: 'Earnings, dividends, and macro prints on your calendar.' },
    ] },

  { type: 'm-category',
    idx: '06 / TRUST LAYER',
    category: 'Answers you\ncan trust.',
    tagline: 'The layer that makes the rest safe to rely on — every agent runs on verified data and shows its work.',
    agents: [
      { name: 'Multi-Agent Orchestrator', desc: 'Specialist agents cross-check to cut hallucination.' },
      { name: 'Data Pipeline', desc: 'Filings, prices, and news verified in multi-stage checks.' },
      { name: 'Fact Check', desc: 'Every claim traced back to a primary source.' },
      { name: 'Citation Guard', desc: 'No answer ships without a citation attached.' },
    ] },

  { type: 'm-libcta',
    idx: 'THE OUTCOME',
    title: 'AI-native,\nanywhere',
    subtitle: 'Not one more platform to live in — a library of specialized agents that plugs into the tools and workflows you already use, turning any environment into an AI-native one.',
    stats: [
      { value: '25', label: 'SPECIALIZED AGENTS' },
      { value: '6', label: 'CATEGORIES' },
      { value: '∞', label: 'ENVIRONMENTS' },
    ],
    ctaTitle: 'Bring the agent library\nto your workflow.',
    url: 'alpha-lenz.com',
    disclaimer: 'Not investment advice. For research & informational purposes.' },
];

const deck: CardNewsDeck = {
  id: 'agent-library-2026-07-02',
  project: 'alphalenz',
  title: { ko: '에이전트 라이브러리', en: 'Agent Library' },
  source: 'https://alpha-lenz.com',
  date: '2026-07-02',
  theme: 'macro',
  accent: '#4FD1A5',
  width: 1080,
  height: 1350,
  caption: { ko: captionKo, en: captionEn },
  variants: [
    { id: 'linkedin', label: 'LinkedIn', width: 1080, height: 1350, slides },
    { id: 'instagram', label: 'Instagram', width: 1080, height: 1350, caption: { ko: igCaptionKo, en: igCaptionEn }, slides },
  ],
};

export default deck;
