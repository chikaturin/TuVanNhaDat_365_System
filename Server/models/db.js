import mongoose, { connect } from "mongoose";
import dotenv from "dotenv";
connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((e) => {
    console.error("Did not connect to MongoDB", e);
  });

export default mongoose;
