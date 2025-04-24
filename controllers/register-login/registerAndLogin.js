const { User } = require("../../models/userModel");
const {
  generatePasswordHash,
  comparePasswordHash,
} = require("../../utils/bcrypt");
const { generateAccessToken } = require("../../utils/jwt");

// ✅ Register - User Signup
const signup = async (req, res, next) => {
  try {
    console.log("Request body:===", req.body);
    // Extract user details from the request body
    const {
      name,
      email,
      password,
      role,
      companyname: deler_name,
      plan,
    } = req.body;

    // Validate input based on the user's role
    if (role === "user") {
      // Ensure required fields for regular users
      if (!password || !name || !role) {
        const error = {
          status: 400,
          message: "Invalid input data",
          fields: {
            body: req.body,
            required: { email, name, password },
          },
        };
        return next(error);
      }
    } else {
      // Ensure required fields for dealers/admins
      if (!password || !name || !role || !plan || !deler_name) {
        const error = {
          status: 400,
          message: "Invalid input data",
          fields: {
            body: req.body,
            required: { email, name, password },
          },
        };
        return next(error);
      }
    }

    // Check if the email already exists in the database
    const isExist = await User.findOne({ email });
    if (isExist) {
      return res.status(422).json({
        message: "User Already Exists",
      });
    }

    // Hash the password before storing it
    const hashedPassword = await generatePasswordHash(password);

    let isCreate = null;

    const PLAN_DURATION_DAYS = 30;
    
    // Create a new user based on their role
    if (role === "user") {
      isCreate = await User.create({
        name,
        email,
        role,
        isDelers: false,
        password: hashedPassword,
        status: true,
      });
    } else {
      isCreate = await User.create({
        name,
        deler_name,
        email,
        role,
        plan,
        planValidUntil: new Date(Date.now() + PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000),
        isDelers: true,
        password: hashedPassword,
        status: false,
      });
    }

    // If user creation fails, return an error
    if (!isCreate) {
      const error = {
        status: 500,
        message: "Account creation failed",
      };
      return next(error);
    }

    // Respond with success message
    res.status(201).json({
      success: true,
      message: "Account has been created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    next(error); // Pass error to error-handling middleware
  }
};

// ✅ Login - User Authentication
const login = async (req, res, next) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      const error = {
        status: 400,
        message: "Invalid input data",
        fields: {
          body: req.body,
          required: { email, password },
        },
      };
      return next(error);
    }

    // Check if user exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      const error = {
        status: 401,
        message: "User does not exist",
      };
      return next(error);
    }

    // Verify the password
    const validPassword = await comparePasswordHash(password, user.password);
    if (!validPassword) {
      const error = {
        status: 401,
        message: "Invalid password or Username",
      };
      return next(error);
    }

    // Generate an access token for the user
    const accessToken = generateAccessToken(user._id);

    // Prepare user data for response (excluding sensitive info)
    const userData = {
      name: user?.name,
      phone: user?.phone,
      email: user?.email,
      image: user?.image,
      role: user?.role,
    };

    // Respond with success message and token
    res.status(200).json({
      success: true,
      accessToken,
      userData,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    next(error); // Forward error to error-handling middleware
  }
};

module.exports = {
  login,
  signup,
};
