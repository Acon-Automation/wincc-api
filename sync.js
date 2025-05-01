require('dotenv').config();
const axios = require('axios');
const { sql, poolConnect, pool } = require('./db');

async function syncToSupabase() {
  try {
    await poolConnect;
    const result = await pool.request().query('SELECT fldindex AS name, fldvalue AS value FROM [parameters].[dbo].[Table_1]');

    for (const row of result.recordset) {
      if (!row.value) {
        console.log(`⏩ Skipped: ${row.name} has empty value`);
        continue;
      }

      console.log("🔁 Sending:", row);

      await axios.post(`${process.env.SUPABASE_URL}/rest/v1/parameters`, {
        name: row.name,
        value: parseInt(row.value)
      }, {
        headers: {
          apikey: process.env.SUPABASE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        params: {
          on_conflict: 'name'
        }
      });
    }

    console.log("✅ Synced with Supabase");

  } catch (err) {
    console.error("❌ Sync error:", err.message);
  }
}

setInterval(syncToSupabase, 1000);
