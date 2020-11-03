module.exports = function (RED) {
    const axios = require("axios");
    //const JSON = require("JSON");
    const querystring = require('querystring');
    function ArrowheadServiceEndpointNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var serviceURL = config.url || "/ah_service"; //or '/'+config.url???

        switch (config.method) {
            case "post":
                RED.httpNode.post(serviceURL, function (req, res) { addReqResToMsg(req, res, node); });
                break;
            case "put":
                RED.httpNode.put(serviceURL, function (req, res) { addReqResToMsg(req, res, node); });
                break;
            case "delete":
                RED.httpNode.delete(serviceURL, function (req, res) { addReqResToMsg(req, res, node); });
                break;
            case "options":
                RED.httpNode.options(serviceURL, function (req, res) { addReqResToMsg(req, res, node); });
                break;
            case "patch":
                RED.httpNode.patch(serviceURL, function (req, res) { addReqResToMsg(req, res, node); });
                break;
            default:
                RED.httpNode.get(serviceURL, function (req, res) { addReqResToMsg(req, res, node); });
        }

        if (config.replace)
            unregisterFromAHServiceRegistry(config, node);
        else
            registerInAHServiceRegistry(config, node);
    }
    RED.nodes.registerType("ah service endpoint", ArrowheadServiceEndpointNode);

    function addReqResToMsg(req, res, node) {
        node.debug(res);
        msg = {
            _msgid: RED.util.generateId(),
            req: req,
            res: createResponseWrapper(node, res),
            body: req.body,
            query: req.query,
            payload: null
        };

        //node.send([msg, null, null]);
        node.send(msg);
    }

    function registerInAHServiceRegistry(config, node) {
        var ahSystem = RED.nodes.getNode(config.system);
        var ahServiceRegistry = RED.nodes.getNode(config.sr);

        var registyURL = ahServiceRegistry.url + '/register';
        var body = getRegistryBody(config, ahSystem);

        node.log(body, "Service Registry: " + registyURL);
        //console.log(body);

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
            let message = "Service Registered in Arrowhead:";
            node.log(response, message);
        }).catch(function (error) {
            let message = "Could not register service in Arrowhead:"
            node.error(message);
            node.error(JSON.stringify(error, null, 2));
        });

    }

    function unregisterFromAHServiceRegistry(ahService, node) {
        let ahSystem = RED.nodes.getNode(ahService.system);
        let ahServiceRegistry = RED.nodes.getNode(ahService.sr);
        let unregisterURL = ahServiceRegistry.url + '/unregister';
        params = {
            serviceDefinition: ahService.definition,
            systemName: ahSystem.name,
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
            node.log(response, message);
            
            registerInAHServiceRegistry(ahService, node);
        }).catch(function (error) {
            let message = "Could not unregister service from Arrowhead";
            node.error(message);
            node.error(JSON.stringify(error, null, 2));
            //node.send([null, null, msg]);
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

    // Copied from HTTPIn module
    function createResponseWrapper(node, res) {
        var wrapper = {
            _res: res
        };
        var toWrap = [
            "append",
            "attachment",
            "cookie",
            "clearCookie",
            "download",
            "end",
            "format",
            "get",
            "json",
            "jsonp",
            "links",
            "location",
            "redirect",
            "render",
            "send",
            "sendfile",
            "sendFile",
            "sendStatus",
            "set",
            "status",
            "type",
            "vary"
        ];
        toWrap.forEach(function (f) {
            wrapper[f] = function () {
                node.warn(RED._("httpin.errors.deprecated-call", { method: "msg.res." + f }));
                var result = res[f].apply(res, arguments);
                if (result === res) {
                    return wrapper;
                } else {
                    return result;
                }
            }
        });
        return wrapper;
    }
}