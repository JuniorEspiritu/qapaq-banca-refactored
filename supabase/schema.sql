-- ============================================================
--  QAPAQ BANCA — Esquema completo para Supabase (Postgres)
--  Ejecuta TODO este archivo en: Supabase → SQL Editor → New query
-- ============================================================

-- Extensión necesaria para gen_random_uuid()
create extension if not exists pgcrypto;

-- ============================================================
-- 1) USUARIOS (clientes, asesores, comité)
--    Login simple por código + clave (manejado por el backend).
-- ============================================================
create table if not exists usuarios (
  id        uuid primary key default gen_random_uuid(),
  codigo    text unique not null,        -- 'carlos.ramirez@qapaq.pe', 'maria.quispe@qapaq.pe', 'jorge.torres@qapaq.pe'
  nombre    text not null,               -- 'Apellido, Nombre'
  dni       text,
  password  text not null,               -- demo: texto plano (proyecto académico)
  rol       text not null default 'cliente'
            check (rol in ('cliente','asesor','comite')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2) CUENTAS DE AHORRO
-- ============================================================
create table if not exists cuentas_ahorro (
  id          uuid primary key default gen_random_uuid(),
  codigo      text unique not null,      -- 'AHO-0001-7'
  usuario_id  uuid not null references usuarios(id) on delete cascade,
  tipo        text not null default 'Insuperable',
  moneda      text not null default 'SO',
  saldo       numeric(12,2) not null default 0,
  estado      text not null default 'Activo',
  created_at  timestamptz not null default now()
);

create table if not exists movimientos_ahorro (
  id          uuid primary key default gen_random_uuid(),
  cuenta_id   uuid not null references cuentas_ahorro(id) on delete cascade,
  fecha       timestamptz not null default now(),
  descripcion text not null,
  monto       numeric(12,2) not null,    -- + ingreso / - egreso
  saldo       numeric(12,2) not null     -- saldo resultante
);

-- ============================================================
-- 3) CRÉDITOS ACTIVOS + CRONOGRAMA
-- ============================================================
create table if not exists creditos (
  id              uuid primary key default gen_random_uuid(),
  codigo          text unique not null,  -- 'CRE-0001-7'
  usuario_id      uuid not null references usuarios(id) on delete cascade,
  solicitud_id    uuid,  -- FK añadida más abajo (referencia a solicitudes_credito)
  tipo_credito    text not null,         -- 'Microempresa' | 'Consumo'
  monto           numeric(12,2) not null,
  plazo           integer not null,
  tea             numeric(6,2) not null,
  cuota_mensual   numeric(12,2) not null,
  saldo_pendiente numeric(12,2) not null,
  dias_atraso     integer not null default 0,
  estado          text not null default 'Normal',  -- 'Normal' | 'Mora'
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
  estado       text not null default 'Pendiente'  -- 'Pendiente' | 'Pagada' | 'Vencida'
);

-- ============================================================
-- 4) SOLICITUDES DE CRÉDITO (flujo cliente → asesor/comité)
-- ============================================================
create table if not exists solicitudes_credito (
  id                uuid primary key default gen_random_uuid(),
  codigo            text unique not null,   -- 'SOL0000001'
  usuario_id        uuid not null references usuarios(id) on delete cascade,
  tipo_credito      text not null,          -- 'Microempresa' | 'Consumo'
  actividad         text,
  monto             numeric(12,2) not null,
  plazo             integer not null,
  tea               numeric(6,2) not null,
  ingreso_neto      numeric(12,2) not null,
  cuota_mensual     numeric(12,2) not null,
  rds               numeric(6,2) not null,  -- ratio deuda/ingreso, %
  scoring           integer,                -- 0-100, score crediticio
  categoria_riesgo  text,                   -- 'A' | 'B' | 'C'
  semaforo          text,                   -- 'verde' | 'amarillo' | 'rojo'
  nivel_aprobacion  text,                   -- 'asesor' | 'comite' (ruta de aprobación por monto)
  estado            text not null default 'En Evaluación'
                    check (estado in ('En Evaluación','Aprobado','Rechazado','Desembolsado')),
  fecha_solicitud   date not null default current_date,
  asesor_id         uuid references usuarios(id),
  comentario_asesor text,
  fecha_resolucion  timestamptz,
  created_at        timestamptz not null default now()
);

-- (la FK de creditos.solicitud_id se crea después de esta tabla)
alter table creditos
  add constraint creditos_solicitud_fk
  foreign key (solicitud_id) references solicitudes_credito(id);

-- Índices
create index if not exists idx_solicitudes_estado   on solicitudes_credito (estado);
create index if not exists idx_solicitudes_usuario  on solicitudes_credito (usuario_id);
create index if not exists idx_creditos_usuario     on creditos (usuario_id);
create index if not exists idx_cuentas_usuario      on cuentas_ahorro (usuario_id);
create index if not exists idx_movimientos_cuenta   on movimientos_ahorro (cuenta_id);
create index if not exists idx_cuotas_credito       on cuotas_credito (credito_id);

-- ============================================================
-- 5) RLS — todo el acceso pasa por el backend con la
--    SERVICE ROLE KEY (que ignora RLS). El frontend NUNCA
--    accede directo con la anon key a estas tablas.
-- ============================================================
alter table usuarios            enable row level security;
alter table cuentas_ahorro       enable row level security;
alter table movimientos_ahorro   enable row level security;
alter table creditos              enable row level security;
alter table cuotas_credito       enable row level security;
alter table solicitudes_credito  enable row level security;
-- Sin políticas para 'anon' => acceso denegado por defecto. ✔

