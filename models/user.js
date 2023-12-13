var mongoose = require('mongoose');
var Schema = mongoose.Schema;
let userSchema= new Schema({
    email:String,
    password:String
});
module.exports = mongoose.model('User',userSchema);





