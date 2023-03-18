import express from "express";
import userRouter from "./user.route";
import shiftsRouter from "./shifts.route";
import paymentsRouter from "./payment.route";
import cyclesRouter from "./cycle.route";
import authGuard from "../middleware/authGuard.middleware";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello from server");
});

router.use("/user", userRouter);
router.use("/shifts", shiftsRouter);
router.use("/payment", paymentsRouter);
router.use("/cycle", cyclesRouter);

export default router;
