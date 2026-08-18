create table if not exists obs_activity (
  id text primary key,
  project_id text not null references obs_projects(id) on delete cascade,
  category text not null,
  title text not null,
  detail text not null default '',
  status text not null,
  source_id text,
  created_at timestamptz not null default now()
);
create index if not exists obs_activity_project_created_idx on obs_activity (project_id, created_at desc);
