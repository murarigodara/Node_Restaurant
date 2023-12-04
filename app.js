var express = require('express');
var mongoose = require('mongoose');
var app= express();
var port = process.env.PORT || 8000;
// var route=require('./route/');
var bodyParser = require('body-parser');  
var database = require('./config/database');
var exphbs = require('express-handlebars');
var api=require('./route/api');
app.use(express.static("./public"));

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    runtimeOptions: { allowProtoPropertiesByDefault: true, allowedProtoMethodsByDefault: true },
}
));


app.set('view engine', 'hbs');
mongoose.set('strictQuery', true);
mongoose.connect(database.url);
app.use(bodyParser.urlencoded({'extended':'true'})); 
app.use('/api',api);
app.get('/', function (req, res) {

    res.render('index', { title: "Restaurant" });
});


app.listen(port);
console.log("App listening on port : " + port);