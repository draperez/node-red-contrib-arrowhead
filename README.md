# Node-RED Arrowhead framework nodes

A collection of nodes for [Node-RED](http://nodered.org) related to [Arrowhead Framework](https://www.arrowhead.eu/arrowheadframework).

## Nodes and explaination

There are several nodes in this repository in order to connect with Arrowhead Framework:

### AH Service

This node creates an HTTP endpoint and registers it to Arrowhead Registry.

## Under development

The nodes are under development at this moment. Nothing works jet.

## Docker image

### Build

```console
docker build -t ah_node-red:latest .
```

### Run

```console
docker run -it -p 1880:1880 --name ah_node-red ah_node-red
```
