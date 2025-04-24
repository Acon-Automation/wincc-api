require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { sql, poolConnect, pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 🟢 API لجلب البيانات من Supabase
app.get('/parameters', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.SUPABASE_URL}/rest/v1/parameters`, {
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
      }
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 🟢 إرسال البيانات من SQL Server إلى Supabase
async function syncToSupabase() {
  try {
    await poolConnect;
    const result = await pool.request().query('SELECT fldindex AS name, fldvalue AS value FROM [parameters].[dbo].[Table_1]');

    for (const row of result.recordset) {
        if (row.value === null || row.value === '') {
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

// ⏱️ تحديث كل ثانية
setInterval(syncToSupabase, 1000);

// 🟢 بدء الخادم
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
