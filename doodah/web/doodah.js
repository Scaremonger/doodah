// DOODAH JAVASCRIPT LIBRARY
// (c) Copyright Si Dunford, July 2019
// VERSION 0.0.1, Pre-Release, Not suitable for production

/* CHANGE LOG:
 * 0.0.1    01 JUL 19   Initial build.
 * 0.0.2    20 JUL 19   Split Meter into own file
 * 0.0.3    23 JUL 19   Added update/updatedivider and system timer

THINGS TO DO NEXT
-----------------
1 of the three SKINS has dissapeared while adding Previous_Skin and Previous_Meter
    Simple image does not exist, so thats to be expected (although there should be a err skin)
    text is gone? why?
Layout manager:
* Use Previous_Skin and Previous_Meter variables (instead of just previous) when adding them. 
* previous_meter, should be Previous_Meter
* New Skin should NULL the Previous Meter
* padding (and margins if rainmeter has them)
Basic config:
* colours of text, background, border for skin AND meters
* font size and face

VERSION 0.0.2
Loading errors:
* When SKIN fails to load, or fails to parse, create an ERROR skin containing an error meter with it's SIZE and POSITION
* When METER fails to load or initialise, a METER_STRING should be added with formatting NOT A METER_ERROR TYPE
    meter=string 
    text=Meter 'NAME' failed to initialise
    dynamicwindowsize=1
    Should set border, background and text colour/size/font
* Replace console.log with "log()" which only displays text when DEBUG=TRUE
* Add IMAGE meter, which loads an image
* Add variable substitution

Known Bugs:
-----------
* HTML file contains static skins, meters and test code. Remove it!

Debugging code:
* Add variable DEBUG=TRUE/FALSE, only show debugging code when TRUE
* Remove popup and tooltip code and CSS
* Remove CARD and DEBUGGING code and CSS
* Green/Red dotted borders around skin and meters in CSS

OUTSTANDING
===========

Preload functions:
	Need to also allow variables in here, not just correct values
	So SolidColor=F6DDCC or Solidcolor=#FGCOL# should both be allowed
	or what about X=#SOMEWHERE#+23
	* ExtractString( definition, key, default )
	* ExtractNumber( definition, key, default ) 	- DONE
	* ExtractPosition( definition, key, default )	- DONE
	* ExtractColor( definition, key, default )		- RRR,GGG,BBB[,AAA] / RRGGBB[AA] etc
	* ExtractPadding( definition, key, default )	- l,t,r,b (NOTE DIFFERENCE WITH CSS)

VARIABLES:
(Including;
	#SCREENAREAHEIGHT#, #SCREENAREAWIDTH#
	#WORKAREAWIDTH#, #WORKAREAHEIGHT#

CALCULATIONS	
Valiable formula, like X=(#WORKAREAWIDTH#/2)

Python Flask must embed the INI after parsing it into a SKIN object array and 
embedding it into Preload array.

Python must parse the INI file into a object before embedding it into 
"Preload" array which mmust be a "Skin()" object!

Attributes:
String:	w,h,hidden,updatedivider,solidcolor/solidcolor2,gradientangle,beveltype

solidcolor should support R,G,B[,a] or RRGGBB[AA]
solidcolor2 should also support gradients on backgrounds
backgroundmode: Implement all options 0 through 4

skins: need paramters (windowx, windowy, hidden etc.)

Meters:
Image, Button, Bar, etc....

Measures: NOT IMPLEMENTED

Actions: NOT IMPLEMENTED

Bangs: NOT IMPLEMENTED
Is there one to SetWallpaper? If so, this must set the body background image.


COLOR: 
https://htmlcolorcodes.com/color-chart/
Paleyellow: #FCF3CF
Orange: #F6DDCC
blue: #D4E6F1  
*/

var Skins = {};		// List of available nodes
var AllMeters = {};	// List of all meters

//var cursor ={x:0,y:0};
var Previous_Meter = undefined;
var Previous_Skin = undefined;
var layout = {}

