import express from "express";
import { deleteOrder, getAllOrders, getmyOrder, getSingleOrder, newOrder, updateOrder } from "../controllers/orderController.js";
import { authenticateRole, isAuthenticated } from "../middlewares/auth.js";

const router  =  express.Router();
router.route("/order/new").post(isAuthenticated, newOrder);
router.route("/admin/order/:id").get(isAuthenticated, authenticateRole("admin"), getSingleOrder);
router.route("/me/order").get(isAuthenticated, getmyOrder);
router.route("/admin/orders").get(isAuthenticated, authenticateRole('admin'), getAllOrders);
router.route("/admin/order/update/:id").put(isAuthenticated, authenticateRole("admin"), updateOrder);
router.route("/admin/order/remove/:id").delete(isAuthenticated, authenticateRole("admin"),deleteOrder);

export default router;