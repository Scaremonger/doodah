// NetAdmin Monitor V3.0
// Si Dunford, Aug 2018
//
// In this version, each node manages it's own DIV. Nodes and states have been seperated.

/* CHANGES
V2 - Calls getNodes.php to retrive a list of all nodes (Every 10 minutes)
		Missing nodes are deleted
		New nodes are added
		Existing nodes remain unchanged.
	 Calls getState.php to retriev current status every 30 seconds
		New nodes are added
		Nodes are updated with current status.
		When status is green and autohide is true, then nodes are hidden.
V3 - Integrated LibraNMS Deviec state.

THIS TO DO:
* Implement LibraNMS service states.

*/
// API TOKEN FOR LIBRENMS:
var TOKEN = "33f7e5f5104f41e76afdb1e094f17cdb";

var NodeUpdates = new XMLHttpRequest();
var StateUpdates = new XMLHttpRequest();
var LibreNMS = new XMLHttpRequest();
var lastupdate;

var banner = new Banner();	// Top of screen counters

var Nodes = {};		// List of available nodes
var local;			// Local Netadmin system object (Self)

// ============================================================
function onLoad() {
	// Create objects for the two systems
//	divBlock( "sys_ServerDB", "ServerDB", "grey", "www", "Connecting...", false );
//	divBlock( "sys_NetAdmin", "NetAdmin", "grey", "www", "Connecting...", false );

	// Create an object for this system (Netadmin)
	local = new Node( "NetAdmin", 0,"", 1 );
	
	// Get initial status
//	loadContent();
	requestNodes();
	requestState();
//	updateNodes();
	LibreNMS_API();
	
	// Node Updates Every 10 minutes
	setInterval(function() {
		ScreenSaver();
		requestNodes();			// Retrieve list of nodes
	}, 300 * 1000);

	// Status updates every 30 seconds
	setInterval(function() {
		requestState();			// Retrieve status data for nodes
	}, 30 * 1000);

	// Status updates every 30 seconds
	setInterval(function() {
		LibreNMS_API();			// Retrieve status data for nodes
	}, 30 * 1000);
	
};

// ============================================================
// SCREEN SAVER  (Between 18:00 and 07:00)
function ScreenSaver() {
	var today = new Date().getHours();
	if (today < 7 || today >=18 ) {
		document.getElementById('status').innerHTML = "";
		document.getElementsByTagName('html')[0].className="screensaver";
		return;
	} else {
//		document.body.className="";
		document.getElementsByTagName('html')[0].className="";
	}
}

// ============================================================
function requestNodes() {
	NodeUpdates.open("GET", "http://172.16.14.71/nms/ws/getnodes.php?n=" + Math.random(), true);
	NodeUpdates.send();
}

// ============================================================
function requestState() {
	StateUpdates.open("GET", "http://172.16.14.71/nms/ws/getstate.php?since="+lastupdate+"&n=" + Math.random(), true);
	StateUpdates.send();
}

// ============================================================
function LibreNMS_API() {
//	LibreNMS.open("GET", "http://172.16.6.10/api/v0", true);
//	LibreNMS.open("GET", "http://172.16.6.10/api/v0/devices?order=hostname%20ASC&type=all", true);
	LibreNMS.open("GET", "http://172.16.6.10/api/v0/devices?order=hostname&type=down", true);
	LibreNMS.setRequestHeader( "X-Auth-Token", TOKEN );
	LibreNMS.send();
}

