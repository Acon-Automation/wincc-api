require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

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

// ✅ API لكل متغير باسمه (مثلاً: /parameters/fan)
app.get('/parameters/:name', async (req, res) => {
  const paramName = req.params.name;

  try {
    const response = await axios.get(`${process.env.SUPABASE_URL}/rest/v1/parameters?name=eq.${paramName}`, {
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
      }
    });

    if (response.data.length === 0) {
      return res.status(404).send('Variable not found');
    }

    res.json(response.data[0]);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
