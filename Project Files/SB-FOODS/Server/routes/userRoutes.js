const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `logo-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// UPDATE PROFILE (Logo, Address, etc.)
router.put("/update-profile", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.profileImage = req.body.profileImage || user.profileImage;
        user.address = req.body.address || user.address;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            profileImage: updatedUser.profileImage,
            token: req.headers.authorization.split(" ")[1]
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// UPLOAD LOGO
router.post("/upload-logo", protect, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a file" });
        }

        const user = await User.findById(req.user._id);
        const profileImageUrl = `/uploads/${req.file.filename}`;

        user.profileImage = profileImageUrl;
        await user.save();

        res.json({
            message: "Logo uploaded successfully",
            profileImage: profileImageUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

