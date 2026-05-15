-- Coordinators
create table coordinators (
  id uuid primary key default gen_random_uuid(),
  password text not null,
  created_at timestamptz default now()
);

-- Institutions
create table institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Members
create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  type text not null check (type in ('Regular', 'Fee')),
  active boolean not null default true,
  institution_id uuid references institutions(id) on delete set null,
  created_at timestamptz default now()
);

-- Months
create table months (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  regular_amount numeric(10,2) not null default 0,
  fee_amount numeric(10,2) not null default 0,
  late_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  expected_amount numeric(10,2) not null default 0,
  due_date date not null,
  created_at timestamptz default now()
);

-- Payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  month_id uuid not null references months(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'under_review', 'confirmed')),
  overdue boolean not null default false,
  amount numeric(10,2) not null default 0,
  notes text,
  receipt_url text,
  created_at timestamptz default now(),
  unique (member_id, month_id)
);

-- RLS
alter table coordinators enable row level security;
alter table institutions enable row level security;
alter table members enable row level security;
alter table months enable row level security;
alter table payments enable row level security;