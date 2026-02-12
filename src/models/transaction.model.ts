import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  id: String,
  sender: String,
  recipient: String,
  amount: Number,
  timestamp: Number,
  signature: String
});

export const TransactionModel = mongoose.model("Transaction", TransactionSchema);
