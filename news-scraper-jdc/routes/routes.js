var cheerio = require("cheerio");
var request = require("request");
var db = require("../models");
// router.get('/', function (req, res) {
//   res.send('Birds home page')
// })

module.exports = function(app) {

	app.get("/", function(req, res) {
			db.Article.find({})
			.then(function(dbArticles){
				//res.send(dbArticles);
				res.render("home", {articles: dbArticles});
			})
	});

	app.get("/saved", function(req, res) {
	  	db.Article.find({saved: true})
			.then(function(dbArticles){
				//res.send(dbArticles);
				res.render("saved-articles", {articles: dbArticles});
			})
	});

	app.get("/scrape", function(req, res) {

		request("https://www.ncregister.com", function(error, response, html) {
			if (error) {
				console.error(error);
				res.send(error);
				return;
			}

			var $ = cheerio.load(html);
			var findPromises = [];
			var addedArticles = 0;
			
			$(".caption.lo-cell").each(function(i, element) {
				var headline = $(element).find("a").text();
				var summary = $(element).find(".subtitle.overflow").text();
				var URL = $(element).find("a").attr("href");

				var result = {
					headline: headline,
					summary: summary,
					URL: "https://www.ncregister.com" + URL
				};

				findPromises.push(
					db.Article.findOne({headline: headline})
						.then(function(existingArticle) {
							if(existingArticle) {
								console.log("article exists already");
								//console.log(existingArticle);
							} else {
								addedArticles++;
								console.log("new article added");
								return db.Article.create(result);
							}
						})
				);
			});
			Promise.all(findPromises)
				.then(function() {
					res.json({added_articles: addedArticles});
				})
				.catch(function(err) {
					console.log(err);
					res.send(err);
				});
		});
	});


	app.put("/save/:id", function(req, res) {
		var articleId = req.params.id;

		db.Article.findOne({_id: articleId, saved: true})
			.then(function(savedArticle) {
				if(savedArticle) {
					console.log("article saved already");
					res.send("article saved already");
				} else {
					db.Article.update({_id: articleId}, {$set: {saved: true}})
						.then(function(result) {
							console.log("article saved")
							res.send("Article saved");
						}).catch(function(err) {
							console.log(err);
							res.send(err);
						});;
				}
			});
	});

	app.put("/delete/:id", function(req, res) {
		var articleId = req.params.id;

		db.Article.find({_id: articleId})
		.then(function(result) {
			var noteIds = []
			for (i = 0; i < result[0].notes.length; i++) {
				noteIds.push(result[0].notes[i]);
			}
			
			db.Note.remove({_id: {$in: noteIds}})
			.then(function(result) {
				
				db.Article.update({_id: articleId}, {$set: {saved: false, notes: []}})
				.then(function(result) {
					console.log("article marked unsaved/deleted, notes and their references deleted")
					res.send("Article marked unsaved/deleted, notes and their references deleted");
				}).catch(function(err) {
					console.log(err);
					res.send(err);
				});
			}).catch(function(err) {
			console.log(err);
			res.send(err);
			});
		}).catch(function(err) {
			console.log(err);
			res.send(err);
		});
	});

	app.get("/notes/:id", function(req, res) {
		var articleId = req.params.id;

		db.Article.findOne({_id: articleId})
			.populate("notes")
			.then(function(dbArticle){
				res.json(dbArticle);
			}).catch(function(err) {
				console.log(err);
				res.send(err);
			});
	});

	app.post("/save-note/:id", function(req, res) {
		var articleId = req.params.id;

		var newNote = req.body;

		console.log(newNote.note);

		db.Note.create({body: newNote.note})
		.then(function(dbNote) {
			return db.Article.findOneAndUpdate({_id: articleId}, {$push: {notes: dbNote._id}}, {new: true}); 
		}).then(function(dbArticle) {
			res.json(dbArticle);
		}).catch(function(err) {
			res.json(err);
		});
	});

	app.delete("/delete-note/:noteid/:articleid", function(req, res) {
		var noteId = req.params.noteid;
		var articleId = req.params.articleid;

		db.Note.remove({_id: noteId})
		.then(function(response) {
			console.log("note deleted")

			db.Article.update({_id: articleId}, {$pull: {notes: noteId}})
			.then(function(response) {
				console.log("note id deleted from article notes");
				 res.send("Note deleted with its reference in article");
			});
		}).catch(function(err) {
			res.send(err);
		});
	});
}