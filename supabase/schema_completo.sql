-- ============================================================
--  QAPAQ BANCA — Script SQL completo (versión final)
--  Incluye: schema + datos demo + módulo mora + scoring
--
--  INSTRUCCIONES:
--  1. Ve a Supabase → SQL Editor → New query
--  2. Si ya tienes tablas viejas, primero corre el bloque DROP
--  3. Luego corre TODO este archivo
-- ============================================================

-- ── 00. LIMPIAR TABLAS ANTERIORES (si las hay) ──────────────
drop table if exists gestiones_cobranza   cascade;
drop table if exists cuotas_credito       cascade;
drop table if exists creditos             cascade;
drop table if exists solicitudes_credito  cascade;
drop table if exists movimientos_ahorro   cascade;
drop table if exists cuentas_ahorro       cascade;
drop table if exists usuarios             cascade;

-- ── 01. EXTENSIONES ─────────────────────────────────────────
create extension if not exists pgcrypto;

-- ── 02. USUARIOS ────────────────────────────────────────────
create table usuarios (
  id         uuid primary key default gen_random_uuid(),
  codigo     text unique not null,
  nombre     text not null,
  dni        text,
  password   text not null,
  rol        text not null default 'cliente'
             check (rol in ('cliente','asesor','comite')),
  created_at timestamptz not null default now()
);

-- ── 03. CUENTAS DE AHORRO ───────────────────────────────────
create table cuentas_ahorro (
  id         uuid primary key default gen_random_uuid(),
  codigo     text unique not null,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  tipo       text not null default 'Insuperable',
  moneda     text not null default 'SO',
  saldo      numeric(12,2) not null default 0,
  estado     text not null default 'Activo',
  created_at timestamptz not null default now()
);

-- ── 04. MOVIMIENTOS DE AHORRO ───────────────────────────────
create table movimientos_ahorro (
  id          uuid primary key default gen_random_uuid(),
  cuenta_id   uuid not null references cuentas_ahorro(id) on delete cascade,
  fecha       timestamptz not null default now(),
  descripcion text not null,
  monto       numeric(12,2) not null,
  saldo       numeric(12,2) not null
);

