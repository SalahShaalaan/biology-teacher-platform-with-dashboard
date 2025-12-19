import mongoose, { Schema, Document } from "mongoose";

export interface ILoginHistory {
  timestamp: Date;
  ip: string;
  userAgent?: string;
  success: boolean;
}

export interface IAdmin extends Document {
  email: string;
  password?: string; // Optional because we might validate against it without returning it
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  loginHistory: ILoginHistory[];
  isLocked: boolean; // Virtual field
  incLoginAttempts(): Promise<IAdmin>;
  resetLoginAttempts(): Promise<IAdmin>;
}

const AdminSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLogin: { type: Date },
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ip: { type: String },
        userAgent: { type: String },
        success: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);

// Virtual field to check if account is locked
AdminSchema.virtual("isLocked").get(function (this: IAdmin) {
  // Check if lockUntil exists and is in the future
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Constants for account lockout
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

// Method to increment login attempts
AdminSchema.methods.incLoginAttempts = function (this: IAdmin) {
  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Otherwise increment attempts
  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock account if max attempts reached
  const attemptsAfterIncrement = this.loginAttempts + 1;
  if (attemptsAfterIncrement >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
    console.log(`🔒 Account locked: ${this.email} until ${new Date(Date.now() + LOCK_TIME)}`);
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
AdminSchema.methods.resetLoginAttempts = function (this: IAdmin) {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Ensure virtuals are included in JSON output
AdminSchema.set("toJSON", { virtuals: true });
AdminSchema.set("toObject", { virtuals: true });

export default mongoose.model<IAdmin>("Admin", AdminSchema);
