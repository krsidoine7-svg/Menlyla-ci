const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to read .env file manually since we can't use view_file
let envContent = '';
try {
    envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
} catch (e) {
    console.error('Could not read .env file');
}

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Adding settings column...');
    const { error } = await supabase.rpc('execute_sql', {
        sql: 'ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT \'{}\''
    });

    if (error) {
        // execute_sql might not exist, try common hack if possible or just fail
        console.error('Error adding column via RPC:', error.message);
        console.log('\nPlease run this SQL in your Supabase SQL Editor manually:');
        console.log('ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT \'{}\';');
    } else {
        console.log('Column added successfully!');
    }
}

run();
