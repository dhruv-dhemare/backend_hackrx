const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
require("dotenv").config();

const app = express();
const db = require('./db'); // Your MongoDB connection file

const allowedOrigins = [
  'http://localhost:5173',
  'https://hackrx-delulu-guys.netlify.app'
];

// Enable CORS for allowed origins only
app.use(cors({
  origin: function(origin, callback){
    if (!origin) return callback(null, true); // Allow Postman or curl (no origin)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(bodyParser.json());

// Root route (health check)
app.get('/', (req, res) => {
  res.send('WELCOME TO BAJAJ FINANCE ✅');
});

// Import your actual route files
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