// ============================================================
NodeUpdates.onreadystatechange = function() {
	xhttp = this;
//console.log( "NodeUpdates()" );
//	notify = false;
//	var div = document.getElementById("source");
//console.log( "xhttp.readyState:"+xhttp.readyState );
//console.log( "xhttp.status:"+xhttp.status );
//console.log( "xhttp.responseText:"+xhttp.responseText );

	if (xhttp.readyState == 4) {
		if( xhttp.status == 200 ) {
//			local.setState( 1 );
//			local.message = "Connection Successful<br>";	//+xhttp.responseText;
			local.addMessage( "xhttp", 1, "Connection Successful", 1 );
			
//console.log( "Connection Successful!" );
//console.log( xhttp.responseText );
//rtext = xhttp.responseText;
//console.log( "LEN:"+rtext.length );

			try{
				var response = JSON.parse(xhttp.responseText);
//console.log( "Data length:"+response.length );
			} catch(e) {
//console.log( "Failed to parse JSON response<br>"+e.name+"<br>"+HTMLProtect(xhttp.responseText) );
//				local.setState( 3 );
//				local.message="Failed to parse JSON response<br>"+e.name+"<br>"+HTMLProtect(xhttp.responseText);
				local.addMessage( "json", 3, "Failed to parse JSON response<br>"+e.name );
			}
			// Invalid data classification will be ignored
			if(response && response.response=='nodeupdate') NodeUpdate( response.data );
			
		} else if( xhttp.status==0 ) {
//			local.setState( 3 );
//			local.message = "Resource cannot be initialised.";
			local.addMessage( "resource", 3, "Resource cannot be initialised." );
		} else {
//			local.setState( 3 );
//			local.message = "State:"+xhttp.readyState+"<br>Status:"+xhttp.status+" ("+xhttp.statusText+")<br>"+HTMLProtect(xhttp.responseText);
			local.addMessage( "state", 3, "State:"+xhttp.readyState+"<br>Status:"+xhttp.status+" ("+xhttp.statusText+")<br>"+HTMLProtect(xhttp.responseText) );
		}
	}

	// Update all nodes with current status
	updateNodes();	

// This is only here for debugguing	
//requestState();
};

// ============================================================
StateUpdates.onreadystatechange = function() {
	xhttp = this;
//console.log( "StateUpdates()" );
//	notify = false;
//	var div = document.getElementById("source");
//console.log( "xhttp.readyState:"+xhttp.readyState );
//console.log( "xhttp.status:"+xhttp.status );
//console.log( "xhttp.responseText:"+xhttp.responseText );

	if (xhttp.readyState == 4) {
		if( xhttp.status == 200 ) {
//			local.setState( 1 );
//			local.message = "Connection Successful<br>";	//+xhttp.responseText;
			local.addMessage( "xhttp", 1, "Connection Successful", 1 );
			
//console.log( "Connection Successful!" );
//console.log( xhttp.responseText );
//rtext = xhttp.responseText;
//console.log( "LEN:"+rtext.length );

			try{
				var response = JSON.parse(xhttp.responseText);
//console.log( "Data length:"+response.length );
				if(response.response=='statusupdate' ) {
//console.log( "Received StatusUpdate" );
					StatusUpdate( response.data );
				} else {
//					// Invalid data classification will be ignored
				}
			} catch(e) {
//console.log( "Failed to parse JSON response<br>"+e.name );
//console.log( "Failed to parse JSON response<br>"+e.name+"<br>"+HTMLProtect(xhttp.responseText) );
//				local.setState( 3 );
//				local.message="Failed to parse JSON response<br>"+e.name+"<br>";
//				local.message="Failed to parse JSON response<br>"+e.name+"<br>"+HTMLProtect(xhttp.responseText);
				local.addMessage( "json", 3, "Failed to parse JSON response<br>"+e.name );
			}
			
		} else if( xhttp.status==0 ) {
//			local.setState( 3 );
//			local.message = "Resource cannot be initialised.";
			local.addMessage( "resource",3, "Resource cannot be initialised." );
		} else {
//			local.setState( 3 );
//			local.message = "State:"+xhttp.readyState+"<br>Status:"+xhttp.status+" ("+xhttp.statusText+")<br>"+HTMLProtect(xhttp.responseText);
			local.addMessage( "state", 3, "State:"+xhttp.readyState+"<br>Status:"+xhttp.status+" ("+xhttp.statusText+")<br>"+HTMLProtect(xhttp.responseText) );
		}
	}

	// Update all nodes with current status
	updateNodes();	
};