-- ── 05. SOLICITUDES DE CRÉDITO ──────────────────────────────
create table solicitudes_credito (
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

-- ── 06. CRÉDITOS ────────────────────────────────────────────
create table creditos (
  id               uuid primary key default gen_random_uuid(),
  codigo           text unique not null,
  usuario_id       uuid not null references usuarios(id) on delete cascade,
  solicitud_id     uuid references solicitudes_credito(id),
  tipo_credito     text not null,
  monto            numeric(12,2) not null,
  plazo            integer not null,
  tea              numeric(6,2) not null,
  cuota_mensual    numeric(12,2) not null,
  saldo_pendiente  numeric(12,2) not null,
  dias_atraso      integer not null default 0,
  estado           text not null default 'Normal',
  banda_mora       text default 'Al día',
  fecha_desembolso date not null default current_date,
  created_at       timestamptz not null default now()
);

-- ── 07. CUOTAS DEL CRÉDITO ──────────────────────────────────
create table cuotas_credito (
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

-- ── 08. GESTIONES DE COBRANZA ───────────────────────────────
create table gestiones_cobranza (
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

-- ── 09. ÍNDICES ─────────────────────────────────────────────
create index idx_solicitudes_estado   on solicitudes_credito (estado);
create index idx_solicitudes_usuario  on solicitudes_credito (usuario_id);
create index idx_creditos_usuario     on creditos (usuario_id);
create index idx_creditos_mora        on creditos (dias_atraso) where dias_atraso > 0;
create index idx_cuentas_usuario      on cuentas_ahorro (usuario_id);
create index idx_movimientos_cuenta   on movimientos_ahorro (cuenta_id);
create index idx_cuotas_credito       on cuotas_credito (credito_id);
create index idx_gestiones_credito    on gestiones_cobranza (credito_id);

-- ── 10. ROW LEVEL SECURITY ──────────────────────────────────
alter table usuarios             enable row level security;
alter table cuentas_ahorro       enable row level security;
alter table movimientos_ahorro   enable row level security;
alter table creditos             enable row level security;
alter table cuotas_credito       enable row level security;
alter table solicitudes_credito  enable row level security;
alter table gestiones_cobranza   enable row level security;
-- Sin políticas para 'anon' → solo el backend (service_role) puede acceder

-- ═══════════════════════════════════════════════════════════
--  DATOS DEMO
-- ═══════════════════════════════════════════════════════════

-- ── USUARIOS ────────────────────────────────────────────────
insert into usuarios (codigo, nombre, dni, password, rol) values
  ('carlos.ramirez@qapaq.pe', 'Ramírez Soto, Carlos',  '11200007', 'demo1234',    'cliente'),
  ('rosa.mamani@qapaq.pe',    'Mamani Huanca, Rosa',   '45123001', 'qapaq2026',   'cliente'),
  ('ana.torres@qapaq.pe',     'Torres Vega, Ana',      '48556677', 'cliente2026', 'cliente'),
  ('maria.quispe@qapaq.pe',   'Quispe Flores, María',  '70011223', 'asesor1234',  'asesor'),
  ('jorge.torres@qapaq.pe',   'Torres Vega, Jorge',    '70022334', 'comite1234',  'comite');

-- ── CUENTAS DE AHORRO ───────────────────────────────────────
insert into cuentas_ahorro (codigo, usuario_id, tipo, moneda, saldo, estado) values
  ('AHO-0001-7', (select id from usuarios where codigo='carlos.ramirez@qapaq.pe'), 'Insuperable', 'SO', 3850.00, 'Activo'),
  ('AHO-0002-7', (select id from usuarios where codigo='carlos.ramirez@qapaq.pe'), 'Qapital+',    'SO', 1200.50, 'Activo'),
  ('AHO-0003-7', (select id from usuarios where codigo='ana.torres@qapaq.pe'),     'Insuperable', 'SO', 500.00,  'Activo'),
  ('AHO-0004-7', (select id from usuarios where codigo='rosa.mamani@qapaq.pe'),    'Insuperable', 'SO', 2100.00, 'Activo');

-- ── MOVIMIENTOS DEMO ────────────────────────────────────────
insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo) values
  ((select id from cuentas_ahorro where codigo='AHO-0001-7'), now()-interval '24 days', 'Depósito en efectivo',        500.00,  3850.00),
  ((select id from cuentas_ahorro where codigo='AHO-0001-7'), now()-interval '19 days', 'Pago servicio agua - Sedapal',-45.50,  3350.00),
  ((select id from cuentas_ahorro where codigo='AHO-0001-7'), now()-interval '14 days', 'Abono de intereses',           12.30,  3395.50),
  ((select id from cuentas_ahorro where codigo='AHO-0001-7'), now()-interval '10 days', 'Transferencia recibida',      200.00,  3383.20),
  ((select id from cuentas_ahorro where codigo='AHO-0001-7'), now()-interval '5 days',  'Retiro en cajero',           -300.00,  3183.20),
  ((select id from cuentas_ahorro where codigo='AHO-0003-7'), now()-interval '2 days',  'Apertura de cuenta',          500.00,   500.00);

-- ── CRÉDITO VIGENTE DEMO (Carlos — ya desembolsado) ─────────
insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea, cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
values ('CRE-0001-7',
  (select id from usuarios where codigo='carlos.ramirez@qapaq.pe'),
  'Consumo', 9000.00, 24, 40.92, 536.05, 8240.00, 0, 'Normal', 'Al día',
  current_date - interval '40 days');

-- Cuotas del crédito demo (primeras 3 para referencia)
insert into cuotas_credito (credito_id, numero, fecha_pago, cuota, capital, interes, saldo, estado)
select c.id, n,
  (current_date - interval '40 days') + (n || ' months')::interval,
  536.05, 258.80+(n-1)*8.2, 277.25-(n-1)*8.2,
  max(0, 8741.20-(n-1)*266.0),
  case when n=1 then 'Pagada' else 'Pendiente' end
from creditos c, generate_series(1,24) n
where c.codigo='CRE-0001-7';

-- ── CRÉDITOS EN MORA (para módulo Recuperaciones) ───────────
insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea, cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso) values
  ('CRE-MORA-01', (select id from usuarios where codigo='carlos.ramirez@qapaq.pe'), 'Microempresa', 5000.00,  18, 43.92, 366.02, 4500.00,  15,  'Mora', 'Preventiva', current_date-interval '3 months'),
  ('CRE-MORA-02', (select id from usuarios where codigo='ana.torres@qapaq.pe'),     'Consumo',      3000.00,  12, 40.92, 299.59, 2700.00,  45,  'Mora', 'Temprana',   current_date-interval '4 months'),
  ('CRE-MORA-03', (select id from usuarios where codigo='rosa.mamani@qapaq.pe'),    'Microempresa', 8000.00,  24, 43.92, 476.00, 7200.00,  90,  'Mora', 'Tardía',     current_date-interval '5 months'),
  ('CRE-MORA-04', (select id from usuarios where codigo='carlos.ramirez@qapaq.pe'), 'Consumo',      12000.00, 24, 40.92, 700.94, 11000.00, 130, 'Mora', 'Judicial',   current_date-interval '6 months'),
  ('CRE-MORA-05', (select id from usuarios where codigo='ana.torres@qapaq.pe'),     'Microempresa', 15000.00, 36, 43.92, 693.00, 14000.00, 200, 'Mora', 'Castigo',    current_date-interval '8 months'),
  ('CRE-MORA-06', (select id from usuarios where codigo='rosa.mamani@qapaq.pe'),    'Microempresa', 10000.00, 24, 43.92, 536.05, 9500.00,  190, 'Mora', 'Judicial',   current_date-interval '9 months');

-- ═══════════════════════════════════════════════════════════
--  VERIFICACIÓN FINAL
-- ═══════════════════════════════════════════════════════════
-- Ejecuta estas queries para verificar que todo quedó bien:
--
-- select codigo, nombre, rol from usuarios;
-- select codigo, saldo from cuentas_ahorro;
-- select codigo, dias_atraso, banda_mora from creditos order by dias_atraso;
--
-- ── USUARIOS CREADOS ────────────────────────────────────────
-- carlos.ramirez@qapaq.pe / demo1234    → cliente (con historial)
-- rosa.mamani@qapaq.pe   / qapaq2026   → cliente (con historial)
-- ana.torres@qapaq.pe    / cliente2026 → cliente (cuenta limpia)
-- maria.quispe@qapaq.pe  / asesor1234  → asesor de negocios
-- jorge.torres@qapaq.pe  / comite1234  → comité de créditos
