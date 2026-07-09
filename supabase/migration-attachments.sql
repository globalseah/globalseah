-- 공지 첨부파일(attachments) 컬럼 추가 — dev / prod 각 1회 실행
-- 기존 posts 테이블이 있는 환경용 (schema.sql 전체 재실행 대신)

alter table public.posts
  add column if not exists attachments jsonb default '[]';
