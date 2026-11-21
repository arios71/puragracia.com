const SUPABASE_URL = "https://kcrehxxnsfszfcikofsw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Osi7AyLU3svYgUomDTEfpw_h52xCrgr";
const ALLOWED_ROLES = new Set(["admin", "editor", "writer"]);

function allowedOrigin(origin) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:") return false;
    if (["www.puragracia.com", "puragracia.com", "puragracia-radio-api-nine.vercel.app"].includes(url.hostname)) return true;
    return url.hostname.endsWith(".vercel.app") && url.hostname.startsWith("puragracia-radio-");
  } catch (_) {
    return false;
  }
}

function send(res, status, payload) {
  return res.status(status).json(payload);
}

async function supabaseFetch(path, options = {}, serviceKey) {
  return fetch(SUPABASE_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: "Bearer " + serviceKey,
      ...(options.headers || {})
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12000)
  });
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return send(res, 405, { ok: false, error: "Método no permitido." });
  }
  if (!allowedOrigin(origin)) return send(res, 403, { ok: false, error: "Origen no autorizado." });

  const serviceKey = process.env.PGR_SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return send(res, 500, { ok: false, error: "Falta configurar PGR_SUPABASE_SERVICE_ROLE_KEY en Vercel." });

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return send(res, 401, { ok: false, error: "Debes iniciar sesión." });

  try {
    const authResponse = await fetch(SUPABASE_URL + "/auth/v1/user", {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + token },
      cache: "no-store",
      signal: AbortSignal.timeout(10000)
    });
    if (!authResponse.ok) return send(res, 401, { ok: false, error: "La sesión no es válida o ha expirado." });
    const authUser = await authResponse.json();

    const profileResponse = await supabaseFetch(
      "/rest/v1/profiles?select=role&id=eq." + encodeURIComponent(authUser.id),
      { method: "GET" },
      serviceKey
    );
    if (!profileResponse.ok) return send(res, 500, { ok: false, error: "No se pudo verificar el perfil administrativo." });
    const profiles = await profileResponse.json();
    if (!profiles[0] || profiles[0].role !== "admin") {
      return send(res, 403, { ok: false, error: "Solo un Administrador puede gestionar colaboradores." });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    if (body.action === "invite") {
      const email = String(body.email || "").trim().toLowerCase();
      const role = String(body.role || "");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 400, { ok: false, error: "Introduce un correo electrónico válido." });
      if (!ALLOWED_ROLES.has(role)) return send(res, 400, { ok: false, error: "El rol seleccionado no es válido." });

      const redirectTo = "https://www.puragracia.com/admin.html";
      const inviteResponse = await supabaseFetch(
        "/auth/v1/invite?redirect_to=" + encodeURIComponent(redirectTo),
        { method: "POST", body: JSON.stringify({ email, data: { invited_role: role } }) },
        serviceKey
      );
      const invited = await inviteResponse.json().catch(() => ({}));
      if (!inviteResponse.ok) {
        const detail = invited.msg || invited.message || invited.error_description || invited.error;
        if (inviteResponse.status === 422 || inviteResponse.status === 409) {
          return send(res, 409, { ok: false, error: "Ese correo ya tiene una cuenta o una invitación pendiente. Revisa la lista de colaboradores." });
        }
        return send(res, 502, { ok: false, error: detail || "Supabase no pudo enviar la invitación." });
      }

      const userId = invited.id || invited.user?.id;
      if (!userId) return send(res, 502, { ok: false, error: "Supabase aceptó la invitación, pero no devolvió el identificador de la cuenta." });

      const profileUpsert = await supabaseFetch(
        "/rest/v1/profiles?on_conflict=id",
        {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({ id: userId, email, role })
        },
        serviceKey
      );
      if (!profileUpsert.ok) {
        await supabaseFetch("/auth/v1/admin/users/" + encodeURIComponent(userId), { method: "DELETE" }, serviceKey).catch(() => {});
        const detail = await profileUpsert.text().catch(() => "");
        console.error("Editorial profile upsert failed:", detail);
        return send(res, 500, { ok: false, error: "No se pudo asignar el rol. La invitación fue cancelada; verifica primero la configuración de roles en Supabase." });
      }
      return send(res, 200, { ok: true, message: "Invitación enviada.", email, role });
    }

    if (body.action === "set-role") {
      const userId = String(body.userId || "").trim();
      const role = String(body.role || "");
      if (!userId || !ALLOWED_ROLES.has(role)) return send(res, 400, { ok: false, error: "Usuario o rol no válido." });
      if (userId === authUser.id && role !== "admin") return send(res, 400, { ok: false, error: "No puedes cambiar tu propio rol." });

      const updateResponse = await supabaseFetch(
        "/rest/v1/profiles?id=eq." + encodeURIComponent(userId),
        { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ role }) },
        serviceKey
      );
      if (!updateResponse.ok) {
        const detail = await updateResponse.text().catch(() => "");
        console.error("Editorial role update failed:", detail);
        return send(res, 500, { ok: false, error: "No se pudo actualizar el rol. Comprueba que la base de datos ya admite Administrador, Editor y Escritor." });
      }
      return send(res, 200, { ok: true, message: "Rol actualizado." });
    }

    return send(res, 400, { ok: false, error: "Acción no reconocida." });
  } catch (error) {
    console.error("Editorial users API error:", error);
    return send(res, 500, { ok: false, error: "Ocurrió un error al gestionar colaboradores." });
  }
};