-- ============================================================
-- 6) DATOS DEMO (igual al flujo que probó tu compañero)
-- ============================================================

-- Cliente: Carlos
insert into usuarios (codigo, nombre, dni, password, rol)
values ('carlos.ramirez@qapaq.pe', 'Ramírez Soto, Carlos', '11200007', 'demo1234', 'cliente')
on conflict (codigo) do nothing;

-- Cliente 2 (para más pruebas)
insert into usuarios (codigo, nombre, dni, password, rol)
values ('rosa.mamani@qapaq.pe', 'Mamani Huanca, Rosa', '45123001', 'qapaq2026', 'cliente')
on conflict (codigo) do nothing;

-- Asesor de negocios
insert into usuarios (codigo, nombre, dni, password, rol)
values ('maria.quispe@qapaq.pe', 'Quispe Flores, María', '70011223', 'asesor1234', 'asesor')
on conflict (codigo) do nothing;

-- Comité de créditos
insert into usuarios (codigo, nombre, dni, password, rol)
values ('jorge.torres@qapaq.pe', 'Torres Vega, Jorge', '70022334', 'comite1234', 'comite')
on conflict (codigo) do nothing;

-- Cliente 3: cuenta "limpia" (sin créditos previos), ideal para probar
-- el flujo completo de solicitud → aprobación → desembolso desde cero.
insert into usuarios (codigo, nombre, dni, password, rol)
values ('ana.torres@qapaq.pe', 'Torres Vega, Ana', '48556677', 'cliente2026', 'cliente')
on conflict (codigo) do nothing;

insert into cuentas_ahorro (codigo, usuario_id, tipo, moneda, saldo, estado)
select 'AHO-0003-7', id, 'Insuperable', 'SO', 500.00, 'Activo'
from usuarios where codigo='ana.torres@qapaq.pe'
on conflict (codigo) do nothing;

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now() - interval '2 days', 'Apertura de cuenta', 500.00, 500.00
from cuentas_ahorro c where c.codigo='AHO-0003-7'
on conflict do nothing;

-- Cuentas de ahorro de Carlos
insert into cuentas_ahorro (codigo, usuario_id, tipo, moneda, saldo, estado)
select 'AHO-0001-7', id, 'Insuperable', 'SO', 3850.00, 'Activo'
from usuarios where codigo='carlos.ramirez@qapaq.pe'
on conflict (codigo) do nothing;

insert into cuentas_ahorro (codigo, usuario_id, tipo, moneda, saldo, estado)
select 'AHO-0002-7', id, 'Qapital+', 'SO', 1200.50, 'Activo'
from usuarios where codigo='carlos.ramirez@qapaq.pe'
on conflict (codigo) do nothing;

-- Movimientos demo de la cuenta AHO-0001-7
insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now() - interval '24 days', 'Depósito en efectivo', 500.00, 3850.00
from cuentas_ahorro c where c.codigo='AHO-0001-7'
on conflict do nothing;

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now() - interval '19 days', 'Pago servicio agua - Sedapal', -45.50, 3350.00
from cuentas_ahorro c where c.codigo='AHO-0001-7'
on conflict do nothing;

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now() - interval '14 days', 'Abono de intereses', 12.30, 3395.50
from cuentas_ahorro c where c.codigo='AHO-0001-7'
on conflict do nothing;

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now() - interval '10 days', 'Transferencia recibida', 200.00, 3383.20
from cuentas_ahorro c where c.codigo='AHO-0001-7'
on conflict do nothing;

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now() - interval '5 days', 'Retiro en cajero', -300.00, 3183.20
from cuentas_ahorro c where c.codigo='AHO-0001-7'
on conflict do nothing;

-- Crédito vigente de ejemplo para Carlos (Consumo, ya desembolsado)
with cr as (
  insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea, cuota_mensual, saldo_pendiente, dias_atraso, estado, fecha_desembolso)
  select 'CRE-0001-7', id, 'Consumo', 9000.00, 24, 40.92, 536.05, 8240.00, 0, 'Normal', current_date - interval '40 days'
  from usuarios where codigo='carlos.ramirez@qapaq.pe'
  on conflict (codigo) do nothing
  returning id
)
insert into cuotas_credito (credito_id, numero, fecha_pago, cuota, capital, interes, saldo, estado)
select cr.id, n, (current_date - interval '40 days') + (n || ' months')::interval,
       536.05,
       258.80 + (n-1)*8.2,
       277.25 - (n-1)*8.2,
       8741.20 - (n-1)*266.0,
       case when n <= 1 then 'Pagada' else 'Pendiente' end
from cr, generate_series(1,24) as n
on conflict do nothing;

-- ============================================================
-- LISTO ✅
--  - Cliente demo (con historial):  carlos.ramirez@qapaq.pe / demo1234
--  - Cliente 2 (con historial):     rosa.mamani@qapaq.pe / qapaq2026
--  - Cliente 3 (cuenta limpia):     ana.torres@qapaq.pe / cliente2026
--  - Asesor demo:                   maria.quispe@qapaq.pe / asesor1234
--  - Comité demo:                   jorge.torres@qapaq.pe / comite1234
-- ============================================================
