var mongoose = require('mongoose');
var Schema = mongoose.Schema;
let resSchema= new Schema({
    address:{
        building:String,
        coord:[Number],
        street:String,
        zipcode:String,

    },
    borough:String,
    cuisine:String,
    grades:[{
      date: Date,
      grade: String,
      score: Number
    }],
    name:String,
});
module.exports = mongoose.model('Restaurant', resSchema,"restaurants");





