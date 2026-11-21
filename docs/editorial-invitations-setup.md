# Configuración de invitaciones del panel editorial

Esta configuración se realiza una sola vez. Las invitaciones y los cambios de rol posteriores se administran desde el panel editorial.

## 1. Supabase: migración de permisos

En Supabase, abre **SQL Editor** y ejecuta los archivos en este orden, cada uno por separado:

1. `supabase/migrations/20261121_01_add_writer_role.sql`
2. `supabase/migrations/20261121_02_editorial_permissions.sql`

El primer archivo añade el valor `writer` al tipo de rol si es un enum. El segundo convierte las cuentas antiguas `publisher` en `writer`, configura las políticas RLS y reserva la gestión de roles al servidor.

## 2. Vercel: clave privada para la API

En el proyecto Vercel conectado a este repositorio, abre **Settings → Environment Variables** y crea:

- **Name:** `PGR_SUPABASE_SERVICE_ROLE_KEY`
- **Value:** la Secret key de Supabase (`sb_secret_...`) o la clave heredada `service_role`.
- **Environment:** **Preview** durante las pruebas. No la añadas a Production hasta aprobar la implementación.

Esta clave tiene privilegios administrativos y solo la utiliza `api/editorial-users.js`. Nunca debe añadirse a archivos JavaScript del navegador ni al repositorio.

## 3. Supabase: URL de retorno permitida

En **Authentication → URL Configuration → Redirect URLs**, permite la dirección exacta de la vista previa de Vercel que se utilizará para probar la invitación, terminada en `/admin.html`.

Cuando la implementación se apruebe para producción, también debe estar permitida:

`https://www.puragracia.com/admin.html`

## 4. Supabase: plantilla del correo de invitación

En **Authentication → Email Templates → Invite user**, configura:

**Subject**

`Invitación a colaborar en los artículos de Pura Gracia Radio`

**Body (HTML)**

```html
<h2>Invitación al equipo editorial de Pura Gracia Radio</h2>

<p>Has sido invitado(a) a colaborar en la sección de artículos de <strong>Pura Gracia Radio</strong>, participando en la redacción, edición y publicación de contenido, según los permisos asignados a tu cuenta.</p>

<p>Para comenzar, pulsa el siguiente enlace y establece tu contraseña de acceso al panel editorial.</p>

<p><a href="{{ .ConfirmationURL }}">Aceptar invitación y establecer mi contraseña</a></p>

<p>¡Bienvenido(a) al equipo editorial de Pura Gracia Radio!</p>
```

El enlace confirma la invitación y devuelve a la persona al panel, donde aparece el formulario para crear y confirmar su contraseña.

## Roles

- **Administrador:** administra colaboradores y roles; crea, edita, publica, despublica y elimina artículos.
- **Editor:** crea y edita cualquier artículo; publica y despublica. No administra colaboradores ni elimina artículos.
- **Escritor:** crea artículos y guarda o edita únicamente sus propios borradores. No publica, despublica ni administra colaboradores.