class Layout {
    constructor( name, config ){
        console.log( "  new Layout( '"+name+"' )" );
        this.name = name;
        this.config = {};
        //
        //console.log( config );
        
        for (var section in config ){
            var section_lower = section.toLowerCase();
            console.log( "Section: "+section  );
            // Ignore anything that is not in a section:
            if( typeof config[section]!=="object" ) continue;
            
            // Check if section is layout configuration rather than skins:
            if( section_lower=='doodah' || section_lower=='rainmeter' ){
                // Layout configuration
                //console.log( ". Reading doodah config" );
                // Currently there is nothing in this section of a layout
                // that we use!
                continue;
            }
            
            // Any remaining section should be a skin
            //var skin_name = section_lower.replace("\\","/");
            //console.log( ". Creating SKIN "+skin_name );
            //Skins[skin_name] = new Skin( skin_name, config[section], this );
            // Request skin configuration from server
            var skin_file = section.replace("\\","/");
            var skin_name = section_lower.replace("\\","/");
            //get_skin( parent, skin_file, skin_name, config[section] );
            this.request_skin( skin_file, skin_name, config[section] );
        }
        
        // Start System Timer
		this.timer = setInterval( function(){
            this.Update( Date.now() );
		}.bind(this),100);      
    }
    request_skin( skin_file, skin_name, config ) {
        // Create a request
        var server = new XMLHttpRequest();
        // Save some variables that we will need later:
        server.skin_config = config;
        server.skin_name = skin_name;
        server.skin_parent = this;
        //
        server.open( "GET", "$Skin="+skin_file, true);
        server.onreadystatechange = function() {
            // Wait for Ready State 4:
            if (server.readyState != 4) return;
            switch( server.status ){
            case 0:
                console.log( "Resource cannot be initialised." );
                break;
            case 200:
                //console.log( "Connection Successful", 1 );
                try{
                    //console.log(xhttp.responseText);
                    var response = JSON.parse(server.responseText);
    //console.log( "Data length:"+response.length );
                    //console.log( response );
                    console.log( "INITIALISE SKIN: '"+response.name+"', "+response.status );
                    if( response.status!=="ok" ) {
                        console.log( "$ FAILED TO LOAD SKIN: "+response.name );
                        console.log( "$ ERROR: "+response.status );
                        
                    } else {
                        console.log( "  Loaded Successfully" );
                        //console.log( server.skin_name);
                        
                        skin_name = server.skin_name;
                        //layout = 
                        //console.log( "CREATING SKIN "+skin_name );
                        var ini = parseINIString( response.ini );
                        var skin = new Skin( server.skin_parent, skin_name, ini, server.skin_config );
                        //console.log( "  Skin created");
                        
                        // DEBUGGING
                        if(skin) {
                            showcard( skin, ini );
                            Skins[skin_name] = skin;
                        } else {
                            console.log( "$ Invalid skin");
                        }
                        /*
                        //console.log( "INI:" );
                        //console.log( response.ini );
                        // Get existing Skin
                        var skin_name = this.skin_name; response.name;
                        //skin_name = skin_name.toLowerCase();
                        //skin_name = skin_name.replace("\\","/");
                        console.log( "IS:: "+response.name+","+this.skin_name);
                        console.log( "CREATING SKIN "+skin_name );
                        var ini = parseINIString( response.ini );
                        var skin = new Skin( skin_name, ini, this.layout );
                        if(skin) {
                            Skins[skin_name] = skin
                            console.log("$ Skin valid");
                            
                            //console.log( "DATA FILE" );
                            //console.log( response.ini );
                            //console.log( "INI FILE" );
                            //console.log( ini );
                            //skin.load_config( ini );
                            showcard( skin );
                            // Add layout configuration into skin
                            if(layout_config.windowx) skin.config.windowx=layout_config.windowx;
                            if(layout_config.windowy) skin.config.windowy=layout_config.windowy;
                        } else {
                            console.log("$ Invalid skin");
                        }
                        */
                    }
                } catch(e) {
                    console.log( "Failed to parse JSON response: "+e );
                }
                break;
            default:
                //console.log( "Status:"+xhttp.status+" ("+xhttp.statusText+")" );
                //console.log( HTMLProtect(xhttp.responseText) );
            }
        }
	server.send();
    
    }
    
    // System Update timer
    Update( now ) {
        // Loop through all Skins, checking their last update and refreshing them where necessary
        Previous_Skin = undefined;
        for( var skin_name in Skins ) {
            var skin = Skins[skin_name];
            if( skin.next_update<now ) skin.Update( now );
            Previous_Skin = skin;
        }
    }
}

