import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getProduct,
  updateProduct,
} from "../controllers/productController.js";
import multipleUpload from "../middlewares/multer.js";
import { authenticateRole, isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

router.route("/product").get(getAllProduct);
router
  .route("/product/new")
  .post(
    isAuthenticated,
    authenticateRole("admin"),
    multipleUpload,
    createProduct
  );
router
  .route("/product/:id")
  .delete(isAuthenticated, authenticateRole("admin"), deleteProduct)
  .put(
    isAuthenticated,
    authenticateRole("admin"),
    multipleUpload,
    updateProduct
  )
  .get(getProduct);
export default router;
