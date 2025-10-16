// authController.cjs - handles user login
// unfortunately i dont have it encrypted yet.

const User = require("../models/userModel.cjs");

//  endpoint - uusername and pwd check
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // check if fields are filled
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    // find user in database
    const user = await User.findOne({ username: username });

    // check if user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // check if password matches (no encryption)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // login successful
    res.json({
      message: "Login successful",
      user: {
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// create a default user -- testing purposes
exports.createDefaultUser = async (req, res) => {
  try {
    // dupe check
    const existingUser = await User.findOne({ username: 'manager' });
    
    if (existingUser) {
      return res.json({ message: "Default user already exists" });
    }

    // create default user
    const defaultUser = new User({
      username: 'manager',
      password: 'password123',
      role: 'manager'
    });

    await defaultUser.save();
    res.json({ message: "Default user created: username='manager', password='password123'" });

  } catch (err) {
    console.error("Error creating default user:", err.message);
    res.status(500).json({ message: "Failed to create user", error: err.message });
  }
};

