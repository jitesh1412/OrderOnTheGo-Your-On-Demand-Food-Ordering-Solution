const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const multer = require("multer");
const path = require("path");

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `cat-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// GET ALL CATEGORIES (Public)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD CATEGORY (Admin Only)
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({ name, image });
    await category.save();

    res.json({ message: "Category added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE CATEGORY
router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;