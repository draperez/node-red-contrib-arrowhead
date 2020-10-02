module.exports = function (RED) {
    const axios = require("axios");
    const querystring = require('querystring');
    function ArrowheadServiceEndpointNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var service_url = config.url || "/ah_service"; //or '/'+config.url???

        switch (config.method) {
            case "post":
                RED.httpNode.post(service_url, function (req, res) { add_req_res_to_msg(req, res, node); });
                break;
            case "put":
                RED.httpNode.put(service_url, function (req, res) { add_req_res_to_msg(req, res, node); });
                break;
            case "delete":
                RED.httpNode.delete(service_url, function (req, res) { add_req_res_to_msg(req, res, node); });
                break;
            case "options":
                RED.httpNode.options(service_url, function (req, res) { add_req_res_to_msg(req, res, node); });
                break;
            case "patch":
                RED.httpNode.patch(service_url, function (req, res) { add_req_res_to_msg(req, res, node); });
                break;
            default:
                RED.httpNode.get(service_url, function (req, res) { add_req_res_to_msg(req, res, node); });
        }

        if (config.replace)
            unregister_from_ah_service_registry(config, node);
        else
            register_in_ah_service_registry(config, node);
    }
    RED.nodes.registerType("ah_service_endpoint", ArrowheadServiceEndpointNode);

    function add_req_res_to_msg(req, res, node) {
        node.debug(res);
        msg = {
            _msgid: RED.util.generateId(),
            req: req,
            res: createResponseWrapper(node, res),
            body: req.body,
            query: req.query,
            payload: null
        };

        node.send([msg, null, null]);
    }

    function register_in_ah_service_registry(config, node) {
        var ah_system = RED.nodes.getNode(config.system);
        var ah_service_registry = RED.nodes.getNode(config.sr);

        var registy_url = ah_service_registry.url + '/register';
        var body = get_registry_body(config, ah_system);

        node.log("Service Registry: " + registy_url);
        console.log(body);

        axios.post(
            registy_url,
            body,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json'
                }
            }
        ).then(function (response) {
            let message = "Service Registered in Arrowhead:"
            node.log(message);
            var msg = {
                payload: response,
                message: message
            };
            node.send([null, msg, null]);
        }).catch(function (error) {
            let message = "Could not register service in Arrowhead:"
            node.error(message);
            var msg = {
                error: error,
                message: message
            };
            node.send([null, null, msg]);
        });

    }

    function unregister_from_ah_service_registry(ah_service, node) {
        var ah_system = RED.nodes.getNode(ah_service.system);
        var ah_service_registry = RED.nodes.getNode(ah_service.sr);
        var unregister_url = ah_service_registry.url + '/unregister';
        params = {
            service_definition: ah_service.definition,
            system_name: ah_system.name,
            address: ah_system.address,
            port: parseInt(ah_system.port)
        }
        unregister_url += '?' + querystring.stringify(params);

        axios.delete(
            unregister_url
        ).then(function (response) {
            let message = "Service Unregistered from Arrowhead:";
            node.log(message);
            var msg = {
                payload: response,
                message: message
            };
            node.send([null, msg, null]);

            register_in_ah_service_registry(ah_service, node);
        }).catch(function (error) {
            let message = "Could not unregister service from Arrowhead";
            node.error(message);
            var msg = {
                error: error,
                message: message
            };
            node.send([null, null, msg]);
        });
    }

    function get_registry_body(ah_service, ah_system) {
        return {
            "interfaces": [
                "HTTP-INSECURE-JSON"
            ],
            "providerSystem": {
                "address": ah_system.address,
                "port": parseInt(ah_system.port),
                "systemName": ah_system.name
            },
            "secure": "NOT_SECURE",
            "serviceDefinition": ah_service.definition,
            "serviceUri": ah_service.uri,
            "version": parseInt(ah_service.version)
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