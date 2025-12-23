const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* ======================
   REGEX VALIDATION
====================== */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Minimum 8 characters, at least 1 letter and 1 number, allow special chars
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;


/* ======================
   REGISTER
====================== */
exports.register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

 if (!passwordRegex.test(password)) {
  return res.status(400).json({
    message: 'Password must be at least 8 characters and include a number'
  });
}


  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  res.status(201).json({ message: 'User registered successfully' });
};

/* ======================
   LOGIN
====================== */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    message: 'Login successful',
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
};

/* ======================
   LOGOUT
====================== */
exports.logout = async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
};
