const express = require("express");
const router = express.Router();
const { default: mongoose } = require("mongoose");
const Restaurant=require('../models/restaurant')
const { body, validationResult,check } = require('express-validator');
// router.use(express.json());
const parseGrades = (value) => {
    try {
      const jsonArray = JSON.parse(value);
      console.log(jsonArray)
      if (!Array.isArray(jsonArray)) {
        throw new Error('Invalid JSON array');
      }
      return jsonArray;
    } catch (error) {
      throw new Error(`Error parsing 'grades': ${error.message}`);
    }
  };
  

const validateRestaurantData = [ 
    body('address.building').notEmpty().withMessage('Building is required'),
  body('address.coord').isArray().withMessage('Coord must be an array'),
  body('address.street').notEmpty().withMessage('Street is required'),
  body('address.zipcode').notEmpty().withMessage('Zipcode is required'),

  // Borough, Cuisine, and Name Validation
  body('borough').notEmpty().withMessage('Borough is required'),
  body('cuisine').notEmpty().withMessage('Cuisine is required'),
  body('name').notEmpty().withMessage('Name is required'),

  // Grades Validation
  check('grades').custom(parseGrades).withMessage('Grades must be an array'),
  body('grades.*.date').isDate().withMessage('Invalid date format'),
  body('grades.*.grade').isString().withMessage('Grade must be a string'),
  body('grades.*.score').isNumeric().withMessage('Score must be a number')
, (req,res,next) => {
      // Run validation
      let  errors = validationResult(req);
    
      if (!errors.isEmpty()) {
        // If there are validation errors, respond with a 400 status and the error messages
        return res.status(400).json({ errors: errors.array() });
      }
      // If validation passes, continue to the next middleware or route handler
      next();
  }];
//add new restaurant
router.route('/restaurant').post(
     validateRestaurantData, (req,res)=>{
    
    res.send("data is validated");
});
//fetch restaurant
router.route('/restaurant').get(async function(req,res){

    let data=await Restaurant.find({}).exec();
    res.send(data);
});
//delete restaurant
router.route('/restaurant').delete(function(req,res){

});
//update restaurant
router.route('/restaurant').put(function(req,res){

});

module.exports = router;