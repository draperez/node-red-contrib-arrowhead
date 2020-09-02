module.exports = function(RED) {
    function ArrowheadNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            msg.payload = "Nothing implemented yet. This module is under development.";
            node.send(msg);
        });
    }
    function ArrowheadEndpointNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        /* Endpoint url should be taken from config instead of /ah_endpoint */
        RED.httpAdmin.get("/ah_endpoint", function (req, res) {
            msg.req = req;
            msg.res = res;
            node.send(msg);
        }
    }
    RED.nodes.registerType("arrowhead", ArrowheadNode);
    RED.nodes.registerType("ah_endpoint", ArrowheadEndpointNode);
}