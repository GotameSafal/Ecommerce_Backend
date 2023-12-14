import express from "express";
import { config } from "dotenv";
import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/userRoute.js";
import orderRoute from "./routes/orderRoute.js";
import khaltiRoute from "./routes/onlinePaymentRoute.js";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

config({ path: "./config/config.env" });
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
  })
);

// defined routes
app.use(productRoute);
app.use(userRoute);
app.use(orderRoute);
app.use(khaltiRoute);
app.use(errorMiddleware);

export default app;
