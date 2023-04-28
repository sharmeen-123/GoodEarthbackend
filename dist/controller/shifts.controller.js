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
const shifts_model_1 = __importDefault(require("../models/shifts.model"));
const cycle_model_1 = __importDefault(require("../models/cycle.model"));
const axios_1 = __importDefault(require("axios"));
const cron = require("node-cron");
// const shell = require('shelljs');
// import fetch from 'node-fetch';
const jwt = require("jsonwebtoken");
//VALIDATION
const Joi = require("@hapi/joi");
let shifttid = false;
// validate body of start shift
const startShiftValidationSchema = Joi.object({
    checkinLocation: Joi.object().required(),
    checkinTime: Joi.date().required(),
    userID: Joi.string().required(),
});
// validate body of end shift
const endShiftValidationSchema = Joi.object({
    checkoutLocation: Joi.object().min(3).required(),
});
// validate body of change location
const changeLocationValidationSchema = Joi.object({
    lastLocation: Joi.object().min(2).required(),
});
// .................... to update location .........................
const updateData = () => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("in update.......")
    try {
        const response = yield axios_1.default.get('http://api.ipapi.com/api/check?access_key=9c326d6e83bb32f28397c00bc5025384');
        let location = response.data;
        console.log(`Location: ${location}`);
        let updatedLocation = {
            longitude: location.longitude,
            latitude: location.latitude
        };
        let updateLocation = yield shifts_model_1.default.findOneAndUpdate({ _id: shifttid }, {
            lastLocation: updatedLocation,
            $push: {
                locations: updatedLocation
            }
        });
    }
    catch (error) {
        console.log(error.message);
    }
});
let test = cron.schedule('*/15 * * * *', () => {
    // console.log("cron running.......")
    if (shifttid) {
        updateData();
        console.log("data updated!!!", shifttid);
    }
});
// store shift to cycle after 15 days
const cycle = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // Function call
    cycle_model_1.default.insertMany(data).then(function () {
        console.log("Data inserted"); // Success
        deleteShifts(data);
    }).catch(function (error) {
        console.log(error); // Failure
    });
});
const deleteShifts = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // Function call
    shifts_model_1.default.remove().then(function () {
        console.log("shifts removed"); // Success
    }).catch(function (error) {
        console.log(error); // Failure
    });
});
// get all shifts
const shiftAll = () => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield shifts_model_1.default.find({});
    // console.log(data)
    if (data) {
        cycle(data);
    }
});
// crone 2
cron.schedule('* * */15,*/30 * *', () => {
    console.log("cron running on cycle compeletion");
    shiftAll();
    console.log("data updated!!!");
}).start();
const shiftsController = {
    // ----------------- api to start shift ----------------- 
    startShift(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // checking for validation
            const { error } = startShiftValidationSchema.validate(req.body);
            // getting current date time
            var date_time = new Date();
            if (error) {
                console.log(error.details[0].message);
                res.status(400).send(error.details[0].message);
            }
            else {
                let shiftData = req.body;
                shiftData.locations = [shiftData.checkinLocation];
                shiftData.status = "active";
                shiftData.lastLocation = shiftData.checkinLocation;
                shiftData.totalHours = "00:00:00";
                shiftData.isPaid = false;
                // creating array of locations
                let locations = [shiftData.checkinLocation];
                console.log(locations);
                let shift = new shifts_model_1.default(shiftData);
                //test.start()
                shift.save((error, newShift) => {
                    if (error) {
                        res.send(error.message);
                    }
                    else {
                        shifttid = newShift._id;
                        const token = jwt.sign({ _id: newShift._id }, process.env.TOKEN_SECRET);
                        // sending response
                        res.status(200).send({
                            authToken: token,
                            userID: newShift.userID,
                            // checkinLocation: newShift.checkinLocation,
                            // checkinTime: newShift.checkinTime,
                            // locations: newShift.locations,
                            // lastLocation: newShift.lastLocation,
                            // status: newShift.status,
                            // totalHours: newShift.totalHours,
                            _id: newShift._id,
                        });
                    }
                });
            }
        });
    },
    // ----------------- api to change location ----------------- 
    changeLocation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // checking for validation
            const { error } = changeLocationValidationSchema.validate(req.body);
            console.log("in update location");
            if (error) {
                console.log(error.details[0].message);
                res.status(400).send(error.details[0].message);
            }
            else {
                let id = req.params.id;
                let location = req.body;
                console.log("location in updated", location.lastLocation);
                let data = yield shifts_model_1.default.find({
                    _id: id,
                });
                let updateLocation = false;
                let ifUpdate = true;
                let lastLocation = data[0].lastLocation;
                let currentLocation = location.lastLocation;
                if (lastLocation.speed === currentLocation.speed || lastLocation.heading === currentLocation.heading ||
                    lastLocation.altitude === currentLocation.altitude || lastLocation.accuracy === currentLocation.accuracy ||
                    lastLocation.longitude === currentLocation.longitude || lastLocation.latitude === currentLocation.latitude) {
                    ifUpdate = false;
                }
                console.log("data", ifUpdate);
                if (ifUpdate) {
                    // update location if changed
                    updateLocation = yield shifts_model_1.default.findOneAndUpdate({ _id: id }, {
                        lastLocation: location.lastLocation,
                        $push: {
                            locations: location.lastLocation
                        }
                    });
                }
                res.status(200).send({
                    data: "Location changed successfully",
                });
            }
        });
    },
    // ----------------- api to end shift ----------------- 
    endShift(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // checking for validation
            const { error } = endShiftValidationSchema.validate(req.body);
            //test.end()
            if (error) {
                console.log(error.details[0].message);
                res.status(400).send(error.details[0].message);
            }
            else {
                shifttid = false;
                let id = req.params.id;
                let endShift = req.body;
                let data = yield shifts_model_1.default.find({
                    _id: id,
                });
                console.log("data is  ", data);
                const currentTime = new Date();
                const givenTime = data[0].checkinTime;
                // Calculate the difference in milliseconds
                const timeDiff = currentTime.getTime() - new Date(givenTime).getTime();
                // Convert the difference to hours, minutes, and seconds
                let hours = Math.floor(timeDiff / (1000 * 60 * 60)).toString();
                let minutes = Math.floor((timeDiff / (1000 * 60)) % 60).toString();
                let seconds = Math.floor((timeDiff / 1000) % 60).toString();
                if (hours.toString().length === 1) {
                    hours = '0' + hours.toString();
                }
                if (minutes.toString().length === 1) {
                    minutes = '0' + minutes.toString();
                }
                if (seconds.toString().length === 1) {
                    seconds = '0' + seconds.toString();
                }
                const totalHours = hours + " : " + minutes + " : " + seconds;
                // update location
                const updateLocation = yield shifts_model_1.default.findOneAndUpdate({ _id: id }, {
                    lastLocation: endShift.checkoutLocation,
                    checkoutLocation: endShift.checkoutLocation,
                    checkoutTime: currentTime,
                    totalHours: totalHours,
                    status: "Compeleted",
                    $push: {
                        locations: endShift.checkoutLocation,
                    }
                });
                if (!updateLocation) {
                    res.status(400).send("User not Exists");
                }
                else {
                    res.status(200).send({
                        data: "Shift Ended Successfully",
                    });
                }
            }
        });
    },
    // ----------------- api to get all shifts ----------------- 
    getAllShifts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let shift = req.query;
            let data = yield shifts_model_1.default.find({
                startedBy: shift.startedBy,
            });
            res.status(200).send({
                data: data,
            });
        });
    },
    // ----------------- api to get all shifts ----------------- 
    getActiveShifts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let shift = req.query;
            let data = yield shifts_model_1.default.find({
                startedBy: shift.startedBy,
                status: "active"
            });
            res.status(200).send({
                data: data,
            });
        });
    },
    // ----------------- api to get all shifts of particular user ----------------- 
    getShiftsOfOneUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let userID = req.params.userID;
            let shiftt = yield shifts_model_1.default.find({
                userID: userID,
                status: "Compeleted",
            });
            let data = [];
            // let obj = {}
            let shift = shiftt.map((val, ind) => {
                let checkin = getTime(val.checkinTime);
                const checkinDate = checkin.date;
                const checkinTime = checkin.time;
                let obj = {
                    totalHours: val.totalHours,
                    checkinTime: checkinTime,
                    checkinDate: checkinDate,
                    checkoutTime: new Date(val.checkoutTime).getTime(),
                    status: val.status
                };
                data.push(obj);
            });
            if (shift.length !== 0) {
                res.status(200).send({
                    data: data,
                });
            }
            else {
                res.status(400).send({
                    data: "user not found!",
                });
            }
        });
    },
    // ----------------- api to get number of active and completed shifts ----------------- 
    getNumberOfShifts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let completedShifts = yield shifts_model_1.default.find({
                status: "Compeleted",
            });
            let activeShifts = yield shifts_model_1.default.find({
                status: "active",
            });
            let allShifts = yield shifts_model_1.default.find({});
            let data = {
                activeShifts: activeShifts.length,
                completedShifts: completedShifts.length,
                allShifts: allShifts.length
            };
            res.status(200).send({
                data: data,
            });
        });
    },
    // ----------------- api to get number number of hours ----------------- 
    getNumberOfHours(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let userID = req.params.userID;
            const completedShifts = yield shifts_model_1.default.find({
                status: "Compeleted",
                userID: userID,
                isPaid: false
            });
            let totalHours = 0;
            completedShifts.map((val, ind) => {
                let time = val.totalHours;
                let time2 = time.split(":");
                totalHours += (+time2[0]);
                // console.log((+time2[0]), " ", (+time2[1]/60), " ", (+time2[1]/(60*60)))
                totalHours += (+time2[1] / 60);
                totalHours += (+time2[1] / (60 * 60));
            });
            totalHours = Math.round(totalHours);
            let data = {
                totalHours: totalHours,
                shifts: completedShifts.length
            };
            if (completedShifts) {
                res.status(200).send({
                    data: data,
                });
            }
            else {
                res.status(200).send({
                    data: 0,
                });
            }
        });
    },
};
const getTime = (time) => {
    let date = time.getDate().toString();
    let month = (time.getMonth() + 1).toString(); // add 1 because month is zero-indexed
    let year = time.getFullYear().toString();
    let hours = time.getHours().toString();
    let minutes = time.getMinutes().toString();
    let seconds = time.getSeconds().toString();
    if (hours.toString().length === 1) {
        hours = '0' + hours.toString();
    }
    if (minutes.toString().length === 1) {
        minutes = '0' + minutes.toString();
    }
    if (seconds.toString().length === 1) {
        seconds = '0' + seconds.toString();
    }
    const Date = date + "-" + month + '-' + year;
    const Time = hours + " : " + minutes + " : " + seconds;
    let dateTime = {
        date: Date,
        time: Time
    };
    return dateTime;
};
exports.default = shiftsController;
//# sourceMappingURL=shifts.controller.js.map