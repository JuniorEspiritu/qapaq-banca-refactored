-- ============================================================
--  SCRIPT MAESTRO — Reinstalación completa desde cero
--
--  Copia y pega este archivo COMPLETO en el SQL Editor de Supabase.
--  Ejecuta todos los scripts en orden (00 → 05).
--
--  ADVERTENCIA: El script 00 borra TODOS los datos existentes.
--  Solo usar cuando quieras empezar de cero.
-- ============================================================

-- ── 00: Limpieza ─────────────────────────────────────────────────
drop table if exists gestiones_cobranza   cascade;
drop table if exists cuotas_credito       cascade;
drop table if exists creditos             cascade;
drop table if exists solicitudes_credito  cascade;
drop table if exists movimientos_ahorro   cascade;
drop table if exists cuentas_ahorro       cascade;
drop table if exists usuarios             cascade;

-- ── 01: Tablas ───────────────────────────────────────────────────
create extension if not exists pgcrypto;

create table if not exists usuarios (
  id         uuid primary key default gen_random_uuid(),
  codigo     text unique not null,
  nombre     text not null,
  dni        text,
  password   text not null,
  rol        text not null default 'cliente'
             check (rol in ('cliente','asesor','comite')),
  created_at timestamptz not null default now()
);

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

create index if not exists idx_solicitudes_estado  on solicitudes_credito (estado);
create index if not exists idx_solicitudes_usuario on solicitudes_credito (usuario_id);
create index if not exists idx_creditos_usuario    on creditos (usuario_id);
create index if not exists idx_cuentas_usuario     on cuentas_ahorro (usuario_id);
create index if not exists idx_movimientos_cuenta  on movimientos_ahorro (cuenta_id);
create index if not exists idx_cuotas_credito      on cuotas_credito (credito_id);
create index if not exists idx_gestiones_credito   on gestiones_cobranza (credito_id);

alter table usuarios            enable row level security;
alter table cuentas_ahorro      enable row level security;
alter table movimientos_ahorro  enable row level security;
alter table solicitudes_credito enable row level security;
alter table creditos            enable row level security;
alter table cuotas_credito      enable row level security;
alter table gestiones_cobranza  enable row level security;

-- ── 02: Usuarios ────────────────────────────────────────────────
insert into usuarios (codigo, nombre, dni, password, rol) values
  ('carlos.ramirez@qapaq.pe', 'Ramírez Soto, Carlos',  '11200007', 'demo1234',    'cliente'),
  ('rosa.mamani@qapaq.pe',    'Mamani Huanca, Rosa',   '45123001', 'qapaq2026',   'cliente'),
  ('ana.torres@qapaq.pe',     'Torres Vega, Ana',      '48556677', 'cliente2026', 'cliente'),
  ('maria.quispe@qapaq.pe',   'Quispe Flores, María',  '70011223', 'asesor1234',  'asesor'),
  ('jorge.torres@qapaq.pe',   'Torres Vega, Jorge',    '70022334', 'comite1234',  'comite')
on conflict (codigo) do nothing;

-- ── 03: Cuentas de ahorro ────────────────────────────────────────
insert into cuentas_ahorro (codigo, usuario_id, tipo, moneda, saldo, estado)
select 'AHO-0001-7', id, 'Insuperable', 'SO', 3850.00, 'Activo'
from usuarios where codigo='carlos.ramirez@qapaq.pe'
on conflict (codigo) do nothing;

insert into cuentas_ahorro (codigo, usuario_id, tipo, moneda, saldo, estado)
select 'AHO-0002-7', id, 'Qapital+', 'SO', 1200.50, 'Activo'
from usuarios where codigo='carlos.ramirez@qapaq.pe'
on conflict (codigo) do nothing;

