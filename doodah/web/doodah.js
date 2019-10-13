// DOODAH JAVASCRIPT LIBRARY
// (c) Copyright Si Dunford, July 2019
//
// VERSION 0.0.1, Pre-Release, Not suitable for production

/* CHANGE LOG:
 * 0.0.1    01 JUL 19   Initial build.
 * 0.0.2    20 JUL 19   Split Meter into own file
 * 0.0.3    23 JUL 19   Added update/updatedivider and system timer
 * 0.1.0    26 JUL 19   Finished basic framework
 * 0.1.1    28 JUL 19   Added ExtractColor() to support all formats

BUG: CreateELement() cannot have spaces, slashes or period, yet replace seems to fail!
 

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
            
            console.log( "SKIN:::FILE:"+skin_file );
            console.log( "SKIN:::NAME:"+skin_name );
            //get_skin( parent, skin_file, skin_name, config[section] );

            // Create a Debugging card
            //var debug= document.getElementById("debugger");
            //var div= document.createElement('div');
            //div.setAttribute("id", ("card_"+skin_name).replace(/\.|%s|\\/g,"_") );
            //div.className='card';
            //debug.appendChild(div);
            //div.innerText = skin_name;

            // Create a new skin
            var skin = new Skin( skin_name, skin_file, config[section], this );
            Skins[ skin_name ] = skin;

            // Request the skin content
            this.request_skin( skin, skin_file, skin_name, config[section] );
        }
        
        // Start System Timer
		//this.timer = setInterval( function(){
        //    this.Update( Date.now() );
		//}.bind(this),100);      
    }
    
    // Request a skin file from the server
    request_skin( skin, skin_file, skin_name, config ) {
        // Create a request
        var server = new XMLHttpRequest();
        // Save some variables that we will need later:
        server.skin = skin;
        server.skin_config = config;
        server.skin_name = skin_name;
        server.skin_parent = this;
        //
        //server.open( "GET", "$Skin="+skin_file, true);
        server.open( "GET", skin_file+"/$", true);
        server.onreadystatechange = function() {
            // Wait for Ready State 4:
            if (server.readyState != 4) return;
            console.log( ".   Server Status: "+server.status );
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
                        //var skin = new Skin( server.skin_parent, skin_name, ini, server.skin_config );
                        //console.log( "  Skin created");
                        server.skin.initialise( ini );
                        // 
                        //if(skin) {
                            // Save sking in list
                            // Skins[skin_name] = skin;
                        //} else {
                        //    console.log( "$ Invalid skin");
                        //}
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
                    console.trace();
                }
                break;
            case 404:{
                // We have requested a missing skin
                // (Be warned: Skins are case sensitive)
                // So, now we must create a TEXT error message in it's place
                ini={
                    'doodah':{
                        'skinwidth':150,
                        'skinheight':40
                    },
                    'error':{
                        'meter':'string',
                        'text':"Skin '"+skin_name+"' missing"
                    }
                };
                server.skin.initialise( ini );
                server.skin.dom.classList.add( "error" );
            }
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

/* A skin is a section of the display tht displays information (Meters)
 * based on static or dynamic (Measures) content.
 */
class Skin {
    // Creates a basic Skin object ready to be loaded from disk
    constructor( skin_name, skin_path, layout_config ){
        console.log( "  new Skin( '"+skin_name+"' )" );
        
        this.name = skin_name;
        this.path = skin_path;
        this.config = {};
        this.meters = {};
        this.measures = {};
        this.variables = {};
        this.meta = {};

        // Control fields
        this.next_update = 0;
        this.has_loaded = false;    // Used to identify skins with load errors.

        // Read config from LAYOUT config
		this.config.windowx = ExtractNumber( layout_config, 'windowx', -1 );
		this.config.windowy = ExtractNumber( layout_config, 'windowy', -1 );

        // Default settings (Used if skin load fails
        this.config.update = 1000;
        this.config.dynamicwindowsize = 0;      
        this.config.skinwidth=50;
        this.config.skinheight=50;
                
        // Read config from SKIN config
		//this.config.dynamicwindowsize = ExtractNumber( skin_config, 'dynamicwindowsize', 0 );
		//this.config.skinwidth = ExtractNumber( skin_config, 'skinwidth', 100 );
		//this.config.skinheight = ExtractNumber( skin_config, 'skinheight', 30 );

        // CREATE DOM OBJECT (DIV) FOR SKIN
		this.dom = document.createElement('div');
		this.dom.setAttribute("id", ("skin."+this.name).replace(/\.|%s|\\/g,"_") );
        this.dom.setAttribute("data-skinname", (this.name) );
		this.dom.className='skin';
		document.body.appendChild(this.dom);
        
        // Create popup for debugging purposes only
        var popup = document.createElement('span');
        popup.innerText=this.name;
        popup.className='tooltiptext';
        this.dom.appendChild(popup);
        
        // Create Debug "Card"
        //showcard( skin_name, this );
        // Parse the SKIN Config
    }
    
