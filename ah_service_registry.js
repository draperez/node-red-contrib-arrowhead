module.exports = function(RED) {
    function ArrowheadServiceRegistryConfigNode(n) {
        RED.nodes.createNode(this, n);
        this.host = n.host;
        this.port = n.port;
        this.path = n.path;
        this.url = get_url(n);
    }
    RED.nodes.registerType("ah_service_registry", ArrowheadServiceRegistryConfigNode);
    function get_url(n) {
        let url = n.host;
        if(n.port) url += ':' + n.port;
        if(n.path) url += n.path;
        return url;
    }
}