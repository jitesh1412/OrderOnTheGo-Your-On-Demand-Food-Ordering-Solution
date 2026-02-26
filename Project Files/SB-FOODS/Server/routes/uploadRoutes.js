const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        // Unique filename: fieldname-timestamp.ext
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Check File Type
const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb("Images only!");
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Upload Endpoint
router.post("/", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No file uploaded" });
    }
    res.send({
        message: "Image uploaded successfully",
        filePath: `/uploads/${req.file.filename}`
    });
});

module.exports = router;
