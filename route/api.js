const express = require("express");
const router = express.Router();
const { default: mongoose } = require("mongoose");
const Restaurant = require("../models/restaurant");
const { body, validationResult, check } = require("express-validator");
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
//add new restaurant
router.route("/restaurant").post(validateRestaurantData, (req, res) => {
  res.send("data is validated");
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
router.route("/restaurant/:id").delete(async function (req, res) {
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
router
  .route("/restaurant/:id")
  .put(validateRestaurantData, async function (req, res) {
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

module.exports = router;