    // Initislise skin with content configuration file
    initialise( skin_config ) {
        console.log("  Loading skin config");
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
                //
                this.config.background= ExtractText( skin_config[section], 'background', "" );
                this.config.backgroundmode = ExtractNumber( skin_config[section], 'backgroundmode', 1 );
                this.config.solidcolor = ExtractColor( skin_config[section], 'solidcolor', undefined );
                this.config.solidcolor2 = ExtractColor( skin_config[section], 'solidcolor2', undefined );
                this.config.gradientangle = ExtractNumber( skin_config[section], 'gradientangle', 90 );
                
                //https://www.w3schools.com/css/css3_gradients.asp
                
                // Does skin have it's own stylesheet?
                if( skin_config[section]['stylesheet'] ) {
                    console.log( "LOADING STYLESHEET: "+skin_config[section]['stylesheet'] );
                    // Add LINK into header
                    var head = document.getElementsByTagName('head')[0];  
                    var link = document.createElement('link'); 
                    link.rel = 'stylesheet';  
                    link.type = 'text/css'; 
                    link.href = this.name+"/"+skin_config[section]['stylesheet'];  
                    head.appendChild(link);
                } else {
                    console.log("NO STYLESHEET");
                }
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
            this.has_loaded = true;     // Mark skin as Loaded
            
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
        this.Update(0);
    }
	
    // Function called every "UPDATE" milliseconds
    Update(now){
        console.log( "UPDATING SKIN: "+this.name );
        
        // Reposition the skin at either its defined position or 
        // Below the previous skin
        /*
        if( Previous_Skin===undefined ) {
            this.xpos = ( (this.config.windowx==-1) ? 0 : this.config.windowx );
            this.ypos = ( (this.config.windowy==-1) ? 0 : this.config.windowy );
        } else {
            this.xpos = ( (this.config.windowx==-1) ? Previous_Skin.xpos : this.config.windowx );
            this.ypos = ( (this.config.windowy==-1) ? Previous_Skin.ypos+Previous_Skin.height : this.config.windowy );
        }
        */
        this.dom.style.left = this.xpos+"px";
		this.dom.style.top = this.ypos+"px";
        
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
            console.log( "  Meter: "+meter_name );
            //if( meter.next_update<now ) 
            meter.update( 0 );
        }
        console.log( "> finished update");
        
        /*
        // If DOM has no fixed abode, position it next to the last skin.
        if( this.config.windowx==-1 ) {
            if( Previous_Skin===undefined) {
                this.xpos = 0;
            } else {
                this.xpos = Previous_Skin.config.windowx;
            }
        }
        if( this.config.windowy==-1 ) {
            console.log( "ADJUSTING Y POSITION" );
            if( Previous_Skin===undefined) {
                console.log( "  Previous_Skin is undefined");
                this.ypos = 0;
            } else {
                console.log( "  Previous skin is "+Previous_Skin.name+", "+ Previous_Skin.height);
                this.ypos = Previous_Skin.config.windowy + Previous_Skin.height;
            }
        }
        */
        
        // Resize dynamic skins
        if( this.config.dynamicwindowsize==1 ) {
            console.log( "  ! Dynamic sizing configured" );
    
            // Calculate size of skin based on meters
            this.width = 0;
            this.height = 0;
            for( var meter_name in this.meters ){
                //console.log( "    "+meter_name );
                var meter = this.meters[meter_name]
                this.width = Math.max( this.width, meter.xpos+meter.width );
                this.height = Math.max( this.height, meter.ypos+meter.height );
                console.log( "    METER: "+meter_name+": X="+meter.xpos+", Y="+meter.ypos+", W="+meter.width+", H="+meter.height );
            }
            // Update DOM size
        //} else {
            // Skin has a static size, but if smaller than 4x4 then we will reset it to 50x50
            //this.height = this.config.skinheight;
            //this.width = this.config.skinwidth;
            //if( this.height <5 ) this.height = 50;
            //if( this.width <5 _ this.width = 50;
        }
        // Update DOM size
        this.dom.style.width = this.width+"px";
        this.dom.style.height = this.height+"px";            
        
        /*
        // Skin resize to fit meters?
        if( this.config.dynamicwindowsize==1 ) {
            console.log( "  ! Dynamic sizing configured" );
            // Calculate size of skin based on meters
            this.width = 0;
            this.height = 0;
            for( var meter_name in this.meters ){
                //console.log( "    "+meter_name );
                var meter = this.meters[meter_name]
                this.width = Math.max( this.width, meter.xpos+meter.width );
                this.height = Math.max( this.height, meter.ypos+meter.height );
                console.log( "    METER: "+meter_name+": X="+meter.xpos+", Y="+meter.ypos+", W="+meter.width+", H="+meter.height );
            }
            // Update DOM size
            this.dom.style.width = this.width+"px";
            this.dom.style.height = this.height+"px";
        } else {
            this.width = this.config.skinwidth;
            this.height = this.config.skinheight;
        }
        */
        console.log( "  SKIN SIZE: X="+this.xpos+", Y="+this.ypos+", W="+this.width+", H="+this.height );
        
