-- MindForge Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
create table if not exists user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  level text not null,
  subject text,
  chapters jsonb default '[]'::jsonb,
  language text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

alter table user_preferences enable row level security;

create policy "Users can view own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);

-- ============================================
-- CHAT HISTORY TABLE
-- ============================================
create table if not exists chat_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  tutor_id text not null,
  chapter_name text,
  messages jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table chat_history enable row level security;

create policy "Users can view own chat history"
  on chat_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat history"
  on chat_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chat history"
  on chat_history for update
  using (auth.uid() = user_id);

create policy "Users can delete own chat history"
  on chat_history for delete
  using (auth.uid() = user_id);

-- ============================================
-- USER PROGRESS TABLE
-- ============================================
create table if not exists user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject text not null,
  chapter_name text not null,
  completed_subtopics jsonb default '[]'::jsonb,
  quiz_scores jsonb default '[]'::jsonb,
  last_accessed timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, subject, chapter_name)
);

alter table user_progress enable row level security;

create policy "Users can view own progress"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on user_progress for update
  using (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
create index if not exists user_preferences_user_id_idx on user_preferences(user_id);
create index if not exists chat_history_user_id_idx on chat_history(user_id);
create index if not exists chat_history_tutor_id_idx on chat_history(tutor_id);
create index if not exists user_progress_user_id_idx on user_progress(user_id);
create index if not exists user_progress_subject_idx on user_progress(subject);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger update_user_preferences_updated_at before update on user_preferences
  for each row execute procedure update_updated_at_column();

create trigger update_chat_history_updated_at before update on chat_history
  for each row execute procedure update_updated_at_column();
