module.exports = function (RED) {
    const helpers = require("./ah_helpers");
    const axios = require("axios");
    // const qs = require("qs");
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

    function askServiceURL(orchestrationURL, config, msg, done, send, node){
        helpers.updateStatus(node, "info", "Asking Service URL to orchestrator...");
        body = prepareOrchestrationBody(config, msg);
        opts = {
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            }
        }

        opts = helpers.addTLSToOptions(RED, config, opts);

        axios.post(
            orchestrationURL,
            body,
            opts
        ).then(function (response) {
            if(response.data.response.length == 0){
                var error = "Could not find requested service: "+body["requestedService"]["serviceDefinitionRequirement"];
                helpers.updateStatus(node, "error", "Could not find service.");
                done(error);
            }else{
                var serviceDefinition = response.data.response[0].provider.systemName;
                var address = response.data.response[0].provider.address;
                var port = response.data.response[0].provider.port;
                var serviceUri = response.data.response[0].serviceUri;
                var fullURL = address + ":" + port + serviceUri;
                helpers.updateStatus(node, "success", serviceDefinition+" => "+fullURL);

                msg.ahOrchestratorResponse = response;
                msg.payload = [];
                for (let item of response.data.response){
                    msg.payload.push({
                        "url": item.provider.address+":"+item.provider.port+item.serviceUri,
                        "authorizationTokens": item.authorizationTokens
                    });
                }
                response.data.response;
                send(msg)
                done();
            }
        }).catch(function (error) {
            helpers.updateStatus(node, "error", "Orchestrator error.");
            done(error);
        });
    }

    function prepareOrchestrationBody(config, msg) {
        let system = RED.nodes.getNode(config.requesterSystem);
        if (msg.body !== undefined) {
            body = msg.body;
        }else{
            // Set Authentication Info
            if(msg.authenticationInfo !== undefined){
                authenticationInfo = msg.authenticationInfo;
            }else if(config.authinfo !== undefined){
                let authinfo = RED.nodes.getNode(config.authinfo);
                authenticationInfo = authinfo.authinfo;
            }else {
                authenticationInfo = null;
            }

            // Set Service Definition
            if(msg.serviceDefinition !== undefined){
                serviceDefinition = msg.serviceDefinition;
            }else{
                serviceDefinition = config.serviceDefinition;
            }
            body = {
                "requesterSystem": {
                    "systemName": system.name,
                    "address": system.address,
                    "port": parseInt(system.port),
                    "authenticationInfo": authenticationInfo
                },
                "requesterCloud": null,
                "requestedService": {
                    "serviceDefinitionRequirement": serviceDefinition,
                    "interfaceRequirements": [],
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
        return body;
    }
}
