const { createClient } = require("@supabase/supabase-js");

let cachedClient = null;

function getSupabaseAdmin() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    const err = new Error("SUPABASE_NOT_CONFIGURED");
    err.code = "SUPABASE_NOT_CONFIGURED";
    throw err;
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedClient;
}

function isSupabaseConfigError(err) {
  return err && err.code === "SUPABASE_NOT_CONFIGURED";
}

module.exports = {
  getSupabaseAdmin,
  isSupabaseConfigError,
  STORAGE_BUCKET: "seah-media",
};
