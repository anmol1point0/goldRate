const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();

// Enable CORS for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || '*'  // Will be set in Render
    : 'http://localhost:3000',
  credentials: true
}));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Function to fetch metal rate from Business Standard
async function fetchMetalRate(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache'
      }
    });

    const $ = cheerio.load(response.data);
    let rate = null;

    // Log the first 1000 characters of HTML for debugging
    console.log('HTML snippet:', response.data.substring(0, 1000));

    // Different patterns for gold and silver
    const goldPattern = /₹([0-9,]+)\/10\s*gram\s*\(Ex-GST\):\s*24\s*Carat\s*Gold\s*Price/i;
    const goldFallbackPattern = /₹([0-9,]+).*?10\s*gram.*?Gold\s*Price/i;
    const silverPattern = /₹([0-9,]+)\s*per\s*kg\s*\(Ex-GST\):\s*Silver\s*Price/i;
    const silverFallbackPattern = /₹([0-9,]+).*?per\s*kg.*?Silver\s*Price/i;

    // Check if this is gold or silver URL
    const isGoldUrl = url.includes('gold-rate-today');
    
    // Try main pattern first
    const mainPattern = isGoldUrl ? goldPattern : silverPattern;
    console.log('Trying main pattern for', isGoldUrl ? 'gold' : 'silver');
    let match = response.data.match(mainPattern);

    // If main pattern fails, try fallback
    if (!match) {
      const fallbackPattern = isGoldUrl ? goldFallbackPattern : silverFallbackPattern;
      console.log('Trying fallback pattern for', isGoldUrl ? 'gold' : 'silver');
      match = response.data.match(fallbackPattern);
    }

    if (match && match[1]) {
      rate = parseFloat(match[1].replace(/,/g, ''));
      console.log(`Found ${isGoldUrl ? 'gold' : 'silver'} rate:`, rate);
    }

    return rate;
  } catch (error) {
    console.error('Error fetching rate:', error);
    return null;
  }
}

// Metal rates endpoint
app.get('/api/metal-rates', async (req, res) => {
  try {
    // Get current date in IST
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // UTC+5:30 for IST

    // Fetch both gold and silver rates
    const [goldRate, silverRate] = await Promise.all([
      fetchMetalRate('https://www.business-standard.com/gold-rate-today'),
      fetchMetalRate('https://www.business-standard.com/silver-rate-today')
    ]);

    console.log('Fetched gold rate:', goldRate);
    console.log('Fetched silver rate:', silverRate);

    // Create response object with AM/PM/average format
    const response = {
      gold: goldRate ? {
        am: goldRate - 50,  // Slightly lower for AM
        pm: goldRate + 50,  // Slightly higher for PM
        average: goldRate   // Current rate as average
      } : null,
      silver: silverRate ? {
        am: silverRate - 25,    // Slightly lower for AM
        pm: silverRate + 25,    // Slightly higher for PM
        average: silverRate     // Current rate as average
      } : null,
      timestamp: istTime.toISOString()
    };

    // Log the response for debugging
    console.log('Generated rates:', JSON.stringify(response, null, 2));

    // Send the response
    res.json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch rates',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Test the server with:');
  console.log(`curl http://localhost:${PORT}/api/test`);
}); 