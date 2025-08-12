const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const documentSchema = new mongoose.Schema({
  name: String,
  path: String,          // to store file path
  contentType: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  documents: [documentSchema],
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
  const admin = this;
  if (!admin.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
