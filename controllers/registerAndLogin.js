const { User } = require("../models/userModel.js");
const razorpay = require("../utils/razorpay.js");
require('dotenv').config()
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require('jsonwebtoken');

const {
  generatePasswordHash,
  comparePasswordHash,
} = require("../utils/bcrypt");
const { generateAccessToken } = require("../utils/jwt");

// ✅ Register - User Signup
const signup = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      companyname: deler_name,
      plan,
      beneficiaryName,
      businessType,
      ifscCode,
      accountNumber,
      reenteredAccountNumber
    } = req.body;

    // Validate input
    if (!password || !name || !phone || !role || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    if (role === !"user") {

      if (accountNumber !== reenteredAccountNumber) {
        return res.status(400).json({
          message: "Account number and re-entered account number do not match"
        });
      }


      if (role !== "user" && (!plan || !deler_name || !beneficiaryName || !businessType || !ifscCode || !accountNumber)) {
        return res.status(400).json({
          message: "Missing required dealer fields"
        });
      }

    }


    const isExist = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (isExist) {
      return res.status(422).json({
        message: "User Already Exists"
      });
    }

    const hashedPassword = await generatePasswordHash(password);
    const PLAN_DURATION_DAYS = 30;

    let isCreate = null;

    if (role === "user") {

      isCreate = await User.create({
        name,
        email,
        phone,
        role,
        isDelers: false,
        password: hashedPassword,
        status: true
      });

    } else {

      // Razorpay Sub Account Creation
      // const razorpayAccount = await razorpay.accounts.create({
      //   name: beneficiaryName,
      //   email,
      //   contact: phone,
      //   type: businessType,
      //   legal_business_name: beneficiaryName,
      //   business_type: businessType,
      //   bank_account: {
      //     name: beneficiaryName,
      //     ifsc: ifscCode,
      //     account_number: accountNumber
      //   }
      // });

      // Save dealer with razorpay_account_id
      isCreate = await User.create({
        name,
        email,
        phone,
        role,
        plan,
        planValidUntil: new Date(Date.now() + PLAN_DURATION_DAYS * 86400000),
        isDelers: true,
        deler_name,
        password: hashedPassword,
        status: false,
        // razorpay_account_id: razorpayAccount.id,
        razorpay_bank_details: {
          beneficiaryName,
          businessType,
          ifscCode,
          accountNumber
        }
      });
    }

    res.status(201).json({
      success: true,
      message: "Account has been created successfully"
    });
  } catch (error) {
    console.error("Error creating user:", error);
    next(error);
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
    const user = await User.findOne({ email, isActive: true });

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

const googleLoginController = async (req, res) => {
  try {

    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    // Check if user exists or create new
    let user = await User.findOne({ email });

    let message = "Login successful";
    let status = 200

    if (!user) {
      user = await User.create({
        name,
        email,
        image: picture,
        googleId: sub,
        role: 'user',
        isDelers: false,
        status: true,
      });

      status = 201
      message = "Account has been created successfully"

    }

    // Generate JWT
    const accessToken = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET
      // { expiresIn: '7d' }
    );

    res.status(status).json({
      success: true,
      accessToken,
      message,
      userData: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        image: user.image,
      },
    });

  } catch (err) {
    console.error('Google Login Error:', err);
    res.status(500).json({ message: 'Google login failed' });
  }
};

module.exports = {
  login,
  signup,
  googleLoginController
};
