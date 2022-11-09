import express from "express";
import passport from "passport";

import {
  getAdminStats,
  getAllUsers,
  logout,
  profile,
} from "../controllers/userController.js";
import {
  authorizeAdmin,
  isAuthenticated,
} from "../middlewares/authenticate.js";

const router = express.Router();

router.get(
  "/googleAuth",
  passport.authenticate("google", { scope: ["profile"] })
);

router.get(
  "/login",
  passport.authenticate("google", {
    successRedirect: process.env.FRONTEND_URL,
  })
);

router.get("/me", isAuthenticated, profile);

router.get("/logout", logout);

router.get("/admin/users", isAuthenticated, authorizeAdmin, getAllUsers);

router.get("/admin/stats", isAuthenticated, authorizeAdmin, getAdminStats);

export default router;
