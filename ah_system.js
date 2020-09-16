module.exports = function(RED) {
    function ArrowheadSystemConfigNode(n) {
        RED.nodes.createNode(this, n);
        this.address = n.address;
        this.port = n.port;
        this.path = n.path;
        this.url = get_url(n);
    }
    RED.nodes.registerType("ah_system", ArrowheadSystemConfigNode);

    function get_url(n) {
        let url = n.address;
        if(n.port) url += ':' + n.port;
        if(n.path) url += n.path;
        return url;
    }
}