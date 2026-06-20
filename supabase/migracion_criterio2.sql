-- ============================================================
--  MIGRACIÓN — Criterio 2: scoring, semáforo y ruta de aprobación
--  Ejecuta esto en el SQL Editor de Supabase (proyecto ya existente).
--  Si vas a crear el proyecto desde cero, no es necesario: estas
--  columnas ya están incluidas en schema.sql.
-- ============================================================

alter table solicitudes_credito
  add column if not exists scoring          integer,
  add column if not exists categoria_riesgo text,   -- 'A' | 'B' | 'C'
  add column if not exists semaforo         text,   -- 'verde' | 'amarillo' | 'rojo'
  add column if not exists nivel_aprobacion text;    -- 'asesor' | 'comite'
