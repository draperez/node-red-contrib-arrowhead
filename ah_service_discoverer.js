module.exports = function (RED) {
    const axios = require("axios");
    const qs = require('qs');
    var node;
    var method;
    function ArrowheadServiceDiscovererNode(config) {
        RED.nodes.createNode(this, config);
        node = this;
        method = config.method;
        node.on('input', function(msg){
            var ahOrchestrator = RED.nodes.getNode(config.orchestrator);
            var orchestrationURL = ahOrchestrator.url+"/orchestration" || "/orchestration";
            askServiceURL(orchestrationURL, config, msg); 
        });
    }
    RED.nodes.registerType("ah service discoverer", ArrowheadServiceDiscovererNode);

    function askServiceURL(orchestrationURL, config, previousMsg){
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
            var serviceDefinition = response.data.response[0].provider.systemName;
            var address = response.data.response[0].provider.address;
            var port = response.data.response[0].provider.port;
            var serviceUri = response.data.response[0].serviceUri;
            var baseURL = address+":"+port;
            var fullURL = config.protocol + "://" + baseURL + serviceUri;
            updateStatus("success", serviceDefinition+": "+fullURL);
            callService(fullURL, previousMsg);
        }).catch(function (error) {
            //updateStatus("error", "Orchestrator responded: "+ error);
            node.error(error);
            previousMsg.error = error;
            node.send([null, previousMsg]);
        });
    }

    function callService(serviceUrl, previousMsg){
        var msg = previousMsg;
        msg["method"] = method;
        msg["requestBody"] = previousMsg.payload;
        msg["serviceUrl"] = serviceUrl;
        msg["payload"] = "nothing done yet";
        var options = {
            method: method,
            headers: {}, // @ToDo, get headers from previousMsg or config?
            data: qs.stringify(previousMsg.payload),
            url: serviceUrl
        }
        axios(options)
        .then(function (response) {
            updateStatus("success","Service called.");
            msg.payload = response.data;
            node.send([msg, null]);
        }).catch(function (error) {
            updateStatus("error",error);
            msg.error = error;
            node.send([null, msg]);
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

    function updateStatus(type, text){
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