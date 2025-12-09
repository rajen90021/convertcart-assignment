const express = require('express');
const cors = require('cors');
require('dotenv').config();

const searchRoutes = require('./routes/searchRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/search', searchRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Restaurant Search API is running. Use /search/dishes?name=biryani&minPrice=150&maxPrice=300');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
