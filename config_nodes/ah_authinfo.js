module.exports = function(RED) {
    function ArrowheadAuthinfoNode(n) {
        RED.nodes.createNode(this, n);
        this.authinfo = n.authinfo;
        this.name = n.name;
    }
    RED.nodes.registerType("ah authinfo", ArrowheadAuthinfoNode);
}