import router from "../routes/main.route";
import User from "../models/user.model";
import shifts from "../models/shifts.model";
import { json } from "express";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//VALIDATION
const Joi = require("@hapi/joi");

const registerValidationSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(3).required(),
  userType: Joi.string().required(),
  verified: Joi.boolean().required(),
  image: Joi.string(),
  address: Joi.string(),
  // dateJoined: Joi.string().required(),
  // active: Joi.boolean().required(),
  status: Joi.string().required(),
  isAdmin: Joi.boolean(),
});


//validation for update data
const updateValidationSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  userType: Joi.string().required(),
  image: Joi.string(),
  address: Joi.string().min(5).required(),
  password: Joi.string().min(8).required(),
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
        var today = new Date(),
        date =  today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
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
              image: registeredUser.image,
              address: registeredUser.address,
              // active: registeredUser.active,
              password: registeredUser.password,
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
      // console.log("image ==> ",updatedUser.image)
      
      // const url = await uploadImage(updatedUser.image);
      // updatedUser.image = url;
      // console.log("public id ==> ",url, "updated user", updatedUser)
      
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
      let id = req.params.id;
      let data = await User.find({
        _id: id,
      });
  
      const status = data[0].verified;
      let update;

      if (status){
        // set verified false
        update = await User.findOneAndUpdate(
          {_id : id},
          {verified: false}
      )
      }else{
        // set verified false
        update = await User.findOneAndUpdate(
          {_id : id},
          {verified: true}
      )
      }
      if (!update){
        res.status(400).send("User not Exists");
      }
      else{
        res.status(200).send({
          data: "data updated successfully",
        });
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
      data: data.reverse(),
    });
  },

 // ----------------- api to find user status (active) ----------------- 
 async getUserStatus(req, res) {
  let user = req.query;
  let users = await User.find({
    startedBy: user.startedBy,
  });
  let shift = await shifts.find({
    status: "active",
  });
  let userWithStatus = []
  let obj, active;
  users.map((val, ind)=>{
    active = false;
    console.log("..............................")
    shift.map((val2, ind2)=>{
      // console.log("val....", val._id," val2.........", val2.userID)
      if(val._id.toString()===val2.userID.toString()){
          active = true;
      }
    })
    if(val.image){
      obj = {
        name: val.firstName+" "+val.lastName,
        image: val.image,
        active: active
      }
    }else{
      obj = {
        name: val.firstName+" "+val.lastName,
        active: active
      }
    }
    userWithStatus.push(obj)
    
  })
  res.status(200).send({
    data: userWithStatus,
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

   // ----------------- api to get user by matching name ----------------- 
   async getUserByName(req, res) {
    let body = req.params.name;
    let data = await User.find({
    })
    const checkName = (data) => {
      let namee = data.firstName + " " + data.lastName;
      if(namee.toUpperCase().includes(body.toUpperCase())){
        return true;
      }
      else{
        return false;
      }
    }
    
    let filterData = data.filter(checkName);
    
    res.status(200).send({
      data: filterData.reverse(),
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

  // ----------------- api to get number of admin and employees ----------------- 
  async getNumberOfUsers(req, res) {
    let employees = await User.find({
      userType: "Site Worker",
    });
    let admin = await User.find({
      userType: "Admin",
    });

    let verified = await User.find({
      verified: false,
    });

    let allUsers = await User.find({
      
    });
    let data = {
      employees : employees.length,
      admin : admin.length,
      allUsers : allUsers.length,
      unverified: verified.length,
    }
      res.status(200).send({
        data: data,
      });
    

  },
};

export default userController;

// router.post("/login", async (req, res) => {
// });
