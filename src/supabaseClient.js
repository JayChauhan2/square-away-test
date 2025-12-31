
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hpgvvkgbfisakffrygmd.supabase.co"; //import.meta.env.SUPABASE_URL
const supabaseAnonKey = "sb_publishable_NQNz2BGCEmH2QvqDRUvFaQ_CQD01H99" //import.meta.env.SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
