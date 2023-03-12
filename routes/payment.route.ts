import express from "express";
import paymentsController from "../controller/payment.controller";

const paymentsRouter = express.Router();

paymentsRouter.post("/addpayment", paymentsController.addpayment);

export default paymentsRouter;