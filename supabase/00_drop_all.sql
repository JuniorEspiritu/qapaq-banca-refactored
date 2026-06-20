-- ============================================================
--  SCRIPT 00 — Limpieza completa (drop all)
--  Ejecutar PRIMERO si se quiere reinstalar desde cero.
--  ADVERTENCIA: borra todos los datos.
-- ============================================================
drop table if exists gestiones_cobranza   cascade;
drop table if exists cuotas_credito       cascade;
drop table if exists creditos             cascade;
drop table if exists solicitudes_credito  cascade;
drop table if exists movimientos_ahorro   cascade;
drop table if exists cuentas_ahorro       cascade;
drop table if exists usuarios             cascade;