// ============================================================
LibreNMS.onreadystatechange = function() {
	xhttp = this;
//console.log( "LibreNMS.update()" );
//	notify = false;
//	var div = document.getElementById("source");
//console.log( "xhttp.readyState:"+xhttp.readyState );
//console.log( "xhttp.status:"+xhttp.status );
//console.log( "xhttp.responseText:"+xhttp.responseText );

	if (xhttp.readyState == 4) {
		if( xhttp.status == 200 ) {
//			local.setState( 1 );
//			local.message = "Connection Successful<br>";	//+xhttp.responseText;
			local.addMessage( "xhttp", 1, "Connection Successful", 1 );
//console.log( "xhttp.responseText:"+xhttp.responseText );

//console.log( "Connection Successful!" );
//console.log( xhttp.responseText );
//rtext = xhttp.responseText;
//console.log( "LEN:"+rtext.length );

			try{
				var response = JSON.parse(xhttp.responseText);
//console.log( "Data length:"+response.length );
//console.log( "Received StatusUpdate" );
				LibreNMS_Update( response.devices );
			} catch(e) {
console.log( "Failed to parse JSON response\n"+e+"\n" );
//console.log( "Failed to parse JSON response<br>"+e.name+"<br>"+HTMLProtect(xhttp.responseText) );
//				local.setState( 3 );
//				local.message="Failed to parse JSON response<br>"+e.name+"<br>";
//				local.message="Failed to parse JSON response<br>"+e.name+"<br>"+HTMLProtect(xhttp.responseText);
				local.addMessage( "json", 3, "Failed to parse JSON response<br>"+e.name );
				
			}
			
		} else if( xhttp.status==0 ) {
//			local.setState( 3 );
//			local.message = "Resource cannot be initialised.";
			local.addMessage( "resource",3, "Resource cannot be initialised." );
		} else {
//			local.setState( 3 );
//			local.message = "State:"+xhttp.readyState+"<br>Status:"+xhttp.status+" ("+xhttp.statusText+")<br>"+HTMLProtect(xhttp.responseText);
			local.addMessage( "state", 3, "State:"+xhttp.readyState+"<br>Status:"+xhttp.status+" ("+xhttp.statusText+")<br>"+HTMLProtect(xhttp.responseText) );
		}
	}

	// Update all nodes with current status
//	updateNodes();	


//	debug = document.getElementById("debug");
//	debug.innerText = response.devices;
	// Update all nodes with current status
	updateNodes();	
}

// ============================================================
function updateNodes() {
//console.log( "updateNodes()" );
//console.log( "- NODES: "+Nodes.length );
	// Reset the counters
	banner.zero();

	// Update Nodes
	for (var key in Nodes) {
		var node = Nodes[key];
		node.update();
	}
	
	// Update counters
	banner.update();
	
	// SORT THE NODE LIST
	var div = document.getElementById('status');
	var toSort = div.children;
	toSort = Array.prototype.slice.call(toSort, 0);		// Convert nodelist to an array
	
	// Perfrom a sort on the array
	toSort.sort( function(a, b) {
		var nodeA = Nodes[a.id];
		var nodeB = Nodes[b.id];
		var order = nodeB.state-nodeA.state;	// RED-YELLOW-GREEN-GREY
		// Same state need to be sorted by ID
		if( order==0 ) { 	// Same status
			if( a.id.toLowerCase()>b.id.toLowerCase() ) {
				order=+1;
			} else {
				order=-1;
			}
		}
		return order;
	});

	// REPLACE ELEMENTS
	div.innerHTML = "";

	for(var i = 0, l = toSort.length; i < l; i++) {
		div.appendChild(toSort[i]);
	}
	
}

// ============================================================
function NodeUpdate( nodelist ) {
	// Loop through nodes and check they are still in node list
	for (var key in Nodes) {
		var node = Nodes[key];	// Get node
		if( !(key in nodelist) ) node.delete();
	}
	// Loop through results creating new nodes
	for (var key in nodelist) {
		var node = nodelist[key];	// This is the node from the response
		// Check to see if response node exists in the Nodes collection
		if( !(key in Nodes) ) {
			// Node doesn't exist, Create a new node:
			var temp = new Node( node.name, node.state, node.class, node.autohide );
		} else {
			// Update existing node
			var existing = Nodes[key];
			existing.autohide = node.autohide;
		}
	}	
}

// ============================================================
// Loop through status update response and pass them to the nodes
function StatusUpdate( statusdata ) {
//console.log( "StatusUpdate()..." );

	for (var key in statusdata) {
		var state = statusdata[key];
//console.log( "-"+key+", "+state.name );
		var node;
		
		// Create a new node if one does not already exist
		var name = state.name.trim();
		if( !(name in Nodes) ) {
//console.log( "==New Node" );
			node = new Node( name, state.status, 'undefined', state.autohide );
		} else {
			node = Nodes[name];
		}
		
		// Add this new state to the node.
		node.addState( key, state );
		
	}	

};