class Skin {
    constructor( parent, skin_name, skin_config, layout_config ){
        console.log( "  new Skin( '"+skin_name+"' )" );
        this.name = skin_name;
        this.config = {};
        this.meters = {};
        this.measures = {};
        this.variables = {};
        this.meta = {};
        this.next_update = 0;

        // Read config from LAYOUT config
		this.config.windowx = ExtractNumber( layout_config, 'windowx', -1 );
		this.config.windowy = ExtractNumber( layout_config, 'windowy', -1 );

        // Read config from SKIN config
		//this.config.dynamicwindowsize = ExtractNumber( skin_config, 'dynamicwindowsize', 0 );
		//this.config.skinwidth = ExtractNumber( skin_config, 'skinwidth', 100 );
		//this.config.skinheight = ExtractNumber( skin_config, 'skinheight', 30 );

        // CREATE DOM OBJECT (DIV) FOR SKIN
		this.dom = document.createElement('div');
		this.dom.setAttribute("id", "skin."+this.name);
		this.dom.className='skin';
		document.body.appendChild(this.dom);
        
        // Create popup for debugging purposes only
        var popup = document.createElement('span');
        popup.innerText=this.name;
        popup.className='tooltiptext';
        this.dom.appendChild(popup);
        
        // Parse the SKIN Config

        //console.log("  Loading skin config");
        //console.log(skin_config);
        for (var section in skin_config ){
            console.log( "  SECTION: "+section);
            // Ignore anything that is not in a section:
            if( typeof skin_config[section]!=="object" ) continue;
            
            // Convert to lowercase and replace backslashes!
            var section_name = section.toLowerCase();
            section_name = section_name.replace("\\","/");
            console.log( "  "+section_name  );
            switch( section_name ){
            case 'doodah':
            case 'rainmeter':
                // Extract Skin configuration
                this.config.update = ExtractNumber( skin_config[section], 'update', 1000 );
                if( this.config.update<500 ) this.config.update = 500;
                this.config.updatedivider = ExtractNumber( skin_config[section], 'updatedivider', 1 );
                //
                this.config.dynamicwindowsize = ExtractNumber( skin_config[section], 'dynamicwindowsize', 0 );
                this.config.skinwidth = ExtractNumber( skin_config[section], 'skinwidth', 100 );
                this.config.skinheight = ExtractNumber( skin_config[section], 'skinheight', 30 );
                break;
            case 'metadata':
                this.Meta = skin_config[section];
                break;
            case 'variables':
                //this.Variables = skin_config[section];
                break;
            default:
                // Is section a METER?{
                if( skin_config[section].meter ) {
                    console.log("Meter '"+section+"' ("+section_name+"): "+skin_config[section].meter);
                    var meter = CreateMeter( section_name, skin_config[section], this );
                    if(meter) {
                        this.meters[section_name] = meter;
                        break;
                    }
                    console.log( "ERROR CREATING METER" );
                    break;
                    //AllMeters[name+"."+section_name]=meter;
                }
                // Is section a MEASURE?
                if( skin_config[section].measure ) {
                    console.log("Measure '"+section+"': "+skin_config[section].measure);
                    var measuretype = skin_config[section].measure.toLowerCase();
                    //var measure_name = section.toLowerCase();
                    switch( measuretype ){
                    case 'calc':
                        console.log("Creating calc measure");
                        // Add a new Measure to the list
                        //var measure = new Measure_Calc( this, section_name, definition );
                        //this.measures[section_name] = measure;
                        //AllMeasures[name+"."+section_name]=measure;
                        break;
                    default:
                        console.log("# Unknown measure type "+measuretype);
                    }
                }
            // Meters, Measures or Variables etc...
            }

            // Update the skin
            //console.log( "Calling update");
            //this.Update();
            //console.log( "Update finished");
        }
        //console.log( "sections finished");
        
        // Set the skin values
        this.xpos = this.config.windowx;
        this.ypos = this.config.windowy;
        this.width = this.config.skinwidth;
        this.height = this.config.skinheight;
        
        // Update DOM to match object
        this.dom.style.left = this.xpos+"px";
		this.dom.style.top = this.ypos+"px";
        this.dom.style.height = this.height+"px";
		this.dom.style.width = this.width+"px";
        // Set fixed size/width skins to truncate overay content
        if( this.config.dynamicwindowsize==0 ) {
            this.dom.classList.add("dynamicwindowsize0");
        }
        this.Update();
        
        
        // Start Self-timer for the skin.
		/*
         * this.timer = setInterval( function(){
			console.log("tick, "+this.name);
            this.Update();
		}.bind(this),this.config.update);
		*/
    }
	
