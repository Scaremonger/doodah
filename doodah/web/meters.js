// Doodah Meters
// (c) Copyright Si Dunford, July 2019
// Version 1.0

/* CHANGE LOG:
 * V0.0.1	20 JUL 19, Split out from doodah.js
 * V0.0.2   20 JUL 19  Added: Meter_Error
 */

/* RAINMETER COMPONENTS:
 * Bar          Unsupported
 * Bitmap       Unsupported
 * Button       Unsupported
 * Histogram    Unsupported
 * Image        In Progress
 * Line         Unsupported
 * Rotator      Unsupported
 * Roundline    Unsupported
 * Shape        Unsupported
 * String       In Progress

 * DOODAH COMPONENTS:
 * audio        Unsupported
 * mqtt         Unsupported
 * rss          Unsupported
 * video        Unsupported
 * webservice   Unsupported
 */

/* KNOWN BUGS / THINGS TO DO
 * Make popups an option in the meter
 * dynamicwindowsize=0
 *      overflow:hidden
 *      Need to add class "dynamicwindowsize0" to skin object
 *      Child sizes then can be read from the DOM and skin adjusted
 * meter position is fixed, but adds on parents windowx/windowy
 */

function CreateMeter( meter_name, meter_config, parent ){
    var metertype = meter_config.meter.toLowerCase(); 
    var meter;
    switch( metertype ){
    case 'string':
        console.log("Creating string meter");
        // Add a new Meter to the list
        var meter = new Meter_String( parent, meter_name, meter_config );
        if( !meter ) return;
        console.log("  Meter created");
        //parent.meters[meter_name] = meter;
        return meter;
        break;
    default:
        console.log("# Unknown meter type "+metertype);
        var meter = new Meter_Error( parent, meter_name, "<br>Invalid meter type '"+metertype+"' in meter '"+meter_name+"'" );
        console.log("  Meter_Error created");
        //parent.meters[meter_name] = meter;
        
        //AllMeters[name+"."+section_name]=meter;
        return meter;
        break;
    }
}


class Meter {
	constructor( parent, meter_name, meter_config ){
		console.log( "CREATE METER: "+ meter_name);
		this.parent = parent; // This is the Parent skin
		this.name = meter_name; // Name fo the meter
		this.metertype = meter_config.meter.toLowerCase();
		// Create DOM element
		this.dom = document.createElement('div');
		this.dom.setAttribute("id", parent.name+"."+this.name);
		this.dom.className='meter meter'+this.metertype;
		//if( visible==0 ) this.div.style.display = "none";
		
        // Extract config properties:
        this.config = {};
		this.config.x = ExtractPosition( meter_config.x||0 );
		this.config.y = ExtractPosition( meter_config.y||0 );
		this.config.w = ExtractPosition( meter_config.w||0 );
		this.config.h = ExtractPosition( meter_config.h||0 );
		this.config.text = ExtractText( meter_config, 'text', '' );
        
        // Calculated position and size:
        this.xpos = 0;
        this.ypos = 0;
        this.width = 0;
        this.height = 0;
		
        //
        this.config.padding = ExtractPadding( meter_config, 'padding' );
        //{left:5,top:10,right:25,bottom:0}
//		this.config.padding = definition[name].padding;
//		if(!this.padding) this.padding={top:0,left:0,right:0,bottom:0};
		//console.log( ".padding="+ definition[name].padding);
		console.log( ".padding="+ JSON.stringify(this.config.padding));
				
		parent.dom.appendChild(this.dom);
        
        // Create popup
        //var popup = document.createElement('div');
        //popup.className='popup';
        //popup.style.display ="none";
        //this.dom.appendChild(popup);
        
        this.Update();
        this.Redraw()

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
	Update(){
        //this.dom.innerText="###"+this.name+"###";
    }
    // Recalculate component location and size
    Redraw(){
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
				//this.xpos = this.parent.config.windowx+this.config.x[0];
				this.xpos = this.config.x[0];
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
				//this.ypos = this.parent.config.windowy+this.config.y[0];
				this.ypos = this.config.y[0];
			}
//			this.width = 10;
//			this.height = 10;
		} else {
			console.log( ".Using parent");
			// First item drawn is relative to parent skin!
			//this.xpos = this.parent.config.windowx+this.config.x[0];
			//this.ypos = this.parent.config.windowy+this.config.y[0];
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
        
        // Save the location into 'previous'
		previous = {x:this.xpos,y:this.ypos,w:this.width||0,h:this.height||0};
		// Update DOM
		this.dom.style.left = this.xpos+"px";
		this.dom.style.top = this.ypos+"px";
		this.dom.style.paddingTop = this.config.padding.top+"px";
		this.dom.style.paddingRight = this.config.padding.right+"px";
		this.dom.style.paddingBottom = this.config.padding.bottom+"px";
		this.dom.style.paddingLeft = this.config.padding.left+"px";
	}
}

// An ERROR meter is used when a meter does not load 
// or loads incorrectly.
class Meter_Error extends Meter {
	constructor( parent, name, error ){
		super( parent, name, {"meter":"error","text":error} );
		//this.prop = 0;
        //this.config.text = error;
	}
	create(){
		return document.createElement("div");
	}
	Update(){
        this.dom.innerText=this.config.text;
	}
}

class Meter_Bar extends Meter {
	constructor(){
		super();
		//this.prop = 0;
	}
	create(){
		return document.createElement("canvas");
	}
	Update(){
	}
}

class Meter_Image extends Meter {
	constructor(){
		super();
		//this.prop = 0;
	}
	create(){
		return document.createElement("img");
	}
	Update(){
	}
}

class Meter_String extends Meter {
	constructor( parent, name, definition ){
		super( parent, name, definition );
//		this.prop = 0;
		

		//console.log("-> w="+this.dom.clientWidth);
		//console.log("-> h="+this.dom.clientHeight);

	}
	Update(){
        //this.dom.innerText="###"+name+"###";
        this.dom.innerText=this.config.text;
    }
}
