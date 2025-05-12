const express = require("express")
const cors = require('cors')
const morgan = require("morgan");
const startCronJobs = require("./utils/cronJobs"); // Adjust path if needed
const connectDb = require("./config/db");

// const passport = require("passport");
// const session = require("express-session");
// require("./utils/passport");

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

app.use(cors())
app.use(express.json())


// app.use(session({ secret: "yourSecret", resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

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