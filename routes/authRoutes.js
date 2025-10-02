const User = require("../models/User");
const express = require("express");
const multer = require('multer');
const path = require('path');
const { registerUser, loginUser, getUserInfo } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// multer setup: store uploads in ./uploads directory
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '..', 'uploads'));
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		cb(null, `${file.fieldname}-${Date.now()}${ext}`);
	}
});
const upload = multer({ storage });

// Register a new user (accept one file named 'profileImage')
router.post("/register", upload.single('profileImage'), registerUser);
// Login a user
router.post("/login", loginUser);
// Get user profile
router.get("/getUser",protect, getUserInfo);

router.post("/upload", upload.single('profileImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});

module.exports = router;