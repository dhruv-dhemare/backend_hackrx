const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');

require("dotenv").config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://hackrx-delulu-guys.netlify.app'
];

// Enable CORS for allowed origins
app.use(cors({
  origin: function(origin, callback){
    if (!origin) return callback(null, true); // allow tools like Postman
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(bodyParser.json());

// Dummy admin routes
const adminRouter = express.Router();

adminRouter.get('/get-docs', (req, res) => {
  // Return example data, replace with real DB data
  res.json({ docs: ["doc1", "doc2", "doc3"] });
});

adminRouter.post('/upload-doc', (req, res) => {
  // Dummy upload handler
  res.json({ message: "Upload successful" });
});

app.use('/admin', adminRouter);

// 404 for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
