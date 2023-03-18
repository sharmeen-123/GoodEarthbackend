"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./user.route"));
const shifts_route_1 = __importDefault(require("./shifts.route"));
const payment_route_1 = __importDefault(require("./payment.route"));
const cycle_route_1 = __importDefault(require("./cycle.route"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.send("hello from server");
});
router.use("/user", user_route_1.default);
router.use("/shifts", shifts_route_1.default);
router.use("/payment", payment_route_1.default);
router.use("/cycle", cycle_route_1.default);
exports.default = router;
//# sourceMappingURL=main.route.js.map