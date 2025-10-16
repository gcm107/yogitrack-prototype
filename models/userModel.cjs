// userModel.cjs - database model for users
// stores username and password for login

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    default: 'manager'
  }
});

module.exports = mongoose.model("User", userSchema);

