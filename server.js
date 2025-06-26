require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = 3000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = '';
let tokenExpiresAt = 0;

app.use(cors());

async function getAccessToken() {
  if (Date.now() < tokenExpiresAt && accessToken) return accessToken;

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return accessToken;
}

app.get('/search', async (req, res) => {
  const { type, q } = req.query;
  const token = await getAccessToken();
  const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=${type}&limit=10`;

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get('/token', async (req, res) => {
  const token = await getAccessToken();
  res.json({ token });
});