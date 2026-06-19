-- ============================================
-- ProveIt! — Supabase Database Setup Script
-- Run this in Supabase → SQL Editor → New Query
-- ============================================

-- PROFILES (students + tutors)
create table if not exists profiles (
  email text primary key,
  role text not null default 'student',
  name text,
  subjects text[] default '{}'
);

-- TESTS
create table if not exists tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  due_date date,
  attempts_allowed int default 1,
  marking_mode text default 'manual',
  show_results_immediately boolean default false,
  status text default 'draft',
  created_at timestamptz default now()
);

-- ANNOUNCEMENTS
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  subject text default 'all',
  pinned boolean default false,
  created_at timestamptz default now()
);

-- SESSIONS (scheduled lessons + tests)
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  session_date date not null,
  session_time time not null,
  subject text not null,
  teams_link text,
  type text default 'live',
  created_at timestamptz default now()
);

-- VIDEOS (recorded lessons)
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  link text not null,
  duration text,
  session_date date,
  created_at timestamptz default now()
);

-- MOTIVATIONAL QUOTES
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  author text,
  bg_color text default '#1E2D4A',
  text_color text default '#F0F4FF',
  active boolean default false,
  created_at timestamptz default now()
);

-- MATERIAL FOLDERS
create table if not exists material_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  created_at timestamptz default now()
);

-- MATERIAL FILES
create table if not exists material_files (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references material_folders(id) on delete cascade,
  name text not null,
  subject text not null,
  file_url text,
  file_size text,
  published boolean default false,
  created_at timestamptz default now()
);

-- QUESTIONS (question bank)
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(id) on delete cascade,
  type text not null default 'mcq',
  content text not null,
  options jsonb,
  correct_answer text,
  marks int default 1,
  order_index int default 0,
  created_at timestamptz default now()
);

-- SUBMISSIONS (student test submissions)
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(id) on delete cascade,
  student_email text references profiles(email),
  answers jsonb,
  score numeric,
  feedback text,
  status text default 'submitted',
  attempt_number int default 1,
  submitted_at timestamptz default now()
);

-- EVALUATIONS
create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  session_id uuid references sessions(id),
  questions jsonb,
  active boolean default false,
  created_at timestamptz default now()
);

-- EVALUATION RESPONSES
create table if not exists evaluation_responses (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid references evaluations(id) on delete cascade,
  student_email text references profiles(email),
  answers jsonb,
  submitted_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (open policies for now)
-- ============================================
alter table profiles enable row level security;
alter table tests enable row level security;
alter table announcements enable row level security;
alter table sessions enable row level security;
alter table videos enable row level security;
alter table quotes enable row level security;
alter table material_folders enable row level security;
alter table material_files enable row level security;
alter table questions enable row level security;
alter table submissions enable row level security;
alter table evaluations enable row level security;
alter table evaluation_responses enable row level security;

create policy "open" on profiles for all using (true) with check (true);
create policy "open" on tests for all using (true) with check (true);
create policy "open" on announcements for all using (true) with check (true);
create policy "open" on sessions for all using (true) with check (true);
create policy "open" on videos for all using (true) with check (true);
create policy "open" on quotes for all using (true) with check (true);
create policy "open" on material_folders for all using (true) with check (true);
create policy "open" on material_files for all using (true) with check (true);
create policy "open" on questions for all using (true) with check (true);
create policy "open" on submissions for all using (true) with check (true);
create policy "open" on evaluations for all using (true) with check (true);
create policy "open" on evaluation_responses for all using (true) with check (true);

-- ============================================
-- Done! All tables created successfully.
-- ============================================
