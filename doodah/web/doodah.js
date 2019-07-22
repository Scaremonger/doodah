// DOODAH JAVASCRIPT LIBRARY
// (c) Copyright Si Dunford, July 2019
// VERSION 0.0.1, Pre-Release, Not suitable for production

/* CHANGE LOG:
 * V0.0.1	01 JUL 19, Initial build.
 *
 */

/* 
DESIGN CHANGES:

The preload definition IS the SKIN object.
The definition should be used INSTEAD of reading the array and parsing it.
The definition should have been parsed before it is added to the Preload array.

skin = Skin( key, preload[key] );

Skin() should add function prototypes into the preload array making it a proper skin object
which can then be called directly.

Meter() should do the same, addding the appropiate functions for the meter typebeing created.
YOU DONT NEED METER_STRING CLASS ETC as the Meter() function is a factory...

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

doodah.ini should have a section for each "loaded" skin 
[See "Reference|Settings|[Skin] Sections" in rainmeter documentation
This "LIST" of sections should be used to create preload array.
Each section is named after the skin and contains:
	position on desktop of skin:
	windowx=
	windowy=

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

BUGS
===========
* in Preload: padding should be four comma seperated numbers. Not object array
* when skinsize is not defined it is -1. It should be calculated.
* When SKIN fails to load, or fails to parse, create an ERROR skin instead.


COLOR: 
https://htmlcolorcodes.com/color-chart/
Paleyellow: #FCF3CF
Orange: #F6DDCC
blue: #D4E6F1  
*/

var Skins = {};		// List of available nodes
var AllMeters = {};	// List of all meters

