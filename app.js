var express = require('express');
var mongoose = require('mongoose');
var app= express();
var port = process.env.PORT || 8000;
// var route=require('./route/');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const  Restaurant=require('./models/restaurant')
// Define GraphQL schema
const schema = buildSchema(`
  type Address {
    building: String
    coord: [Float]
    street: String
    zipcode: String
  }

  type Grade {
    date: String
    grade: String
    score: Int
  }

  type Restaurant {
    _id: ID
    address: Address
    borough: String
    cuisine: String
    grades: [Grade]
    name: String
    restaurant_id: String
  }

  type Query {
    restaurant(id: ID!): Restaurant
    restaurants: [Restaurant]
    restaurantByName(name: String!): [Restaurant]
  }
`);
const root = {
    restaurant: async ({ id }) => await Restaurant.findById(id),
    restaurants: async () => await Restaurant.find(),
    restaurantByName: async ({ name }) => await Restaurant.find({ name: new RegExp(name, 'i') }),
  };
require('dotenv').config();
var bodyParser = require('body-parser');  
var database = require('./config/database');
var exphbs = require('express-handlebars');
var api=require('./route/api');
app.use(express.static("./public"));
app.use(
    '/graphql',
    graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true, // Set to true to enable the GraphiQL UI for testing
    })
  );
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    runtimeOptions: { allowProtoPropertiesByDefault: true, allowedProtoMethodsByDefault: true },
}
));


app.set('view engine', 'hbs');
mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE_URL);
app.use(bodyParser.urlencoded({'extended':'true'})); 
app.use('/api',api);
app.get('/', function (req, res) {

    res.render('index', { title: "Restaurant" });
});


app.listen(port);
console.log("App listening on port : " + port);