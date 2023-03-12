import express from "express";
import userController from "../controller/user.controller";

const userRouter = express.Router();

userRouter.post("/register", userController.register);
userRouter.put("/updateUser/:id", userController.updateUser);
userRouter.put("/verifyUser/:id", userController.verifyUser);
userRouter.put("/activeUser/:id", userController.activeUser);
userRouter.put("/switchUserStatus/:id", userController.switchUserStatus);
userRouter.delete("/deleteUser/:id", userController.deleteUser);
userRouter.post("/login", userController.login);
userRouter.get("/getAllUsers", userController.getAllUsers);
userRouter.get("/getOneUser/:id", userController.getOneUser);
userRouter.get("/getNumberOfUsers", userController.getNumberOfUsers);

export default userRouter;
