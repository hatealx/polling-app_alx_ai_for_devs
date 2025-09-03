-- Create polls table
create table if not exists polls (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    options jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) on delete cascade not null,
    ends_at timestamp with time zone
);

-- Create votes table
create table if not exists votes (
    id uuid default gen_random_uuid() primary key,
    poll_id uuid references polls(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    option_index integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(poll_id, user_id)
);

-- Set up Row Level Security (RLS)
alter table polls enable row level security;
alter table votes enable row level security;

-- Policies for polls table
create policy "Polls are viewable by everyone"
    on polls for select
    using (true);

create policy "Users can create polls"
    on polls for insert
    with check (auth.uid() = created_by);

create policy "Users can update their own polls"
    on polls for update
    using (auth.uid() = created_by);

create policy "Users can delete their own polls"
    on polls for delete
    using (auth.uid() = created_by);

-- Policies for votes table
create policy "Votes are viewable by everyone"
    on votes for select
    using (true);

create policy "Users can insert their own votes"
    on votes for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own votes"
    on votes for update
    using (auth.uid() = user_id);

create policy "Users can delete their own votes"
    on votes for delete
    using (auth.uid() = user_id);