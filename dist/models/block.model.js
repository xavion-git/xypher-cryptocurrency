"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BlockSchema = new mongoose_1.default.Schema({
    index: Number,
    timestamp: Number,
    hash: String,
    previousHash: String,
    nonce: Number,
    difficulty: Number,
    data: Array
});
exports.BlockModel = mongoose_1.default.model("Block", BlockSchema);
//# sourceMappingURL=block.model.js.map