// ============================================================
// Loop through LibreNMS update response and pass them to the nodes
function LibreNMS_Update( data ) {
//	console.log( "updateing.." );
	for (var key in data) {
		var host = data[key];
		var hostname = host.sysName.toUpperCase();
		var state;
		var dot = hostname.indexOf(".");
		if( dot>0 ) hostname = hostname.substring(0,dot);
//console.log( hostname + ", " + state );
		var node, autohide;
		
		if( host.status=="1" ) {
			autohide = true;
			state = 1;
		} else {
			autohide = false;
			state = 3;
		}

		if( !(hostname in Nodes) ) {
//			console.log( "-- New Node" );
			// Node doesn't exist, Create a new node:
			node = new Node( hostname, state, "unknown", autohide );
		} else {
			node = node = Nodes[hostname];
		}
			
		// Add this new state to the node.
//console.log( data );
		var msg;
		
		
		// ADD JSON for debugging
//		msg	= { "subtitle":"LibreNMS", "status":state, "errcode":0, "errtext":JSON.stringify(host), "autohide":false };
//		node.addState( host.device_id, msg);
		
		// LAST PING
		msg = { "subtitle":"Last Ping", "status":state, "errcode":0, "errtext":host.last_ping, "autohide":autohide };
		node.addState( host.device_id+".ping", msg);

		// LAST POLL
		msg = { "subtitle":"Last Poll", "status":state, "errcode":0, "errtext":host.last_polled, "autohide":autohide };
		node.addState( host.device_id+".poll", msg);

		// STATUS
		msg = { "subtitle":"Cause: "+host.status_reason, "status":state, "errcode":0, "errtext":"", "autohide":true };
		node.addState( host.device_id+".status", msg);

		// DEBUGGING
//		if( hostname=="LBB_CIV_SDC_APM01" ) console.log( JSON.stringify(host) );
	}
}

// ============================================================
function HTMLProtect( str ) {
var html = str.replace(/</g,"&lt;" );
	html = html.replace(/>/g,"&gt;" );
	return html;
}

// ============================================================
function playSound(filename){   
	document.getElementById("sound").innerHTML='<audio autoplay="autoplay"><source src="' + filename + '.mp3" type="audio/mpeg" /><embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3" /></audio>';
}

function state2color( state ) {
	switch( state ) {
		case 1: return "green";
		case 2: return "yellow";
		case 3: return "red";
		default:
			return "grey";
	}
}

// ============================================================
//##
//##### NODES "CLASS" #####
//##
//function NodeList() {
//	this.list = {};
//}
//Node.prototype.add = function() {
//	this.div.style.display = "block";
//}

//############################################################
//##
//##### NODE "CLASS" #####
//##

// Constructor
function Node( hostname, status=0, ico='unknown', visible=0 ) {
	this.id = hostname;		//'node'+(objcounter++);
	this.name = hostname;
	this.state = status;			// Top-Level state of this node
	this.list = {};					// List of status elements within this node.
	this.lastupdate = new Date();
	this.autohide = visible;
	this.icon = ico;
	// Create a HTML Element
	this.div = document.createElement("div");
	this.div.setAttribute("id", this.id);
	if( visible==0 ) this.div.style.display = "none";
	// Add to page
	div_status = document.getElementById("status");
	if( div_status ) {
		div_status.appendChild(this.div);
	} else {
//		console.log( "Unable to append child to status" );
	}
	// Add to node list
	Nodes[this.id]= this;
//	Nodes.push( this );
	
//	console.log( "Added node "+hostname+", "+Nodes.length );
}

Node.prototype.show = function() {
	this.div.style.display = "block";
}	

Node.prototype.hide = function() {
	this.div.style.display = "none";
}	

Node.prototype.delete = function () {
	this.div.parentNode.removeChild(div);	// Remove HTML Element
//	delete Nodes[id];					// Remove attribute from an object  THIS LEAVE "HOLES" IN THE ARRAY & LENGTH REMAINS THE SAME
//	Nodes[id] = null;					// This just leaves a NULL record in the array

// UNTESTED
	if( index = data.indexOf( id ) ) Nodes.splice( index,1 );
}

