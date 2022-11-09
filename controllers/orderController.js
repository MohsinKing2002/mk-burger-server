import { instance } from "../app.js";
import { asyncError } from "../middlewares/ErrorMiddleware.js";
import { Order } from "../models/orderSchema.js";
import { Payment } from "../models/paymentSchema.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import crypto from "crypto";

//place order via cod
export const placeOrder = asyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderedItems,
    paymentMethod,
    itemsPrice,
    shippingCharges,
    taxCharges,
    totalAmount,
  } = req.body;
  const user = req.user._id;
  const orderOptions = {
    shippingInfo,
    orderedItems,
    paymentMethod,
    itemsPrice,
    shippingCharges,
    taxCharges,
    totalAmount,
    user,
  };

  await Order.create(orderOptions);

  res.status(201).json({
    sucess: true,
    message: "Order placed successfully via Cash on Delivary",
  });
});

//place order
export const placeOrderOnline = asyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderedItems,
    paymentMethod,
    itemsPrice,
    shippingCharges,
    taxCharges,
    totalAmount,
  } = req.body;
  const user = req.user._id;
  const orderOptions = {
    shippingInfo,
    orderedItems,
    paymentMethod,
    itemsPrice,
    shippingCharges,
    taxCharges,
    totalAmount,
    user,
  };

  const options = {
    amount: Number(totalAmount) * 100,
    currency: "INR",
  };

  const order = await instance.orders.create(options);

  res.status(201).json({
    sucess: true,
    order,
    orderOptions,
  });
});

//payment verification
export const paymentVerification = asyncError(async (req, res, next) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    orderOptions,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  const isAuthenticedPayment = expectedSignature === razorpay_signature;

  if (isAuthenticedPayment) {
    const payment = await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    await Order.create({
      ...orderOptions,
      paidAt: new Date(Date.now()),
      paymentInfo: payment._id,
    });

    res.status(201).json({
      sucess: true,
      message: `Order Placed successfully. Payment ID: ${payment._id}`,
    });
  } else {
    return next(new ErrorHandler("Payment Failed", 400));
  }
});

//my orders
export const getMyOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find({
    user: req.user._id,
  }).populate("user", "name");

  res.status(200).json({
    success: true,
    orders,
  });
});

//get details of a order
export const getOrder = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name");
  if (!order) {
    return next(new ErrorHandler("invalid Order id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//get admin orders
export const getAllOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find().populate("user", "name");

  res.status(200).json({
    success: true,
    orders,
  });
});

//process a order
export const processOrder = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name");
  if (!order) {
    return next(new ErrorHandler("Invalid Order id", 404));
  }

  if (order.orderStatus === "Preparing") {
    order.orderStatus = "Shipped";
  } else if (order.orderStatus === "Shipped") {
    order.orderStatus = "Delivared";
    order.delivaredAt = new Date(Date.now());
  } else {
    return next(new ErrorHandler("Order already Delivared !!", 400));
  }

  await order.save();

  res.status(200).json({
    sucess: true,
    message: "Status updated successfully!!",
  });
});
