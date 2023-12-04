var mongoose = require('mongoose');
var Schema = mongoose.Schema;
let gradeSchema=new Schema({
  date: Date,
  grade: String,
  score: Number

})
let resSchema= new Schema({
    address:{
        building:String,
        coord:[Number],
        street:String,
        zipcode:String,

    },
    borough:String,
    cuisine:String,
    grades:[gradeSchema],
    name:String,
});
module.exports = mongoose.model('Restaurant', resSchema,"restaurants");