    // Function called every "UPDATE" milliseconds
    Update(now=0){
        console.log( "UPDATING SKIN: "+this.name );
        // Update all Measures
        console.log( "> Updating measures...");
        for( var measure_name in this.measures ){
            var measure = this.measures[measure_name];
            //console.log( "  Measure "+JSON.stringify( meter));
            if( measure.next_update<now ) measure.Update( now );
        }
        
        // Update all Meters
        console.log( "> Updating meters...");
        for( var meter_name in this.meters ){
            var meter = this.meters[meter_name];
            //console.log( "  Meter "+JSON.stringify( meter));
            if( meter.next_update<now ) meter.Update( now );
        }
        console.log( "> finished update");
        
        // If DOM has not fixed abode, position it next to the last skin.
        if( this.config.windowx==-1 ) {
            if( PreviousSkin===undefined) {
                this.xpos = 0;
            } else {
                this.xpos = Previous_Skin.config.windowx + Previous_Skin.width;
            }
        }
        if( this.config.windowy==-1 ) {
            if( PreviousSkin===undefined) {
                this.ypos = 0;
            } else {
                this.ypos = Previous_Skin.config.windowy + Previous_Skin.height;
            }
        }
        // Skin DOM location
        this.dom.style.left = this.xpos+"px";
		this.dom.style.top = this.ypos+"px";
            
        // Skin resize to fit meters?
        if( this.config.dynamicwindowsize==1 ) {
            console.log( "  ! Dynamic sizing configured" );
            // Calculate size of skin based on meters
            this.width = 0;
            this.height = 0;
            for( var meter_name in this.meters ){
                //console.log( "    "+meter_name );
                var meter = this.meters[meter_name]
                this.width = Math.max( this.width, meter.width );
                this.height = Math.max( this.height, meter.height );
                console.log( "    METER: "+meter_name+": sX="+meter.xpos+", Y="+meter.ypos+", W="+meter.width+", H="+meter.height );
            }
            // Update DOM size
            this.dom.style.width = this.width+"px";
            this.dom.style.height = this.height+"px";
        }
        console.log( "  SKIN SIZE: X="+this.xpos+", Y="+this.ypos+", W="+this.width+", H="+this.height );
        
        // 
        
        // Next update
        this.next_update = now+this.config.update;
        console.log( "  Next Update at: "+this.next_update );
    }
}

function ExtractNumber( definition, variable, otherwise ){
	if(definition&&definition[variable]) return parseInt(definition[variable]);
	return parseInt( otherwise );
}

// Extracts position and offset information from a location string
// NN	Absolute, relative to skin
// NNr	Relative to Previous Meter Left/Top
// NNr	Relative to Previous Meter Right/Bottom
function ExtractPosition( str ){
	var err = [0,''];
	if(!str) return err;
	str = str.toString();
	re = /(\d+)([rR])?/
	var found = str.match(re);
	if(!found) return err;
	if( !found[2]) found[2]='';
	if(found) return [parseInt(found[1]),found[2]];
}
function ExtractPadding( definition, variable ){
    var err = {left:0,top:0,right:0,bottom:0};
    if( !definition||!definition[variable] ) return err;
    var str = definition[variable].toString();
    var item = str.split(",");
    //console.log( "Padding="+item.length);
    if(item.length!=4) return err;
    return {left:parseInt(item[0]),
            top:parseInt(item[1]),
            right:parseInt(item[2]),
            bottom:parseInt(item[3])};
}
function ExtractText( definition, variable, otherwise ){
	if(definition&&definition[variable]) return definition[variable];
    return otherwise;
}

