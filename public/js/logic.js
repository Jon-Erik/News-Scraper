$("#scrape-news").on("click", function() {

	//console.log("test")
	$.ajax({
		url: "/scrape",
		method: "GET"
	}).then(function(result) {		
			console.log(result);
			var addedArticles = result.added_articles;
			if (addedArticles === 0) {
				$(".scrape-modal-title").text("Sorry! No new articles...");
				$(".scrape-modal-body").text("No new articles were found. Try again another time!")
				$('#scrape-modal').modal()
			} else {
				$(".scrape-modal-title").text(addedArticles + " new articles!");
				$(".scrape-modal-body").text("New articles were found. Close this message to view!")
				$('#scrape-modal').modal()
			}
		});
});

$(".dismiss-scraper-modal").on("click", function() {
	location.reload();
});

$(".save-btn").on("click", function() {
	var articleId = $(this).data("id");
	
	$.ajax("/save/" + articleId, {
		type: "PUT"
	}).then(function(result) {
		console.log(result);
	})
});

$(".delete-saved").on("click", function() {
	var articleId = $(this).data("id");

	$.ajax("/delete/" + articleId, {
		type: "PUT"
	}).then(function(result) {
		location.reload();
	})
})

// $(".view-notes").on("click", function() {

// 	var articleId = $(this).data("id");

// 	$.ajax({
// 		method: "GET",
// 		url: "/notes/" + articleId
// 	}).then(function(result) {
// 		console.log(result);
// 		$("#notes-modal").modal();
// 	});
// });

$(".view-notes").on("click", function() {
	var articleId = $(this).data("id");

	$.ajax({
		method: "GET",
		url: "/notes/" + articleId,
	}).then(function(results) {		
			console.log(results);

			$(".article-notes-title").empty();
			$(".article-notes-title").text(results.headline);

			if(results.notes.length === 0) {
				$(".notes-container").empty();
				$(".notes-container").text("No saved notes.");
			} else {
				$(".notes-container").empty();

				for(i = 0; i < results.notes.length; i++) {
					var newListItem = $("<li>");
					newListItem.html("<p><button class='btn delete-note' data-id='" + 
						results._id + "''>&times;</button> " + 
						results.notes[i].body + "</p>");
					$(".notes-container").append(newListItem);
				}
				//$(".notes-container").text(results.notes[0].body);
			}

			$(".add-note").attr("data-id", results._id)

			$("#notes-modal").modal();
	});
})

$(".add-note").on("click", function() {
	var newNote = $("textarea.new-note-body").val().trim();
	var articleId = $(this).data("id");

	if (newNote.length === 0) {
		alert("Please enter text before submitting a note");
	} else {
		// console.log(newNote);
		// console.log(articleId);
		$.ajax({
			method: "POST",
			url: "/save-note/" + articleId,
			data: {
				note: newNote
			}
		}).then(function(result) {
			console.log(result);
		})
	}
	$("textarea.new-note-body").empty();
});