insert into cuentas_ahorro (codigo, usuario_id, tipo, moneda, saldo, estado)
select 'AHO-0003-7', id, 'Insuperable', 'SO', 500.00, 'Activo'
from usuarios where codigo='ana.torres@qapaq.pe'
on conflict (codigo) do nothing;

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now()-interval '24 days','Depósito en efectivo',+500.00,3850.00
from cuentas_ahorro c where c.codigo='AHO-0001-7';

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now()-interval '19 days','Pago servicio agua - Sedapal',-45.50,3350.00
from cuentas_ahorro c where c.codigo='AHO-0001-7';

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now()-interval '14 days','Abono de intereses',+12.30,3395.50
from cuentas_ahorro c where c.codigo='AHO-0001-7';

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now()-interval '10 days','Transferencia recibida',+200.00,3383.20
from cuentas_ahorro c where c.codigo='AHO-0001-7';

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now()-interval '5 days','Retiro en cajero',-300.00,3183.20
from cuentas_ahorro c where c.codigo='AHO-0001-7';

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now()-interval '2 days','Apertura de cuenta',+500.00,500.00
from cuentas_ahorro c where c.codigo='AHO-0003-7';

-- ── 04: Crédito vigente (Normal) ─────────────────────────────────
insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-0001-7', id, 'Consumo', 9000.00, 24, 40.92,
  536.05, 8240.00, 0, 'Normal', 'Al día', current_date-interval '40 days'
from usuarios where codigo='carlos.ramirez@qapaq.pe'
on conflict (codigo) do nothing;

insert into cuotas_credito (credito_id, numero, fecha_pago, cuota, capital, interes, saldo, estado)
select c.id, 1,(current_date-interval '40 days')+interval '1 month',536.05,258.80,277.25,8741.20,'Pagada'
from creditos c where c.codigo='CRE-0001-7';

insert into cuotas_credito (credito_id, numero, fecha_pago, cuota, capital, interes, saldo, estado)
select c.id, 2,(current_date-interval '40 days')+interval '2 months',536.05,266.77,269.28,8474.43,'Pendiente'
from creditos c where c.codigo='CRE-0001-7';

-- ── 05: Cartera morosa (~13% del total) ──────────────────────────
insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-MORA-01', id, 'Microempresa', 5000.00, 18, 43.92,
  366.02, 4500.00, 15, 'Mora', 'Preventiva', current_date-interval '3 months'
from usuarios where codigo='carlos.ramirez@qapaq.pe'
on conflict (codigo) do nothing;

insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-MORA-02', id, 'Consumo', 3000.00, 12, 40.92,
  299.59, 2700.00, 45, 'Mora', 'Temprana', current_date-interval '4 months'
from usuarios where codigo='ana.torres@qapaq.pe'
on conflict (codigo) do nothing;

insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-MORA-03', id, 'Microempresa', 8000.00, 24, 43.92,
  476.00, 7200.00, 90, 'Mora', 'Tardía', current_date-interval '5 months'
from usuarios where codigo='rosa.mamani@qapaq.pe'
on conflict (codigo) do nothing;

insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-MORA-04', id, 'Consumo', 12000.00, 24, 40.92,
  700.94, 11000.00, 130, 'Mora', 'Judicial', current_date-interval '6 months'
from usuarios where codigo='carlos.ramirez@qapaq.pe'
on conflict (codigo) do nothing;

insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-MORA-05', id, 'Microempresa', 15000.00, 36, 43.92,
  693.00, 14000.00, 200, 'Mora', 'Castigo', current_date-interval '8 months'
from usuarios where codigo='ana.torres@qapaq.pe'
on conflict (codigo) do nothing;

insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-MORA-06', id, 'Microempresa', 10000.00, 24, 43.92,
  536.05, 9500.00, 190, 'Mora', 'Judicial', current_date-interval '9 months'
from usuarios where codigo='rosa.mamani@qapaq.pe'
on conflict (codigo) do nothing;

-- ============================================================
-- ✅ INSTALACIÓN COMPLETA
-- Usuarios demo:
--   carlos.ramirez@qapaq.pe  / demo1234    (cliente)
--   rosa.mamani@qapaq.pe     / qapaq2026   (cliente)
--   ana.torres@qapaq.pe      / cliente2026 (cliente)
--   maria.quispe@qapaq.pe    / asesor1234  (asesor)
--   jorge.torres@qapaq.pe    / comite1234  (comité)
-- ============================================================
