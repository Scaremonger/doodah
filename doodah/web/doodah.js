// DOODAH JAVASCRIPT LIBRARY
// (c) Copyright Si Dunford, July 2019
// VERSION 0.0.1, Pre-Release, Not suitable for production

/* CHANGE LOG:
 * V0.0.1	01 JUL 2019, Initial build.
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
        console.log( "Layout "+name+" created." );
        this.name = name;
        this.config = {};
        //
        //console.log( config );
        for (var section in config ){
            //console.log( "Section: "+section  );
            // Ignore anything that is not in a section:
            if( typeof config[section]==="object" ){
                // Check if section is layout configuration rather than skins:
                if( section=='doodah'|| section=='rainmeter' ){
                    // Layout configuration
                    //console.log( ". Reading doodah config" );
                    
                    // Currently there is nothing in this section of a layout that we use!
                    //read_config(config[section]);
                    // Read config from layout file
                    //this.config.windowx = ExtractNumber( config, 'windowx', 0 );
                    //this.config.windowy = ExtractNumber( config, 'windowy', 0 );
                } else {
                    // This section should be a skin
                    //console.log( ". Creating SKIN" );
                    section = section.replace("\\","/");
                    Skins[section] = new Skin( section, config[section], this );
                    // Request skin configuration from server
                    get_skin( section );
                }
            }
        }
    }
}

class Skin {
    constructor( name, config, parent ){
        console.log( "Skin "+name+" created." );
        this.name = name;
        this.config = {};
        this.meters = {};
        this.measures = {};
        this.variables = {};
        this.meta = {};
        //
        // Read basic configuration from the layout
        
        // Set initial variable values:
		//this.config.windowx = ExtractNumber( config, 'windowx', 0 );
		//this.config.windowy = ExtractNumber( config, 'windowy', 0 );
		this.config.update = ExtractNumber( config, 'update', 1000 );
		this.config.dynamicwindowsize = ExtractNumber( config, 'dynamicwindowsize', 0 );
		this.config.skinwidth = ExtractNumber( config, 'skinwidth', -1 );
		this.config.skinheight = ExtractNumber( config, 'skinheight', -1 );
        
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
        
    }
	old_constructor( name, definition, parent ){
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
	// Load the skin .ini file into existing skin.
	load_config( ini ){
        for (var section in ini ){
            console.log( section + ":::" + ini[section] );
            // Ignore anything that is not in a section:
            if( typeof ini[section]==="object" ){
                section = section.replace("\\","/");
                if( section=='doodah' ){
                    // Layout configuration
                    read_config(ini[section]);
                } else {
                    // Meters, Measures or Variables etc...
                }
            }
        }
        // Read config from INI file
        //this.config.windowx = ExtractNumber( ini, 'windowx', 0 );
		//this.config.windowy = ExtractNumber( ini, 'windowy', 0 );
		this.config.update = ExtractNumber( ini['doodah'], 'update', 1000 );
		this.config.dynamicwindowsize = ExtractNumber( ini.doodah, 'dynamicwindowsize', 0 );
		this.config.skinwidth = ExtractNumber( ini.doodah, 'skinwidth', -1 );
		this.config.skinheight = ExtractNumber( ini.doodah, 'skinheight', -1 );
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

class Meter {
	constructor( skin, name, definition, child='div' ){
		console.log( "CREATE METER: "+ JSON.stringify(definition[name]));
		this.skin = skin;
		this.name = name;
		// Create DOM element
		this.dom = document.createElement(child);
		this.dom.setAttribute("id", skin.name+"."+this.name);
		this.dom.className='meter';
		//if( visible==0 ) this.div.style.display = "none";
		
        // Extract config properties:
        this.config = {};
		this.config.x = ExtractPosition( definition[name].x||0 );
		this.config.y = ExtractPosition( definition[name].y||0 );
		this.config.w = ExtractPosition( definition[name].w||0 );
		this.config.h = ExtractPosition( definition[name].h||0 );
		this.config.text = ExtractText( definition[name], 'text', '' );
        
        // Calculated position and size:
        this.xpos = 0;
        this.ypos = 0;
        this.width = 0;
        this.height = 0;
		//
        this.config.padding = ExtractPadding( definition[name], 'padding' );
        //{left:5,top:10,right:25,bottom:0}
//		this.config.padding = definition[name].padding;
//		if(!this.padding) this.padding={top:0,left:0,right:0,bottom:0};
		//console.log( ".padding="+ definition[name].padding);
		console.log( ".padding="+ JSON.stringify(this.config.padding));
				
		skin.dom.appendChild(this.dom);
        
        this.update();
        this.redraw()

		console.log( "Meter %s pos:",name );
		console.log( " X="+ JSON.stringify(this.config.x));
		console.log( " Y="+ JSON.stringify(this.config.y));
		console.log( " W="+ JSON.stringify(this.config.w));
		console.log( " H="+ JSON.stringify(this.config.h));
// this.definition = definition;
		//this.dom = this.create();
		//this.period = 1000;
		//if(this.prop < 10) setTimeout(this.update.bind(this), this.period);
	}
    // Update the meter (With new value if required)
    // This is called by timer
	update(){
        this.dom.innerText="###"+this.name+"###";
    }
    // Recalculate component location and size
    redraw(){
		console.log( "Calc pos of '%s'.",this.name);
		/*
		console.log( ".sx="+ JSON.stringify(this.sx));
		console.log( ".sy="+ JSON.stringify(this.sy));
		console.log( ".sw="+ JSON.stringify(this.sw));
		console.log( ".sh="+ JSON.stringify(this.sh));
		*/
		// Recalculate drawing location and if different, update the DOM
		if( previous) {
			console.log( ".Using previous "+ JSON.stringify(previous));
			// Draw relative to previous
			switch( this.config.x[1] ){
			case 'r':	//Relative to left of previous
				this.xpos = previous.x+this.config.x[0];			
				break;
			case 'R':	//Relative to right of previous
				this.xpos = previous.x+previous.w+this.config.x[0];
				break;
			default:
				this.xpos = this.skin.config.windowx+this.config.x[0];
			};
			//console.log( ". X="+this.xpos+","+this.config.x );
			switch( this.config.y[1]){
			case 'r':	//Relative to left of previous
				this.ypos = previous.y+this.config.y[0];			
				break;
			case 'R':	//Relative to right of previous
				this.ypos = previous.y+previous.h+this.config.y[0];
				break;
			default:
				this.ypos = this.skin.config.windowy+this.config.y[0];
			}
//			this.width = 10;
//			this.height = 10;
		} else {
			console.log( ".Using parent");
			// First item drawn is relative to skin!
			//this.xpos = this.skin.config.windowx+this.config.x[0];
			//this.ypos = this.skin.config.windowy+this.config.y[0];
			this.xpos = this.config.x[0];
			this.ypos = this.config.y[0];
		}
		console.log( ".X="+this.xpos+" ("+this.config.x+")" );
		console.log( ".Y="+this.ypos+" ("+this.config.y+")" );
		console.log( ".W="+this.width+" ("+this.config.w+")" );
		console.log( ".H="+this.height+" ("+this.config.h+")" );
