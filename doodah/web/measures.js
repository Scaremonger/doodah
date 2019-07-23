// Doodah Mesasures
// (c) Copyright Si Dunford, July 2019
// Version 1.0

/* CHANGE LOG:
 * V0.0.1	20 JUL 19, Split out from doodah.js
 */

/* RAINMETER MEASURES:
 * Calc             Unsupported
 * CPU              Unsupported
 * FreeDiskSpace    Unsupported
 * Loop             Unsupported
 * MediaKey         Unsupported
 * Memory           Unsupported
 * Net              Unsupported
 * NowPlaying       Unsupported
 * Plugin           Unsupported
 * RecycleManager   Unsupported    
 * Registry         Unsupported
 * Script           Unsupported
 * String           Unsupported
 * Time             Unsupported
 * Uptime           Unsupported
 * WebParser        Unsupported

 * DOODAH MEASURES:
 * mqtt             Unsupported
 * rss              Unsupported
 * webservice       Unsupported
 */

class Measure {
    constructor(){
        this.next_update=0;
        this.parent = undefined;
        this.config = {};
        this.config.updatedivider=1;
    }
    
    Update( now ){
        this.next_update = now+parent.config.update*this.config.updatedivider;
    }
}
