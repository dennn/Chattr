$(function() {

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

	if (navigator.getUserMedia) {       
		navigator.getUserMedia({video: true, audio: true}, handleVideo, handleError);
	} else {
		window.location.replace("/no-web-rtc");
	}

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

	var myVideo = $('#myVideo');
	var otherVideo = $('#theirVideo');

	/* Socket setup */
	//var socket = io.connect('http://localhost:8080');
	var socket = io.connect('http://young-springs-6599.herokuapp.com');

	socket.on('connect', onChannelOpened)
		  .on('message', onMessage)
		  .on('filter', onFilter)
		  .on('quitting', onQuitting)
		  .on('joinedRoom', onJoinedRoom)
		  .on('joinedRoomReturn', onJoinedRoomReturn);

	//Get the chat room ID
	var path = window.location.pathname.split('/');
	if (path.length >= 3) {
		if (path[1] === "conversation" && path[2] != null) {
			var roomToJoin = path[2];
		}
	}

	var myFacebookID = $("body").data("user-id");

	socket.emit('joinRoom', { room: roomToJoin, myID: myFacebookID });

	/* WebRTC */
	var ready = false;
	var localStream = null;
	var started = false;
	var peerConnection = null;
	var mediaConstraints = {'mandatory': {
		'OfferToReceiveVideo': true,
		'OfferToReceiveAudio': true}};
	var candidates = [];

	var lastFilterClass = null;
	var otherFilterClass = null;

	function connect() {
		if (!started && localStream && ready) {
			CreatePeerConnection();
			started = true;
			peerConnection.createOffer(function(sessionDescription) {
  				peerConnection.setLocalDescription(sessionDescription, function() {
  					console.log("Sending: SDP");
	    			socket.json.send(sessionDescription);
  				});
			}, error, mediaConstraints);
		}
	}

	var error = function(err) {
    	console.log("Create Answer failed " + JSON.stringify(err));
  	}

	function onChannelOpened(evt) {
		ready = true;
	}

	function CreatePeerConnection() {
		console.log("Creating peer connection");
		RTCPeerConnection = webkitRTCPeerConnection || mozRTCPeerConnection;
		var config = {"iceServers": [{ url: 'stun:stun.l.google.com:19302'}]};

		peerConnection = new RTCPeerConnection(config);
		peerConnection.onicecandidate = function(evt) {
			if (evt.candidate) {
				socket.json.send({type: "candidate",
       			              sdpMLineIndex: evt.candidate.sdpMLineIndex,
                	          sdpMid: evt.candidate.sdpMid,
                    	      candidate: evt.candidate.candidate});
			}
		};

        peerConnection.addStream(localStream);
		peerConnection.addEventListener("addstream", onremoteaddstream, false);
		peerConnection.addEventListener("removestream", onremoteremovestream, false);

		function onremoteaddstream(event) {
			console.log("got remote video");
			otherVideo[0].src = window.URL.createObjectURL(event.stream);
			otherVideo[0].load();

			if (lastFilterClass != null) {
				socket.emit('filter', {filter: lastFilterClass});
			}
		};

		function onremoteremovestream(event) {
			console.log("Stream removed");
			otherVideo[0].src = "";
		};
	}

	function onMessage(evt) {
		if (evt.type === 'offer') {
      		console.log("Received offer...")

        	CreatePeerConnection();
        	started = true;

      		console.log('Setting remote session description...' );
      		peerConnection.setRemoteDescription(new RTCSessionDescription(evt), function() {
      			peerConnection.createAnswer(function(answer) {
      				console.log('Sending answer...');
      				peerConnection.setLocalDescription(answer, function() {
      					socket.json.send(answer);
      				}, error, mediaConstraints)
      			}, error)
      		}, error);
    	} else if (evt.type === 'answer' && started) {
      		console.log('Received answer...');
      		console.log('Setting remote session description...' );
      		peerConnection.setRemoteDescription(new RTCSessionDescription(evt), function() {
      			candidates.forEach(function(candidate) {
      				peerConnection.addIceCandidate(candidate);
      			});
      		}, error);
    	} else if (evt.type === 'candidate' && started) {
      		console.log('Received ICE candidate...');
      		var candidate = new RTCIceCandidate({sdpMLineIndex:evt.sdpMLineIndex, sdpMid:evt.sdpMid, candidate:evt.candidate});
      		if (peerConnection.remoteDescription === null) {
    			candidates.push(candidate);
    		} else {
    			peerConnection.addIceCandidate(candidate);
    		}
    	} else if (evt.type === 'bye' && started) {
      		console.log("Received bye");
    	} 
	}

	/* Local Video playing */

	function handleVideo(stream) {
		myVideo[0].src = window.URL.createObjectURL(stream);
		myVideo[0].load();
		localStream = stream;
		connect();
	}

	function handleError(e) {
		console.log("Cant play video because of" + e)
	}

	window.onunload = function() {
		socket.emit('quitting');
		peerConnection.close();
	}

	function onQuitting() {
		otherVideo[0].src = "";
		$('#friend').fadeOut();
		$('#nobody').fadeIn();
	}

	/* Video filters */

	$("li").click(function() {
		addFilter(this.id);
	});

	function addFilter(filter) {
		if (lastFilterClass != null) {
			myVideo.removeClass(lastFilterClass);
			socket.emit('filter', {filter: 'none'});
		}
		if (lastFilterClass != filter) {
			myVideo.addClass(filter);
			if (started == true) {
				socket.emit('filter', {filter: filter});
			}
			lastFilterClass = filter;
		} else {
			lastFilterClass = null;
		}
	}

	function onFilter(filter) {
		if (otherFilterClass != null || filter === 'none') {
			otherVideo.removeClass(otherFilterClass);
		}
		if (otherFilterClass != filter.filter) {
			otherVideo.addClass(filter.filter);
			otherFilterClass = filter.filter;
		} else {
			otherFilterClass = null;
		}
	}

	/* Conversation link */
	$('#conversation-link').click(function() {
		this.focus();
		this.select();
	});

	/* New user joined */

	function onJoinedRoom(userID) {
		socket.emit('joinedRoom', myFacebookID);
		console.log("User joined the room " + userID);
		$.get(('/user/' + userID) , function(data) {
			$('#name').text(data.name);
			$('#gender').text(data.gender);
			$('#friend-pic').attr("src", data.photo);
			$('#profile-link').attr("href", data.url);
			$('#nobody').fadeOut();
			$('#friend').fadeIn();
		});
	}

	function onJoinedRoomReturn(userID) {
		console.log("User joined the room " + userID);
		$.get(('/user/' + userID) , function(data) {
			$('#name').text(data.name);
			$('#gender').text(data.gender);
			$('#friend-pic').attr("src", data.photo);
			$('#profile-link').attr("href", data.url);
			$('#nobody').fadeOut();
			$('#friend').fadeIn();
		});
	}
});