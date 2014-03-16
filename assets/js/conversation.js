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


				/* Generate white noise 

			var backgroundsToGenerate = 20;
			var updateInterval = 40;

			var canvas = document.getElementById("videoCanvas");
			var context = canvas.getContext("2d");

			var backgrounds = [];
			var cycle = 0;
			var timer;

			generateNoise();

			function generateNoise() {
				var w = canvas.width;
				var h = canvas.height;

				for (id = 0; id < backgroundsToGenerate; id++) {
					for (i = 0; i < w; i++) {
						for (j = 0; j < h; j++) {
							var num = Math.floor(Math.random() * 255);
							context.fillStyle = "rgb(" + num + "," + num + "," + num + ")";
							context.fillRect(i, j, 1, 1);
						}
					}
					var dataURL = canvas.toDataURL();
					backgrounds.push(dataURL);
				}
				timer = setInterval(useNoise, updateInterval);
			}

			function removeNoise() {
				clearInterval(timer);
				myVideo.css({
					"background": ""
				});
			}

			function replaceBackground(dataURL) {
				myVideo.css({
					"background": "url(" + dataURL + ")"
				});
			}

			function useNoise() {
				if (cycle > backgrounds.length - 1) {
					cycle = 0;
				}

				replaceBackground(backgrounds[cycle]);
				cycle++;
			}

			*/
});