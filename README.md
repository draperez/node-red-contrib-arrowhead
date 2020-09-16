# Node-RED Arrowhead framework nodes
A collection of nodes for [Node-RED](http://nodered.org) related to [Arrowhead Framework](https://www.arrowhead.eu/arrowheadframework).

## Under development
The nodes are under development at this moment. Nothing works jet.

## Docker image
### Build
```console
docker build -t ah_node-red:latest .
```

### Run
```console
docker run -it -p 1880:1880 -e FLOWS=my_flows.json ah_node-red
```
