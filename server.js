const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');

// 👉 Load environment variables BEFORE requiring db.js
require("dotenv").config();

const app = express();
const db = require('./db'); // now MONGO_URL will be available

const allowedOrigins = [
  'http://localhost:5173',
  'https://hackrx-delulu-guys.netlify.app'
];

app.use(cors({
  origin: function(origin, callback){
    if (!origin) return callback(null, true);
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
    console.log('Invalid server', error);
    return res.status(500).send({ error: 'Server error occurred' });
  }
});

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
