# Node-RED Arrowhead framework nodes

A collection of nodes for [Node-RED](http://nodered.org) related to [Arrowhead Framework](https://www.arrowhead.eu/arrowheadframework).

## Nodes and explaination

There are several nodes in this repository in order to connect with ```Arrowhead Framework```:

### AH Service Endpoint

This node creates an HTTP Endpoint and registers it in an ```Arrowhead Registry```.

### AH Service Discovery

This node gets an ```Arrowhead Service``` from ```Arrowhead Orchestrator``` and calls it.

## Under development

The nodes are under development at this moment. Nothing works jet.

## Docker image

- Remove old image:

```console
docker stop ah_node-red
docker rm ah_node-red
```

- Build image:

```console
docker build --tag ah_node-red:latest .
```

- Run:

```console
docker run --publish 1880:1880 --detach --name ah_node-red ah_node-red:latest
```