Node.prototype.setState = function( value ) {
	if( this.state!==value ) {
		// State change
	}
	this.state = value;
}	

Node.prototype.addState = function( key, data ) {
//var state;
//	if( !(key in this.list) ) {
		// New State being added
//		state = { "subtitle":$subtitle, "status"=>$status, "errcode"=>$errcode, "errtext"=>$errtext, "autohide"=>$autohide );
//		state = data
//	} else {
//		// Updating existing state
//	}
	// Add or update state information
	this.list[key] = data;
}	

Node.prototype.addMessage = function( key, status, message, autohide=0 ) {
	var state = { "subtitle":"", "status":status, "errcode":0, "errtext":message, "autohide":autohide };
//	if( !(key in this.list) ) {
		// New State being added
//		state = { "subtitle":$subtitle, "status"=>$status, "errcode"=>$errcode, "errtext"=>$errtext, "autohide"=>$autohide );
//		state = data
//	} else {
//		// Updating existing state
//	}
	// Add or update state information
	this.list[key] = state;
}

Node.prototype.update = function() {
	this.lastupdate = new Date();

	html  = '<div class="header"><nobr><i class="fa '+this.icon+'"></i><span><b>'+this.name+'</b></span></nobr></div>';
	html += '<div class="pane">';

	// Clean out out message information
	this.state = 0;	// We start off with the object in an undefined state.
	
	// Cycle through states, adding them to the current message body
	for (var key in this.list) {
		var message = this.list[key];	// Get message record
//console.log( message.status+","+typeof(message.status)+","+typeof(this.state) );
		if( parseInt(message.status)>this.state ) this.state=parseInt(message.status);
		//
		if( parseInt(message.status)==1 && message.autohide==1 ) {
		} else {
			switch( typeof message ) {
			case 'string':
	//console.log ( "color: "+state2color(state) );
				if(message) html += '<div class="message '+state2color(parseInt(message.status))+'">'+message.errtext+'</div>';
				break;
			case 'object':
				if(message.subtitle) {
					html += "<div class='message "+state2color(parseInt(message.status))+"'><div class='subtitle'>"+message.subtitle+"</div>"+message.errtext+"</div>";
				} else {
					html += "<div class='message "+state2color(parseInt(message.status))+"'>"+message.errtext+"</div>";
				}
				break;
			case 'undefined':
				html += "<div class='message "+state2color(parseInt(message.status))+" center'>(Initialising)</div>";
				break;
			default:
				html += "#"+typeof message+"#";
			}
		}
	}

	html += '</div>';	// PANE
	
	this.div.className=this.status2color()+" node";	
	if( this.state==1 && this.autohide==1 ) {
//		this.show();
		this.hide();
	} else {
		this.show();
		this.div.innerHTML = html;
	}
	// Debug autohide issue...
	// this.div.innerHTML += ( this.autohide==1 ? "Y" : "N" );
	
	// Increment status counters
	if( this.state>4 ) {
		banner.increment(0);
	} else {
		banner.increment(this.state);
	}
	
//	if( this.state=1 && this.autohide ) {
//		this.hide();
//	} else {
//		this.show();
//		this.div.className=this.status2color()+" node";	
//		html = createBlock( this.name, this.icon, this.state, this.message );
//		this.div.innerHTML = html;
//	}
}
	
Node.prototype.status2color = function() {
	switch( this.state ) {
		case 0:	return "grey";
		case 1: return "green";
		case 2: return "yellow";
		case 3: return "red";
		case 4: return "grey";
		case 5: return "cyan";	// Maintenance
		default:
			return "grey";
	}
}

//############################################################
//##
//##### BANNER "CLASS" #####
//##

// Constructor
function Banner() {
	this.counters = [0,0,0,0];
	
}

Banner.prototype.update = function( states ) {
	for( i=0; i<4; i++ ) {
		panel = document.getElementById("panel"+i);
		value = document.getElementById("panel"+i+"value");
		if( panel && this.counters[i]>0 ) {
		panel.className = "pane color"+i;
		} else {
			panel.className = "pane grey";
		}
		if( value ) value.innerHTML = this.counters[i];
	}
}

Banner.prototype.zero = function() {
	this.counters = [0,0,0,0];
}

Banner.prototype.increment = function( panel ) {
	this.counters[ panel ]+=1;
}