//		this.width = this.sw[0];
//		this.height = this.sh[0];
        
        // Get size including padding...
		this.width = this.dom.clientWidth;
		this.height = this.dom.clientHeight;
		this.width += this.config.padding.left+this.config.padding.right;
		this.height += this.config.padding.top+this.config.padding.bottom; 
        
        // Save the location into previous
		previous = {x:this.xpos,y:this.ypos,w:this.width||0,h:this.height||0};
		// UPdate DOM
		this.dom.style.left = this.xpos+"px";
		this.dom.style.top = this.ypos+"px";
		this.dom.style.paddingTop = this.config.padding.top+"px";
		this.dom.style.paddingRight = this.config.padding.right+"px";
		this.dom.style.paddingBottom = this.config.padding.bottom+"px";
		this.dom.style.paddingLeft = this.config.padding.left+"px";
	}
}
class Meter_String extends Meter {
	constructor( parent, name, definition ){
		super( parent, name, definition );
//		this.prop = 0;
		

		//console.log("-> w="+this.dom.clientWidth);
		//console.log("-> h="+this.dom.clientHeight);

	}
	update(){
        //this.dom.innerText="###"+name+"###";
        this.dom.innerText=this.config.text;
    }
}
class Meter_Image extends Meter {
	constructor(){
		super();
		this.prop = 0;
	}
	create(){
		return document.createElement("img");
	}
}
class Meter_bar extends Meter {
	constructor(){
		super();
		this.prop = 0;
	}
	create(){
		return document.createElement("canvas");
	}
	update(){
	}
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
                    console.log( "LAYOUT RECEIVE: "+response.name+", "+response.error );
                    if( response.error!=="ok" ) {
                        console.log( "$ FAILED TO LOAD LAYOUT: "+response.name );
                        console.log( "$ ERROR: "+response.error );
                    } else {
                        console.log( "LAYOUT LOADED: "+response.name );
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
function get_skin(name) {
    var doodah_server = new XMLHttpRequest();
	doodah_server.open( "GET", "$Skin="+name, true);
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
                    console.log( "SKIN RECEIVE: "+response.name+", "+response.error );
                    if( response.error!=="ok" ) {
                        console.log( "$ FAILED TO LOAD SKIN: "+response.name );
                        console.log( "$ ERROR: "+response.error );
                    } else {
                        console.log( "SKIN LOADED: "+response.name );
                        skin = Skins[response.name];
                        if(skin) {
                            var ini = parseINIString( response.ini );
                            skin.load_config( ini );
                        } else {
                            console.log("$ Invalid skin");
                        }
                    }
                } catch(e) {
                    console.log( "Failed to parse JSON response: "+e.name );
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

// Start the launcher
// Loop through all skins, create them as objects
window.onload = function(){
	// Get Layout from URL
    layout = window.location.pathname;
    layout = layout.slice(1)   // Remove leading "/"
    if( !layout||layout=='' ) layout='Default';
    console.log( "LOADING LAYOUT: "+layout );
    get_layout( layout );
    
    console.log( preload);
    // Loop through pre-loaded skins and create them
//	for (var key in preload.skins) {
//		if(!(key in Skins)){
//			skin = new Skin( key, preload.skins[key] );
//		} // Ignore duplicate skins. 
//	}
	
}
