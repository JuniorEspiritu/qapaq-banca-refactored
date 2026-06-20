-- ============================================================
--  SCRIPT 01 — Creación de tablas
--  Sistema Core Bancario + Homebanking — Financiera Qapaq S.A.
--  Base de datos: bd_core_financiero (Supabase/Postgres)
-- ============================================================

create extension if not exists pgcrypto;

-- ── 1) USUARIOS ───────────────────────────────────────────────────
create table if not exists usuarios (
  id         uuid primary key default gen_random_uuid(),
  codigo     text unique not null,   -- correo institucional @qapaq.pe
  nombre     text not null,          -- 'Apellido, Nombre'
  dni        text,
  password   text not null,          -- demo: texto plano
  rol        text not null default 'cliente'
             check (rol in ('cliente','asesor','comite')),
  created_at timestamptz not null default now()
);

-- ── 2) CUENTAS DE AHORRO ─────────────────────────────────────────
create table if not exists cuentas_ahorro (
  id         uuid primary key default gen_random_uuid(),
  codigo     text unique not null,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  tipo       text not null default 'Insuperable',
  moneda     text not null default 'SO',
  saldo      numeric(12,2) not null default 0,
  estado     text not null default 'Activo',
  created_at timestamptz not null default now()
);

create table if not exists movimientos_ahorro (
  id          uuid primary key default gen_random_uuid(),
  cuenta_id   uuid not null references cuentas_ahorro(id) on delete cascade,
  fecha       timestamptz not null default now(),
  descripcion text not null,
  monto       numeric(12,2) not null,
  saldo       numeric(12,2) not null
);

-- ── 3) SOLICITUDES DE CRÉDITO ────────────────────────────────────
create table if not exists solicitudes_credito (
  id                uuid primary key default gen_random_uuid(),
  codigo            text unique not null,
  usuario_id        uuid not null references usuarios(id) on delete cascade,
  tipo_credito      text not null,
  actividad         text,
  monto             numeric(12,2) not null,
  plazo             integer not null,
  tea               numeric(6,2) not null,
  ingreso_neto      numeric(12,2) not null,
  cuota_mensual     numeric(12,2) not null,
  rds               numeric(6,2) not null,
  scoring           integer,
  categoria_riesgo  text,
  semaforo          text,
  nivel_aprobacion  text,
  estado            text not null default 'En Evaluación'
                    check (estado in ('En Evaluación','Aprobado','Rechazado','Desembolsado')),
  fecha_solicitud   date not null default current_date,
  asesor_id         uuid references usuarios(id),
  comentario_asesor text,
  fecha_resolucion  timestamptz,
  created_at        timestamptz not null default now()
);

-- ── 4) CRÉDITOS VIGENTES ─────────────────────────────────────────
create table if not exists creditos (
  id              uuid primary key default gen_random_uuid(),
  codigo          text unique not null,
  usuario_id      uuid not null references usuarios(id) on delete cascade,
  solicitud_id    uuid references solicitudes_credito(id),
  tipo_credito    text not null,
  monto           numeric(12,2) not null,
  plazo           integer not null,
  tea             numeric(6,2) not null,
  cuota_mensual   numeric(12,2) not null,
  saldo_pendiente numeric(12,2) not null,
  dias_atraso     integer not null default 0,
  estado          text not null default 'Normal',
  banda_mora      text default 'Al día',
  fecha_desembolso date not null default current_date,
  created_at      timestamptz not null default now()
);

create table if not exists cuotas_credito (
  id           uuid primary key default gen_random_uuid(),
  credito_id   uuid not null references creditos(id) on delete cascade,
  numero       integer not null,
  fecha_pago   date not null,
  cuota        numeric(12,2) not null,
  capital      numeric(12,2) not null,
  interes      numeric(12,2) not null,
  saldo        numeric(12,2) not null,
  estado       text not null default 'Pendiente'
);

-- ── 5) GESTIONES DE COBRANZA ─────────────────────────────────────
create table if not exists gestiones_cobranza (
  id              uuid primary key default gen_random_uuid(),
  credito_id      uuid not null references creditos(id) on delete cascade,
  usuario_id      uuid not null references usuarios(id),
  fecha           timestamptz not null default now(),
  tipo_gestion    text not null,
  resultado       text not null,
  comentario      text,
  monto_prometido numeric(12,2),
  fecha_promesa   date,
  created_at      timestamptz not null default now()
);

-- ── 6) ÍNDICES ───────────────────────────────────────────────────
create index if not exists idx_solicitudes_estado   on solicitudes_credito (estado);
create index if not exists idx_solicitudes_usuario  on solicitudes_credito (usuario_id);
create index if not exists idx_creditos_usuario     on creditos (usuario_id);
create index if not exists idx_cuentas_usuario      on cuentas_ahorro (usuario_id);
create index if not exists idx_movimientos_cuenta   on movimientos_ahorro (cuenta_id);
create index if not exists idx_cuotas_credito       on cuotas_credito (credito_id);
create index if not exists idx_gestiones_credito    on gestiones_cobranza (credito_id);

-- ── 7) RLS ───────────────────────────────────────────────────────
alter table usuarios            enable row level security;
alter table cuentas_ahorro      enable row level security;
alter table movimientos_ahorro  enable row level security;
alter table solicitudes_credito enable row level security;
alter table creditos            enable row level security;
alter table cuotas_credito      enable row level security;
alter table gestiones_cobranza  enable row level security;
