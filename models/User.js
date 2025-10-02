const mongoose = require('mongoose');

const bycrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String, default: null },
}, { timestamps: true }
);

// Hash password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password'))  return next();
    this.password = await bycrypt.hash(this.password, 10);
    next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bycrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);