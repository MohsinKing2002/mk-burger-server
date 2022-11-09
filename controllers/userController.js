import { asyncError } from "../middlewares/ErrorMiddleware.js";
import { Order } from "../models/orderSchema.js";
import { User } from "../models/userSchema.js";

//get user profile
export const profile = (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

//logout
export const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);

    res.clearCookie("connect.sid", {
      secure: process.env.NODE_ENV === "development" ? false : true,
      httpOnly: process.env.NODE_ENV === "development" ? false : true,
      sameSite: process.env.NODE_ENV === "development" ? false : "none",
    });

    res.status(200).json({
      message: "Logged out!!",
    });
  });
};

//get all users --> admin access
export const getAllUsers = asyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//get statistics --> admin access
export const getAdminStats = asyncError(async (req, res, next) => {
  const userCounts = await User.countDocuments();

  const orders = await Order.find();

  const preparingOrders = orders.filter((i) => i.orderStatus === "Preparing");
  const shippedOrders = orders.filter((i) => i.orderStatus === "Shipped");
  const delivaredOrders = orders.filter((i) => i.orderStatus === "Delivared");

  let totalIncome = 0;
  orders.forEach((i) => {
    totalIncome += i.totalAmount;
  });

  res.status(200).json({
    success: true,
    userCounts,
    orderCounts: {
      total: orders.length,
      preparing: preparingOrders.length,
      shipped: shippedOrders.length,
      delivared: delivaredOrders.length,
    },
    totalIncome,
  });
});
