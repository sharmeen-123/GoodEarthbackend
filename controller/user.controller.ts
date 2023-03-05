import router from "../routes/main.route";
import User from "../models/user.model";
import { json } from "express";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//VALIDATION
const Joi = require("@hapi/joi");

//validation for register data
const registerValidationSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  email: Joi.string().required(),
  phone: Joi.number().required(),
  password: Joi.string().min(3).required(),
  userType: Joi.string().required(),
  verified: Joi.boolean().required(),
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



const userController = {
  // ----------------- Api to register user ----------------- 
  async register(req, res) {
    // checking for validations
    const { error } = registerValidationSchema.validate(req.body);
    if (error) {
      console.log(error.details[0].message);
      res.status(400).send(error.details[0].message);
    } else {
      let userData = req.body;
      let user = new User(userData);

      // check if user already exists
      const emailExists = await User.findOne({
        email: user.email,
      });
      if (emailExists) {
        console.log("already exisits");
        res.status(400).send("User Already Exists");
      } else {

        // encrypting password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        user.save((error, registeredUser) => {
          if (error) {
            res.send(error.message);
            console.log(error.message);
          } else {
            const token = jwt.sign(
              { _id: registeredUser._id },
              process.env.TOKEN_SECRET
            );

            // sending response
            res.status(200).send({
              authToken: token,
              firstName: registeredUser.firstName,
              lastName: registeredUser.lastName,
              email: registeredUser.email,
              phone: registeredUser.phone,
              userType: registeredUser.userType,
              verified: registeredUser.verified,
              // active: registeredUser.active,
              status: registeredUser.status,
              _id: registeredUser._id,
            });
          }
        });
      }
    }
  },


  // ----------------- api to update user ----------------- 
  async updateUser(req, res) {
    // checking for validation
    const { error } = updateValidationSchema.validate(req.body);
    if (error) {
      console.log(error.details[0].message);
      res.status(400).send(error.details[0].message);
    } else {
      let id = req.params.id;
      let updatedUser = req.body;
      let name = updatedUser.name.split(" ");
      const checkName = (name) => {
        if (name !== ""){
          console.log("return")
          return true
        }
        else {
          return false;
        }
      }
      let namee = name.filter(checkName);
      const salt = await bcrypt.genSalt(10);
      updatedUser.password = await bcrypt.hash(updatedUser.password, salt);
      console.log("password", updatedUser.password);
      console.log("id", id);

        // update user
          const update = await User.findOneAndUpdate(
            {_id : id},
            {
              firstName: namee[0],
              lastName: namee[1],
              password: updatedUser.password,
                email: updatedUser.email,  
                phone: updatedUser.phone,
                image: updatedUser.image,
                address: updatedUser.address,
            }
        )
      if (!update){
        console.log("error")
        res.status(400).send("Error");
      }
     
      else{
        res.status(200).send({
          data: "data updated successfully",
        });
      }
     
    }   
  },

  // ----------------- api to verify user ----------------- 
  async verifyUser(req, res) {
    // checking for validation
    const { error } = verifyValidationSchema.validate(req.body);
    if (error) {
      console.log(error.details[0].message);
      res.status(400).send(error.details[0].message);
    } else {
      let id = req.params.id;
      let updatedUser = req.body;

        // set verified
          const update = await User.findOneAndUpdate(
            {_id : id},
            {verified: updatedUser.verified,}
        )
      if (!update){
        res.status(400).send("User not Exists");
      }
      else{
        res.status(200).send({
          data: "data updated successfully",
        });
      }
     
    }   
  },

  // ----------------- api to make user active ----------------- 
  async activeUser(req, res) {
    // checking for validation
    const { error } = activeUserValidationSchema.validate(req.body);
    if (error) {
      console.log(error.details[0].message);
      res.status(400).send(error.details[0].message);
    } else {
      let id = req.params.id;
      let updatedUser = req.body;

        // set active
          const update = await User.findOneAndUpdate(
            {_id : id},
            {active: updatedUser.active,}
        )
      if (!update){
        res.status(400).send("User not Exists");
      }
     
      else{
        res.status(200).send({
          data: "data updated successfully",
        });
      }
     
    }   
  },

  // ----------------- api to block or unblock user ----------------- 
  async switchUserStatus(req, res) {
    let id = req.params.id;
    let data = await User.find({
      _id: id,
    });

    const status = data[0].status;
    let update;

    // if status is blocked
    if(status === "block"){
        update = await User.findOneAndUpdate(
        {_id : id},
        {status: "unblock",}
    )
    }
    // if status is set to unblock
    else {
      update = await User.findOneAndUpdate(
        {_id : id},
        {status: "block",}
    )
    }
      if (!update){
        res.status(400).send("User not Exists");
      }
      else{
        res.status(200).send({
          data: "Status updated",
        });
 }
  },

  // ----------------- api to get all users ----------------- 
  async getAllUsers(req, res) {
    let user = req.query;
    let data = await User.find({
      startedBy: user.startedBy,
    });
    res.status(200).send({
      data: data,
    });
  },

  // ----------------- api to get particular users by matching id ----------------- 
  async getOneUser(req, res) {
    let id = req.params.id;
    let data = await User.find({
      _id: id,
    });
    res.status(200).send({
      data: data,
    });
  },

  // ----------------- api to delete user ----------------- 
  async deleteUser(req, res) {
    let userId = req.params.id;
    await User.deleteOne(
      {
        _id: userId,
      },
      (err, suc) => {
        if (err) {
          res.status(404).send("user not found");
        } else {
          if (suc.deletedCount == 1) {
            res.send("deleted");
          } else res.status(404).send("user not found");
        }
      }
    );
  },


  async login(req, res) {
    const { error } = loginValidationSchema.validate(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
    } else {
      const userData = req.body;
      const user = new User(userData);
      const foundUser = await User.findOne({ email: userData.email });

      if (!foundUser) {
        res.status(400).send("Email or Password is wrong");
      }
      else if(foundUser.status === 'block'){
        res.status(400).send("Your account have been blocked by admin. Contact company for detailed information");
      }
      else if(foundUser.verified === false){
        res.status(400).send("Verification is pending. Contact company for information");
      } else {
        const validPass = await bcrypt.compare(
          user.password,
          foundUser.password
        );
        if (!validPass) {
          res.status(400).send("Email or Password is wrong");
        } else {
          const token = jwt.sign(
            { _id: foundUser._id },
            process.env.TOKEN_SECRET
          );
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
  },
};

export default userController;

// router.post("/login", async (req, res) => {
// });
