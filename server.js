const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

// 👉 Load environment variables BEFORE requiring db.js
require("dotenv").config();

const app = express();
const db = require('./db'); // now MONGO_URL will be available

const allowedOrigins = [
  'http://localhost:5173',
  'https://hackrx-delulu-guys.netlify.app'
];

// Global CORS middleware - runs before all routes
app.use(cors({
  origin: function(origin, callback){
    if (!origin) return callback(null, true); // Allow REST clients like Postman with no origin
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
  try {
    console.log('🌟 REAL BACKEND REACHED');
    return res.send('WELCOME TO BAJAJ FINANCE ✅');
  } catch (error) {
    console.error('Invalid server:', error);
    return res.status(500).send({ error: 'Server error occurred' });
  }
});

// Run Python script route
app.get('/run-python', (req, res) => {
  const scriptPath = path.join(__dirname, 'chatbot_doc_5.py');
  const pythonCmd = 'python'; // or 'python3' if needed

  exec(`${pythonCmd} "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Python exec error:', error);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error('Python stderr:', stderr);
      // Optionally: return res.status(500).json({ error: stderr });
    }
    console.log('Python stdout:', stdout);
    res.json({ output: stdout });
  });
});

// Dummy user routes (replace with your actual userRoutes)
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

// Example adminRoutes with basic /get-docs and /upload-doc stubs
const expressRouter = require('express').Router();

expressRouter.get('/get-docs', (req, res) => {
  // TODO: Replace with your actual logic
  res.json({ docs: ["doc1", "doc2"] });
});

expressRouter.post('/upload-doc', (req, res) => {
  // TODO: Replace with your actual upload handling logic
  res.json({ message: 'Upload successful' });
});

app.use('/admin', expressRouter);

// 404 handler - catch all unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
