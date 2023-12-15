var peerid = "", initStateOK = false;

while(!initStateOK){
	while(peerid == "" || peerid == null)
		peerid = prompt("Enter peer ID");

	//validating peer id
	var req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(req.readyState == 4){
			if(req.status == 200){
				initStateOK = true;
			}
			else{
				alert('An error unknown error occurred. Try again');
				peerid = "";
			}
		}
	}
	req.open('GET', 'https://'+peerid, false); //NOT ASYNCHRONOUS
	try{
		req.send();
	}catch(e){ //looking for 502 in case peer server isn't active
		if(e.toString().startsWith("NetworkError")){
			alert('Peer Offline or Invalid Peer ID. Try Again');
			peerid = "";
		}
	}
}

function jssinit(){
	//starting async process of polling for messages
	setInterval(fetchNewMessage, 500);
}

function fetchNewMessage(){
	//fetching current messages from comm server @ localhost
	var req = new XMLHttpRequest();
	req.onreadystatechange = function(){
		if(req.readyState == 4 && req.status == 200){
			var t = req.responseText.split("\n");
			if(t != "" && t != null && t!= undefined){
				for(var i=0; i<t.length; i++){
					document.getElementById('message_area').innerHTML += "<div id=\"peer_msg_blob\">"+t[i]+"</div>";
				}
			}
		}
	}
	req.open('POST', '/fetch', true);
	req.send();
}

function sendMessage(){
	var msg = document.getElementById('type_message').value.trim();
	document.getElementById('type_message').value = null;
	if(msg == "")
		return;

	//sending post request to peer's server with msg as data
	var m = new XMLHttpRequest();
	m.onreadystatechange = function(){
		if(m.readyState == 4){
			if(m.status == 200){
				document.getElementById('message_area').innerHTML += "<div id=\"my_msg_blob\">"+msg+"</div>";
			}
			else{
				alert("Failed to send message!");
			}
		}
	}
	m.open('POST', 'https://'+peerid, true);
	m.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	m.send("msg="+msg);
}

function checkKey(){
	//checking if 'Enter' key is pressed inside message textarea
	if(window.event.keyCode == 13)
		sendMessage();
}
