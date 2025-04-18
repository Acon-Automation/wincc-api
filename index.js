const express = require('express');
const { sql, poolConnect, pool } = require('./db');

const app = express();
const PORT = 3000;

let cachedData = [];

async function fetchData() {
    try {
        await poolConnect;
        const result = await pool.request().query('SELECT * FROM Table_1');
        cachedData = result.recordset;
        console.log("✅ Data updated");
    } catch (err) {
        console.error("❌ Error fetching data:", err);
    }
}

// تحدث كل ثانية
setInterval(fetchData, 1000);

// API endpoint
app.get('/parameters', (req, res) => {
    res.json(cachedData);
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
