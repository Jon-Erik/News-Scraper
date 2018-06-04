// var express = require('express')

// var app = express();
// var router = express.Router();
var cheerio = require("cheerio");
var request = require("request");
var db = require("../models");
// router.get('/', function (req, res) {
//   res.send('Birds home page')
// })

module.exports = function(app) {

	app.get("/", function(req, res) {
			db.Article.find({saved: false})
			.then(function(dbArticles){
				//res.send(dbArticles);
				res.render("home", {articles: dbArticles});
			})

	  	
	});

	app.get("/saved", function(req, res) {
	  	res.render("saved-articles");
	});

	app.get("/scrape", function(req, res) {

		request("https://www.ncregister.com", function(error, response, html) {
			if (error) {
				console.error(error);
			}

			var $ = cheerio.load(html);
			
			var articleLinks = [];
			
			$(".caption.lo-cell").each(function(i, element) {
				var headline = $(element).find("a").text();
				var summary = $(element).find(".subtitle.overflow").text();
				var URL = $(element).find("a").attr("href");

				var result = {
					headline: headline,
					summary: summary,
					URL: "https://www.ncregister.com" + URL
				}

				articleLinks.push(result)

				var addedArticles = 0;

				db.Article.findOne({headline: headline})
				.then(function(existingArticle) {
					if(existingArticle) {
						console.log("article exists already");
						//console.log(existingArticle);
					} else {
						db.Article.create(result)
						.then(function(dbArticle) {
								addedArticles++;
								//console.log(dbArticle);
								console.log("new article added");
							}).catch(function(err) {
								console.log(err);
								res.send(err);
							});
						}
					}).catch(function(err) {
						console.log(err);
						res.send(err);
					});
				});
			});
		res.send("Scrape Complete." + addedArticles + " added articles");
	});

};