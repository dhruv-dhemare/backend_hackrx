const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },  // store plain text (insecure)
  documents: [{
    name: String,
    data: Buffer,
    contentType: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
});

const admin = mongoose.model('admin', adminSchema);
module.exports = admin;
