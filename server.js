const express = require('express');
const path = require('path');
const compression = require('compression');
const app = express();
const port = process.env.PORT || 3000;

// Enable compression
app.use(compression());

// Serve static files with caching
app.use(express.static(__dirname, {
    maxAge: '1h',
    setHeaders: (res, path) => {
        if (path.endsWith('.js') || path.endsWith('.css')) {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
        }
    }
}));

// API configuration endpoint
app.get('/api/config', (req, res) => {
    res.json({
        cohereApiKey: process.env.COHERE_API_KEY || 'RvwURyicgwE1jCRvMc8qVLTdf0x0G2C3EO8v6H7I' // Fallback for local development
    });
});

// Ping endpoint to keep the service active
app.get('/ping', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 