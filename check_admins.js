const { loadEnvConfig } = require('@next/env')
const { createClient } = require('@supabase/supabase-js')

const projectDir = process.cwd()
loadEnvConfig(projectDir)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
    console.log("Listing app_admins...")
    const { data: admins, error } = await supabase.from('app_admins').select('*')
    if (error) console.error("Error:", error)
    else console.log(admins)
}
run()