        // 
        //showcard( this.name, this );
        
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
/* Colour formats supported:
 * Decimal type "RRR,GGG,BBB,AAA"    (Alpha is optional)
 * Hexadecimal types "RRGGBBAA" or, "#RRGGBBAA"    (Alpha is optional)
 * Hexadecimal types "RGBA", "#RGBA"    (Alpha is optional)
 */
function ExtractColor( definition, variable, otherwise ){
    if(!definition||!definition[variable]) return otherwise;
    console.log( "ExtractColor( "+definition[variable]+" );" );
    var str = definition[variable].toString();
    // Check for RRR,GGG,BBB,AAA (Alpha optional)
    re = /(\d{1,3}),(\d{1,3}),(\d{1,3})([,\d{1,3}])?/
	var found = str.match(re);
    if(found) {
        console.log( "  NUMBERS:"+found.length);
        var result = {}
        result['color']=parseInt(found[0]);
        result['red']=parseInt(found[1]);
        result['green']=parseInt(found[2]);
        result['blue']=parseInt(found[3]);
        result['alpha']=255;
        if( found[4]) {
            // Four digit colour includes Alpha
            result['alpha']=parseInt(found[4]);
        } else {
            // Three digit colour Alpha
            result['color']=(result['color']<<8)||0xff;
        }
        return result;
    }
    // Check for RRGGBBAA (Alpha optional)
    re = /#?([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})?/
	var found = str.match(re);
    if(found) {
        //console.log( "  DOUBLEHEX:"+found.length);
        //console.log( "  "+found );
        if(found[4]) console.log( "FOUR" );
        if(found[4]==='' ) console.log("EMPTY");
        var result = {}
        result['color']=parseInt("0x"+found[0]);
        result['red']=parseInt("0x"+found[1]);
        result['green']=parseInt("0x"+found[2]);
        result['blue']=parseInt("0x"+found[3]);
        result['alpha']=255;
        if(found[4]) result['alpha']=parseInt("0x"+found[4]);
        return result;
    }
    // Check for RRGGBBAA (Alpha optional)
    re = /#?([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])?/
	var found = str.match(re);
    if(found) {
        console.log( "  HEX:"+found.length);
        var result = {}
        result['color']=parseInt("0x"+found[0]);
        result['red']=parseInt("0x"+found[1]);
        result['green']=parseInt("0x"+found[2]);
        result['blue']=parseInt("0x"+found[3]);
        result['alpha']=255;
        if(found[4]) result['alpha']=parseInt("0x"+found[4]);
        return result;
    }
    return otherwise;
}

// ========================================
// Version 1.1
function get_layout(name) {
    var doodah_server = new XMLHttpRequest();
	doodah_server.layout_name = name;
	//doodah_server.open( "GET", "$Layout="+name, true);
    doodah_server.open( "GET", name+"/$", true);
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
                    console.trace();
                }
             } else if( xhttp.status==0 ) {
                console.log( "Resource cannot be initialised." );
            } else {                
                // CREATE LOADING ERROR CONTENT
                var div = document.createElement('div');
                div.setAttribute("id", "html404");
                div.innerHTML = "Layout file '"+this.layout_name+"' not found.<br>Error code 404."
                document.body.appendChild(div);
                //console.log( "Status:"+xhttp.status+" ("+xhttp.statusText+")" );
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
            html += indent+item+"$="+obj[item]+"<br>";
            break;
        case "number":
            html += indent+item+"%="+obj[item].toString()+"<br>";
            break;
        case "object":
            if( depth==0 ){
                html += indent+item.toUpperCase();
            } else {
                html += indent+item;
            }
            html += " ("+Object.keys( obj[item] ).length+"): {<br>";
            html += dumpvar( obj[item], depth+1 );
            html += indent+"}<br>";
            break;
        case "boolean":
            html += indent+item+":BOOL=";
            if( obj[item]===true ){
                html += "TRUE<br>";
            } else {
                html += "FALSE<br>";
            }
            break;
        case "function":
            // Not interested in listing these
            break;
        default:
            html += indent + item +"=="+typeof obj[item]+"<br>";
        }
    }
    return html;
}

//function showcard( skin_name, obj ){
//    var div= document.getElementById("card_"+skin_name);
//    var html = dumpvar( obj );
//    div.innerHTML="<pre>"+html+"</pre>";
//}

// Start the launcher
// Loop through all skins, create them as objects
window.onload = function(){
	// Get Layout from URL
    layout = window.location.pathname;
    layout = layout.slice(1)   // Remove leading "/"
    if( !layout||layout=='' ) layout='Default';
    console.log( "Layout '"+layout+ "' Selected" );
    get_layout( layout );
    
    // Add mouseover skin debugger
    document.onmouseover=function(e){
        var e = e || window.event
        var element = e.target || e.srcElement;
        if( element.classList.contains("skin")) {
            name = element.getAttribute("data-skinname");
            var html = dumpvar( Skins[name] );
            var div= document.getElementById("debugger");
            div.innerHTML="<pre>"+html+"</pre>";
        }
    };

    
}


