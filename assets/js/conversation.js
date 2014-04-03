$(function() {

	/* Video playing */

	var myVideo = $('#myVideo');

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

	if (navigator.getUserMedia) {       
		navigator.getUserMedia({video: true}, handleVideo, handleError);
	} else {
		window.location.replace("/no-web-rtc.html");
	}

	function handleVideo(stream) {
//		removeNoise();
		myVideo[0].src = window.URL.createObjectURL(stream);
		myVideo[0].load();
	}

	function handleError(e) {
		console.log("Cant play video because of" + e)
	}

	/* Video filters */

	var lastClass = null;

	$("li").on("click", function() {
		if (lastClass != null) {
			myVideo.removeClass(lastClass);
		}
		if (lastClass != this.id) {
			myVideo.addClass(this.id);
			lastClass = this.id;
		} else {
			lastClass = null;
		}
	});

	// Remove the ugly Facebook appended hash
	// <https://github.com/jaredhanson/passport-facebook/issues/12>
	if (window.location.hash && window.location.hash === "#_=_") {
  		if (window.history && history.replaceState) {
    		window.history.replaceState("", document.title, window.location.pathname);
  		} else {
    		// Prevent scrolling by storing the page's current scroll offset
    		var scroll = {
      			top: document.body.scrollTop,
      			left: document.body.scrollLeft
    		};
    		window.location.hash = "";
   		 	// Restore the scroll offset, should be flicker free
    		document.body.scrollTop = scroll.top;
    		document.body.scrollLeft = scroll.left;
  		}
	}
});