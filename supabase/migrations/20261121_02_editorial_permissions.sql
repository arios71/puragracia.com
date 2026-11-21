-- PASO 2 — Aplicar los tres roles y sus permisos en Supabase.
-- Ejecuta únicamente después de completar 20261121_01_add_writer_role.sql.

BEGIN;

-- Eliminar restricciones CHECK antiguas que todavía permitan publisher y no writer.
DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', item.conname);
  END LOOP;
END
$$;

-- Las cuentas antiguas Publicador pasan a Escritor.
UPDATE public.profiles
SET role = 'writer'
WHERE role::text = 'publisher';

-- Toda cuenta nueva comienza con el permiso mínimo; la invitación asigna después el rol elegido.
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'writer';

-- Si role es texto, restringir explícitamente sus valores.
DO $$
DECLARE
  role_kind "char";
BEGIN
  SELECT t.typtype INTO role_kind
  FROM pg_attribute a
  JOIN pg_type t ON t.oid = a.atttypid
  WHERE a.attrelid = 'public.profiles'::regclass
    AND a.attname = 'role'
    AND NOT a.attisdropped;

  IF role_kind <> 'e' THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_allowed
      CHECK (role::text IN ('admin', 'editor', 'writer'));
  END IF;
END
$$;

-- Función segura para consultar el rol actual desde las políticas RLS.
CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role::text
  FROM public.profiles AS p
  WHERE p.id = auth.uid()
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;

-- Garantizar que cualquier perfil creado automáticamente por Auth comience como Escritor.
CREATE OR REPLACE FUNCTION public.pgr_set_default_writer_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'writer')
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        role = 'writer';
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS pgr_set_default_writer_profile ON auth.users;
CREATE TRIGGER pgr_set_default_writer_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.pgr_set_default_writer_profile();

-- Reemplazar las políticas anteriores para que los permisos sean inequívocos.
DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'articles')
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', item.policyname, item.schemaname, item.tablename);
  END LOOP;
END
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Cada usuario puede leer su propio perfil; solo administradores pueden leer el directorio completo.
CREATE POLICY profiles_read_self_or_admin
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.current_app_role() = 'admin');

-- El público solo puede leer artículos publicados.
CREATE POLICY articles_public_read_published
ON public.articles
FOR SELECT
TO anon, authenticated
USING (status::text = 'published');

-- Administradores y editores pueden leer todo; escritores solo sus propios artículos.
CREATE POLICY articles_editorial_read
ON public.articles
FOR SELECT
TO authenticated
USING (
  public.current_app_role() IN ('admin', 'editor')
  OR created_by = auth.uid()
);

-- Administradores y editores pueden crear; escritores solo pueden crear borradores propios.
CREATE POLICY articles_create_by_role
ON public.articles
FOR INSERT
TO authenticated
WITH CHECK (
  public.current_app_role() IN ('admin', 'editor')
  OR (
    public.current_app_role() = 'writer'
    AND created_by = auth.uid()
    AND status::text = 'draft'
  )
);

-- Administradores y editores editan cualquier artículo.
-- Escritores solo pueden editar sus propios borradores y mantenerlos como borradores.
CREATE POLICY articles_update_by_role
ON public.articles
FOR UPDATE
TO authenticated
USING (
  public.current_app_role() IN ('admin', 'editor')
  OR (
    public.current_app_role() = 'writer'
    AND created_by = auth.uid()
    AND status::text = 'draft'
  )
)
WITH CHECK (
  public.current_app_role() IN ('admin', 'editor')
  OR (
    public.current_app_role() = 'writer'
    AND created_by = auth.uid()
    AND status::text = 'draft'
  )
);

-- Solo administradores pueden borrar artículos.
CREATE POLICY articles_delete_admin_only
ON public.articles
FOR DELETE
TO authenticated
USING (public.current_app_role() = 'admin');

-- Publicar y despublicar queda reservado a Administradores y Editores.
CREATE OR REPLACE FUNCTION public.publish_article(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.current_app_role() NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'No tienes permiso para publicar artículos.';
  END IF;

  UPDATE public.articles
  SET status = 'published',
      updated_at = now()
  WHERE id = article_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró el artículo solicitado.';
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.unpublish_article(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.current_app_role() NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'No tienes permiso para despublicar artículos.';
  END IF;

  UPDATE public.articles
  SET status = 'draft',
      updated_at = now()
  WHERE id = article_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró el artículo solicitado.';
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.delete_article(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.current_app_role() <> 'admin' THEN
    RAISE EXCEPTION 'Solo un Administrador puede eliminar artículos.';
  END IF;

  DELETE FROM public.articles WHERE id = article_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró el artículo solicitado.';
  END IF;
END
$$;

REVOKE ALL ON FUNCTION public.publish_article(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.unpublish_article(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_article(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_article(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unpublish_article(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_article(uuid) TO authenticated;

COMMIT;
