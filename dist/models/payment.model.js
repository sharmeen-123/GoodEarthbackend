"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const paymentSchema = new Schema({
    totalHours: {
        type: Number,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    wage: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        required: true
    },
    userID: {
        type: mongoose.Schema.ObjectId,
        required: true,
    }
});
exports.default = mongoose.model("payment", paymentSchema, "payments");
//# sourceMappingURL=payment.model.js.map