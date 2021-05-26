exports.updateStatus = function (node, type, text){
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

exports.addTLSToOptions = function (RED, config, opts) {
    if (config.tls){
        const https = require('https');
        var tlsNode = RED.nodes.getNode(config.tls);
        opts.httpsAgent = new https.Agent({
            cert: tlsNode.cert,
            key: tlsNode.key,
            passphrase: tlsNode.credentials.passphrase,
            rejectUnauthorized: false
        });
    }
    return opts;
}