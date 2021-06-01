module.exports = function (RED) {
    const helpers = require("./ah_helpers");
    const axios = require("axios");
    const jose = require('node-jose');
    const util = require('util');
    const crypto = require('crypto');

    var node;

    function ArrowheadTokenValidatorNode(config) {
        RED.nodes.createNode(this, config);
        node = this;
        node.auth = config.auth;

        // ensure that publicKey is set
        if(config.publickey === "") {
            getPublicKeyFromAH(node, config);
        }else{
            node.publickey = config.publickey;
            helpers.updateStatus(node, "success", "Public key set");
        }
        
        node.on('input', async function(msg, send, done){
            done = done || function() { if (arguments.length>0) node.error.apply(node, arguments) };
            send = send || function() { node.send.apply(node, arguments) };
            
            msg.encryptedToken = getToken(msg);
            msg.publickey = node.publickey;
            try {
                await validateToken(node, msg, done, send);
            } catch (error) {
                let message = "Invalid token."+error.message
                helpers.updateStatus(node, "error", message);
                msg.status = message;
                msg.payload = message;
                msg.statusCode = 403;
                send([null, msg]);
                done();
            }
        });
    }
    RED.nodes.registerType("ah token validator", ArrowheadTokenValidatorNode);

    function getPublicKeyFromAH(node, config) {
        // Call authorization service to get the public key. path /publickey
        let authService = RED.nodes.getNode(config.auth);
        let authURL = authService.url + "/publickey";
        let opts = {};
        if(authService.usetls){
            opts = helpers.addTLSToOptions(RED, authService, opts);
        }
        axios.get(
            authURL,
            opts
        ).then(function (response) {
            node.publickey = response.data;
            helpers.updateStatus(node, "success", "Public key from AH Auth service.");
        }).catch(function (error) {
            node.puclickey = "";
            helpers.updateStatus(node, "warning", "Public key not set.");
        });
    }

    async function validateToken(node, msg, done, send) {
        msg.decryptedToken = await decryptToken(node, msg.encryptedToken);
        
        let authorizationPublicKey = "-----BEGIN PUBLIC KEY-----" + msg.publickey + "-----END PUBLIC KEY-----";
        let verifierKey = await jose.JWK.asKey(authorizationPublicKey, 'pem');
        let verifier = await jose.JWS.createVerify(verifierKey);
        let verificationResult = await verifier.verify(msg.decryptedToken);
        let isValidToken = !!verificationResult;

        if (isValidToken) {
            //from bytes to string then to json object
            let td = new util.TextDecoder('utf-8');
            let vrString = td.decode(verificationResult.payload);
            msg.decodedToken = JSON.parse(vrString);
            isValidToken = (msg.decodedToken.iss == 'Authorization')
        }

        if(isValidToken){
            msg.status = "valid token";
            helpers.updateStatus(node, "success", "Valid Token");
            send([msg, null]);
            done();
        }else{
            msg.status = "invalid token";
            msg.payload = msg.status;
            msg.statusCode = 403;
            helpers.updateStatus(node, "warning", error);
            send([null, msg]);
            done();
        }
    }

    async function decryptToken(node, encryptedToken){
        let auth = RED.nodes.getNode(node.auth);
        let tls = RED.nodes.getNode(auth.tls);
        let privateKey = tls.key;

        if(tls.credentials && tls.credentials.passphrase){

            let pk = crypto.createPrivateKey(
                {
                    key: tls.key, 
                    passphrase: tls.credentials.passphrase
                }
            );
            privateKey = pk.export({format:'pem', type: 'pkcs1'});
        }

        let decryptionKey = await jose.JWK.asKey(privateKey, "pem");
        let decrypter = await jose.JWE.createDecrypt(decryptionKey);
        let decryptResult = await decrypter.decrypt(encryptedToken);

        //from bytes to string
        let td = new util.TextDecoder('utf-8');
        let decryptedToken = td.decode(decryptResult.payload);
        return decryptedToken;
    }

    function getToken(msg){
        // Extract token from header or msg.token.
        let token = "no-token";
        if(msg.token){
            token = msg.token;
        }else if(
            msg.req !== undefined && 
            msg.req.headers != undefined && 
            msg.req.headers.authorization !== undefined
        ){
            token = msg.req.headers.authorization;
        }

        if(token.startsWith("Bearer ")){
            token = token.substring(7);
        }
        return token;
    }
}