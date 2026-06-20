-- ============================================================
--  SCRIPT 02 — Datos semilla: usuarios
-- ============================================================

insert into usuarios (codigo, nombre, dni, password, rol) values
  ('carlos.ramirez@qapaq.pe', 'Ramírez Soto, Carlos',  '11200007', 'demo1234',    'cliente'),
  ('rosa.mamani@qapaq.pe',    'Mamani Huanca, Rosa',   '45123001', 'qapaq2026',   'cliente'),
  ('ana.torres@qapaq.pe',     'Torres Vega, Ana',      '48556677', 'cliente2026', 'cliente'),
  ('maria.quispe@qapaq.pe',   'Quispe Flores, María',  '70011223', 'asesor1234',  'asesor'),
  ('jorge.torres@qapaq.pe',   'Torres Vega, Jorge',    '70022334', 'comite1234',  'comite')
on conflict (codigo) do nothing;
