import type { CardNewsDeck } from '../../types';

/* AlphaLenz · Agent Library 쇼케이스 (2026-07-02) — macro 테마(세로 1080×1350 LinkedIn).
   앵글 리포트가 아니라 제품 쇼케이스: "단일 챗봇이 아니라, 카테고리별로 특화된 검증형 에이전트 라이브러리".
   전용 슬라이드 타입 사용: m-libcover(커버) · m-library(개요 그리드) · m-category(카테고리 카드) · m-libcta(마무리).
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
  slides: [
    { type: 'm-libcover',
      kicker: 'AGENT LIBRARY · AI INVESTMENT INTELLIGENCE',
      title: '25 agents.\nOne brain.',
      subtitle: "AlphaLenz isn't a single chatbot — it's a library of specialized, verifiable agents. Now in production with partners across finance, insurance, and media.",
      stats: [
        { value: '25', label: 'SPECIALIZED AGENTS' },
        { value: '7', label: 'PARTNERS LIVE' },
        { value: '100%', label: 'CITED & VERIFIABLE' },
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
  ],
};

export default deck;
