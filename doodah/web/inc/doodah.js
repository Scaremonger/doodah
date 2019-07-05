
// Get a list of skins from server
// INITIALLY THIS IS PRE-LOADED, SO WE DONT NEED THIS
function getSkins(){
}

// Reload an individual skin from server
// Used when user asks for a single skin to be refreshed
function loadSkin( sking ){
}

// Loop through all skins, create them as objects
function main(){
	loop through preload:
	foreach( skin in preload ){
		createskin( skin );
	}
}

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

// Start the launch
main()


// defines a class function
class className {
	constructor(){
	this.prop = 0;
	}

	// method
	metName() {
		document.getElementById('swprop').innerHTML = this.prop; // shows prop value in #swprop

		// adds one unit to prop to each call, and auto-calls this function every 0.5 sec., till prop reaches 10
		this.prop++;
		if(this.prop < 10) setTimeout(this.metName.bind(this), 500);
	}
}

class Skin {
	constructor( definition ){
		this.prop = 0;
		this.def = definition;
		
		// Loop through skin sections
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
	}
	
}

class Meter {
	constructor(){
		this.prop = 0;
		this.dom = this.create();
		this.period = 1000;
		if(this.prop < 10) setTimeout(this.update.bind(this), this.period);
	}
	// Create the Meter in the browser DOM
	create(){
		return document.createElement("div");
	}
	update(){
	}
}
class Meter_Text extends Skin {
	constructor(){
		super();
		this.prop = 0;
	}
	create(){
		return document.createElement("div");
	}
}
class Meter_Image extends Skin {
	constructor(){
		super();
		this.prop = 0;
	}
	create(){
		return document.createElement("img");
	}
}
class Meter_bar extends Skin {
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

// creates an object of className, and accesses metName()
var objTest = new className();
objTest.metName();

