const express = require("express");
const jwt = require('jsonwebtoken');
const router = express.Router();
const { default: mongoose } = require("mongoose");
const Restaurant = require("../models/restaurant");
const User=require("../models/user");
const { body, validationResult, check } = require("express-validator");
const restaurant = require("../models/restaurant");
function containsOnlyDigits(str) {
  const digitsRegex = /^\d+$/;
  return digitsRegex.test(str);
}
let bcrypt=require('bcryptjs');
const { graphql } = require("graphql");
// router.use(express.json());
const parseGrades = (value) => {
  try {
    const jsonArray = JSON.parse(value);
    if (!Array.isArray(jsonArray)) {
      throw new Error("Invalid Grades json Array");
    }
    // console.log(typeof(jsonArray));
    // let jsonArr=Array.from(jsonArray);
    jsonArray.forEach((item) => {
      let keyArray = Object.keys(item);
      if (
        keyArray.length != 3 ||
        keyArray[0] != "date" ||
        keyArray[1] != "grade" ||
        keyArray[2] != "score"
      )
        throw new Error("Invalid Grades keys check Array");
    });
    return jsonArray;
  } catch (error) {
    throw new Error(error);
  }
};

// Validate Query Params Middleware
const validateGetQueryParams = [

  check("page").isNumeric().toInt().withMessage("Page Parameter should be integer!"),
  check("perPage").isNumeric().toInt().withMessage("PerPage Parameter should be integer!"),
  // check("borough").optional().custom(value => typeof value === 'string').withMessage("Borough Parameter should be string!"),

  (req, res, next) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      // If there are validation errors, respond with a 400 status and the error messages
      return res.status(400).json({ errors: errors.array() });
    }
    // If validation passes, continue to the next middleware or route handler
    next();
  }
]
//
const validateRegisterLogin=[
  body("email").isEmail().withMessage("Email is not valid!"),
  body("password").notEmpty().withMessage("Password is required!"),
  (req,res,next)=>{
    let errors=validationResult(req);
    
    if (!errors.isEmpty()) {
      // If there are validation errors, respond with a 400 status and the error messages
      return res.status(400).json({ errors: errors.array() });
    }
    // If validation passes, continue to the next middleware or route handler
    next();
  }
]
// Validate post form data Middleware
const validateRestaurantData = [
  body("address.building").notEmpty().withMessage("Building is required"),
  body("address.coord").isArray().withMessage("Coord must be an array"),
  body("address.street").notEmpty().withMessage("Street is required"),
  body("address.zipcode").notEmpty().withMessage("Zipcode is required"),

  // Borough, Cuisine, and Name Validation
  body("borough").notEmpty().withMessage("Borough is required"),
  body("cuisine").notEmpty().withMessage("Cuisine is required"),
  body("name").notEmpty().withMessage("Name is required"),
  body("restaurant_id").notEmpty().withMessage("Name is required"),

  body("grades").custom(parseGrades),
  body("grades.*.date").notEmpty().isISO8601().toDate().withMessage("Invalid date format"),
  body("grades.*.grade").notEmpty().isString().withMessage("Grade must be a string"),
  body("grades.*.score").notEmpty().isNumeric().withMessage("Score must be a number"),
  (req, res, next) => {
    // Run validation
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      // If there are validation errors, respond with a 400 status and the error messages
      return res.status(400).json({ errors: errors.array() });
    }
    // If validation passes, continue to the next middleware or route handler
    next();
  },
];
//
const validateSearchData=[
  body("searchBy").notEmpty().withMessage("SearchBy is required"),
  body("searchText").notEmpty().withMessage("SeachText be an array"),
(req, res, next) => {
  // Run validation
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    // If there are validation errors, respond with a 400 status and the error messages
    return res.status(400).json({ errors: errors.array() });
  }
  // If validation passes, continue to the next middleware or route handler
  next();
},]
// validate token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token verification failed' });
    }

   // req.user = decoded; // Attach user information to the request
    next();
  });
};


//add new restaurant
router.route("/restaurant").post(authenticateUser,validateRestaurantData, (req, res) => {
  try{
    let data={
    address: req.body.address,
    borough: req.body.borough,
    cuisine: req.body.cuisine,
    grades: JSON.parse(req.body.grades),
    name: req.body.name,
    restaurant_id: req.body.restaurant_id,
  };
  Restaurant.create(data)
  .then(restaurant=>{
    if(restaurant){
     return  res.send("<h1>Resturanent created successfully!"+restaurant);}
    else{
      return res.send("<h1>Resturanent Is not created!");
    }
  })
}
catch(err){
  return res.send("error :"+err)
}
});

