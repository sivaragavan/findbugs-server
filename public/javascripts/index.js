function onLoad() {

	$("#createProject").click(function() {
		$.ajax({
			url : "/project/create?projectName=" + $('#projectName').val() + "&emailId=" + $('#emailId').val()
		}).done(function (data) {
			console.log("Create Response", data);
			var Json = eval("(" + data + ")");
			window.location.href = "/dashboard?projectId=" + Json.id;
		});
	});
}

myPlayerArray = {};
myTextArray = {};
stopped = true;
paused = false;
playLength = 0;
progSize = 0.0;
comment = false;
transcript = false;

function pageSetup() {
	if (!transcript) {
		$('#library').css("height", ($(window).height() - 110) + 'px');
	} else {
		$('#library').css("height", ($(window).height() - 260) + 'px');
	}
}

function clearComment() {
	comment = false;
	if (!paused) {
		$('#comment').html(
				'<span id="commentHead">Reading</span>'
						+ myPlayerArray["text_" + current]);
	} else {
		$('#comment').html(
				'<span id="commentHead">Paused</span>'
						+ myPlayerArray["text_" + current]);
	}
}

var onEvent = function(event) {
	var eventJson = eval("(" + event + ")");
	console.log(eventJson);

	switch (eventJson.event_name) {

	case "parse_result":
		initPlayer(eventJson);
		break;

	case "parse_complete":
		initPlayer(eventJson);
		// for (var i = 0; i < eventJson.totalLength; i++) {
		// insertAudio(i, eventJson.id);
		// }
		// play(0);
		break;

	case "audio_ready":
		insertAudio(eventJson.index, eventJson.id, eventJson.text);
		if (stopped && !paused) {
			play(eventJson.index);
		}
		break;
	}
}
function insertAudio(i, id, text) {

	$("#players").append(
			'<div id="jquery_jplayer_' + i + '" class="jp-jplayer"></div>');

	$("#jquery_jplayer_" + i).jPlayer({
		swfPath : "http://www.jplayer.org/2.1.0/js",
		solution : 'html, flash',
		supplied : "wav"
	});

	$("#jquery_jplayer_" + i).jPlayer("setMedia", {
		wav : "https://s3.amazonaws.com/com.codefs/" + id + "/" + i + ".wav"
	});

	myPlayerArray["text_" + i] = text;

	myPlayerArray["jquery_jplayer_" + i] = i;

	$("#jquery_jplayer_" + i).bind(
			$.jPlayer.event.ended,
			function(event) {
				if ($("#jquery_jplayer_"
						+ (myPlayerArray[$(this).attr('id')] + 1)).length > 0
						&& !paused) {
					play(myPlayerArray[$(this).attr('id')] + 1);
				} else {
					stop();
				}
			});

	$("#progressBar").progressbar("value", i + 1);
}

function initPlayer(eventJson) {
	$("#details").html(eventJson.text);
	$('#newsheadline').html(eventJson.title);

	$("#progressBar").progressbar({
		value : 0,
		max : eventJson.totalLength
	});

	playLength = eventJson.totalLength;
	progSize = ($(window).width() - 110) / playLength;

	for ( var i = 0; i < eventJson.media.length; ++i) {
		if (eventJson.media[i].hasOwnProperty('primary')) {
			$("#images").html('<img src="' + eventJson.media[i].link + '">');
		}
	}

}

function play(playerId) {
	stopped = false;
	paused = false;
	current = playerId;
	$("#jquery_jplayer_" + current).jPlayer("play");
	$("#playimg").attr("src", "/assets/images/pause.png");
	$('#prog').css("left", 50 + (progSize * (playerId)));
	if (!comment) {
		clearComment();
	}
}

function stop() {
	stopped = true;
}

function pause() {
	$("#jquery_jplayer_" + current).jPlayer("stop");
	$("#playimg").attr("src", "/assets/images/play.png");
	paused = true;
	if (!comment) {
		clearComment();
	}
}