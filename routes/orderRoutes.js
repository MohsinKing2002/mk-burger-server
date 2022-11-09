import express from "express";
import {
  getAllOrders,
  getMyOrders,
  getOrder,
  paymentVerification,
  placeOrder,
  placeOrderOnline,
  processOrder,
} from "../controllers/orderController.js";
import {
  authorizeAdmin,
  isAuthenticated,
} from "../middlewares/authenticate.js";
const router = express.Router();

//place order with cod payment
router.post("/createorder", isAuthenticated, placeOrder);

//place order with online payment
router.post("/createorderonline", isAuthenticated, placeOrderOnline);

//payment verification
router.post("/paymentverification", isAuthenticated, paymentVerification);

//get my orderes
router.get("/myorders", isAuthenticated, getMyOrders);

//get details of a order
router.get("/orders/:id", isAuthenticated, getOrder);

//get all orders --> admin access
router.get("/admin/orders", isAuthenticated, authorizeAdmin, getAllOrders);

//process order --> admin access
router.get("/admin/orders/:id", isAuthenticated, authorizeAdmin, processOrder);

export default router;
