import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/admin.model";
import connectDB from "../config/connect-db";

// Load environment variables
dotenv.config({ path: "./src/.env" });

const updateAdmin = async () => {
    // Get arguments from command line
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log("Usage: npm run update-admin <new-email> <new-password>");
    console.log("Example: npm run update-admin admin@example.com mysecurepassword");
    process.exit(1);
  }

  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log("Finding admin account...");
    // Find the first admin document (since system is designed for single admin)
    const admin = await Admin.findOne();
    
    if (!admin) {
      console.error("❌ No admin account found under 'Admin' collection.");
      console.log("You may need to run the initial setup or signup first.");
      process.exit(1);
    }

    console.log(`Found admin account: ${admin.email}`);
    console.log("Updating credentials...");

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update fields
    admin.email = email;
    admin.password = hashedPassword;
    
    // Reset security counters just in case they were locked out
    admin.loginAttempts = 0;
    admin.set('lockUntil', undefined); // using set to handle potential undefined cleanup

    await admin.save();

    console.log("✅ Successfully updated admin credentials!");
    console.log(`New Email: ${email}`);
    console.log(`New Password: ${password.replace(/./g, '*')}`); // Masked
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating admin:", error);
    process.exit(1);
  }
};

updateAdmin();
