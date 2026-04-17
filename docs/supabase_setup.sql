-- WOOHWA 상담실 예약 시스템 — Supabase 초기 설정 SQL
-- Supabase 대시보드 → SQL Editor에서 실행하세요

create table if not exists coaches (
  id text primary key,
  name text not null,
  phone text not null default '',
  last_car_number text default '',
  active boolean not null default true
);

create table if not exists reservations (
  id text primary key,
  date text not null,
  time text not null,
  room integer not null check (room in (1,2,3)),
  coach_id text not null,
  name text not null,
  phone text default '',
  car_number text default '',
  created_at text not null,
  status text not null default 'active' check (status in ('active','cancelled'))
);

-- 동시 예약 중복 방지 (unique constraint)
create unique index if not exists reservations_unique_active
  on reservations (date, time, room)
  where status = 'active';

create table if not exists blocked_slots (
  id text primary key,
  type text not null check (type in ('common','weekly')),
  week_start_date text default '',
  day_of_week text not null,
  time text not null,
  room text not null,
  reason text default ''
);

create table if not exists settings (
  key text primary key,
  value text not null default ''
);

create table if not exists admin_list (
  email text primary key,
  role text not null default 'admin'
);

create table if not exists access_log (
  id bigserial primary key,
  timestamp timestamptz default now(),
  action text,
  coach_id text,
  detail text
);

-- 관리자 이메일 등록 (본인 Gmail로 변경)
insert into admin_list (email, role) values
  ('your-email@gmail.com', 'admin')
on conflict (email) do nothing;

-- 코치 명단 등록 (실제 데이터로 변경)
insert into coaches (id, name, phone, active) values
  ('C001', '이경아', '01071297486', true),
  ('C002', '장지진', '01041133570', true)
on conflict (id) do nothing;
