const jwt = require('jsonwebtoken');
const User = require('../models/User');

//generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

//register user
exports.registerUser = async (req, res) => {
    // Defensive: handle undefined req.body (e.g., when content-type isn't parsed)
    const body = req.body || {};
    let { fullName, email, password, profileImageUrl } = body;

    // If a file upload middleware (multer) was used, the uploaded file will be on req.file
    if (req.file) {
        // adapt depending on your multer storage; here we prefer file.path or filename
        profileImageUrl = req.file.path || req.file.filename || profileImageUrl;
    }

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }
   
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ fullName, email, password, profileImageUrl });

        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('registerUser error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//login user
exports.loginUser = async (req, res) => {
    const body = req.body || {};
    const { email, password } = body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        res.json({ id: user._id, user, token: generateToken(user._id) });
    } catch (error) {
        console.error('loginUser error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//get user profile
exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        console.error('getUserInfo error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};