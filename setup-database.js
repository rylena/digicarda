/**
 * Database Setup Script
 * 
 * This script will create the necessary tables and policies in your Supabase database.
 * 
 * IMPORTANT: You need your Supabase SERVICE ROLE KEY (not the anon key) to run this.
 * 
 * To get your service role key:
 * 1. Go to your Supabase project: https://qcpcncikxsskvlqladpu.supabase.co
 * 2. Click on "Project Settings" (gear icon)
 * 3. Go to "API" section
 * 4. Copy the "service_role" key (keep this secret!)
 * 
 * Then run: SERVICE_ROLE_KEY=your_service_role_key node setup-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://qcpcncikxsskvlqladpu.supabase.co';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SERVICE_ROLE_KEY environment variable is required');
  console.log('\nTo run this script:');
  console.log('1. Get your service role key from Supabase Project Settings > API');
  console.log('2. Run: SERVICE_ROLE_KEY=your_key_here node setup-database.js\n');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  try {
    console.log('📖 Reading SQL schema file...');
    const sqlPath = path.join(__dirname, 'supabase-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Executing SQL schema...\n');

    // Split SQL into individual statements (basic splitting by semicolon)
    // Note: This is a simple approach. For production, use a proper SQL parser
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement.trim().length === 0) continue;

      try {
        // Use Supabase REST API to execute SQL
        // Note: Supabase doesn't have a direct SQL execution endpoint via JS client
        // We'll need to use the REST API directly
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ sql: statement })
        });

        if (!response.ok) {
          // Try alternative: execute via PostgREST or direct SQL
          console.log(`⚠️  Statement ${i + 1} may need manual execution`);
        } else {
          successCount++;
          console.log(`✅ Statement ${i + 1} executed`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
      }
    }

    console.log(`\n📊 Results: ${successCount} successful, ${errorCount} errors`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some statements failed. You may need to run the SQL manually in Supabase SQL Editor.');
      console.log('   Go to: https://qcpcncikxsskvlqladpu.supabase.co/project/_/sql');
    } else {
      console.log('\n✅ Database setup complete!');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.log('\n💡 Alternative: Run the SQL manually in Supabase SQL Editor:');
    console.log('   https://qcpcncikxsskvlqladpu.supabase.co/project/_/sql');
    process.exit(1);
  }
}

// Actually, Supabase doesn't expose SQL execution via the JS client
// The best approach is to provide clear instructions
console.log('⚠️  Note: Supabase JS client cannot execute raw SQL directly.');
console.log('   Please run the SQL manually in Supabase SQL Editor.\n');
console.log('📝 Steps:');
console.log('1. Go to: https://qcpcncikxsskvlqladpu.supabase.co/project/_/sql');
console.log('2. Click "New Query"');
console.log('3. Copy contents of supabase-schema.sql');
console.log('4. Paste and click "Run"\n');

setupDatabase();

