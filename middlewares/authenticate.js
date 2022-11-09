import ErrorHandler from "../utils/ErrorHandler.js";

//user authentication
export const isAuthenticated = (req, res, next) => {
  const token = req.cookies["connect.sid"];

  if (!token) {
    return next(new ErrorHandler("Not Logged in !!", 401));
  }

  next();
};

//authorize admin
export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Only Admins are allowed!!", 405));
  }
  next();
};
