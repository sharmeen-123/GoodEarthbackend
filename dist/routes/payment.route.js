"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = __importDefault(require("../controller/payment.controller"));
const paymentsRouter = express_1.default.Router();
paymentsRouter.post("/addpayment", payment_controller_1.default.addpayment);
exports.default = paymentsRouter;
//# sourceMappingURL=payment.route.js.map