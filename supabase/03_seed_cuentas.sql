-- ============================================================
--  SCRIPT 03 — Datos semilla: cuentas de ahorro y movimientos
-- ============================================================

-- Cuentas de Carlos (2 productos de ahorro)
insert into cuentas_ahorro (codigo, usuario_id, tipo, moneda, saldo, estado)
select 'AHO-0001-7', id, 'Insuperable', 'SO', 3850.00, 'Activo'
from usuarios where codigo='carlos.ramirez@qapaq.pe'
on conflict (codigo) do nothing;

insert into cuentas_ahorro (codigo, usuario_id, tipo, moneda, saldo, estado)
select 'AHO-0002-7', id, 'Qapital+', 'SO', 1200.50, 'Activo'
from usuarios where codigo='carlos.ramirez@qapaq.pe'
on conflict (codigo) do nothing;

-- Cuenta de Ana (limpia, para pruebas del flujo completo)
insert into cuentas_ahorro (codigo, usuario_id, tipo, moneda, saldo, estado)
select 'AHO-0003-7', id, 'Insuperable', 'SO', 500.00, 'Activo'
from usuarios where codigo='ana.torres@qapaq.pe'
on conflict (codigo) do nothing;

-- Movimientos demo de Carlos
insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now() - interval '24 days', 'Depósito en efectivo',        +500.00, 3850.00
from cuentas_ahorro c where c.codigo='AHO-0001-7';

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now() - interval '19 days', 'Pago servicio agua - Sedapal', -45.50, 3350.00
from cuentas_ahorro c where c.codigo='AHO-0001-7';

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now() - interval '14 days', 'Abono de intereses',           +12.30, 3395.50
from cuentas_ahorro c where c.codigo='AHO-0001-7';

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now() - interval '10 days', 'Transferencia recibida',      +200.00, 3383.20
from cuentas_ahorro c where c.codigo='AHO-0001-7';

insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now() - interval '5 days',  'Retiro en cajero',            -300.00, 3183.20
from cuentas_ahorro c where c.codigo='AHO-0001-7';

-- Movimiento apertura de Ana
insert into movimientos_ahorro (cuenta_id, fecha, descripcion, monto, saldo)
select c.id, now() - interval '2 days', 'Apertura de cuenta', +500.00, 500.00
from cuentas_ahorro c where c.codigo='AHO-0003-7';
