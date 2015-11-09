function syncItem(obj, listId, listTitle, id, keyOrName) {

	var row = obj.parentNode.parentNode;
	
	$("body").css("cursor", "wait");
	$(obj).css("cursor", "wait");
	
	var alertBox = $("#listError");
	
	alertBox.hide();
	alertBox.addClass("hidden");

	$
	.post("/api/sync/"+keyFrom+"/"+ keyTo+"/" + listTitle.toLowerCase(), {
		"id": id,
		"keyOrName": keyOrName
	})
	.done(function(newItem, b, http) {
		
		if (http.status == 201) {
	
			//add success color to row
			$(row).removeClass("info").removeClass("warning").removeClass("danger").addClass("success");
	
			//add icon and text to last column
			$(row).find("td:last-child").find("span").removeClass("glyphicon-plus").removeClass("glyphicon-remove").removeClass("text-danger").removeClass("text-info").addClass("glyphicon-ok").addClass("text-success");
	
			//add the new id to second last column
			$(row).find("td:nth-last-child(2)").append(newItem.link);
	
			var addCount = parseInt($("#addCount_" + listId).text());
			addCount--;
			$("#addCount_" + listId).text(addCount);
	
			$(obj).css("cursor", "default");
	
		} else if (http.status == 204) {
		
			$(row).remove();
	
			var removeCount = parseInt($("#removeCount_" + listId).text());
			removeCount--;
			$("#removeCount_" + listId).text(removeCount);
	
		}
	
	})
	.fail(function(resp) {
	
		var message = "Could not sync \"" + keyOrName + "\" onto " + keyTo;

        var error;

		if (resp.responseJSON && resp.responseJSON.errors && Array.isArray(resp.responseJSON.errors)) {
			
			for (error in resp.responseJSON.errors) {
				if (resp.responseJSON.errors.hasOwnProperty(error))
					message += " " + resp.responseJSON.errors[error];
			}
	
			alertBox.text(message);
		
		}else if (resp.responseJSON && resp.responseJSON.errorMessages && Array.isArray(resp.responseJSON.errorMessages)) {
			
			for (error in resp.responseJSON.errorMessages) {
				if (resp.responseJSON.errorMessages.hasOwnProperty(error))
					message += " " + resp.responseJSON.errorMessages[error];
			}
	
			alertBox.text(message);
	
		}else{
	
			alertBox.text(message + " " + resp.responseText);
		}
	
		alertBox.show();
		alertBox.removeClass("hidden");
	
		$.smoothScroll({
			offset: -200,
			scrollTarget: "#listError"
		});
	
	})
	.always(function() {
	
		$("body").css("cursor", "default");
	
	});

};