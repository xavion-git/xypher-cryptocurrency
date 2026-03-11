import mongoose from "mongoose";

const BlockSchema = new mongoose.Schema({
  index: Number,
  timestamp: Number,
  hash: String,
  previousHash: String,
  nonce: Number,
  difficulty: Number,
  data: Array
});

export const BlockModel = mongoose.model("Block", BlockSchema);