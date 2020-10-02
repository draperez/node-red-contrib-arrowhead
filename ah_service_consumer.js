module.exports = function (RED) {
    const axios = require("axios");
    function ArrowheadServiceConsumerNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
    }
    RED.nodes.registerType("ah_service_consumer", ArrowheadServiceConsumerNode);

}