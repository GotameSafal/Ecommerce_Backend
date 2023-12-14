import mongoose from "mongoose";
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const { connection } = await mongoose.connect(process.env.DB_URI);
    console.log(`connection made with ${connection.host}`);
  } catch (error) {

    console.log(`connection failed`);
  }
};
export default connectDB;
