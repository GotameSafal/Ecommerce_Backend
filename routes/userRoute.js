import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  forgotPassword,
  getProfile,
  updateName,
  updatePassword,
  getAllUsers,
  getUser,
  updateUserRole,
  removeUser,
  createReview,
  getAllReviews,
  deleteReviews,
  addAddress,
  deleteAddress,
} from "../controllers/userController.js";
import { authenticateRole, isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticated, getProfile);
router.route("/me/password/update").put(isAuthenticated, updatePassword);
router.route("/me/updateName").put(isAuthenticated, updateName);
router.route("/me/address").post(isAuthenticated, addAddress);
router.route("/me/address/:id").delete(isAuthenticated, deleteAddress);
router
  .route("/admin/Users")
  .get(isAuthenticated, authenticateRole("admin"), getAllUsers);
router
  .route("/admin/Users/:id")
  .get(isAuthenticated, authenticateRole("admin"), getUser)
  .put(isAuthenticated, authenticateRole("admin"), updateUserRole)
  .delete(isAuthenticated, authenticateRole("admin"), removeUser);

router.route("/review").put(isAuthenticated, createReview);

router
  .route("/reviews")
  .get(getAllReviews)
  .delete(isAuthenticated, deleteReviews);
export default router;
