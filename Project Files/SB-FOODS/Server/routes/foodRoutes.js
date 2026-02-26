const express = require("express");
const router = express.Router();
const Food = require("../models/Food");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `food-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// GET TOP RESTAURANTS (Approved Only)
router.get("/top-restaurants", async (req, res) => {
  try {
    // Collect all foods and their ratings from approved restaurants
    const foods = await Food.find().populate("restaurant", "username profileImage isApproved");

    // Filter out foods from unapproved restaurants early
    const approvedFoods = foods.filter(food => food.restaurant && food.restaurant.isApproved);


    // Aggregate by restaurant
    const restaurantData = {};

    approvedFoods.forEach(food => {
      if (food.restaurant) {
        const id = food.restaurant._id.toString();
        if (!restaurantData[id]) {
          restaurantData[id] = {
            _id: food.restaurant._id,
            username: food.restaurant.username,
            profileImage: food.restaurant.profileImage,
            totalRating: 0,
            count: 0
          };
        }
        restaurantData[id].totalRating += (food.rating || 0);
        restaurantData[id].count += 1;
      }
    });

    // Calculate final scores and sort
    const result = Object.values(restaurantData).map(r => ({
      ...r,
      avgRating: r.count > 0 ? r.totalRating / r.count : 0
    })).sort((a, b) => b.avgRating - a.avgRating).slice(0, 4);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD FOOD (Restaurant Only)
router.post("/add", protect, authorize("restaurant"), upload.single("image"), async (req, res) => {
  try {
    if (!req.user.isApproved) {
      return res.status(403).json({ message: "Your account is pending approval. You cannot add items yet." });
    }
    const { title, description, price, category, discount, isVeg } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const food = new Food({
      title,
      description,
      price,
      category,
      image,
      discount: discount || 0,
      isVeg: isVeg === "true" || isVeg === true,
      restaurant: req.user._id
    });

    await food.save();

    res.json({ message: "Food added successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ALL FOODS (Public - Only from Approved Restaurants)
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find().populate("restaurant", "username profileImage isApproved");
    // Filter out foods from unapproved restaurants
    const approvedFoods = foods.filter(food => food.restaurant && food.restaurant.isApproved);
    res.json(approvedFoods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET RESTAURANT'S OWN FOODS
router.get("/my-items", protect, authorize("restaurant"), async (req, res) => {
  try {
    const foods = await Food.find({ restaurant: req.user._id });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET FOOD BY RESTAURANT
router.get("/restaurant/:id", async (req, res) => {
  try {
    const foods = await Food.find({
      restaurant: req.params.id
    }).populate("restaurant", "username");

    res.json(foods);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/rate/:id", protect, authorize("user", "restaurant", "admin"), async (req, res) => {
  try {
    const { rating } = req.body;
    const ratingNum = Number(rating);

    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // Check if user already rated
    const alreadyRatedIndex = food.reviews.findIndex(
      (r) => r.user && r.user.toString() === req.user._id.toString()
    );

    if (alreadyRatedIndex > -1) {
      // Update existing rating
      food.reviews[alreadyRatedIndex].rating = ratingNum;
    } else {
      // Add new rating
      food.reviews.push({
        user: req.user._id,
        rating: ratingNum
      });
    }

    // Recalculate Average and Count
    if (food.reviews.length > 0) {
      food.numReviews = food.reviews.length;
      const total = food.reviews.reduce((acc, item) => Number(item.rating) + acc, 0);
      food.rating = total / food.reviews.length;
    } else {
      food.numReviews = 0;
      food.rating = 0;
    }

    // Safety: If image is missing (old data), provide placeholder to satisfy validation
    if (!food.image) {
      food.image = "https://via.placeholder.com/300?text=Food+Item";
    }

    // Explicitly mark as modified
    food.markModified('reviews');
    await food.save();

    res.json({ message: "Rating saved successfully", rating: food.rating, numReviews: food.numReviews });

  } catch (error) {
    console.error("Rating Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE FOOD
router.delete("/:id", protect, authorize("restaurant", "admin"), async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // Ensure only the owner can delete (or admin)
    if (req.user.role === "restaurant" && food.restaurant.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this food" });
    }

    await food.deleteOne();
    res.json({ message: "Food removed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
