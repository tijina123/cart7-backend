const { User } = require("../../models/userModel");
const razorpay = require("../../utils/razorpay.js");

const {
  generatePasswordHash,
  comparePasswordHash,
} = require("../../utils/bcrypt");
const { generateAccessToken } = require("../../utils/jwt");

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

    if(role === !"user"){

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
      const razorpayAccount = await razorpay.accounts.create({
        name: beneficiaryName,
        email,
        contact: phone,
        type: businessType,
        legal_business_name: beneficiaryName,
        business_type: businessType,
        bank_account: {
          name: beneficiaryName,
          ifsc: ifscCode,
          account_number: accountNumber
        }
      });

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
        razorpay_account_id: razorpayAccount.id,
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

module.exports = {
  login,
  signup,
};
