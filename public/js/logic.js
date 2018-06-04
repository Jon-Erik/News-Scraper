function displayUnsavedArticles(articles) {
	for (i=0; i < articles.length; i++) {
			var articlesDiv = $(".articles");

			var newArticleDiv = $("<div class='card'>");
			articlesDiv.append(newArticleDiv);

			var cardBody = $("<div class='card-body'>");
			newArticleDiv.append(cardBody);

			var headlineURL = $("<a>");
			headlineURL.attr("href", articles[i].URL);
			cardBody.append(headlineURL);

			var headlineText = $("<h5 class='card-title'>");
			headlineText.text(articles[i].headline);
			headlineURL.append(headlineText);

			// var headline = $("<h5 class='card-title'>");
			// headline.text(articles[i].headline);
			// cardBody.append(headline);

			var summary = $("<p class='card-text'>");
			summary.text(articles[i].summary);
			cardBody.append(summary);

			var URLButton = $("<a class='btn'>");
			URLButton.text("Save Article")
			cardBody.append(URLButton);			
		}
}

$("#scrape-news").on("click", function() {

	//console.log("test")
	$.ajax({
		url: "/scrape",
		method: "GET"
	}).then(function(result) {		
			console.log(result);
			location.reload();
		});
});