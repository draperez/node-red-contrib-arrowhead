module.exports = function(RED) {
    function ArrowheadNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            msg.payload = "Nothing implemented yet. This module is under development.";
            node.send(msg);
        });
    }
    RED.nodes.registerType("arrowhead", ArrowheadNode);
}