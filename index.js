const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { nanoid } = require('nanoid');
const Url = require('./models/Url');

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('DB Error:', err));

// ROUTE 1: Shorten a URL
app.post('/shorten', async (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'Please provide a URL' });
  }

  const shortCode = nanoid(6);

  const url = new Url({ longUrl, shortCode });
  await url.save();

  res.json({
    shortCode,
    shortUrl: `http://localhost:3000/${shortCode}`,
    longUrl
  });
});

// ROUTE 2: Redirect short URL to long URL
app.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  const url = await Url.findOne({ shortCode });

  if (!url) {
    return res.status(404).json({ error: 'URL not found' });
  }

  res.redirect(url.longUrl);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});