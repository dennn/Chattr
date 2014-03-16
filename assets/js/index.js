$(function() {

	/*
	 * Wow.js - Scroll animation library
	 */ 
 	new WOW().init();

	/* Scroll down button */
	 $("#down-button").click(function() {
	 	$('html, body').animate({
	    	scrollTop: $(".contacts").offset().top
 	   }, 700);
	});

	 $("#email-signup").submit(function() {
	 	event.preventDefault();
	 	console.log("CALLED");
	 	var email = $('#email').val();
	 	if (email == '' || IsEmail(email) == false) {
	 		// Show error
	 		$("#signup-text").showError();
	 	} else {
	 		//Fade out contact form and fade in success
	 		$("#signup-text").showSuccess();
	 		$(this).fadeOut();
	 	}
	 });

	 $.fn.showSuccess = function() {
	 	$(this).fadeOut(function() {
	 		$(this).text("Thanks, we'll be in touch shortly!");
	 		$(this).css({
	 			"color": "rgb(255, 255, 255)",
	 			"margin-top": "8%"
	 		});
	 	}).fadeIn();

	 	return this;
	 }

	 $.fn.showError = function() {
	 	$(this).fadeOut(function() {
	 		$(this).text("Sorry, that email is invalid");
	 		$(this).css('color', 'rgb(200, 44, 40)');
	 	}).fadeIn();

	 	return this;
	 }

	 $.fn.hideError = function() {
	 	$(this).fadeOut(function() {
	 		$(this).text("Signup to be notified when we launch.");
	 		$(this).css('color', 'rgb(255, 255, 255)');
	 	}).fadeIn();
	 }

	 function IsEmail(email) {
  	 	var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  		return regex.test(email);
  	}
});