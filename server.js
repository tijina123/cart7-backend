const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");
const serverless = require("serverless-http");

const categoryRoute = require("./routes/categoryRoute");
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const addressRoute = require("./routes/addressRoute");
const orderRoute = require("./routes/orderRoute");
const offerRoute = require("./routes/offerRoute");
const errorHandle = require("./middlewares/errorHandle");

const app = express();
require("dotenv").config();
connectDb();

app.use(cors());
app.use(express.json());

app.use("/", userRoute);
app.use("/category", categoryRoute);
app.use("/product", productRoute);
app.use("/address", addressRoute);
app.use("/offer", offerRoute);
app.use("/order", orderRoute);

// Error handling
app.use(errorHandle);

// Instead of app.listen(), export a serverless handler
module.exports = serverless(app);
