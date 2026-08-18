create table if not exists obs_projects (
  id text primary key,
  user_id text not null,
  name text not null,
  namespace text not null unique,
  plan text not null default 'free',
  signing_secret text not null,
  created_at timestamptz not null default now()
);
create index if not exists obs_projects_user_id_idx on obs_projects (user_id);

create table if not exists obs_api_keys (
  id text primary key,
  project_id text not null references obs_projects(id) on delete cascade,
  name text not null,
  prefix text not null,
  key_hash text not null unique,
  scopes text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists obs_api_keys_project_id_idx on obs_api_keys (project_id);

create table if not exists obs_upload_tokens (
  id text primary key,
  project_id text not null references obs_projects(id) on delete cascade,
  token_hash text not null unique,
  folder text,
  visibility text not null default 'public',
  max_upload_bytes bigint not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists obs_upload_tokens_project_id_idx on obs_upload_tokens (project_id);

create table if not exists obs_files (
  id text primary key,
  project_id text not null references obs_projects(id) on delete cascade,
  path text not null,
  filename text not null,
  content_type text not null,
  byte_size bigint not null default 0,
  visibility text not null default 'public',
  status text not null default 'pending',
  etag text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, path)
);
create index if not exists obs_files_project_status_idx on obs_files (project_id, status);

create table if not exists obs_uploads (
  id text primary key,
  project_id text not null references obs_projects(id) on delete cascade,
  file_id text not null references obs_files(id) on delete cascade,
  method text not null default 'single',
  expected_bytes bigint not null,
  content_type text not null,
  status text not null default 'pending',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists obs_uploads_file_id_idx on obs_uploads (file_id);

create table if not exists obs_blobs (
  upload_id text primary key references obs_uploads(id) on delete cascade,
  bytes bytea not null
);

create table if not exists obs_objects (
  file_id text primary key references obs_files(id) on delete cascade,
  bytes bytea not null
);

create table if not exists obs_webhooks (
  id text primary key,
  project_id text not null references obs_projects(id) on delete cascade,
  url text not null,
  secret text not null,
  events text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists obs_webhooks_project_id_idx on obs_webhooks (project_id);

create table if not exists obs_webhook_deliveries (
  id text primary key,
  webhook_id text not null references obs_webhooks(id) on delete cascade,
  event_type text not null,
  payload jsonb not null,
  status_code integer,
  success boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists obs_usage (
  project_id text primary key references obs_projects(id) on delete cascade,
  bandwidth_bytes bigint not null default 0,
  operations integer not null default 0
);
