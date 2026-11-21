-- PASO 1 — Añadir el nuevo valor Escritor al tipo de rol existente.
-- Ejecuta este archivo por separado y espera a que termine antes del PASO 2.
DO $$
DECLARE
  role_type regtype;
  role_kind "char";
BEGIN
  SELECT a.atttypid::regtype, t.typtype
    INTO role_type, role_kind
  FROM pg_attribute a
  JOIN pg_type t ON t.oid = a.atttypid
  WHERE a.attrelid = 'public.profiles'::regclass
    AND a.attname = 'role'
    AND NOT a.attisdropped;

  IF role_type IS NULL THEN
    RAISE EXCEPTION 'No se encontró public.profiles.role. No se aplicó ningún cambio.';
  END IF;

  IF role_kind = 'e' THEN
    EXECUTE format('ALTER TYPE %s ADD VALUE IF NOT EXISTS %L', role_type, 'writer');
  ELSIF role_kind NOT IN ('b') THEN
    RAISE EXCEPTION 'El tipo de public.profiles.role (%) no es un enum ni un tipo de texto compatible.', role_type;
  END IF;
END
$$;
