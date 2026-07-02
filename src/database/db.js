import mongoose from "mongoose";



const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://pm3794469:pinky123@ac-lsjzt7b-shard-00-00.rvhuh3f.mongodb.net:27017,ac-lsjzt7b-shard-00-01.rvhuh3f.mongodb.net:27017,ac-lsjzt7b-shard-00-02.rvhuh3f.mongodb.net:27017/?ssl=true&replicaSet=atlas-rhfwev-shard-0&authSource=admin&appName=Cluster0' );
    console.log("MongoDB connected");
  } catch (error) {
    console.log("DB connection error:", error);
  }
};

export default connectDB;

