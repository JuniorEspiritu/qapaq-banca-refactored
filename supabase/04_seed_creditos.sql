-- ============================================================
--  SCRIPT 04 — Datos semilla: crédito vigente de Carlos
--  (proporción mora ~13%: 1 normal de 8 totales aprox.)
-- ============================================================

-- Crédito de consumo vigente de Carlos (ya desembolsado, estado Normal)
insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-0001-7', id, 'Consumo', 9000.00, 24, 40.92,
  536.05, 8240.00, 0, 'Normal', 'Al día', current_date - interval '40 days'
from usuarios where codigo='carlos.ramirez@qapaq.pe'
on conflict (codigo) do nothing;

-- Primeras 2 cuotas del cronograma (la 1 pagada, el resto pendientes)
insert into cuotas_credito (credito_id, numero, fecha_pago, cuota, capital, interes, saldo, estado)
select c.id, 1, (current_date - interval '40 days') + interval '1 month',
  536.05, 258.80, 277.25, 8741.20, 'Pagada'
from creditos c where c.codigo='CRE-0001-7'
on conflict do nothing;

insert into cuotas_credito (credito_id, numero, fecha_pago, cuota, capital, interes, saldo, estado)
select c.id, 2, (current_date - interval '40 days') + interval '2 months',
  536.05, 266.77, 269.28, 8474.43, 'Pendiente'
from creditos c where c.codigo='CRE-0001-7'
on conflict do nothing;
