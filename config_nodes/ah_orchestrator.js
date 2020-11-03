module.exports = function(RED) {
    function ArrowheadOrchestratorConfigNode(n) {
        RED.nodes.createNode(this, n);
        this.host = n.host;
        this.port = n.port;
        this.path = n.path;
        this.url = getURL(n);
    }
    RED.nodes.registerType("ah orchestrator", ArrowheadOrchestratorConfigNode);

    function getURL(n) {
        let url = n.host;
        if(n.port) url += ':' + n.port;
        if(n.path) url += n.path;
        return url;
    }
}