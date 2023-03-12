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
const payment_model_1 = __importDefault(require("../models/payment.model"));
const cron = require("node-cron");
// const shell = require('shelljs');
// import fetch from 'node-fetch';
const jwt = require("jsonwebtoken");
//VALIDATION
const Joi = require("@hapi/joi");
let paymenttid = false;
// validate body of start payment
const addpaymentValidationSchema = Joi.object({
    userName: Joi.string().required(),
    totalHours: Joi.number().required(),
    wage: Joi.number().required(),
    paidAmount: Joi.number().required(),
    userID: Joi.string().required(),
});
const paymentsController = {
    // ----------------- api to start payment ----------------- 
    addpayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // checking for validation
            const { error } = addpaymentValidationSchema.validate(req.body);
            if (error) {
                console.log(error.details[0].message);
                res.status(400).send(error.details[0].message);
            }
            else {
                let paymentData = req.body;
                let payment = new payment_model_1.default(paymentData);
                //test.start()
                payment.save((error, newpayment) => {
                    if (error) {
                        res.send(error.message);
                    }
                    else {
                        paymenttid = newpayment._id;
                        const token = jwt.sign({ _id: newpayment._id }, process.env.TOKEN_SECRET);
                        // sending response
                        res.status(200).send({
                            authToken: token,
                            userID: newpayment.userID,
                            // checkinLocation: newpayment.checkinLocation,
                            // checkinTime: newpayment.checkinTime,
                            // locations: newpayment.locations,
                            // lastLocation: newpayment.lastLocation,
                            // status: newpayment.status,
                            // totalHours: newpayment.totalHours,
                            _id: newpayment._id,
                        });
                    }
                });
            }
        });
    },
};
exports.default = paymentsController;
//# sourceMappingURL=payment.controller.js.map