
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 's:/Menlyla/.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- Checking Profiles ---');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(5);
    if (pError) console.error('Profiles Error:', pError);
    else console.log('Profiles found:', profiles.length, profiles[0] ? '(Sample ID: ' + profiles[0].id + ')' : '(Empty)');

    console.log('\n--- Checking Admins ---');
    const { data: admins, error: aError } = await supabase.from('app_admins').select('*');
    if (aError) console.error('Admins Error:', aError);
    else console.log('Admins found:', admins.length);

    console.log('\n--- Checking Join ---');
    const { data: join, error: jError } = await supabase.from('profiles').select('*, app_admins(id)').limit(1);
    if (jError) {
        console.error('Join Error (Expected if no FK):', jError.message);
    } else {
        console.log('Join Success:', join);
    }
}

debug();
