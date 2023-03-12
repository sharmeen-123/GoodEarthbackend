import express from "express";
import shiftsController from "../controller/shifts.controller";

const shiftsRouter = express.Router();

shiftsRouter.post("/startShift", shiftsController.startShift);
shiftsRouter.put("/changeLocation/:id", shiftsController.changeLocation);
shiftsRouter.put("/endShift/:id", shiftsController.endShift);
shiftsRouter.get("/getAllShifts", shiftsController.getAllShifts);
shiftsRouter.get("/getShiftsOfOneUser/:userID", shiftsController.getShiftsOfOneUser);
shiftsRouter.get("/getNumberOfHours/:userID", shiftsController.getNumberOfHours);
shiftsRouter.get("/getNumberOfShifts", shiftsController.getNumberOfShifts);

export default shiftsRouter;