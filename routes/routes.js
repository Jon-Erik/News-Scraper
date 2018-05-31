var express = require('express')

var app = express();
var router = express.Router();
var cheerio = require("cheerio");
var request = require("request");

// router.get('/', function (req, res) {
//   res.send('Birds home page')
// })

module.exports = function(app) {

	app.get("/", function(req, res) {
	  	res.render("home");
	});

	app.get("/scrape", function(req, res) {
		request("https://www.ncregister.com", function(error, response, html) {
			if (error) {
				console.error(error);
			}

			var $ = cheerio.load(html);
			var results = [];

			$(".caption.lo-cell").each(function(i, element) {
				var headline = $(element).find("a").text();
				var summary = $(element).find(".subtitle.overflow").text();
				var URL = $(element).find("a").attr("href");

				results.push({
					headline: headline,
					summary: summary,
					URL: URL
				})
			})

			console.log(results);
		})

		var message = "Scrape Complete"
		res.render("home", {scrape: message})
	});
}

