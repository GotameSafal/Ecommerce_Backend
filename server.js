import app from "./app.js";
import connectDB from "./config/connDb.js";
import { v2 as cloudinary } from "cloudinary";
// catching uncaught exception
process.on("uncaughtException", (err) => {
  console.log("server closed due to uncaught exception");
  process.exit(1);
});

// connection to database
connectDB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// connecting to server
const server = app.listen(process.env.PORT, () => {
  console.log(`listening at port ${process.env.PORT}`);
});

// catching unhandled rejection
process.on("unhandledRejection", (err) => {
  console.log("server crashed");
  console.log(err.message);
  server.close((e) => {
    process.exit(1);
  });
});
