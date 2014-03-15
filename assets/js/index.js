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