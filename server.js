const express = require("express")
const cors = require('cors')
const morgan = require("morgan");

const startCronJobs = require("./utils/cronJobs"); // Adjust path if needed
const connectDb = require("./config/db");

const categoryRoute = require('./routes/categoryRoute');
const productRoute = require('./routes/productRoute');
const userRoute = require('./routes/userRoute');
const addressRoute = require('./routes/addressRoute');
const orderRoute = require('./routes/orderRoute');
const offerRoute = require('./routes/offerRoute');
const errorHandle = require("./middlewares/errorHandle");
const authRoutes = require("./routes/auth");



const app = express()
require('dotenv').config()

//connect to database
connectDb()

// Start the plan downgrade cron job
startCronJobs();

// Use morgan middleware
app.use(morgan("dev")); // 'dev' is a predefined format string

const allowedOrigins = [
  "https://www.cart7online.com",
  "https://admin.cart7online.com",
  "http://localhost:5173",
  "http://localhost:5174"
];



app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

//app.options("*", cors()); // handle preflight


app.use(express.json())


app.use("/", userRoute);
app.use("/category", categoryRoute);
app.use("/product", productRoute);
app.use("/address", addressRoute);
app.use("/offer", offerRoute);
app.use("/order", orderRoute);

// app.use("/api/auth", authRoutes);

//  Error Handling
app.use(errorHandle);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);