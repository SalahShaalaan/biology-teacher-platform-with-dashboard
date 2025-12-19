import { Router } from "express";
import { loginAdmin, createAdmin } from "../controllers/auth.controller";

const router = Router();

// Login endpoint - protected by database-level account lockout (5 failed attempts)
router.post("/login", loginAdmin);

// Signup endpoint - only allows one admin account
router.post("/signup", createAdmin);

export default router;
