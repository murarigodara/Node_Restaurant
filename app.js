var express = require('express');
var mongoose = require('mongoose');
var app= express();
var port = process.env.PORT || 8000;

var exphbs = require('express-handlebars');
app.use(express.static("./public"));

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    runtimeOptions: { allowProtoPropertiesByDefault: true, allowedProtoMethodsByDefault: true },
}
));
app.set('view engine', 'hbs');

app.get('/', function (req, res) {

    res.render('index', { title: "Restaurant" });
});


app.listen(port);
console.log("App listening on port : " + port);