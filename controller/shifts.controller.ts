import e from "express";
import shifts from "../models/shifts.model";

const jwt = require("jsonwebtoken");

//VALIDATION
const Joi = require("@hapi/joi");

// validate body of start shift
const startShiftValidationSchema = Joi.object({
    checkinLocation: Joi.object().required(),
    checkinTime: Joi.date().required(),
    userID: Joi.string().required(),
  });
// validate body of end shift
const endShiftValidationSchema = Joi.object({
    checkoutLocation: Joi.object().min(3).required(),
    checkoutTime: Joi.date().required(),
    totalHours: Joi.string().required()
  }); 
// validate body of change location
const changeLocationValidationSchema = Joi.object({
    lastLocation: Joi.object().min(3).required(),
  });

  
const shiftsController = {
  // ----------------- api to start shift ----------------- 
  async startShift(req, res) {
    // checking for validation
    const { error } = startShiftValidationSchema.validate(req.body);
    // getting current date time
    var date_time = new Date();
    if (error) {
      console.log(error.details[0].message);
      res.status(400).send(error.details[0].message);
    } else {
        let shiftData = req.body;
        shiftData.locations= [shiftData.checkinLocation];
        shiftData.status = "active";
        shiftData.lastLocation = shiftData.checkinLocation;
        shiftData.totalHours = "00:00:00";
        // creating array of locations
        let locations = [shiftData.checkinLocation];
        console.log(locations);
        let shift = new shifts(shiftData);
  
        shift.save((error, newShift) => {
            if (error) {
              res.send(error.message);
            } else {
              const token = jwt.sign(
                { _id: newShift._id },
                process.env.TOKEN_SECRET
              );
  
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
    },

 // ----------------- api to change location ----------------- 
 async changeLocation(req, res) {
    // checking for validation
    const { error } = changeLocationValidationSchema.validate(req.body);
    console.log("in update location")
    if (error) {
        console.log(error.details[0].message);
        res.status(400).send(error.details[0].message);
      } else {
        let id = req.params.id;
        let location = req.body;
        console.log("location in updated",location.lastLocation)
        let data = await shifts.find({
            _id: id,
          });
        let updateLocation = false;
        let ifUpdate = true;
        let lastLocation = data[0].lastLocation;
        let currentLocation = location.lastLocation;
        if (lastLocation.speed === currentLocation.speed || lastLocation.heading === currentLocation.heading ||
          lastLocation.altitude === currentLocation.altitude || lastLocation.accuracy === currentLocation.accuracy ||
          lastLocation.longitude === currentLocation.longitude || lastLocation.latitude === currentLocation.latitude){
            ifUpdate = false;
          }
        
        console.log("data", ifUpdate)
        if (ifUpdate){
            // update location if changed
            updateLocation = await shifts.findOneAndUpdate(
                {_id : id},
                {lastLocation: location.lastLocation,
                  $push : {
                      locations : location.lastLocation
                    }}
            )
        }
  
         
            
       
          res.status(200).send({
            data: "Location changed successfully",
          });
        
       
      }   
    },

// ----------------- api to end shift ----------------- 
async endShift(req, res) {
    // checking for validation
    const { error } = endShiftValidationSchema.validate(req.body);
    if (error) {
        console.log(error.details[0].message);
        res.status(400).send(error.details[0].message);
      } else {
        let id = req.params.id;
        let endShift = req.body;
  
        let data = await shifts.find({
            _id: id,
          });
  
          // update location
            const updateLocation = await shifts.findOneAndUpdate(
              {_id : id},
              {lastLocation: endShift.checkoutLocation,
                checkoutLocation : endShift.checkoutLocation,
                checkoutTime : endShift.checkoutTime,
                totalHours: endShift.totalHours,
                status: "Compeleted",
                $push : {
                    locations : endShift.checkoutLocation,
                  }}
          )
        if (!updateLocation){
          res.status(400).send("User not Exists");
        }
        else{
          res.status(200).send({
            data: "Shift Ended Successfully",
          });
        }
       
      }   
    },

 // ----------------- api to get all shifts ----------------- 
 async getAllShifts(req, res) {
    let shift = req.query;
    let data = await shifts.find({
      startedBy: shift.startedBy,
    });
    res.status(200).send({
      data: data,
    });
  },

   // ----------------- api to get all shifts of particular user ----------------- 
   async getShiftsOfOneUser(req, res) {
    let userID = req.params.userID;
    let shift = await shifts.find({
      userID: userID,
    });
    if(shift.length !== 0){
        res.status(200).send({
            data: shift,
          });
    }else{
        res.status(400).send({
            data: "user not found!",
          });
    }
    
  },
};

export default shiftsController;
