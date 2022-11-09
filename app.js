import express, { urlencoded } from "express";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import Razorpay from "razorpay";
import cors from "cors";
import { connectDB } from "./config/database.js";
import { connectPassport } from "./utils/Provider.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/ErrorMiddleware.js";
const app = express();

//accessing env file
dotenv.config({
  path: "./config/config.env",
});

//accessing middleware
app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
      secure: process.env.NODE_ENV === "development" ? false : true,
      httpOnly: process.env.NODE_ENV === "development" ? false : true,
      sameSite: process.env.NODE_ENV === "development" ? false : "none",
    },
  })
);

app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.enable("trust proxy");

connectPassport();

//accessing routes
app.use(userRoutes);
app.use(orderRoutes);

//connect DB
connectDB();

//using razorpay integration
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(
    `server is running at port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});

//using errorHandler middleware
app.use(errorMiddleware);
