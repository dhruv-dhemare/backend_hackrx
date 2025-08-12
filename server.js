const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

require("dotenv").config();

const app = express();
const db = require('./db'); 

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

app.get('/', (req, res) => {
  try {
    console.log('🌟 REAL BACKEND REACHED');
    return res.send('WELCOME TO BAJAJ FINANCE ✅');
  } catch (error) {
    console.log('Invalid server', error);
    return res.status(500).send({ error: 'Server error occurred' });
  }
});

// Example route to run chatbot_doc_5.py
app.get('/run-python', (req, res) => {
  const scriptPath = path.join(__dirname, 'chatbot_doc_5.py');

  exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Exec error: ${error.message}`);
      return res.status(500).send({ error: error.message });
    }
    if (stderr) {
      console.error(`Python stderr: ${stderr}`);
      // You can choose to treat this as an error or just log it
    }
    console.log(`Python stdout: ${stdout}`);
    res.send({ output: stdout });
  });
});

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
