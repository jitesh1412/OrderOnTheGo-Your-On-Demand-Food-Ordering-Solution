const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();


// PLACE ORDER (User Only)
router.post("/place", protect, authorize("user"), async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod, pincode, phone, email } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.food");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;

    cart.items.forEach(item => {
      if (item.food) {
        const price = item.food.discount > 0
          ? item.food.price * (1 - item.food.discount / 100)
          : item.food.price;
        totalAmount += price * item.quantity;
      }
    });

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.filter(item => item.food).map(item => ({
        food: item.food._id,
        quantity: item.quantity
      })),
      totalAmount,
      deliveryAddress,
      pincode,
      phone,
      email,
      paymentMethod
    });

    // Clear cart after order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET USER ORDERS
router.get("/my-orders", protect, authorize("user"), async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.food");

  res.json(orders);
});


// GET ALL ORDERS (Admin Only)
router.get("/all", protect, authorize("admin"), async (req, res) => {
  const orders = await Order.find()
    .populate("user", "username email")
    .populate("items.food");

  res.json(orders);
});

// GET RESTAURANT ORDERS
router.get("/restaurant-orders", protect, authorize("restaurant"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.food")
      .populate("user", "username email");

    // Filter only orders that contain this restaurant's food
    const restaurantOrders = orders.filter(order =>
      order.items.some(item =>
        item.food && item.food.restaurant && item.food.restaurant.toString() === req.user._id.toString()
      )
    );

    res.json(restaurantOrders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// UPDATE ORDER STATUS (Restaurant Only)
router.post("/status", protect, authorize("restaurant"), async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId).populate("items.food");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled" || order.status === "Delivered") {
      return res.status(400).json({ message: "Order cannot be modified" });
    }

    // Ensure order belongs to this restaurant
    const belongsToRestaurant = order.items.some(item =>
      item.food && item.food.restaurant && item.food.restaurant.toString() === req.user._id.toString()
    );

    if (!belongsToRestaurant) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RESTAURANT STATS
router.get("/restaurant-stats", protect, authorize("restaurant"), async (req, res) => {
  try {
    const orders = await Order.find().populate("items.food");

    const restaurantOrders = orders.filter(order =>
      order.items.some(item =>
        item.food && item.food.restaurant && item.food.restaurant.toString() === req.user._id.toString()
      )
    );

    const totalOrders = restaurantOrders.length;
    const deliveredOrders = restaurantOrders.filter(order => order.status === "Delivered");
    const deliveredCount = deliveredOrders.length;

    const totalRevenue = deliveredOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    res.json({
      totalOrders,
      deliveredCount,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// CANCEL ORDER (User Only)
router.put("/cancel/:id", protect, authorize("user"), async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Placed") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