// Pagination to fetch restaurant data  params page & perPage
router.route("/restaurant").get(validateGetQueryParams, async (req, res) => {
  try {

    // Query Params
    let page = req.query.page;
    let perPage = req.query.perPage;

    // Query for optional param, Borough
    let query = {};
    if (req.query.borough) {
      // search with borough for both upper case and lowercase input
      query.borough = { $regex: new RegExp(req.query.borough, 'i')  };
    }

    // Apply Pagination with Total number of data per page
    let restaurantData = await Restaurant.find(query)
      .skip((page - 1) * perPage) // Skip pages for pagination
      .limit(perPage) // Fetch data per page
      .exec();

      if (restaurantData.length > 0) {
        res.json(restaurantData);
      } else {
        res.status(404).json({ error: 'No restaurants found' });
      }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.route("/restaurant/pageform/").get(async (req,res)=>{
    res.render('apiform');
})
//pagination with hbs template
//Pagination to fetch and render using template
router.route("/restaurant/pageapi/").get(validateGetQueryParams, async (req, res) => {
  try {

    // Query Params
    let page = req.query.page;
    let perPage = req.query.perPage;

    // Query for optional param, Borough
    let query = {};
    if (req.query.borough) {
      // search with borough for both upper case and lowercase input
      query.borough = { $regex: new RegExp(req.query.borough, 'i')  };
    }

    // Apply Pagination with Total number of data per page
    let restaurantData = await Restaurant.find(query)
      .skip((page - 1) * perPage) // Skip pages for pagination
      .limit(perPage) // Fetch data per page
      .exec();

      if (restaurantData.length > 0) {
       
        res.render('page',{restaurantData})

      } else {
        res.status(404).json({ error: 'No restaurants found' });
      }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//fetch restaurant record based on id
router.route("/restaurant/:id").get(async function (req, res) {
  try {
    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.send("<h1>Invalid Id : " + id + "</h1>");
    let data = await Restaurant.find({ _id: id }).exec();
    if (data.length > 0) return res.send(data);
    return res.send("<h1> No Record Found : Invlaid Id" + id + "</h1>");
  } catch (err) {
    return res.send("Error" + err);
  }
});
//delete restaurant based on id
router.route("/restaurant/:id").delete(authenticateUser,async function (req, res) {
  try {
    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.send("<h1>Invalid Id : " + id + "</h1>");
    let record = await Restaurant.findOneAndDelete({ _id: id }).exec();
    if (record) {
      return res.send("<h1>Record is deleted Scuccessfully <h1>" + record);
    }
    return res.send("<h1>No Record Deleted  Invlalid Id : " + id + "</h1>");
  } catch (err) {
    return res.send("Error" + err);
  }
});
//update restaurant based on id
router.route("/restaurant/:id")
  .put(authenticateUser,validateRestaurantData, async function (req, res) {
    try {
      let id = req.params.id;
      let updateData = {
        address: req.body.address,
        borough: req.body.borough,
        cuisine: req.body.cuisine,
        grades: JSON.parse(req.body.grades),
        name: req.body.name,
        restaurant_id: req.body.restaurant_id,
      };
      if (!mongoose.Types.ObjectId.isValid(id))
        return res.send("<h1>Invalid Id : " + id + "</h1>");
      let record = await Restaurant.findOneAndUpdate({ _id: id }, updateData, {
        new: true,
      }).exec();
      if (record) {
        return res.send("<h1>Record is Updated Scuccessfully <h1>" + record);
      }
      return res.send("<h1>No Record Updated  Invlalid Id : " + id + "</h1>");
    } catch (err) {
      return res.send("Error Update" + err);
    }
  });

router.route("/restaurant/search/name").get((req,res)=>{
  res.render("nameform");
});
//login route
router.route("/login").post(validateRegisterLogin,async (req,res)=>{
  try{
    
    const { email, password } = req.body;
    
  const user =await  User.find({email:email});
  if (!user.length>0 || !bcrypt.compareSync(password,user[0].password) ) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user.id, username: user.username }, process.env.SECRETKEY, { expiresIn: '1h' });

  res.json({ token });
  }
  catch(err){
    return res.send("erro"+err);
  }
  

})
.get((req,res)=>{
  res.render('loginform');
})

//register post route
router.route("/register").post(validateRegisterLogin,async (req,res)=>{
  try{
    const { email, password,confirmpassword} = req.body;
    if(password!=confirmpassword){
      return res.send("<h1>Password and Confirm Password does not Match");
    }
    let userExist=await User.find({email:email});
   
    if(userExist.length!=0){
      return res.send("<h1>User already exists");
       
    }
    let hashPassword=bcrypt.hashSync(password,10) ;
    let result=await User.create({
      email:email,
      password:hashPassword
    });
    if(result)
    return res.send("<h1>Account is created Login to get token</h1>");
    else
    return res.send("<h1>Account is not created Try later</h1>")
  }
  catch(err){
    res.send(err);
  }
})
//register form route
.get((req,res)=>{
  return res.render('register');
});
//search route
router.route('/search').get( (req,res)=>{
  res.render('search');
})
.post(validateSearchData,async (req,res)=>{
  const {searchText,searchBy}=req.body;
  let query={}
  if (searchBy === 'street') query['address.street'] = { $regex: new RegExp(searchText, 'i') };
  else if (searchBy === 'building') query['address.building'] = { $regex: new RegExp(searchText, 'i') };
  else if (searchBy === 'zipcode') query['address.zipcode'] = { $regex: new RegExp(searchText, 'i') };
    else if (searchBy === 'borough') query['borough'] = { $regex: new RegExp(searchText, 'i') };
    else if (searchBy === 'cuisine') query['cuisine'] = { $regex: new RegExp(searchText, 'i') };
    else if (searchBy === 'name') query['name'] = { $regex: new RegExp(searchText, 'i') };
    else if (searchBy === 'score') {
      console.log(Number.isNaN(parseFloat(searchText)));
      if(!Number.isNaN(parseFloat(searchText)) && Number.isFinite(parseFloat(searchText)) && containsOnlyDigits(searchText))
      query =  {$expr: { $eq: [{ $avg: '$grades.score'},Number(searchText)]}};
    else{
      return res.send("Score should be a number");
    }
   
    } 
    try {
      // Perform the search using the Mongoose model
      
      const restaurantData = await Restaurant.find(query);
      // console.log(restaurantData[0]);
      if(!restaurantData.length>0){
       return res.send("<h1>No record is Found</h1>")
      }
      res.render('page', { restaurantData });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

router.route('/graphql').get((req,res)=>{
    res.render('graphql');
});
module.exports = router;
