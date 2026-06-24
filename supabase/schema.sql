-- 글로벌세아 admin Phase 0 — posts 테이블 + RLS + Storage 정책
-- Supabase 대시보드 → SQL Editor → New query → 전체 붙여넣기 → Run
-- dev / prod 프로젝트 각각 1회 실행

-- ---------------------------------------------------------------------------
-- 1. posts 테이블
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('notice', 'portfolio', 'recruit')),
  title text not null default '',
  body text,
  fields jsonb,
  images text[] default '{}',
  image_url text,
  contact jsonb,
  content_type text check (content_type is null or content_type in ('legacy', 'structured')),
  status text not null default 'open' check (status in ('open', 'closed')),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_category_published_at_idx
  on public.posts (category, published_at desc);

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. RLS — 공개 읽기만 허용, 쓰기는 service role(API 서버) 전용
-- ---------------------------------------------------------------------------
alter table public.posts enable row level security;

drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read"
  on public.posts
  for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 3. Storage 버킷 (이미지 업로드)
--    버킷이 이미 있으면 이 블록만 건너뛰고 4번 정책만 실행
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('seah-media', 'seah-media', true)
on conflict (id) do nothing;

drop policy if exists "seah_media_public_read" on storage.objects;
create policy "seah_media_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'seah-media');

-- service role은 RLS 우회 — API 서버에서 업로드/삭제 처리
