//Click event for scraping articles and displaying a modal telling how many
//new articles were scraped
$("#scrape-news").on("click", function() {
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

//event handler for closing scrape modal and reloading page to display new articles 
$(".dismiss-scraper-modal").on("click", function() {
	location.reload();
});

//event handler for saving an article
$(".save-btn").on("click", function() {
	var articleId = $(this).data("id");
	
	$.ajax("/save/" + articleId, {
		type: "PUT"
	}).then(function(result) {
		console.log(result);
		$('#saved-modal').modal()
	});
});

//event handler for marking article as saved
$(".delete-saved").on("click", function() {
	var articleId = $(this).data("id");

	$.ajax("/delete/" + articleId, {
		type: "PUT"
	}).then(function(result) {
		location.reload();
	})
});

//event handler for displaying a modal with an article's notes
$(".view-notes").on("click", function() {
	var articleId = $(this).data("id");

	displayNotes(articleId);
	
	$("#notes-modal").modal();
});

//event handler for adding a note to an article
$(".add-note").on("click", function() {
	var newNote = $("textarea.new-note-body").val().trim();
	var articleId = $(this).attr("articleId");
	console.log(articleId);

	if (newNote.length === 0) {
		alert("Please enter text before submitting a note.");
	} else {
		$.ajax({
			method: "POST",
			url: "/save-note/" + articleId,
			data: {
				note: newNote
			}
		}).then(function(result) {
			//console.log(result);
			displayNotes(articleId);
		})
	}
});

//event handler for deleting a note
$(document).on("click", ".delete-note", function() {
	var noteId = $(this).data("noteid");
	var articleId = $(this).data("articleid");
	
	$.ajax({
			method: "DELETE",
			url: "/delete-note/" + noteId + "/" + articleId,
		}).then(function(result) {
			//console.log(result);
			displayNotes(articleId)
		});
});

//function for displaying notes inside a modal
function displayNotes(articleId) {
	$.ajax({
		method: "GET",
		url: "/notes/" + articleId,
	}).then(function(results) {		
			//console.log(results);

			$(".default-message").hide();
			$(".article-notes-title").empty();
			$("textarea.new-note-body").val("");
			$(".notes-container").empty();
			$(".article-notes-title").text(results.headline);

			if(results.notes.length === 0) {
				$(".default-message").show();
			} else {
				$(".notes-container").empty();

				for(i = 0; i < results.notes.length; i++) {
					var newListItem = $("<li>");
					newListItem.html("<p>" + 
						results.notes[i].body + " <button class='btn delete-note' data-articleid='" + 
						results._id + "'' data-noteid='" + results.notes[i]._id + "'>&times;</button></p>");
					$(".notes-container").append(newListItem);
				}
			}

			$(".add-note").attr("articleId", results._id)
	});
}