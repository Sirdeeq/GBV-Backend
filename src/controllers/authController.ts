import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { validationResult } from "express-validator";
import twilio from "twilio";

export const signup = async (req: Request, res: Response) => {
  try {
    // Validate incoming request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      full_name,
      email,
      password,
      confirm_password,
      organization,
      phone,
      address,
      age,
    } = req.body;

    // Check if password and confirm_password match
    if (password !== confirm_password) {
      console.error("Passwords do not match");
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("Email already exists:", email);
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Generate salt
    const salt = await bcrypt.genSalt(10); // 10 is the default salt rounds
    console.log("Generated salt:", salt);

    // Hash password with salt
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPassword2 = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);

    // Create user
    const user = new User({
      full_name,
      email,
      organization,
      phone,
      address,
      age,
      password, // Store hashed password
    });

    await user.save();
    console.log("User created successfully:", user);

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};



// Google
// export const googleSignIn = async (req: Request, res: Response) => {
//   try {
//     const { token } = req.body;
//     const decodedToken = await admin.auth().verifyIdToken(token);

//     let user = await User.findOne({ firebaseUid: decodedToken.uid });

//     if (!user) {
//       // Create new user if doesn't exist
//       user = new User({
//         full_name: decodedToken.name,
//         email: decodedToken.email,
//         firebaseUid: decodedToken.uid,
//         organization: "Not specified",
//         phone: "Not specified",
//         address: "Not specified",
//         age: 0,
//       });
//       await user.save();
//     }

//     res.json({ user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error with Google sign in" });
//   }
// };

// Logout handler

// logout
export const logout = async (req: Request, res: Response) => {
  try {
    // Assuming the session is managed with a session cookie or JWT token
    // Here, you would destroy the session or invalidate the JWT token.
    // If you're using JWT, this step is unnecessary. You would simply stop sending the token.

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging out" });
  }
};

// Delete account handler
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params; // Assuming userId is passed as a URL parameter

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user from the database
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user account" });
  }
};

// Initialize Twilio client with environment variables for better security
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;

    const user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    const verificationCode = generateVerificationCode();

    user.verificationCode = verificationCode;
    await user.save();

    await twilioClient.messages.create({
      to: user.phone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body: `Your verification code is: ${verificationCode}`,
    });

    res.json({ message: "Verification code sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending verification code" });
  }
};

// Reset Password Controller
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { userId, verificationCode, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Incorrect verification code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.verificationCode = null; // Clear verification code
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       console.error("Missing email or password in request body");
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     console.log("Login request received:", { email });

//     // Check if the user exists in the database
//     const user = await User.findOne({ email });
//     if (!user) {
//       console.error(`User not found with email: ${email}`);
//       return res.status(404).json({ message: "Account not found" });
//     }

//     console.log("Retrieved user from database:", { email: user.email, id: user.id });

//     // Ensure user has a password stored
//     if (!user.password) {
//       console.error(`User with email ${email} has no password stored`);
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Compare the provided password with the stored hashed password
//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//       console.error(`Password mismatch for user with email: ${email}`);
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     console.log(`User ${email} successfully logged in`);

//     // Prepare user data for response
//     const { full_name, organization, phone, address, age, role, profileImage } = user;
//     return res.status(200).json({
//       message: "Login successful",
//       user: { full_name, email, organization, phone, address, age, role, profileImage },
//     });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
//     console.error("Error during login process:", errorMessage);

//     return res.status(500).json({
//       message: "An error occurred while processing your request",
//       error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
//     });
//   }
// };



// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//       console.error("Missing email or password in request body");
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     console.log("Login request received:", { email });

//     // Check if the user exists in the database
//     const user = await User.findOne({ email });
//     if (!user) {
//       console.error(`User not found with email: ${email}`);
//       return res.status(404).json({ message: "Account not found" });
//     }

//     console.log("Retrieved user from database:", { email: user.email, id: user.id });

//     // Ensure user has a password stored
//     if (!user.password) {
//       console.error(`User with email ${email} has no password stored`);
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Log both passwords for debugging
//     console.log("Provided plaintext password:", password); // Plaintext password from request
//     console.log("Stored hashed password:", user.password); // Hashed password from database

//     // Compare the provided password with the stored hashed password
//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//       console.error(`Password mismatch for user with email: ${email}`);
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     console.log(`User ${email} successfully logged in`);

//     // Prepare user data for response
//     const { full_name, organization, phone, address, age, role, profileImage } = user;
//     return res.status(200).json({
//       message: "Login successful",
//       user: { full_name, email, organization, phone, address, age, role, profileImage },
//     });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
//     console.error("Error during login process:", errorMessage);

//     return res.status(500).json({
//       message: "An error occurred while processing your request",
//       error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
//     });
//   }
// };

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.error("Missing email or password in request body");
      return res.status(400).json({ message: "Email and password are required" });
    }

    console.log("Login request received:", { email });

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User not found with email: ${email}`);
      return res.status(404).json({ message: "Account not found" });
    }

    console.log("Retrieved user from database:", { email: user.email, id: user.id });

    // Ensure user has a password stored
    if (!user.password) {
      console.error(`User with email ${email} has no password stored`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Log both passwords for debugging (remove this in production)
    console.log("Provided plaintext password:", password); // Plaintext password from request
    console.log("Stored hashed password:", user.password); // Hashed password from database

    // Compare the provided password with the stored hashed password

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    console.log(isPasswordMatch);
    if (!isPasswordMatch) {
      console.error(`Password mismatch for user with email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log(`User ${email} successfully logged in`);

    // Prepare user data for response
    const { full_name, organization, phone, address, age, role, profileImage } = user;
    return res.status(200).json({
      message: "Login successful",
      user: { full_name, email, organization, phone, address, age, role, profileImage },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error during login process:", errorMessage);

    return res.status(500).json({
      message: "An error occurred while processing your request",
      error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
    });
  }
};
