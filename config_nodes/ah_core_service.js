module.exports = function(RED) {
    function ArrowheadCoreServiceConfigNode(n) {
        RED.nodes.createNode(this, n);
        this.host   = n.host;
        this.port   = n.port;
        this.path   = n.path;
        this.tls    = n.tls;
        this.usetls = n.usetls;
        this.url    = getURL(n);
    }
    RED.nodes.registerType("ah core service", ArrowheadCoreServiceConfigNode);
    function getURL(n) {
        let url = n.host;
        if(n.port) url += ':' + n.port;
        if(n.path) url += n.path;
        return url;
    }
}