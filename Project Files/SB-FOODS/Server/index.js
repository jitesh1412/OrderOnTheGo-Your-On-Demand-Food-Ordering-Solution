const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
const categoryRoutes = require("./routes/categoryRoutes");


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Connection Error ❌");
    console.error(err);
  });
app.use("/uploads", express.static("uploads"));

app.use("/api/category", categoryRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/food", require("./routes/foodRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/user", require("./routes/userRoutes"));


app.get("/", (req, res) => {
  res.send("SB Foods Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});