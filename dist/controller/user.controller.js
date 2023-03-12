"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
// export CLOUDINARY_URL=cloudinary://799719869373998:LhU3V8GcPLCWcVmd_zmzPDPg_Go@dyapmvalo
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//VALIDATION
const Joi = require("@hapi/joi");
// for uploading img on cloudinary
// Require the cloudinary library
const cloudinary = require('cloudinary').v2;
// Return "https" URLs by setting secure: true
cloudinary.config({
    cloud_name: 'dyapmvalo',
    api_key: '799719869373998',
    api_secret: 'LhU3V8GcPLCWcVmd_zmzPDPg_Go'
});
// cloudinary.config({
//   secure: true
// });
// Log the configuration
// console.log(cloudinary.config());
//validation for register data
const registerValidationSchema = Joi.object({
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3),
    email: Joi.string().required(),
    phone: Joi.number().required(),
    password: Joi.string().min(3).required(),
    userType: Joi.string().required(),
    verified: Joi.boolean().required(),
    image: Joi.string(),
    // dateJoined: Joi.string().required(),
    // active: Joi.boolean().required(),
    status: Joi.string().required(),
    isAdmin: Joi.boolean(),
});
//validation for update data
const updateValidationSchema = Joi.object({
    name: Joi.string().min(3),
    email: Joi.string(),
    phone: Joi.number(),
    userType: Joi.string(),
    image: Joi.string(),
    address: Joi.string().min(5),
    password: Joi.string().min(8),
});
//validation to verify data
const verifyValidationSchema = Joi.object({
    verified: Joi.boolean().required(),
});
//validation to make user active
const activeUserValidationSchema = Joi.object({
    active: Joi.boolean().required(),
});
//validation for login data
const loginValidationSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().min(3).required(),
});
/////////////////////////
// Uploads an image file
/////////////////////////
const uploadImage = (imagePath) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in update user ==> ", imagePath);
    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
    };
    console.log("uploading image ==> ", options);
    try {
        // Upload the image
        const result = yield cloudinary.uploader.upload(imagePath, options);
        console.log(result.url);
        return result.url;
    }
    catch (error) {
        console.error("error........................", error);
    }
});
const userController = {
    // ----------------- Api to register user ----------------- 
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // checking for validations
            const { error } = registerValidationSchema.validate(req.body);
            if (error) {
                console.log(error.details[0].message);
                res.status(400).send(error.details[0].message);
            }
            else {
                let userData = req.body;
                let user = new user_model_1.default(userData);
                // check if user already exists
                const emailExists = yield user_model_1.default.findOne({
                    email: user.email,
                });
                if (emailExists) {
                    console.log("already exisits");
                    res.status(400).send("User Already Exists");
                }
                else {
                    // encrypting password
                    const salt = yield bcrypt.genSalt(10);
                    user.password = yield bcrypt.hash(user.password, salt);
                    var today = new Date(), date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
                    user.dateJoined = date;
                    // if(user.image){
                    //   console.log("in Uploading Imagee", user.image)
                    //   const url = await uploadImage(user.image);
                    //   user.image = url;
                    // }
                    user.save((error, registeredUser) => {
                        if (error) {
                            res.send(error.message);
                            console.log(error.message);
                        }
                        else {
                            const token = jwt.sign({ _id: registeredUser._id }, process.env.TOKEN_SECRET);
                            // sending response
                            res.status(200).send({
                                authToken: token,
                                firstName: registeredUser.firstName,
                                lastName: registeredUser.lastName,
                                email: registeredUser.email,
                                phone: registeredUser.phone,
                                userType: registeredUser.userType,
                                verified: registeredUser.verified,
                                image: registeredUser.image,
                                // active: registeredUser.active,
                                password: registeredUser.password,
                                status: registeredUser.status,
                                _id: registeredUser._id,
                            });
                        }
                    });
                }
            }
        });
    },
    // ----------------- api to update user ----------------- 
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // checking for validation
            const { error } = updateValidationSchema.validate(req.body);
            if (error) {
                console.log(error.details[0].message);
                res.status(400).send(error.details[0].message);
            }
            else {
                let id = req.params.id;
                let updatedUser = req.body;
                // console.log("image ==> ",updatedUser.image)
                const url = yield uploadImage(updatedUser.image);
                updatedUser.image = url;
                console.log("public id ==> ", url, "updated user", updatedUser);
                let name = updatedUser.name.split(" ");
                const checkName = (name) => {
                    if (name !== "") {
                        console.log("return");
                        return true;
                    }
                    else {
                        return false;
                    }
                };
                let namee = name.filter(checkName);
                const salt = yield bcrypt.genSalt(10);
                updatedUser.password = yield bcrypt.hash(updatedUser.password, salt);
                console.log("password", updatedUser.password);
                console.log("id", id);
                // update user
                const update = yield user_model_1.default.findOneAndUpdate({ _id: id }, {
                    firstName: namee[0],
                    lastName: namee[1],
                    password: updatedUser.password,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    image: updatedUser.image,
                    address: updatedUser.address,
                });
                if (!update) {
                    console.log("error");
                    res.status(400).send("Error");
                }
                else {
                    res.status(200).send({
                        data: "data updated successfully",
                    });
                }
            }
        });
    },
    // ----------------- api to verify user ----------------- 
    verifyUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let data = yield user_model_1.default.find({
                _id: id,
            });
            const status = data[0].verified;
            let update;
            if (status) {
                // set verified false
                update = yield user_model_1.default.findOneAndUpdate({ _id: id }, { verified: false });
            }
            else {
                // set verified false
                update = yield user_model_1.default.findOneAndUpdate({ _id: id }, { verified: true });
            }
            if (!update) {
                res.status(400).send("User not Exists");
            }
            else {
                res.status(200).send({
                    data: "data updated successfully",
                });
            }
        });
    },
    // ----------------- api to make user active ----------------- 
    activeUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // checking for validation
            const { error } = activeUserValidationSchema.validate(req.body);
            if (error) {
                console.log(error.details[0].message);
                res.status(400).send(error.details[0].message);
            }
            else {
                let id = req.params.id;
                let updatedUser = req.body;
                // set active
                const update = yield user_model_1.default.findOneAndUpdate({ _id: id }, { active: updatedUser.active, });
                if (!update) {
                    res.status(400).send("User not Exists");
                }
                else {
                    res.status(200).send({
                        data: "data updated successfully",
                    });
                }
            }
        });
    },
    // ----------------- api to block or unblock user ----------------- 
    switchUserStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let data = yield user_model_1.default.find({
                _id: id,
            });
            const status = data[0].status;
            let update;
            // if status is blocked
            if (status === "block") {
                update = yield user_model_1.default.findOneAndUpdate({ _id: id }, { status: "unblock", });
            }
            // if status is set to unblock
            else {
                update = yield user_model_1.default.findOneAndUpdate({ _id: id }, { status: "block", });
            }
            if (!update) {
                res.status(400).send("User not Exists");
            }
            else {
                res.status(200).send({
                    data: "Status updated",
                });
            }
        });
    },
    // ----------------- api to get all users ----------------- 
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = req.query;
            let data = yield user_model_1.default.find({
                startedBy: user.startedBy,
            });
            res.status(200).send({
                data: data,
            });
        });
    },
    // ----------------- api to get particular users by matching id ----------------- 
    getOneUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = req.params.id;
            let data = yield user_model_1.default.find({
                _id: id,
            });
            res.status(200).send({
                data: data,
            });
        });
    },
    // ----------------- api to get user by matching name ----------------- 
    getUserByName(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let body = req.params.name;
            let data = yield user_model_1.default.find({});
            const checkName = (data) => {
                let namee = data.firstName + " " + data.lastName;
                if (namee.toUpperCase().includes(body.toUpperCase())) {
                    return true;
                }
                else {
                    return false;
                }
            };
            let filterData = data.filter(checkName);
            res.status(200).send({
                data: filterData,
            });
        });
    },
    // ----------------- api to delete user ----------------- 
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId = req.params.id;
            yield user_model_1.default.deleteOne({
                _id: userId,
            }, (err, suc) => {
                if (err) {
                    res.status(404).send("user not found");
                }
                else {
                    if (suc.deletedCount == 1) {
                        res.send("deleted");
                    }
                    else
                        res.status(404).send("user not found");
                }
            });
        });
    },
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { error } = loginValidationSchema.validate(req.body);
            if (error) {
                res.status(400).send(error.details[0].message);
            }
            else {
                const userData = req.body;
                const user = new user_model_1.default(userData);
                const foundUser = yield user_model_1.default.findOne({ email: userData.email });
                if (!foundUser) {
                    res.status(400).send("Email or Password is wrong");
                }
                else if (foundUser.status === 'block') {
                    res.status(400).send("Your account have been blocked by admin. Contact company for detailed information");
                }
                else if (foundUser.verified === false) {
                    res.status(400).send("Verification is pending. Contact company for information");
                }
                else {
                    const validPass = yield bcrypt.compare(user.password, foundUser.password);
                    if (!validPass) {
                        res.status(400).send("Email or Password is wrong");
                    }
                    else {
                        const token = jwt.sign({ _id: foundUser._id }, process.env.TOKEN_SECRET);
                        res.status(200).send({
                            authToken: token,
                            // name: foundUser.name,
                            // email: foundUser.email,
                            _id: foundUser._id,
                            // isAmdin: foundUser.isAdmin,
                        });
                    }
                }
            }
        });
    },
    // ----------------- api to get number of admin and employees ----------------- 
    getNumberOfUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let employees = yield user_model_1.default.find({
                userType: "Site Worker",
            });
            let admin = yield user_model_1.default.find({
                userType: "Admin",
            });
            let verified = yield user_model_1.default.find({
                verified: false,
            });
            let allUsers = yield user_model_1.default.find({});
            let data = {
                employees: employees.length,
                admin: admin.length,
                allUsers: allUsers.length,
                unverified: verified.length,
            };
            res.status(200).send({
                data: data,
            });
        });
    },
};
exports.default = userController;
// router.post("/login", async (req, res) => {
// });
//# sourceMappingURL=user.controller.js.map