//var cursor ={x:0,y:0};
var previous = undefined;
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

        // Read config from LAYOUT config
		this.config.windowx = ExtractNumber( layout_config, 'windowx', 0 );
		this.config.windowy = ExtractNumber( layout_config, 'windowy', 0 );

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
	/*
     * old_constructor( name, definition, parent ){
		console.log( "# Creating skin for %s",name );
		// Add self to Skin list
		Skins[name] = this;
		//
		this.name = name;
        
		// Set initial variable values:
        this.config = {};
		this.config.windowx = ExtractNumber( definition, 'windowx', 0 );
		this.config.windowy = ExtractNumber( definition, 'windowy', 0 );
		this.config.update = ExtractNumber( definition['doodah'], 'update', 1000 );
		this.config.dynamicwindowsize = ExtractNumber( definition.doodah, 'dynamicwindowsize', 0 );
		this.config.skinwidth = ExtractNumber( definition.doodah, 'skinwidth', -1 );
		this.config.skinheight = ExtractNumber( definition.doodah, 'skinheight', -1 );

        // CREATE DOM OBJECT (DIV) FOR SKIN
        //console.log( "'%s' pos:",name );
        //console.log( " X: %s",this.config.windowx );
        //console.log( " Y: %s",this.config.windowy );
        //console.log( " W: %s",this.config.skinwidth );
        //console.log( " H: %s",this.config.skinheight );
		this.dom = document.createElement('div');
		this.dom.setAttribute("id", "skin."+this.name);
		this.dom.className='skin';
        this.dom.style.left = this.config.windowx+"px";
		this.dom.style.top = this.config.windowy+"px";
		document.body.appendChild(this.dom);
        
		//
		this.Meters = {};
		this.Measures = {};
		this.Variables = {};
		this.Meta = {};
	
		// Loop through skin sections
		for (var section in definition) {
			//console.log("SECTION: %s",section);
			if( section=='doodah' ) continue;
			if( section=='metadata' ) {
				this.Meta = definition[section];
				continue;
			}
			if( section=='variables' ) continue;
			// Is section a METER?
			if( definition[section].meter ) {
				console.log("Meter '"+section+"': "+definition[section].meter);
				var metertype = definition[section].meter;
				switch( metertype ){
				case 'string':
					console.log("Creating string meter");
					// Add a new Meter to the list
					var meter = new Meter_String( this, section, definition );
					this.Meters[section] = meter;
					AllMeters[name+"."+section]=meter;
					break;
				default:
					console.log("# Unknown meter type "+metertype);
				}
			}
			// Is section a MEASURE?
			if( definition[section].measure ) {
				console.log("Measure '"+section+"': "+definition[section].measure);
				var measuretype = definition[section].measure;
				switch( measuretype ){
				case 'calc':
					console.log("Creating calc measure");
					// Add a new Measure to the list
					//var measure = new Measure_Calc( this, section, definition );
					//this.Measures[section] = measure;
					//AllMeasures[name+"."+section]=measure;
					break;
				default:
					console.log("# Unknown measure type "+measuretype);
				}
			}
		}		

		// Initial size of skin is based on meters:
		if( this.config.skinwidth==-1){
            this.config.skinwidth = 50;
        }
		if( this.config.skinheight==-1){
            this.config.skinheight = 50;
        }
        // Update DOM size
        this.dom.style.width = this.config.skinwidth+"px";
        this.dom.style.height = this.config.skinheight+"px";
        
		// Start Self-timer
//		this.timer = setInterval( function(){
//			console.log("tick, "+this.name);
//		},this.updateTime).bind(this);
	}
	*/
	
    // Function called every "UPDATE" milliseconds
    Update(){
        console.log( "UPDATING SKIN: "+this.name );
        // Loop through all meters, calling their update function
        for( var meter in this.meters ){
            //console.log( "  Meter "+JSON.stringify( meter));
            //meter.Update();
        }
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

/* FUNCTION TESTING
console.log( ExtractPosition( "25R" ) );
console.log( ExtractPosition( "bad" ) );
console.log( ExtractPosition( "25r" ) );
console.log( ExtractPosition( "" ) );
console.log( ExtractPosition( undefined ) );
console.log( ExtractPosition( null ) );
console.log( JSON.stringify( ExtractPadding( "0,1,2,3") ));
console.log( JSON.stringify( ExtractPadding( "A,1,2,3") ));
console.log( JSON.stringify( ExtractPadding( "0,B,2,3") ));
console.log( JSON.stringify( ExtractPadding( "0,2") ));
console.log( JSON.stringify( 
    ExtractPadding( { padding:'1,2,3,4' }, "padding" )
    ));
console.log( JSON.stringify( 
    ExtractPadding( { X:100 }, "padding" )
    ));
console.log( JSON.stringify( 
    ExtractPadding( { padding:10 }, "padding" )
    ));
*/



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

// ========================================
/*
function get_skin(layout, skin_file, skin_name, skin_layout) {
    var doodah_server = new XMLHttpRequest();
    console.log(" CHECK:"+skin_name);
	doodah_server.open( "GET", "$Skin="+skin_file, true);
    this.skin_name = skin_name;
    this.skin_layout = skin_layout;
    this.layout = layout;
    doodah_server.onreadystatechange = function() {
        xhttp = this;

        if (xhttp.readyState == 4) {
            if( xhttp.status == 200 ) {
                //console.log( "Connection Successful", 1 );
                try{
                    //console.log(xhttp.responseText);
                    var response = JSON.parse(xhttp.responseText);
    //console.log( "Data length:"+response.length );
                    //console.log( response );
                    console.log( "INITIALISE SKIN '"+response.name+"', "+response.status );
                    if( response.status!=="ok" ) {
                        console.log( "$ FAILED TO LOAD SKIN: "+response.name );
                        console.log( "$ ERROR: "+response.status );
                    } else {
                        console.log( ". Loaded successfully." );
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
                    }
                } catch(e) {
                    console.log( "Failed to parse JSON response: "+e );
                }
            } else if( xhttp.status==0 ) {
                console.log( "Resource cannot be initialised." );
            } else {
                //console.log( "Status:"+xhttp.status+" ("+xhttp.statusText+")" );
                //console.log( HTMLProtect(xhttp.responseText) );
            }
        }
    };
	doodah_server.send();
}


/*
// Create a skin object, add it to the list and the DOM
function createSkin( definition ){
	skin = new Skin;
	skin.def = definition;
	skin.dom = createDIV( def.name );
	skin.timer = setTimer( skin.refresh, skinupdate )
}

function skinupdate( skin ){
	skin.obj.update()
}
*/
/*
// defines a class function
class className {
	constructor(){
	this.prop = 0;
	}

	// method
	metName() {
//		document.getElementById('swprop').innerHTML = this.prop; // shows prop value in #swprop

		// adds one unit to prop to each call, and auto-calls this function every 0.5 sec., till prop reaches 10
//		this.prop++;
//		if(this.prop < 10) setTimeout(this.metName.bind(this), 500);
	}
}
*/


// creates an object of className, and accesses metName()
//var objTest = new className();
//objTest.metName();

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
    
    //console.log( preload);
    // Loop through pre-loaded skins and create them
//	for (var key in preload.skins) {
//		if(!(key in Skins)){
//			skin = new Skin( key, preload.skins[key] );
//		} // Ignore duplicate skins. 
//	}
	
}
