module.exports = function(RED) {
    function ArrowheadSystemConfigNode(n) {
        RED.nodes.createNode(this, n);
        this.address = n.address;
        this.name = n.name;
        this.port = n.port;
        this.url = getURL(n);
    }
    RED.nodes.registerType("ah system", ArrowheadSystemConfigNode);

    function getURL(n) {
        let url = n.address;
        if(n.port) url += ':' + n.port;
        return url;
    }
}