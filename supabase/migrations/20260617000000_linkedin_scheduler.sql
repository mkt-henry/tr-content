-- LinkedIn 예약 발행 백엔드 스키마
-- 토큰·예약 큐는 민감 데이터 → RLS 활성화 + anon/authenticated 정책 없음(= 거부).
-- 접근은 Edge Function의 service_role 키로만(RLS 우회). Data API로 노출하지 않는다.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ── LinkedIn 조직 토큰 (조직 URN당 1행) ───────────────────────────────
create table if not exists public.linkedin_tokens (
  org_urn            text primary key,              -- urn:li:organization:ID
  access_token       text not null,
  refresh_token      text,
  expires_at         timestamptz not null,
  refresh_expires_at timestamptz,
  updated_at         timestamptz not null default now()
);
alter table public.linkedin_tokens enable row level security;
-- 정책 없음: anon/authenticated 전면 차단. service_role만 접근.

-- ── 예약 게시물 큐 ────────────────────────────────────────────────────
create table if not exists public.scheduled_posts (
  id            uuid primary key default gen_random_uuid(),
  org_urn       text not null,
  commentary    text not null,                       -- 게시 본문(캡션)
  doc_title     text not null,                       -- 문서(캐러셀) 제목
  pdf_path      text not null,                       -- linkedin-pdfs 버킷 내 경로
  scheduled_at  timestamptz not null,                -- 발행 예정 시각
  status        text not null default 'pending',     -- pending|processing|posted|failed|canceled
  post_urn      text,                                -- 성공 시 urn:li:share:...
  error         text,
  attempts      int not null default 0,
  deck_id       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists scheduled_posts_due_idx
  on public.scheduled_posts (status, scheduled_at);
alter table public.scheduled_posts enable row level security;
-- 정책 없음: service_role(엣지 함수)만 접근.

-- ── OAuth state (CSRF 방지, 단명) ─────────────────────────────────────
create table if not exists public.linkedin_oauth_state (
  state       text primary key,
  created_at  timestamptz not null default now()
);
alter table public.linkedin_oauth_state enable row level security;

-- ── PDF 보관용 비공개 버킷 ────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('linkedin-pdfs', 'linkedin-pdfs', false)
on conflict (id) do nothing;

-- updated_at 자동 갱신
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_scheduled_posts_touch on public.scheduled_posts;
create trigger trg_scheduled_posts_touch before update on public.scheduled_posts
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_linkedin_tokens_touch on public.linkedin_tokens;
create trigger trg_linkedin_tokens_touch before update on public.linkedin_tokens
  for each row execute function public.touch_updated_at();

-- NOTE: 예약 발행 cron(pg_cron → net.http_post → linkedin-publish 함수)은
--       함수 배포 + CRON_SECRET 설정 후 다음 마이그레이션에서 cron.schedule()로 등록한다.
