module.exports = function (RED) {
    const helpers = require("./ah_helpers");
    const axios = require("axios");
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

        helpers.updateStatus(node, "debug", "Registering endpoint:"+serviceUri);

        if (config.replace)
            unregisterFromAHServiceRegistry(config, node,);
        else
            registerInAHServiceRegistry(config, node);
    }
    RED.nodes.registerType("ah-endpoint-registration", ArrowheadEndpointRegistrationNode);

    function registerInAHServiceRegistry(config, node) {
        var ahSystem = RED.nodes.getNode(config.system);
        var ahServiceRegistry = RED.nodes.getNode(config.sr);

        var registyURL = ahServiceRegistry.url + '/register';
        var body = getRegistryBody(config, ahSystem);

        opts = {
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            }
        };

        opts = helpers.addTLSToOptions(RED, config, opts);

        axios.post(
            registyURL,
            body,
            opts
        ).then(function (response) {
            let message = "Registered in AH ("+serviceUri+")";
            helpers.updateStatus(node, "success", message);
        }).catch(function (error) {
            let message = "Could not register service in Arrowhead";
            helpers.updateStatus(node, "error", message);
            node.error(error);
            //node.error(JSON.stringify(error, null, 2));
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

        opts = {
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            }
        };

        opts = helpers.addTLSToOptions(RED, ahService, opts);

        axios.delete(
            unregisterURL,
            opts
        ).then(function (response) {
            let message = "Service Unregistered from Arrowhead:";
            helpers.updateStatus(node, "success", message);
            
            registerInAHServiceRegistry(ahService, node);
        }).catch(function (error) {
            let message = "Could not unregister service from Arrowhead";
            helpers.updateStatus(node, "error", message);
            node.error(JSON.stringify(error, null, 2));
        });
    }

    function getRegistryBody(ahService, ahSystem) {

        body = {
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

        if(ahService.token) {
            body["secure"] = "TOKEN";
            body["interfaces"] = ["HTTP-SECURE-JSON"];
        }

        if(ahService.authinfo !== undefined){
            let authinfo = RED.nodes.getNode(ahService.authinfo);
            body["providerSystem"]["authenticationInfo"] = authinfo.authinfo;
        }
        return body;
    }
}