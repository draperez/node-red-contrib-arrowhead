module.exports = function (RED) {
    const axios = require("axios");
    //const JSON = require("JSON");
    const querystring = require('querystring');
    var cookieParser = require("cookie-parser");
    var httpMiddleware = function(req,res,next) { next(); }
    var corsHandler = function(req,res,next) { next(); }
    var metricsHandler = function(req,res,next) { next(); }
    var node;
    var serviceUri;
    var method
    function ArrowheadServiceEndpointNode(config) {
        RED.nodes.createNode(this, config);
        node = this;
        
        method = config.method;
        serviceUri = config.uri || "/ah_service";
        if (serviceUri[0] !== '/') {
            serviceUri = '/'+serviceUri;
        }

        updateStatus("debug", "Registering endpoint:"+serviceUri+" ["+config.method+"]");

        this.errorHandler = function(err,req,res,next) {
            updateStatus("error", "Endpoint call error");
            node.warn(err);
            res.sendStatus(500);
        };

        switch (method) {
            case "post":
                updateStatus("debug", "Register POST: "+serviceUri);
                RED.httpNode.post(
                    serviceUri,
                    cookieParser(),
                    httpMiddleware,
                    corsHandler,
                    metricsHandler,
                    addReqResToMsg,
                    this.errorHandler
                );
                break;
            case "put":
                updateStatus("debug", "Register PUT: "+serviceUri);
                RED.httpNode.put(
                    serviceUri,
                    cookieParser(),
                    httpMiddleware,
                    corsHandler,
                    metricsHandler,
                    addReqResToMsg,
                    this.errorHandler
                );
                break;
            case "delete":
                updateStatus("debug", "Register DELETE: "+serviceUri);
                RED.httpNode.delete(
                    serviceUri,
                    cookieParser(),
                    httpMiddleware,
                    corsHandler,
                    metricsHandler,
                    addReqResToMsg,
                    this.errorHandler
                );
                break;
            case "options":
                updateStatus("debug", "Register OPTIONS: "+serviceUri);
                RED.httpNode.options(
                    serviceUri,
                    cookieParser(),
                    httpMiddleware,
                    corsHandler,
                    metricsHandler,
                    addReqResToMsg,
                    this.errorHandler
                );
                break;
            case "patch":
                updateStatus("debug", "Register PATCH: "+serviceUri);
                RED.httpNode.patch(
                    serviceUri,
                    cookieParser(),
                    httpMiddleware,
                    corsHandler,
                    metricsHandler,
                    addReqResToMsg,
                    this.errorHandler
                );
                break;
            default:
                updateStatus("debug", "Register GET: "+serviceUri);
                RED.httpNode.get(
                    serviceUri,
                    cookieParser(),
                    httpMiddleware,
                    corsHandler,
                    metricsHandler,
                    addReqResToMsg,
                    this.errorHandler
                );
        }

        if (config.replace)
            unregisterFromAHServiceRegistry(config, node);
        else
            registerInAHServiceRegistry(config, node);
    }
    RED.nodes.registerType("ah service endpoint", ArrowheadServiceEndpointNode);

    function addReqResToMsg(req, res) {
        msg = {
            _msgid: RED.util.generateId(),
            req: req,
            res: createResponseWrapper(node, res),
            body: req.body,
            query: req.query,
            payload: null
        };

        node.send(msg);
    }

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
            let message = "Registered in AH (["+method+"] "+serviceUri+")";
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