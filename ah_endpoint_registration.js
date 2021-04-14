module.exports = function (RED) {
    const axios = require("axios");
    //const JSON = require("JSON");
    const querystring = require('querystring');
    var node;
    var serviceUri;
    function ArrowheadEndpointRegistrationNode(config) {
        RED.nodes.createNode(this, config);
        node = this;
        
        serviceUri = config.uri || "/ah_service";
        if (serviceUri[0] !== '/') {
            serviceUri = '/'+serviceUri;
        }

        updateStatus("debug", "Registering endpoint:"+serviceUri);

        if (config.replace)
            unregisterFromAHServiceRegistry(config, node);
        else
            registerInAHServiceRegistry(config, node);
    }
    RED.nodes.registerType("ah-endpoint-registration", ArrowheadEndpointRegistrationNode);

    function registerInAHServiceRegistry(config, node) {
        var ahSystem = RED.nodes.getNode(config.system);
        var ahServiceRegistry = RED.nodes.getNode(config.sr);

        var registyURL = ahServiceRegistry.url + '/register';
        var body = getRegistryBody(config, ahSystem);

        axios.post(
            registyURL,
            body,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                }
            }
        ).then(function (response) {
            let message = "Registered in AH ("+serviceUri+")";
            updateStatus("success", message);
        }).catch(function (error) {
            let message = "Could not register service in Arrowhead";
            updateStatus("error", message);
            node.error(JSON.stringify(error, null, 2));
        });

    }

    function unregisterFromAHServiceRegistry(ahService, node) {
        let ahSystem = RED.nodes.getNode(ahService.system);
        let ahServiceRegistry = RED.nodes.getNode(ahService.sr);
        let unregisterURL = ahServiceRegistry.url + '/unregister';
        params = {
            service_definition: ahService.definition,
            system_name: ahSystem.name,
            address: ahSystem.address,
            port: parseInt(ahSystem.port)
        }
        unregisterURL += '?' + querystring.stringify(params);

        axios.delete(
            unregisterURL,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                }
            }
        ).then(function (response) {
            let message = "Service Unregistered from Arrowhead:";
            updateStatus("success", message);
            
            registerInAHServiceRegistry(ahService, node);
        }).catch(function (error) {
            let message = "Could not unregister service from Arrowhead";
            updateStatus("error", message);
            node.error(JSON.stringify(error, null, 2));
        });
    }

    function getRegistryBody(ahService, ahSystem) {
        return {
            "interfaces": [
                "HTTP-INSECURE-JSON"
            ],
            "providerSystem": {
                "address": ahSystem.address,
                "port": parseInt(ahSystem.port),
                "systemName": ahSystem.name
            },
            "secure": "NOT_SECURE",
            "serviceDefinition": ahService.definition,
            "serviceUri": ahService.uri,
            "version": parseInt(ahService.version)
        }
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