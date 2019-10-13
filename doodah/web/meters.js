// Doodah Meters
// (c) Copyright Si Dunford, July 2019
// Version 1.0

/* CHANGE LOG:
 * V0.0.1	20 JUL 19, Split out from doodah.js
 * 
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
 * Consider making popups an option in the meter
 */

//var ERROR_SKIN = {doodah:(xyz:""},error:{meter:"string",text:"Bad Skin"}};
//var ERROR_METER = {meter:"string",text:"ERROR"};

// METER FACTORY
function CreateMeter( meter_name, meter_config, parent ){
    var metertype = meter_config.meter.toLowerCase(); 
    var meter;
    switch( metertype ){
    case 'string':
        console.log("Creating STRING meter");
        // Add a new Meter to the list
        var meter = new Meter_String( parent, meter_name, meter_config );
        if( !meter ) return;
        console.log("  Meter created");
        //parent.meters[meter_name] = meter;
        return meter;
        break;
    case 'image':
        console.log("Creating IMAGE meter");
        // Add a new Meter to the list
        var meter = new Meter_Image( parent, meter_name, meter_config );
        if( !meter ) return;
        console.log("  Meter created");
        //parent.meters[meter_name] = meter;
        return meter;
        break;
    default:
        // Unknown Meter Type, so create a STRING meter to show an error instead.
        console.log("# Unknown meter type "+metertype);
        Error_Meter= { meter:"string",text:"Invalid meter type '"+metertype+"'" }
        var meter = new Meter_String( parent, meter_name, Error_Meter );
        if( !meter ) return;
        console.log("  Meter created");
        /*
         * var config = ERROR_METER;
        config.name = meter_name;
        if( meter_config.x ) config.x = meter_config.x;
        if( meter_config.y ) config.y = meter_config.y;
        config.text="Meter: '"+meter_name+"'<br>Invalid meter type '"+metertype+"'";
        var meter = new Meter_String( parent, meter_name, config );
        console.log("  Meter_Error created");
        //parent.meters[meter_name] = meter;
        */
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
        this.next_update=0;
        
		// Create DOM element
		this.dom = this.create();
        //this.dom = document.createElement('div');
		this.dom.setAttribute("id", parent.name+"."+this.name);
		this.dom.className='meter meter'+this.metertype;
		//if( visible==0 ) this.div.style.display = "none";
		
        // Extract config properties:
        this.config = {};
		this.config.x = ExtractPosition( meter_config.x||0 );
		this.config.y = ExtractPosition( meter_config.y||0 );
		this.config.w = ExtractPosition( meter_config.w||0 );
		this.config.h = ExtractPosition( meter_config.h||0 );
        this.config.updatedivider=ExtractNumber( meter_config, 'updatedivider', 1 );
        if( this.config.updatedivider<1 ) this.config.updatedivider=1;
		this.config.text = ExtractText( meter_config, 'text', '' );
        
        // Calculated position and size:
        this.xpos = -1;     // -1 forces reposition on first update
        this.ypos = -1;     // -1 forces reposition on first update
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
	
	// Create the default object type "div"
	create() {
        //console.log( "SS DEFAULT DOM TYPE $$" );
        return document.createElement('div');
    }
    
    // Update the meter (With new value if required)
    // This is called by timer
	update(now){
		console.log( "Calc pos of "+this.name);
		// Recalculate drawing location and if different, update the DOM
		if( Previous_Meter===undefined ) {
			console.log( ".Using parent");
			// First meter is drawn relative to parent skin!
			//this.xpos = this.parent.config.windowx+this.config.x[0];
			//this.ypos = this.parent.config.windowy+this.config.y[0];
			if(this.xpos==-1) this.xpos = this.config.x[0];
			if(this.ypos==-1) this.ypos = this.config.y[0];
        } else {
			console.log( ".Using Previous_Meter "+ Previous_Meter.name);
			if(this.xpos==-1) {
                // Draw relative to Previous_Meter
                switch( this.config.x[1] ){
                case 'r':	//Relative to left of Previous_Meter
                    this.xpos = Previous_Meter.xpos+this.config.x[0];			
                    break;
                case 'R':	//Relative to right of Previous_Meter
                    this.xpos = Previous_Meter.xpos+Previous_Meter.width+this.config.x[0];
                    break;
                default:
                    //this.xpos = this.parent.config.windowx+this.config.x[0];
                    this.xpos = this.config.x[0];
                };
            };
			if(this.ypos==-1) {
                //console.log( ". X="+this.xpos+","+this.config.x );
                switch( this.config.y[1]){
                case 'r':	//Relative to left of Previous_Meter
                    this.ypos = Previous_Meter.ypos+this.config.y[0];			
                    break;
                case 'R':	//Relative to right of Previous_Meter
                    this.ypos = Previous_Meter.ypos+Previous_Meter.height+this.config.y[0];
                    break;
                default:
                    //this.ypos = this.parent.config.windowy+this.config.y[0];
                    this.ypos = this.config.y[0];
                }
            };
//			this.width = 10;
//			this.height = 10;
		}
        
		// Update DOM
		this.dom.style.left = this.xpos+"px";
		this.dom.style.top = this.ypos+"px";
		this.dom.style.paddingTop = this.config.padding.top+"px";
		this.dom.style.paddingRight = this.config.padding.right+"px";
		this.dom.style.paddingBottom = this.config.padding.bottom+"px";
		this.dom.style.paddingLeft = this.config.padding.left+"px";
        
        // Get size including padding...
		this.width = this.dom.offsetWidth;
		this.height = this.dom.offsetHeight;
		this.width += this.config.padding.left+this.config.padding.right;
		this.height += this.config.padding.top+this.config.padding.bottom;
        
        // Save the location into 'Previous_Meter'
		Previous_Meter = this;
        
        // Set next update duration
        this.next_update = now+this.parent.config.update*this.config.updatedivider;
	}
}

class Meter_Bar extends Meter {
	constructor(){
		super();
		//this.prop = 0;
	}
//	create(){
//		return document.createElement("canvas");
//	}
	Update(){
	}
}

//THE PROBLEM:
//Parent.name is lowercase, needs to be physical case...


class Meter_Image extends Meter {
	constructor( parent, name, definition ){
		super( parent, name, definition );
        //
        this.config.imagename = ExtractText( definition, 'imagename', '' );
        if( this.config.imagename=='' ) {
            this.config.imagename='/$/missing.png';
        } else {
            this.config.imagename=parent.path+"/"+this.config.imagename;
        }
        this.dom.src=this.config.imagename;
	}

	// Create an image object
	create() {
        //console.log( "SS IMAGE $$" );
        return document.createElement('img');
    }

	Update(){
        //this.dom.src=this.config.imagename;
        //console.log( "UPDATING IMAGE" );
        //this.dom.innerHTML="<h1>Boo</h1>";
        //this.dom.innerText="BOO";
	}
}

class Meter_String extends Meter {
	constructor( parent, name, definition ){
		super( parent, name, definition );
	}
	Update(){
        //this.dom.innerText="###"+name+"###";
        this.dom.innerText=this.config.text;
    }
}
