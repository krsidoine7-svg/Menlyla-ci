
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 's:/Menlyla/.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing URL or Key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profiles count:', count);
  }

  const { data: users, error: selectError } = await supabase
    .from('profiles')
    .select('*, app_admins(id)')
    .limit(1);

  if (selectError) {
    console.error('Error with join:', selectError);
  } else {
    console.log('Sample user with admin join:', users);
  }
}

checkProfiles();
