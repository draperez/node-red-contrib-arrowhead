module.exports = function (RED) {
    const axios = require("axios");
    const qs = require('qs');
    function ArrowheadServiceDiscovererNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;

        node.on('input', function(msg, send, done){
            done = done || function() { if (arguments.length>0) node.error.apply(node, arguments) };
            send = send || function() { node.send.apply(node, arguments) };
            var ahOrchestrator = RED.nodes.getNode(config.orchestrator);
            var orchestrationURL = ahOrchestrator.url+"/orchestration" || "/orchestration";
            askServiceURL(orchestrationURL, config, msg, done, send, node); 
        });
    }
    RED.nodes.registerType("ah service discoverer", ArrowheadServiceDiscovererNode);

    function askServiceURL(orchestrationURL, config, previousMsg, done, send, node){
        body = prepareOrchestrationBody(config);
        axios.post(
            orchestrationURL,
            body,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                }
            }
        ).then(function (response) {
            if(response.data.response.length == 0){
                var error = "Could not find requested service: "+body["requestedService"]["serviceDefinitionRequirement"];
                updateStatus(node, "error", "Could not find service.");
                done(error);
            }else{
                var serviceDefinition = response.data.response[0].provider.systemName;
                var address = response.data.response[0].provider.address;
                var port = response.data.response[0].provider.port;
                var serviceUri = response.data.response[0].serviceUri;
                var baseURL = address+":"+port;
                var fullURL = config.protocol + "://" + baseURL + serviceUri;
                updateStatus(node, "success", "["+config.method+"] "+serviceDefinition+": "+fullURL);
                callService(config.method, fullURL, previousMsg, done, send, node);
            }
        }).catch(function (error) {
            updateStatus(node, "error", "Orchestrator error.");
            done(error);
        });
    }

    function callService(method, serviceUrl, previousMsg, done, send, node){
        var msg = previousMsg;
        msg.method = method;
        msg.requestBody = previousMsg.payload;
        msg.serviceUrl = serviceUrl;
        msg.payload = "nothing done yet";
        msg.options = {
            method: method,
            headers: previousMsg.headers || {}, // get headers from previousMsg or config?
            data: previousMsg.payload,/*qs.stringify(previousMsg.payload),*/
            url: serviceUrl,
            baseURL: previousMsg.baseURL,
            params: previousMsg.params,
            timeout: previousMsg.timeout || 0,
            auth: previousMsg.auth,
            responseType:  previousMsg.responseType || 'json',
            responseEncoding:  previousMsg.responseEncoding || 'utf8',
            xsrfCookieName: previousMsg.xsrfCookieName || 'XSRF-TOKEN',
            xsrfHeaderName: previousMsg.xsrfHeaderName || 'X-XSRF-TOKEN',
            maxRedirects: previousMsg.maxRedirects || 5,
            decompress: previousMsg.decompress || true,
        }
        axios(msg.options)
        .then(function (response) {
            msg.res = response;
            msg.payload = response.data;
            send(msg);
            done();
        }).catch(function (error) {
            updateStatus(node, "error", "Could not call service: ["+method+"] " + serviceUrl);
            done(error);
        });
    }

    function prepareOrchestrationBody(config) {
        let system = RED.nodes.getNode(config.requesterSystem);

        return {
            "requesterSystem": {
                "systemName": system.name,
                "address": system.address,
                "port": parseInt(system.port),
                "authenticationInfo": null
            },
            "requesterCloud": null,
            "requestedService": {
                "serviceDefinitionRequirement": config.serviceDefinition,
                "interfaceRequirements": [
                    "HTTP-INSECURE-JSON"
                ],
                "securityRequirements": null,
                "metadataRequirements": null,
                "versionRequirement": null,
                "minVersionRequirement": null,
                "maxVersionRequirement": null,
                "pingProviders": false
            },
            "orchestrationFlags": {
                "onlyPreferred": false,
                "overrideStore": true,
                "externalServiceRequest": false,
                "enableInterCloud": false,
                "enableQoS": false,
                "matchmaking": true,
                "metadataSearch": false,
                "triggerInterCloud": false,
                "pingProviders": false
            },
            "preferredProviders": [],
            "commands": {}
        };
    }

    function updateStatus(node, type, text){
        let status;
        switch (type){
            case "error":
                status = {fill:"red",shape:"ring",text:text};
                break;
            case "success":
                status = {fill:"green",shape:"dot",text:text};
                break;
            default:
                status = {fill:"grey",shape:"ring",text:text};
        }
        node.status(status);
    }
}