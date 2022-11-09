import mongoose from "mongoose";

export const connectDB = async () => {
  const { connection } = await mongoose.connect(process.env.DB);

  console.log(`DB is connected with ${connection.host}`);
};
