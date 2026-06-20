-- ============================================================
--  SCRIPT 05 — Datos semilla: cartera morosa (~13% del total)
--  Criterio 4: bandas Preventiva/Temprana/Tardía/Judicial/Castigo
-- ============================================================

-- Preventiva (15 días) — Carlos
insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-MORA-01', id, 'Microempresa', 5000.00, 18, 43.92,
  366.02, 4500.00, 15, 'Mora', 'Preventiva', current_date - interval '3 months'
from usuarios where codigo='carlos.ramirez@qapaq.pe'
on conflict (codigo) do nothing;

-- Temprana (45 días) — Ana
insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-MORA-02', id, 'Consumo', 3000.00, 12, 40.92,
  299.59, 2700.00, 45, 'Mora', 'Temprana', current_date - interval '4 months'
from usuarios where codigo='ana.torres@qapaq.pe'
on conflict (codigo) do nothing;

-- Tardía (90 días) — Rosa
insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-MORA-03', id, 'Microempresa', 8000.00, 24, 43.92,
  476.00, 7200.00, 90, 'Mora', 'Tardía', current_date - interval '5 months'
from usuarios where codigo='rosa.mamani@qapaq.pe'
on conflict (codigo) do nothing;

-- Judicial (130 días) — Carlos
insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-MORA-04', id, 'Consumo', 12000.00, 24, 40.92,
  700.94, 11000.00, 130, 'Mora', 'Judicial', current_date - interval '6 months'
from usuarios where codigo='carlos.ramirez@qapaq.pe'
on conflict (codigo) do nothing;

-- Castigo (200 días) — Ana
insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-MORA-05', id, 'Microempresa', 15000.00, 36, 43.92,
  693.00, 14000.00, 200, 'Mora', 'Castigo', current_date - interval '8 months'
from usuarios where codigo='ana.torres@qapaq.pe'
on conflict (codigo) do nothing;

-- Judicial (190 días) — Rosa (para prueba de castigo desde cero)
insert into creditos (codigo, usuario_id, tipo_credito, monto, plazo, tea,
  cuota_mensual, saldo_pendiente, dias_atraso, estado, banda_mora, fecha_desembolso)
select 'CRE-MORA-06', id, 'Microempresa', 10000.00, 24, 43.92,
  536.05, 9500.00, 190, 'Mora', 'Judicial', current_date - interval '9 months'
from usuarios where codigo='rosa.mamani@qapaq.pe'
on conflict (codigo) do nothing;
