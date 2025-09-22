import { createClient } from '@supabase/supabase-js'
const url = process.env.SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE
const anon = process.env.SUPABASE_ANON_KEY
export const supabaseAdmin = url && serviceKey ? createClient(url, serviceKey, { auth: { persistSession: false }}) : null
export const supabaseRead = url && (anon || serviceKey) ? createClient(url, (anon || serviceKey)!, { auth: { persistSession: false }}) : null
