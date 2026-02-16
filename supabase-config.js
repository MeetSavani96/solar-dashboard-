// supabase-config.js
const SUPABASE_URL = "https://rerfweyqwizorswucqcs.supabase.co";
const SUPABASE_ANON_KEY = "PASTE_NEW_ANON_PUBLIC_KEY_HERE";

window.supabase = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
