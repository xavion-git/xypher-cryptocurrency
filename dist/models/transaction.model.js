"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const TransactionSchema = new mongoose_1.default.Schema({
    id: String,
    sender: String,
    recipient: String,
    amount: Number,
    timestamp: Number,
    signature: String
});
exports.TransactionModel = mongoose_1.default.model("Transaction", TransactionSchema);
//# sourceMappingURL=transaction.model.js.map