var express = require("express");
var PORT = process.env.PORT || 3000;
var bodyParser = require("body-parser");
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var databaseUri = "mongodb://127.0.0.1/mongoHeadlines";
var cheerio = require('cheerio');
var request = require('request');

var db = require("./models");

//initialize express
var app = express();
var router = express.Router()

//set up body parser for requests
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

//use static public files
app.use(express.static(__dirname + "/public"));
app.use(express.static("."));

//initialize express-handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//import routes
require("./routes/routes.js")(app);

//connect locally or to process.env in deployment
if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
} else {
	mongoose.connect(databaseUri);
}

//initialize mongoose mongoDB connection
//mongoose.connect(databaseUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected to mongo db")
});

app.listen(PORT, function() {
	console.log('App listening on port ' + PORT);
});