// ========================================
function get_layout(name) {
    var doodah_server = new XMLHttpRequest();
	doodah_server.open( "GET", "$Layout="+name, true);
    doodah_server.onreadystatechange = function() {
        xhttp = this;
        if (xhttp.readyState == 4) {
            if( xhttp.status == 200 ) {
                //console.log( "Connection Successful", 1 );
                try{
                    //console.log(xhttp.responseText);
                    var response = JSON.parse(xhttp.responseText);
                    //console.log( response );
                    console.log( "INITIALISE LAYOUT: '"+response.name+"', "+response.status );
                    
                    if( response.status!=="ok" ) {
                        console.log( "$ FAILED TO LOAD LAYOUT: "+response.name );
                        console.log( "$ ERROR: "+response.status );
                    } else {
                        console.log( ". Loaded successfully." );
                        var ini = parseINIString( response.ini );
                        layout = new Layout( response.name, ini );
                    }
                    
                } catch(e) {
    //console.log( "Failed to parse JSON response<br>"+e.name+"<br>"+HTMLProtect(xhttp.responseText) );
    //				local.setState( 3 );
    //				local.message="Failed to parse JSON response<br>"+e.name+"<br>"+HTMLProtect(xhttp.responseText);
                    console.log( "Failed to parse JSON response: "+e.name );
                }
             } else if( xhttp.status==0 ) {
                console.log( "Resource cannot be initialised." );
            } else {
                console.log( "Status:"+xhttp.status+" ("+xhttp.statusText+")" );
                //console.log( HTMLProtect(xhttp.responseText) );
            }
        }
    };
	doodah_server.send();
}

// ============================================================
function HTMLProtect( str ) {
var html = str.replace(/</g,"&lt;" );
	html = html.replace(/>/g,"&gt;" );
	return html;
}

// Config Parser by YumYumYum
// https://stackoverflow.com/questions/3870019/javascript-parser-for-a-string-which-contains-ini-data
// Modified by Si Dunford to always use lowercase for keys.
function parseINIString(data){
    var regex = {
        section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
        param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
        comment: /^\s*;.*$/
    };
    //console.log( "DATA FILE:");
    //console.log( data);
    var value = {};
    var lines = data.split(/[\r\n]+/);
    var section = null;
    lines.forEach(function(line){
        if(regex.comment.test(line)){
            return;
        }else if(regex.param.test(line)){
            var match = line.match(regex.param);
            if(section){
                value[section][match[1].toLowerCase()] = match[2];
            }else{
                value[match[1].toLowerCase()] = match[2];
            }
        }else if(regex.section.test(line)){
            var match = line.match(regex.section);
            value[match[1]] = {};
            section = match[1];
            //console.log( value);
        }else if(line.length == 0 && section){
            section = null;
        };
    });
    //console.log( "INI FILE");
    //console.log( value);
    return value;
}

function dumpvar( obj, depth=0) {
    if(depth>4) return "DEPTH EXCEEDED";
    var html ='';
    for (var item in obj ){
        var indent = " ".repeat( depth );
        if(item=="dom"){
            html += indent+"dom:DOM<br>";
            continue;
        }
        if(item=="parent"){
            html += indent+"parent:OBJECT{...}<br>";
            continue;
        }
        switch( typeof obj[item] ){
        case "string":
            html += indent+item+":STR="+obj[item]+"<br>";
            break;
        case "number":
            html += indent+item+":NUM="+obj[item].toString()+"<br>";
            break;
        case "object":
            html += indent+item+": {<br>";
            html += dumpvar( obj[item], depth+1 );
            html += indent+"}<br>";
  //          break;
        case "function":
            // Not interested in listing these
            break;
        default:
            html += indent + item +"=="+typeof obj[item]+"<br>";
        }
    }
    return html;
}

function showcard( obj, data={} ){
    var debug= document.getElementById("debugger");
    var div= document.createElement('div');
	div.className='card';
    
    var html = dumpvar( obj );
    //return;
   // THE ERROR IS HERE
    //IT WILL NOT STRINGIFY A FULL OBJECT
    div.innerHTML="<pre>"+html+"</pre>";
//    div.innerHTML="OBJECT:<br>"+JSON.stringify( obj );
//    div.innerHTML+="<br>DATA:<br>"+JSON.stringify( data );
    debug.appendChild(div);
}

// Start the launcher
// Loop through all skins, create them as objects
window.onload = function(){
	// Get Layout from URL
    layout = window.location.pathname;
    layout = layout.slice(1)   // Remove leading "/"
    if( !layout||layout=='' ) layout='Default';
    console.log( "Layout '"+layout+ "' Selected" );
    get_layout( layout );
    
}
