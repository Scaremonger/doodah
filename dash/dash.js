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
* skin is 1px square because content is fixed instead of absolute
* SKIN size must be defined or calculated depending on settings
* METER size must be calculated.

CHANGES:
===========
V0.0.1	01 JUL 2019, Initial build.

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

class Skin {
	constructor( name, definition ){
		console.log( "# Creating skin for %s",name );
		// Add self to Skin list
		Skins[name] = this;
		//
		this.name = name;
		//
		this.dom = document.createElement('div');
		this.dom.setAttribute("id", "skin."+this.name);
		this.dom.className='skin';
		document.body.appendChild(this.dom);
		// Variables that can be changed by actions
		this.variables = {windowx:0,windowy:0};
		// Set initial variable values:
		this.variables.windowx = ExtractNumber( definition, 'windowx', 0 );
		this.variables.windowy = ExtractNumber( definition, 'windowy', 0 );
		//
		this.Meters = {};
		this.Measures = {};
		this.Variables = {};
		this.Meta = {};
		// Skin Properties
		this.doodah = {update:1000,dynamicwindowsize:1,skinwidth:-1,skinheight:-1};
		this.updateTime=1000;
		this.dynamicwindowsize=0;
		this.xpos=0;
		this.ypos=0;
		this.width = undefined;
		this.height = undefined;
		// Extract variables from definition
		if(definition["doodah"]){
			this.doodah.update = parseInt(definition.doodah.update||1000);
			this.doodah.dynamicwindowsize = parseInt(definition.doodah.dynamicwindowsize||1);
			this.doodah.skinwidth = parseInt(definition.doodah.skinwidth);
			this.doodah.skinheight = parseInt(definition.doodah.skinheight);
		}
		
		
		// Loop through skin sections
		for (var section in definition) {
			//console.log("SECTION: %s",section);
			if( section=='doodah' ) continue;
			if( section=='metadata' ) {
				this.Meta = definition[section];
				continue;
			}
			// Is section a METER?
			if( definition[section].meter ) {
				console.log("#"+definition[section].meter);
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
		}		
/*
		foreach definition as def {
			if(['doodah','metadata'].indexOf(def)==0){
				section = definition[def];
				if( section.meter ) {
					switch( section.meter ){
					case 'text':
						skin.meters += new Meter_text( section );
						break;
					case 'image':
						skin.meters += new Meter_Image( section );
						break;
					default:
						echo( "Meter type '"+section.meter+"' is unsupported." );
					}
				} else if( section.measure ){
					
				}
			}
		}
*/
		// Start Self-timer
//		this.timer = setInterval( function(){
//			console.log("tick, "+this.name);
//		},this.updateTime).bind(this);
	}
	
}

function ExtractNumber( definition, variable, otherwise ){
	if(definition&&definition[variable]) return parseInt(definition[vaiable]);
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
*/


class Meter {
	constructor( skin, name, definition, child='div' ){
		console.log( ".meter="+ JSON.stringify(definition[name]));
		this.skin = skin;
		this.name = name;
		// Create DOM element
		this.dom = document.createElement(child);
		this.dom.setAttribute("id", skin.name+"."+this.name);
		this.dom.className='meter';
		//if( visible==0 ) this.div.style.display = "none";
		
		this.sx = ExtractPosition( definition[name].x||0 );
		this.sy = ExtractPosition( definition[name].y||0 );
		this.sw = ExtractPosition( definition[name].w||0 );
		this.sh = ExtractPosition( definition[name].h||0 );
		//
		this.padding = definition[name].padding;
		if(!this.padding) this.padding={top:0,left:0,right:0,bottom:0};
		console.log( ".padding="+ definition[name].padding);
		console.log( ".padding="+ JSON.stringify(this.padding));
		/*
		console.log( ".sx="+ JSON.stringify(this.sx));
		console.log( ".sy="+ JSON.stringify(this.sy));
		console.log( ".sw="+ JSON.stringify(this.sw));
		console.log( ".sh="+ JSON.stringify(this.sh));
		*/
		document.body.appendChild(skin.dom);
		// this.definition = definition;
		//this.dom = this.create();
		//this.period = 1000;
		//if(this.prop < 10) setTimeout(this.update.bind(this), this.period);
	}

	update(){
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
			switch( this.sx[1] ){
			case 'r':	//Relative to left of previous
				this.xpos = previous.x+this.sx[0];			
				break;
			case 'R':	//Relative to right of previous
				this.xpos = previous.x+previous.w+this.sx[0];
				break;
			default:
				this.xpos = this.skin.xpos+this.sx[0];
			};
			//console.log( ". X="+this.xpos+","+this.sx );
			switch( this.sy[1]){
			case 'r':	//Relative to left of previous
				this.ypos = previous.y+this.sy[0];			
				break;
			case 'R':	//Relative to right of previous
				this.ypos = previous.y+previous.h+this.sy[0];
				break;
			default:
				this.ypos = this.skin.ypos+this.sy[0];
			}
//			this.width = 10;
//			this.height = 10;
		} else {
			console.log( ".Using parent");
			// First item drawn is relative to skin!
			this.xpos = this.skin.xpos+this.sx[0];
			this.ypos = this.skin.ypos+this.sy[0];
		}
		console.log( ".X="+this.xpos+","+this.sx );
		console.log( ".Y="+this.ypos+","+this.sy );
		console.log( ".W="+this.width+","+this.sw );
		console.log( ".H="+this.height+","+this.sh );
//		this.width = this.sw[0];
//		this.height = this.sh[0];
		previous = {x:this.xpos,y:this.ypos,w:this.width||0,h:this.height||0};
		//
		this.dom.style.left = this.xpos+"px";
		this.dom.style.top = this.ypos+"px";
		this.dom.style.paddingTop = this.padding.top+"px";
		this.dom.style.paddingRight = this.padding.right+"px";
		this.dom.style.paddingBottom = this.padding.bottom+"px";
		this.dom.style.paddingLeft = this.padding.left+"px";
	}
}
class Meter_String extends Meter {
	constructor( parent, name, definition ){
		super( parent, name, definition );
//		this.prop = 0;
		this.dom.innerText="###"+name+"###";
		// Get size including padding...
		this.width = this.dom.clientWidth;
		this.height = this.dom.clientHeight;
		this.width += this.padding.left+this.padding.right;
		this.height += this.padding.top+this.padding.bottom;
		//console.log("-> w="+this.dom.clientWidth);
		//console.log("-> h="+this.dom.clientHeight);
		this.update();
	}
	create(){
//		return document.createElement("div");
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


// Get a list of skins from server
// INITIALLY THIS IS PRE-LOADED, SO WE DONT NEED THIS
function getSkins(){
}

// Reload an individual skin from server
// Used when user asks for a single skin to be refreshed
function loadSkin( sking ){
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


// Start the launcher
// Loop through all skins, create them as objects
window.onload = function(){
	// Loop through pre-loaded skins and create them
	for (var key in preload) {
		if(!(key in Skins)){
			skin = new Skin( key, preload[key] );
		} // Ignore duplicate skins. 
	}
}
