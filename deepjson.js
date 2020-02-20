module.exports = function(RED) {
    function DeepJsonGetNode(config) {
        RED.nodes.createNode(this,config);
        this.host = config.host;
        this.port = config.port;
        this.secret = config.secret;
        this.user = config.user;
        this.password = config.password;
        this.dj = require( "deepjson-js-client" );

        var node = this;
        node.on('input', function(msg, send, done) {

           var err = undefined;

            /// For maximum backwards compatibility, check that send exists.
            // If this node is installed in Node-RED 0.x, it will need to
            // fallback to using `node.send`
            send = send || function() { node.send.apply(node,arguments) };

            var key = undefined;
            var command = undefined;

            if( msg.payload.key === undefined ) {
                key = msg.payload;
            } else {
                key = msg.payload.key;
                command = msg.payload.command;
            }
           // load data from dj
            this.dj.setSettings( { host: this.host, port: this.port, secret: this.secret, user: this.user, password: this.password } );
            node.status( {text: "getting: " + key  } );

            this.dj.get( key, command, function( result, response ) {
                        if( result !== "ok") {
                            node.status({fill:"red",shape:"ring",text: JSON.stringify( response )});
                            if( done ) {
                                done(response);
                            } else {
                                node.error(response,msg);
                            }
                        } else { 
                            node.status({fill:"green",shape:"ring",text:"done: " + key });
                            msg.payload = response;
                            send( msg );

                            if( done ) {
                                done();
                            }
                        }
            });


//            msg.payload = this.host + ":" + this.port + "(" + this.secret + ")@" + this.us$
//            send(msg);

        });
        
    }
    function DeepJsonPostNode(config) {
        RED.nodes.createNode(this,config);
        this.host = config.host;
        this.port = config.port;
        this.secret = config.secret;
        this.user = config.user;
        this.password = config.password;
        this.storage_type = config.storage_type;
        this.java_function = config.function;
        this.dj = require( "deepjson-js-client" );

        var node = this;
        node.on('input', function(msg, send, done) {

           var err = undefined;

            /// For maximum backwards compatibility, check that send exists.
            // If this node is installed in Node-RED 0.x, it will need to
            // fallback to using `node.send`
            send = send || function() { node.send.apply(node,arguments) };

            var key = undefined;
            var command = undefined;
            var data = undefined;

            if( msg.payload.key === undefined ) {
                key = msg.payload;
            } else {
                key = msg.payload.key;
                command = msg.payload.command;
            }
            if( msg.payload.data === undefined ) {
                data = "";
            } else {
                data = msg.payload.data;
            }

            // encapsulate the function
            if( this.java_function !== undefined && this.java_function.trim().length > 0 ) {
                if( this.storage_type === "set" ) {
                    data = "javascript:set\n" + this.java_function + "\njavascript!\n\n" + JSON.stringify( data );
                } else {
                    data = "javascript:get\n" + this.java_function + "\njavascript!\n\n" + JSON.stringify( data );
                }

            }
            //console.log( "dj post: " + data );
            // load data from dj
            this.dj.setSettings( { host: this.host, port: this.port, secret: this.secret, user: this.user, password: this.password } );

            node.status( {text: "posting: " + key  } );

            this.dj.post( key, command, data, function( result, response ) {
                        if( result !== "ok") {
                            node.status({fill:"red",shape:"ring",text:JSON.stringify( response )});
                            if( done ) {
                                done(response);
                            } else {
                                node.error(response,msg);
                            }
                        } else { 
                            node.status({fill:"green",shape:"ring",text:"done: " + key });
                            msg.payload = response;
                            send( msg );

                            if( done ) {
                                done();
                            }
                        }
            });



//            msg.payload = this.host + ":" + this.port + "(" + this.secret + ")@" + this.us$
//            send(msg);

        });
        
    }

    function DeepJsonKeysNode(config) {
        RED.nodes.createNode(this,config);
        this.host = config.host;
        this.port = config.port;
        this.secret = config.secret;
        this.user = config.user;
        this.password = config.password;
        this.dj = require( "deepjson-js-client" );

        var node = this;
        node.on('input', function(msg, send, done) {

           var err = undefined;

            // For maximum backwards compatibility, check that send exists.
            // If this node is installed in Node-RED 0.x, it will need to
            // fallback to using `node.send`
            send = send || function() { node.send.apply(node,arguments) };

            console.log( "dj keys: " + msg.payload );
            // load data from dj
            node.status( {text: "accessing: " + msg.payload } );

            this.dj.setSettings( { host: this.host, port: this.port, secret: this.secret, user: this.user, password: this.password } );

            this.dj.keys( msg.payload, function( result, response ) {
                if( result !== "ok") {
                    node.status({fill:"red",shape:"ring",text:JSON.stringify( response )});

                    node.error(response,msg);

                    if( done ) {
                        done();
                    }

                } else { 
                    node.status({fill:"green",shape:"ring",text:"done " + msg.payload});

                    msg.payload = response;
                    send( msg );

                    if( done ) {
                        done();
                    }
                }
            });

//            msg.payload = this.host + ":" + this.port + "(" + this.secret + ")@" + this.us$
//            send(msg);

        });
        
    }
    RED.nodes.registerType("deepjson-get",DeepJsonGetNode);
    RED.nodes.registerType("deepjson-post",DeepJsonPostNode);
    RED.nodes.registerType("deepjson-keys",DeepJsonKeysNode);
}
