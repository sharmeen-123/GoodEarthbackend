import e from "express";
import payments from "../models/payment.model";
import cycles from "../models/cycle.model";
import axios from 'axios';

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
  shifts: Joi.number().required(),
  userID: Joi.string().required(),

});


const paymentsController = {
  // ----------------- api to start payment ----------------- 
  async addpayment(req, res) {
    // checking for validation
    const { error } = addpaymentValidationSchema.validate(req.body);
   
    if (error) {
      console.log(error.details[0].message);
      res.status(400).send(error.details[0].message);
    } else {
      let paymentData = req.body;
      
      let payment = new payments(paymentData);
      //test.start()

      payment.save((error, newpayment) => {
        if (error) {
          res.send(error.message);
        } else {
          paymenttid = newpayment._id;
          const token = jwt.sign(
            { _id: newpayment._id },
            process.env.TOKEN_SECRET
          );

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
  },

  
};




export default paymentsController;
