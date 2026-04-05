const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'restaurants' });
  if (error) {
    // If RPC doesn't exist, try a simple select
    const { data: sample, error: selectError } = await supabase.from('restaurants').select('*').limit(1);
    if (selectError) {
      console.error(selectError);
      return;
    }
    console.log('Columns:', Object.keys(sample[0] || {}));
  } else {
    console.log('Columns:', data);
  }
}

checkColumns();
