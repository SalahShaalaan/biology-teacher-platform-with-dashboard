import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model";

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  // DEBUG: Log headers to identify why token is missing
  console.log("[AuthMiddleware] Headers:", JSON.stringify(req.headers));

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  if (token) {
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret_for_development_only_12345"
      );

      req.user = await Admin.findById(decoded.id).select("-password");

      if (!req.user) {
        // Fallback: Check if it's a student token if we eventually add student auth
        // For now, if Admin not found, fail.
        return res
          .status(401)
          .json({ success: false, message: "Not authorized, user not found" });
      }

      next();
      return; // Ensure we don't fall through to the error response
    } catch (error) {
      console.error(error);
      res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
      return; // Ensure we don't fall through
    }
  }

  if (!token) {
    if (process.env.NODE_ENV === "development" || true) {
      // Always show detailed errors for now
      res.status(401).json({
        success: false,
        message: "Not authorized, no token",
        debug_headers: req.headers, // Return what we received
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });
    }
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user) {
    // Assuming for now any authenticated user via this middleware is an Admin
    // because we only query the Admin model in 'protect'.
    next();
  } else {
    res
      .status(401)
      .json({ success: false, message: "Not authorized as an admin" });
  }
};
