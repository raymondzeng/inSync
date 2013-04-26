WEB_SOCKET_SWF_LOCATION = "/WebSocketMain.swf";
WEB_SOCKET_DEBUG = true;
PATH = '/static/uploads/';

var button;
var userInfo;
var fb_name, fb_id;
var logged_in;

function showView(desired){
    if(desired == 'login'){
	$('#nickname').hide();
	$('#audio').hide();
	$('#fb-postlog').css('display','block');
    }
    else if(desired == 'nickname'){
	$('#fb-postlog').hide();
	$('#audio').hide();
	$('#nickname').css('display','block');
    }
    else{	
	$('#nickname').hide();
	$('#fb-postlog').hide();
	$('#audio').css('display','block');
    }
}
//fb stuff
window.fbAsyncInit = function() {
    FB.init({ appId: '378043245648833', 
	      status: true, 
	      cookie: true,
	      xfbml: true,
	      oauth: true});
    
    function updateButton(response) {
	button = document.getElementById('login_button');
	userInfo = document.getElementById('user-info');

	if (response.authResponse) {
	    //user is already logged in and connected
	    FB.api('/me', function(info) {
		login(response, info);
	    });
	} else {
	    //user is not connected to your app or logged out
	    button.onclick = function() {
		FB.login(function(response) {
		    if (response.authResponse) {
			FB.api('/me', function(info) {
			    login(response, info);
			});	   
		    } else {
			//user cancelled login or did not grant authoriz.
		    }
		}, {scope:'email,user_about_me'});  	
	    }
	}
    }
    
    // run once with current status and whenever the status changes
    FB.getLoginStatus(updateButton);
    FB.Event.subscribe('auth.statusChange', updateButton);	
};
$(document).ready(function() {
    (function() {
	var e = document.createElement('script'); e.async = true;
	e.src = 'http://connect.facebook.net/en_US/all.js';
	document.getElementById('fb-root').appendChild(e);
    }());
});

function login(response, info){
    fb_name = info.name;
    fb_id = info.id;
    if (response.authResponse) {
	var accessToken = response.authResponse.accessToken;
	showView('nickname');
	$('#user-stuff').html('<img class="pull-right" id="user-pic" src=""><p class="pull-right" id="user-name"></p>');
	$('#user-pic').attr('src','https://graph.facebook.com/' + info.id + '/picture');
	$('#user-name').html(info.name);
	$('#user-pic').hover(
	    function() {
		var $this = $('#user-name'); // caching $(this)
		$this.data('initialText', $this.text());
		$this.css('color','white');
		$this.text("Logout?");
	    },
	    function() {
		var $this = $('#user-name'); // caching $(this)
		$this.css('color','gray');
		$this.text($this.data('initialText'));
	    });
    }
    button = document.getElementById('user-pic');
    button.onclick = function() {
	FB.logout(function(response) {
	    logout(response);
	});
    };
}

function logout(response){
    showView('login');
    $('#user-stuff').html('');
}

// socket.io specific code
var socket = io.connect();
var room = '';

socket.on('connect', function () {
    console.log('connected');
});

socket.on('reconnect', function () {
    console.log('Reconnected to the server');
});

socket.on('reconnecting', function () {
    console.log('Attempting to re-connect to the server');
});

socket.on('error', function (e) {
    console.log(e ? e : 'An unknown error occured');
});

socket.on('playpause', function(){
    ap = document.getElementById('audioplayer');
    if(ap.paused){
	ap.play();
    }   
    else
	ap.pause();
});

socket.on('skip', function(){
    ap = document.getElementById('audioplayer');
    ap.currentTime += 10;
});

socket.on('reset', function(){
    ap = document.getElementById('audioplayer');
    ap.currentTime = 0;
});

socket.on('updateTime', function(time){
    ap = document.getElementById('audioplayer');
    ap.currentTime = time;
    setTimeout(function() {
	ap.addEventListener('seeked', timeChanged);
    }, 10);
});

function toggle(){
    socket.emit('toggle play pause', room);
}
function skipTen(){
    socket.emit('skip seven', room);
}
function resetTime(){
    socket.emit('reset', room);
}
function timeChanged(){
    console.log('time');
    ap = document.getElementById('audioplayer');
    time = ap.currentTime;
    socket.emit('time changed', room, time);
    ap.removeEventListener('seeked',arguments.callee,false);
}

function submit(){
    socket.emit('nickname', 
		fb_name, $('#room').val(), 
		function (set) {
		    if (!set) {
			room = $('#room').val();
			$('#userID').html('User: ' + fb_name);
			$('#roomID').html('Room: ' + room);
			showView('audio');
		    }
		    //$('#nickname-err').css('visibility', 'visible');
		});
    return false;
}

function playmysong(){
    $('#audiosource').attr('src',PATH + 'mysong.mp3');
    ap = document.getElementById('audioplayer');
    ap.load();
}

$(function(){
    $('#room').keydown(function(){
	if(event.keyCode == 13)
	    submit();
    });
});

$(document).ready(function(){
    ap = document.getElementById('audioplayer');
    ap.addEventListener('seeked', timeChanged);
    $('.accordion-toggle').hover(
	function(){
	    $(this).css('color','blue');
	}, function(){
	    $(this).css('color','#DDD');
	});
});
		 