module.exports = function (RED) {
    const helpers = require("./ah_helpers");
    const axios = require("axios");
    const querystring = require('querystring');
    var node;

    function ArrowheadTokenValidatorNode(config) {
        RED.nodes.createNode(this, config);
        node = this;

        // ensure that publicKey is set
        if(config.publickey === undefined) {
            let publicKey = getPublicKey(node, config);
            if(!publicKey){
                helpers.updateStatus(node, "warning", "Public key not set.");
            } else {
                config.publickey = publicKey;
                helpers.updateStatus(node, "success", "Public key set (Arrowhead).")
            }
        }else{
            helpers.updateStatus(node, "success", "Public key set");
        }
        
        node.on('input', function(msg, send, done){
            done = done || function() { if (arguments.length>0) node.error.apply(node, arguments) };
            send = send || function() { node.send.apply(node, arguments) };
            
            msg.checked_token = getToken(msg);
            let valid = validateToken(msg.checked_token, config.publickey);

            if(valid){
                helpers.updateStatus(node, "success", "Valid Token");
                send(msg);
                done();
            }else{
                var error = "Invalid token";
                helpers.updateStatus(node, "warning", error);
                send(msg);
                //done(error);
            }
        });
    }
    RED.nodes.registerType("ah token validator", ArrowheadTokenValidatorNode);

    function getPublicKey(config) {
        // Call authorization service to get the public key. path /publickey
        return null;
    }

    function validateToken(token, publickey) {
        // Check if token is valid using the public key.
        return false;
    }

    function getToken(msg){
        // Extract token from header or msg.token.
        let token = "no-token";
        if(
            msg.req !== undefined && 
            msg.req.headers != undefined && 
            msg.req.headers.authorization !== undefined
        ){
            token = msg.req.headers.authorization;
        }else if(msg.token) {
            token = msg.token;
        }
        if(token.startsWith("Bearer ")){
            token = token.substring(7);
        }
        return token;
    }
}