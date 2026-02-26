const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const Order = require("../models/Order");

const router = express.Router();

// Get all restaurants (Admin only)
router.get("/restaurants", protect, authorize("admin"), async (req, res) => {
  const restaurants = await User.find({ role: "restaurant" });
  res.json(restaurants);
});

// Public - Get Approved Restaurants
router.get("/public-restaurants", async (req, res) => {
  try {
    const restaurants = await User.find({
      role: "restaurant",
      isApproved: true
    });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN - GET ALL ORDERS
router.get("/all-orders", protect, authorize("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "username email")
      .populate({
        path: "items.food",
        populate: {
          path: "restaurant",
          select: "username"
        }
      });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ADMIN DASHBOARD STATS
router.get("/stats", protect, authorize("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalRestaurants = await User.countDocuments({ role: "restaurant" });
    const totalOrders = await Order.countDocuments();

    const deliveredOrders = await Order.find({ status: "Delivered" });
    const totalRevenue = deliveredOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Restaurant-wise order count
    const restaurants = await User.find({ role: "restaurant" });

    const restaurantStats = await Promise.all(
      restaurants.map(async (restaurant) => {
        const orders = await Order.find()
          .populate("items.food");

        const count = orders.filter(order =>
          order.items.some(item =>
            item.food.restaurant.toString() === restaurant._id.toString()
          )
        ).length;

        return {
          restaurantName: restaurant.username,
          orderCount: count
        };
      })
    );

    res.json({
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalRevenue,
      restaurantStats
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Toggle restaurant approval (Admin only)
router.put("/toggle-approval/:id", protect, authorize("admin"), async (req, res) => {
  const restaurant = await User.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  restaurant.isApproved = !restaurant.isApproved;
  await restaurant.save();

  res.json({ message: `Restaurant ${restaurant.isApproved ? "approved" : "disapproved"} successfully`, isApproved: restaurant.isApproved });
});

module.exports = router;
