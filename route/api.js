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

  // Grades Validation
  // check("grades").isArray().withMessage("Grades must be an array"),
  // body('grades').isArray({ min: 1 }).withMessage('At least one grade is required'),
  // body("grades.*.date").isDate().withMessage("Invalid date format"),
  // body("grades.*.grade").isString().withMessage("Grade must be a string"),
  // body("grades.*.score").isNumeric().withMessage("Score must be a number"),
  body("grades").custom(parseGrades),
  body("grades.*.date")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid date format"),
  body("grades.*.grade")
    .optional()
    .isString()
    .withMessage("Grade must be a string"),
  body("grades.*.score")
    .optional()
    .isNumeric()
    .withMessage("Score must be a number"),
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
//fetch restaurant
router.route("/restaurant/:id").get(async function (req, res) {
  try {
    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.send("<h1>Invalid Id : " + id + "</h1>");
    let data = await Restaurant.find({ _id: id }).exec();
    if (data.length > 0) return res.send(data);
    return res.send("<h1>Invalid Id : " + id + "</h1>");
  } catch (err) {
    return res.send("Error" + err);
  }
});
//delete restaurant
router.route("/restaurant").delete(function (req, res) {});
//update restaurant
router.route("/restaurant").put(function (req, res) {});

module.exports = router;
