import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import Admin, { ILoginHistory } from "../models/admin.model";

// Security constants
const TOKEN_EXPIRY = "7d"; // Changed from 30d to 7d for better security
const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_SALT_ROUNDS = 12; // Increased from 10 for better security

/**
 * Generate secure JWT token
 * Validates JWT_SECRET exists and generates token with secure settings
 */
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || "fallback_secret_for_development_only_12345";
  
  if (!process.env.JWT_SECRET) {
    console.error("⚠️ WARNING: Using fallback JWT_SECRET. Set JWT_SECRET in environment variables for production security.");
  }

  return jwt.sign({ id }, secret, {
    expiresIn: TOKEN_EXPIRY,
    issuer: "mr-abdallah-platform",
    audience: "mr-abdallah-admin",
  });
};

/**
 * Get client IP address (works with proxies like Vercel)
 */
const getClientIp = (req: Request): string => {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    (req.headers["x-real-ip"] as string) ||
    req.ip ||
    req.socket.remoteAddress ||
    "unknown"
  );
};

/**
 * Validate password strength
 */
const isPasswordStrong = (password: string): { valid: boolean; message?: string } => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }

  // Check for at least one number and one letter
  if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    return { valid: false, message: "Password must contain both letters and numbers" };
  }

  return { valid: true };
};

/**
 * Add login attempt to history
 */
const addLoginHistory = async (
  admin: any,
  ip: string,
  userAgent: string | undefined,
  success: boolean
): Promise<void> => {
  const historyEntry: ILoginHistory = {
    timestamp: new Date(),
    ip,
    userAgent,
    success,
  };

  // Keep only last 20 login attempts
  const updatedHistory = [historyEntry, ...admin.loginHistory].slice(0, 20);

  await admin.updateOne({
    $set: { loginHistory: updatedHistory },
  });
};

/**
 * LOGIN ADMIN
 * Implements comprehensive security measures:
 * - Account lockout after failed attempts
 * - IP tracking and logging
 * - Timing attack protection
 * - Input sanitization
 * - Login history tracking
 */
export const loginAdmin = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const clientIp = getClientIp(req);
  const userAgent = req.headers["user-agent"];

  try {
    // Input validation and sanitization
    let { email, password } = req.body;

    // Prevent server crash if email/password are not strings (e.g. objects or arrays)
    if (typeof email !== "string" || typeof password !== "string") {
      console.log(`⚠️  Invalid payload type from IP: ${clientIp}`);
       return res.status(400).json({
        success: false,
        message: "Invalid input format",
      });
    }

    if (!email.trim() || !password.trim()) {
      console.log(`⚠️  Login attempt with missing credentials from IP: ${clientIp}`);
      // Add delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Sanitize email
    email = validator.normalizeEmail(email) || email;
    email = validator.trim(email);

    if (!validator.isEmail(email)) {
      console.log(`⚠️  Login attempt with invalid email format from IP: ${clientIp}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Find admin
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log(`⚠️  Login attempt for non-existent account: ${email} from IP: ${clientIp}`);
      // Add delay to prevent user enumeration
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      const lockUntil = admin.lockUntil ? new Date(admin.lockUntil).toLocaleString() : "unknown";
      console.log(`🔒 Login attempt for locked account: ${email} from IP: ${clientIp}`);
      
      await addLoginHistory(admin, clientIp, userAgent, false);
      
      return res.status(423).json({
        success: false,
        message: `Account is locked due to too many failed login attempts. Please try again after ${lockUntil}`,
      });
    }

    // Verify password
    const isPasswordValid = admin.password && (await bcrypt.compare(password, admin.password));

    if (!isPasswordValid) {
      // Increment failed login attempts
      await admin.incLoginAttempts();
      await addLoginHistory(admin, clientIp, userAgent, false);

      console.log(
        `❌ Failed login attempt for ${email} from IP: ${clientIp} (Attempt ${admin.loginAttempts + 1})`
      );

      // Add delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Successful login
    console.log(`✅ Successful login: ${email} from IP: ${clientIp}`);

    // Reset login attempts
    await admin.resetLoginAttempts();

    // Update last login time
    await admin.updateOne({ $set: { lastLogin: new Date() } });

    // Add successful login to history
    await addLoginHistory(admin, clientIp, userAgent, true);

    // Generate token
    const token = generateToken(admin._id as string);

    // Ensure minimum response time to prevent timing attacks
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < 1000) {
      await new Promise((resolve) => setTimeout(resolve, 1000 - elapsedTime));
    }

    res.json({
      success: true,
      _id: admin._id,
      email: admin.email,
      token,
      lastLogin: admin.lastLogin,
    });
  } catch (error: any) {
    console.error(`❌ Server error during login from IP: ${clientIp}`, error);
    
    // Ensure minimum response time even on error
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < 1000) {
      await new Promise((resolve) => setTimeout(resolve, 1000 - elapsedTime));
    }

    res.status(500).json({
      success: false,
      message: "Server error during login. Please try again later.",
    });
  }
};

/**
 * CREATE ADMIN
 * SECURITY: This endpoint should be protected or disabled after first use.
 * For now, checks if ANY admin exists. If so, deny.
 * Implements strong password validation and secure password hashing.
 */
export const createAdmin = async (req: Request, res: Response) => {
  const clientIp = getClientIp(req);

  try {
    // Check if admin already exists
    const count = await Admin.countDocuments();
    if (count > 0) {
      console.log(`⚠️  Attempt to create second admin from IP: ${clientIp}`);
      return res.status(403).json({
        success: false,
        message: "Admin already exists. Only one admin account is allowed.",
      });
    }

    // Input validation
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Sanitize email
    email = validator.normalizeEmail(email) || email;
    email = validator.trim(email);

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password strength
    const passwordCheck = isPasswordStrong(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        message: passwordCheck.message,
      });
    }

    // Hash password with increased security
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = await Admin.create({
      email,
      password: hashedPassword,
      loginAttempts: 0,
      lastLogin: new Date(),
    });

    if (admin) {
      console.log(`✅ Admin account created: ${email} from IP: ${clientIp}`);

      const token = generateToken(admin._id as string);

      res.status(201).json({
        success: true,
        _id: admin._id,
        email: admin.email,
        token,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to create admin account",
      });
    }
  } catch (error: any) {
    console.error(`❌ Server error during admin creation from IP: ${clientIp}`, error);
    res.status(500).json({
      success: false,
      message: "Server error during signup. Please try again later.",
    });
  }
};
