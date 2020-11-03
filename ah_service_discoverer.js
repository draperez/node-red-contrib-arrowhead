module.exports = function (RED) {
    const axios = require("axios");
    var node;
    function ArrowheadServiceDiscovererNode(config) {
        RED.nodes.createNode(this, config);
        node = this;
        node.on('input', function(msg){
            var orchestrationURL = config.orchestrator.url || "/orchestration";
            askServiceURL(orchestrationURL, prepareOrchestrationBody(config), msg); 
        });
    }
    RED.nodes.registerType("ah service discoverer", ArrowheadServiceDiscovererNode);

    function askServiceURL(orchestrationURL, body, previousMsg){
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
            let message = "AH Orchestrator says:";
            node.log(message);
            console.log(JSON.stringify(response));
            previousMsg.response = response;
            node.send(previousMsg);
        }).catch(function (error) {
            let message = "AH Orchestrator error:";
            node.error(message);
            node.error(JSON.stringify(error, null, 2));
            previousMsg.error = error;
            node.send(previousMsg);
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
}